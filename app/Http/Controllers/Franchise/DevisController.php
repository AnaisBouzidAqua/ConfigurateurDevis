<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use App\Models\Scenario;
use App\Models\Devis;
use App\Models\DevisReponse;
use App\Models\Produit;
use App\Models\DevisMainOeuvre;
use App\Models\TauxHoraire;
use App\Exports\DevisExport;
use Maatwebsite\Excel\Facades\Excel;
use App\Services\MoteurScenarios;
use Illuminate\Http\Request;

class DevisController extends Controller
{

    /**
     * Liste des devis non archivés, avec recherche par nom de client.
     */
    public function index(Request $request)
    {
        $parPage = (int) $request->query('par_page', 20);
        [$tri, $direction] = $this->triValide($request);

        $devis = $this->devisFiltres($request)
            ->paginate($parPage)
            ->withQueryString();

        $dispositifsDisponibles = Devis::whereNull('archived_at')
            ->whereNotNull('dispositif')
            ->distinct()
            ->orderBy('dispositif')
            ->pluck('dispositif');

        return inertia('franchise/devis/index', [
            'devis' => $devis,
            'recherche' => $request->query('recherche'),
            'parPage' => $parPage,
            'tri' => $tri,
            'direction' => $direction,
            'dateDebut' => $request->query('date_debut'),
            'dateFin' => $request->query('date_fin'),
            'dispositif' => $request->query('dispositif'),
            'installateur' => $request->query('installateur'),
            'typeInstallateur' => $request->query('type_installateur'),
            'dispositifsDisponibles' => $dispositifsDisponibles,
        ]);
    }

    /**
     * Télécharge l'historique filtré au format CSV.
     */
    public function export(Request $request)
    {
        return Excel::download(
            new DevisExport($this->devisFiltres($request)),
            'historique-chiffrages.csv',
            \Maatwebsite\Excel\Excel::CSV,
        );
    }

    private function triValide(Request $request): array
    {
        $colonnesTriables = ['client_nom', 'dispositif', 'capacite_eh', 'installateur', 'type_installateur', 'total_ht', 'created_at'];
        $tri = $request->query('tri', 'created_at');
        $direction = $request->query('direction') === 'asc' ? 'asc' : 'desc';

        if (! in_array($tri, $colonnesTriables, true)) {
            $tri = 'created_at';
        }

        return [$tri, $direction];
    }

    private function devisFiltres(Request $request): \Illuminate\Database\Eloquent\Builder
    {
        $recherche = $request->query('recherche');
        $dateDebut = $request->query('date_debut');
        $dateFin = $request->query('date_fin');
        $dispositif = $request->query('dispositif');
        $installateur = $request->query('installateur');
        $typeInstallateur = $request->query('type_installateur');
        [$tri, $direction] = $this->triValide($request);

        return Devis::whereNull('archived_at')
            ->when($recherche, fn($query) => $query->where('client_nom', 'ilike', "%{$recherche}%"))
            ->when($dateDebut, fn($query) => $query->whereDate('created_at', '>=', $dateDebut))
            ->when($dateFin, fn($query) => $query->whereDate('created_at', '<=', $dateFin))
            ->when($dispositif, fn($query) => $query->where('dispositif', $dispositif))
            ->when($installateur, fn($query) => $query->where('installateur', $installateur))
            ->when($typeInstallateur, fn($query) => $query->where('type_installateur', $typeInstallateur))
            ->orderBy($tri, $direction);
    }



    /**
     * Archive un devis (il disparaît de l'Historique sans être supprimé).
     */
    public function archiver(Devis $devis)
    {
        $devis->update(['archived_at' => now()]);

        return redirect()->route('franchise.devis.index');
    }

    /**
     * Formulaire "Dossier" vierge, avant qu'un Devis existe.
     */
    public function create()
    {
        return inertia('franchise/devis/create', [
            'scenarios' => Scenario::orderBy('id')->get(),
        ]);
    }

    /**
     * Crée le Devis à partir du Dossier, puis redirige vers l'onglet Chiffrage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'scenario_id' => 'nullable|exists:scenarios,id',
            'client_nom' => 'nullable|string|max:255',
            'dispositif' => 'nullable|string|max:255',
            'nombre_batiments' => 'nullable|integer|min:0',
            'capacite_eh' => 'nullable|integer|min:0',
            'nombre_chambres' => 'nullable|integer|min:0',
            'type_effluents' => 'nullable|string|max:255',
            'installateur' => 'nullable|string|max:255',
            'type_installateur' => 'nullable|string|max:255',
            'installateur_agree_nom' => 'nullable|string|max:255',
            'type_realisation' => 'nullable|string|max:255',
        ]);

        // Le "Type d'installateur" n'a de sens que pour une vente de kit —
        // on l'ignore silencieusement sinon, pour ne pas garder en base une
        // valeur qui ne correspond plus à ce qui est affiché/filtrable.
        if (($validated['installateur'] ?? null) !== 'vente_kit') {
            $validated['type_installateur'] = null;
        }

        $devis = Devis::create($validated);

        return redirect(route('franchise.devis.show', $devis) . '?tab=chiffrage');
    }

    /**
     * Enregistre (ou met à jour) la réponse du franchisé à une question du
     * Chiffrage, pour pouvoir rouvrir un brouillon plus tard.
     */
    public function saveReponse(Request $request, Devis $devis)
    {
        $validated = $request->validate([
            'question_id' => 'required|exists:questions,id',
            'question_option_id' => 'required|exists:question_options,id',
        ]);

        DevisReponse::updateOrCreate(
            ['devis_id' => $devis->id, 'question_id' => $validated['question_id']],
            ['question_option_id' => $validated['question_option_id']],
        );

        return redirect()->route('franchise.devis.show', $devis);
    }

    /**
     * Supprime toutes les réponses enregistrées pour ce devis, pour
     * recommencer le Chiffrage à zéro.
     */
    public function clearReponses(Devis $devis)
    {
        $devis->reponses()->delete();

        return redirect(route('franchise.devis.show', $devis) . '?tab=chiffrage');
    }

    /**
     * Ajoute une ligne de main d'œuvre au devis.
     */
    public function storeMainOeuvre(Request $request, Devis $devis)
    {
        $validated = $this->validateMainOeuvre($request);

        $mainOeuvre = $devis->mainOeuvres()->create([
            'libelle' => $validated['libelle'],
            'description' => $validated['description'],
        ]);

        $mainOeuvre->heures()->sync($this->heuresPivot($validated['heures']));

        return redirect(route('franchise.devis.show', $devis) . '?tab=chiffrage');
    }

    /**
     * Met à jour une ligne de main d'œuvre existante (titre, description, heures).
     */
    public function updateMainOeuvre(Request $request, Devis $devis, DevisMainOeuvre $mainOeuvre)
    {
        $validated = $this->validateMainOeuvre($request);

        $mainOeuvre->update([
            'libelle' => $validated['libelle'],
            'description' => $validated['description'],
        ]);

        $mainOeuvre->heures()->sync($this->heuresPivot($validated['heures']));

        return redirect(route('franchise.devis.show', $devis) . '?tab=chiffrage');
    }

    /**
     * Supprime une ligne de main d'œuvre du devis.
     */
    public function destroyMainOeuvre(Devis $devis, DevisMainOeuvre $mainOeuvre)
    {
        $mainOeuvre->delete();

        return redirect(route('franchise.devis.show', $devis) . '?tab=chiffrage');
    }

    private function validateMainOeuvre(Request $request): array
    {
        return $request->validate([
            'libelle' => 'required|string|max:255',
            'description' => 'required|string',
            'heures' => 'required|array|min:1',
            'heures.*.taux_horaire_id' => 'required|exists:taux_horaires,id',
            'heures.*.nombre_heures' => 'required|numeric|min:0',
        ]);
    }

    /**
     * Transforme les heures du formulaire ([{taux_horaire_id, nombre_heures}])
     * en tableau attendu par sync() : [taux_horaire_id => ['nombre_heures' => n]].
     */
    private function heuresPivot(array $heures): array
    {
        return collect($heures)
            ->mapWithKeys(fn (array $heure) => [
                $heure['taux_horaire_id'] => ['nombre_heures' => $heure['nombre_heures']],
            ])
            ->all();
    }


    /**
     * Enregistre le coefficient de difficulté et la remise commerciale
     * saisis manuellement pour ce devis.
     */
    public function updateTarification(Request $request, Devis $devis)
    {
        $validated = $request->validate([
            'coefficient_difficulte' => 'required|integer|min:0',
            'remise_valeur' => 'nullable|numeric|min:0',
            'remise_type' => 'nullable|in:montant,pourcentage',
        ]);

        $devis->update($validated);

        return redirect()->route('franchise.devis.show', $devis);
    }


    /**
     * Affiche le Devis (Dossier + Chiffrage). Recalcule à chaque visite les
     * produits déclenchés par les réponses déjà enregistrées, via
     * MoteurScenarios, résolus en nom/prix via la table produits.
     */
    public function show(Devis $devis)
    {
        $devis->load([
            'scenario.rubriques.questions.options',
            'reponses',
        ]);

        $resolution = collect();
        $visibleQuestionIds = collect();

        if ($devis->scenario) {
            $reponses = $devis->reponses->pluck('question_option_id', 'question_id')->toArray();
            $moteur = app(MoteurScenarios::class);

            $lignes = $moteur->resoudre($devis->scenario, $reponses);
            $visibleQuestionIds = $moteur->questionsAccessibles($devis->scenario, $reponses)->pluck('id');

            // Si la reference associee a la reponse est une declinaison EH
            // (ex: BFV5EH configure sur le scenario, cf. Produit::skuBaseDeclinaison),
            // on cherche celle qui correspond a la capacite EH reelle du dossier
            // (ex: BFV10EH si capacite_eh = 10) plutot que de garder la taille
            // configuree telle quelle.
            $refEffective = function (?string $ref) use ($devis) {
                if ($ref === null || $devis->capacite_eh === null) {
                    return $ref;
                }

                $base = Produit::skuBaseDeclinaison($ref);

                return $base !== null ? $base.$devis->capacite_eh.'EH' : $ref;
            };

            $refsOriginales = $lignes->pluck('produit_ref')->filter();
            $refsSouhaitees = $refsOriginales->map($refEffective);
            // On recupere aussi les references d'origine : si la declinaison
            // ciblee n'existe pas dans le catalogue, on retombe dessus plutot
            // que de n'afficher aucun produit.
            $produits = Produit::whereIn('ref', $refsOriginales->merge($refsSouhaitees)->unique())
                ->get()->keyBy('ref');

            $resolution = $lignes->map(function (array $ligne) use ($produits, $refEffective) {
                // Un produit libre porte son propre nom/prix, saisis directement
                // sur la réponse — pas de recherche dans le catalogue.
                if ($ligne['produit_ref'] === null) {
                    return [
                        'cle' => $ligne['cle'],
                        'produit_ref' => null,
                        'quantite' => $ligne['quantite'],
                        'nom' => $ligne['libelle_libre'],
                        'prix' => $ligne['prix_libre'],
                    ];
                }

                $refResolue = $refEffective($ligne['produit_ref']);
                $produit = $produits->get($refResolue);

                if (! $produit && $refResolue !== $ligne['produit_ref']) {
                    $refResolue = $ligne['produit_ref'];
                    $produit = $produits->get($refResolue);
                }

                $nom = $produit->nom ?? $refResolue;
                $ehResolue = Produit::valeurEhDeclinaison($refResolue);

                // Toutes les declinaisons d'une meme famille partagent le meme
                // nom chez AquaConnect (ex: "KIT BAC PEHD" quelle que soit la
                // taille) : on precise la taille retenue pour que ce soit lisible.
                if ($produit && $ehResolue !== null) {
                    $ehTexte = fmod($ehResolue, 1.0) === 0.0 ? (string) (int) $ehResolue : (string) $ehResolue;
                    $nom .= " ({$ehTexte} EH)";
                }

                return [
                    'cle' => $ligne['cle'],
                    'produit_ref' => $refResolue,
                    'quantite' => $ligne['quantite'],
                    'nom' => $nom,
                    'prix' => $produit->prix ?? null,
                ];
            })->values();
        }

        $tauxHoraires = TauxHoraire::orderBy('id')->get();

        $mainOeuvres = $devis->mainOeuvres()->with('heures')->get()->map(fn (DevisMainOeuvre $mo) => [
            'id' => $mo->id,
            'libelle' => $mo->libelle,
            'description' => $mo->description,
            'heures' => $mo->heures->map(fn (TauxHoraire $taux) => [
                'taux_horaire_id' => $taux->id,
                'libelle' => $taux->libelle,
                'nombre_heures' => $taux->pivot->nombre_heures,
            ])->values(),
            'cout' => $mo->heures->sum(fn (TauxHoraire $taux) => $taux->pivot->nombre_heures * $taux->montant),
        ]);

        $totalProduits = $resolution->sum(fn(array $ligne) => $ligne['quantite'] * ($ligne['prix'] ?? 0));
        $totalBase = $totalProduits + $mainOeuvres->sum('cout');
        $totalApresCoefficient = $totalBase * (1 + $devis->coefficient_difficulte / 100);

        $remiseMontant = match ($devis->remise_type) {
            'pourcentage' => $totalApresCoefficient * ($devis->remise_valeur ?? 0) / 100,
            default => $devis->remise_valeur ?? 0,
        };

        $totalHt = max(0, $totalApresCoefficient - $remiseMontant);
        $totalTva = round($totalHt * 0.20, 2);

        $totaux = [
            'total_ht' => round($totalHt, 2),
            'total_tva' => $totalTva,
            'total_ttc' => round($totalHt + $totalTva, 2),
        ];

        // Persiste le total recalculé sur le devis lui-même, pour que
        // l'Historique des chiffrages (qui lit directement ces colonnes,
        // sans repasser par ce calcul) affiche la bonne valeur.
        $devis->update($totaux);

        return inertia('franchise/devis/show', [
            'devis' => $devis,
            'resolution' => $resolution,
            'visibleQuestionIds' => $visibleQuestionIds,
            'mainOeuvres' => $mainOeuvres,
            'totaux' => $totaux,
            'tauxHoraires' => $tauxHoraires,
        ]);
    }
}
