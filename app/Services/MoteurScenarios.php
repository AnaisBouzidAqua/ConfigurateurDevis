<?php

namespace App\Services;

use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Scenario;
use Illuminate\Support\Collection;

class MoteurScenarios
{
    /**
     * Parcourt l'arbre de questions du scenario en suivant les reponses
     * donnees, et calcule les produits a ajouter au devis.
     *
     * @param  array<int, int>  $reponses  Reponses du franchise, au format [question_id => question_option_id].
     * @return Collection<int, array{produit_ref: string, quantite: int}>
     */
    public function resoudre(Scenario $scenario, array $reponses): Collection
    {
        $scenario->loadMissing('rubriques.questions.options.produits');

        $questions = $scenario->rubriques->flatMap->questions;

        if ($questions->isEmpty()) {
            return collect();
        }

        $questionCourante = $questions->first();
        $produitsDeclenches = collect();
        $questionsVisitees = [];

        while ($questionCourante !== null) {
            if (in_array($questionCourante->id, $questionsVisitees, true)) {
                break;
            }

            $questionsVisitees[] = $questionCourante->id;

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

        return $produitsDeclenches
            ->groupBy('produit_ref')
            ->map(fn (Collection $groupe) => [
                'produit_ref' => $groupe->first()->produit_ref,
                'quantite' => $groupe->sum('quantite'),
            ])
            ->values();
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
