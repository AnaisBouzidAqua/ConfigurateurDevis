<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rubrique;
use App\Models\Question;
use App\Models\Scenario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class QuestionController extends Controller
{
    /**
     * Enregistre une nouvelle question.
     */
    public function store(Request $request, Rubrique $rubrique)
    {
        $validated = $request->validate([
            'texte' => 'required|string|max:255',
            'infos_bulle' => 'nullable|string',
            'reponses' => 'required|array|min:1',
            'reponses.*.libelle' => 'required|string|max:255',
            'reponses.*.rubrique_suivante_id' => 'nullable|exists:rubriques,id',
            'reponses.*.question_suivante_id' => 'nullable|exists:questions,id',
            'reponses.*.produits' => 'array',
            'reponses.*.produits.*.produit_ref' => 'required|string|max:255',
            'reponses.*.produits.*.quantite' => 'required|integer|min:1',
        ]);

        $question = $rubrique->questions()->create([
            'texte' => $validated['texte'],
            'infos_bulle' => $validated['infos_bulle'] ?? null,
        ]);


        foreach ($validated['reponses'] as $reponse) {
            $option = $question->options()->create([
                'libelle' => $reponse['libelle'],
                'rubrique_suivante_id' => $reponse['rubrique_suivante_id'] ?? null,
                'question_suivante_id' => $reponse['question_suivante_id'] ?? null,
            ]);

            foreach ($reponse['produits'] ?? [] as $produit) {
                $option->produits()->create($produit);
            }
        }

        return redirect()->route('admin.scenarios.show', $rubrique->scenario_id);
    }

    public function duplicate(Question $question)
    {
        $question->load('options.produits');

        DB::transaction(function () use ($question) {
            $copie = $question->rubrique->questions()->create([
                'texte' => $question->texte,
                'infos_bulle' => $question->infos_bulle,
            ]);

            foreach ($question->options as $option) {
                $optionCopie = $copie->options()->create([
                    'libelle' => $option->libelle,
                    'question_suivante_id' => $option->question_suivante_id,
                    'rubrique_suivante_id' => $option->rubrique_suivante_id,
                ]);

                foreach ($option->produits as $produit) {
                    $optionCopie->produits()->create([
                        'produit_ref' => $produit->produit_ref,
                        'quantite' => $produit->quantite,
                    ]);
                }
            }
        });

        return redirect()->route('admin.scenarios.show', $question->rubrique->scenario_id);
    }

    public function destroy(Question $question)
    {
        $scenarioId = $question->rubrique->scenario_id;

        Question::destroy($question->id);

        Scenario::find($scenarioId)->touch();

        return redirect()->route('admin.scenarios.show', $scenarioId);
    }

    /**
     * Enregistre le nouvel ordre des questions d'une rubrique, déterminé par
     * un glisser-déposer côté admin.
     */
    public function reorder(Request $request, Rubrique $rubrique)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:questions,id',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['ids'] as $index => $id) {
                Question::whereKey($id)->update(['ordre' => $index]);
            }
        });

        return redirect()->route('admin.scenarios.show', $rubrique->scenario_id);
    }


    public function update(Request $request, Question $question)
    {
        $validated = $request->validate([
            'texte' => 'required|string|max:255',
            'infos_bulle' => 'nullable|string',
            'reponses' => 'required|array|min:1',
            'reponses.*.libelle' => 'required|string|max:255',
            'reponses.*.rubrique_suivante_id' => 'nullable|exists:rubriques,id',
            'reponses.*.question_suivante_id' => 'nullable|exists:questions,id',
            'reponses.*.produits' => 'array',
            'reponses.*.produits.*.produit_ref' => 'required|string|max:255',
            'reponses.*.produits.*.quantite' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($question, $validated) {
            $question->update([
                'texte' => $validated['texte'],
                'infos_bulle' => $validated['infos_bulle'] ?? null,
            ]);

            // On repart de zero plutot que d'essayer de faire correspondre chaque
            // reponse existante a sa version modifiee : plus simple, et les ajouts/
            // suppressions de reponses depuis le formulaire sont geres naturellement.
            $question->options()->delete();

            foreach ($validated['reponses'] as $reponse) {
                $option = $question->options()->create([
                    'libelle' => $reponse['libelle'],
                    'rubrique_suivante_id' => $reponse['rubrique_suivante_id'] ?? null,
                    'question_suivante_id' => $reponse['question_suivante_id'] ?? null,
                ]);

                foreach ($reponse['produits'] ?? [] as $produit) {
                    $option->produits()->create($produit);
                }
            }
        });

        return redirect()->route('admin.scenarios.show', $question->rubrique->scenario_id);
    }

}


