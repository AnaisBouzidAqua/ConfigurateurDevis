<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Rubrique;
use Illuminate\Http\Request;

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
}
