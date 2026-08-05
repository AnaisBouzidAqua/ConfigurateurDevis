<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use App\Models\Scenario;
use App\Models\Devis;
use App\Models\DevisReponse;
use App\Models\Produit;
use App\Services\MoteurScenarios;
use Illuminate\Http\Request;

class DevisController extends Controller
{
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

            $produits = Produit::whereIn('ref', $lignes->pluck('produit_ref'))->get()->keyBy('ref');

            $resolution = $lignes->map(function (array $ligne) use ($produits) {
                $produit = $produits->get($ligne['produit_ref']);

                return [
                    'produit_ref' => $ligne['produit_ref'],
                    'quantite' => $ligne['quantite'],
                    'nom' => $produit->nom ?? $ligne['produit_ref'],
                    'prix' => $produit->prix ?? null,
                ];
            })->values();
        }

        return inertia('franchise/devis/show', [
            'devis' => $devis,
            'resolution' => $resolution,
            'visibleQuestionIds' => $visibleQuestionIds,
        ]);
    }
}
