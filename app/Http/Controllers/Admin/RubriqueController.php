<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rubrique;
use App\Models\Scenario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RubriqueController extends Controller
{
    public function store(Request $request, Scenario $scenario)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'bulle_infos' => 'nullable|string',
        ]);

        $scenario->rubriques()->create($validated);

        return redirect()->route('admin.scenarios.show', $scenario);
    }

    public function update(Request $request, Rubrique $rubrique)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'bulle_infos' => 'nullable|string',
        ]);

        $rubrique->update($validated);

        return redirect()->route('admin.scenarios.show', $rubrique->scenario_id);
    }

    public function duplicate(Rubrique $rubrique)
    {
        $rubrique->load('questions.options.produits');

        DB::transaction(function () use ($rubrique) {
            $copie = $rubrique->scenario->rubriques()->create([
                'titre' => $rubrique->titre.' (copie)',
                'bulle_infos' => $rubrique->bulle_infos,
            ]);

            foreach ($rubrique->questions as $question) {
                $questionCopie = $copie->questions()->create([
                    'texte' => $question->texte,
                    'infos_bulle' => $question->infos_bulle,
                ]);

                foreach ($question->options as $option) {
                    $optionCopie = $questionCopie->options()->create([
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
            }
        });

        return redirect()->route('admin.scenarios.show', $rubrique->scenario_id);
    }

    public function destroy(Rubrique $rubrique)
    {
        $scenarioId = $rubrique->scenario_id;

        Rubrique::whereKey($rubrique->getKey())->delete();

        Scenario::find($scenarioId)->touch();

        return redirect()->route('admin.scenarios.show', $scenarioId);
    }
}
