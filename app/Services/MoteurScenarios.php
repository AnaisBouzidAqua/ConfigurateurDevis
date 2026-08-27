<?php

namespace App\Services;

use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\QuestionOptionProduit;
use App\Models\Scenario;
use Illuminate\Support\Collection;

class MoteurScenarios
{
    /**
     * Parcourt l'arbre de questions du scenario en suivant les reponses
     * donnees, et calcule les produits a ajouter au devis.
     *
     * @param  array<int, int>  $reponses  Reponses du franchise, au format [question_id => question_option_id].
     * @return Collection<int, array{produit_ref: ?string, libelle_libre: ?string, prix_libre: ?float, quantite: int}>
     */
    public function resoudre(Scenario $scenario, array $reponses): Collection
    {
        return $this->parcourir($scenario, $reponses)['produits'];
    }

    /**
     * Les questions atteignables avec les reponses donnees jusqu'ici, dans
     * l'ordre du parcours — y compris la prochaine question sans reponse,
     * pour que le franchise sache quoi remplir ensuite.
     *
     * @param  array<int, int>  $reponses
     * @return Collection<int, Question>
     */
    public function questionsAccessibles(Scenario $scenario, array $reponses): Collection
    {
        return $this->parcourir($scenario, $reponses)['questions'];
    }

    /**
     * @param  array<int, int>  $reponses
     * @return array{produits: Collection<int, array{produit_ref: ?string, libelle_libre: ?string, prix_libre: ?float, quantite: int}>, questions: Collection<int, Question>}
     */
    private function parcourir(Scenario $scenario, array $reponses): array
    {
        $scenario->loadMissing('rubriques.questions.options.produits');

        $questions = $scenario->rubriques->flatMap->questions;

        if ($questions->isEmpty()) {
            return ['produits' => collect(), 'questions' => collect()];
        }

        $questionCourante = $questions->first();
        $produitsDeclenches = collect();
        $questionsAccessibles = collect();
        $questionsVisitees = [];

        while ($questionCourante !== null) {
            if (in_array($questionCourante->id, $questionsVisitees, true)) {
                break;
            }

            $questionsVisitees[] = $questionCourante->id;
            $questionsAccessibles->push($questionCourante);

            $optionChoisie = $questionCourante->options
                ->firstWhere('id', $reponses[$questionCourante->id] ?? null);

            if ($optionChoisie === null) {
                break;
            }

            foreach ($optionChoisie->produits as $produit) {
                $produitsDeclenches->push($produit);
            }

            $questionCourante = $this->questionSuivante($questions, $questionCourante, $optionChoisie);
        }

        // Les produits du catalogue se cumulent par reference (meme produit
        // declenche plusieurs fois = quantites additionnees). Les produits
        // libres n'ont pas de reference commune : chacun reste sa propre
        // ligne, sinon ils fusionneraient tous ensemble sous une cle "null".
        $produits = $produitsDeclenches
            ->groupBy(fn (QuestionOptionProduit $produit) => $produit->produit_ref ?? "libre-{$produit->id}")
            ->map(fn (Collection $groupe, string $cle) => [
                'cle' => $cle,
                'produit_ref' => $groupe->first()->produit_ref,
                'libelle_libre' => $groupe->first()->libelle_libre,
                'prix_libre' => $groupe->first()->prix_libre,
                'quantite' => $groupe->sum('quantite'),
            ])
            ->values();

        return ['produits' => $produits, 'questions' => $questionsAccessibles];
    }

    private function questionSuivante(Collection $questions, Question $actuelle, QuestionOption $option): ?Question
    {
        if ($option->question_suivante_id !== null) {
            return $questions->firstWhere('id', $option->question_suivante_id);
        }

        if ($option->rubrique_suivante_id !== null) {
            return $questions->firstWhere('rubrique_id', $option->rubrique_suivante_id);
        }

        $index = $questions->search(fn (Question $q) => $q->id === $actuelle->id);

        return $questions->get($index + 1);
    }
}
