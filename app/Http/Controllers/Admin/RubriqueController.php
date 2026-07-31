<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rubrique;
use App\Models\Scenario;
use Illuminate\Http\Request;

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
        ]);

        $rubrique->update($validated);

        return redirect()->route('admin.scenarios.show', $rubrique->scenario_id);
    }

    public function duplicate(Rubrique $rubrique)
    {
        $rubrique->scenario->rubriques()->create([
            'titre' => $rubrique->titre.' (copie)',
            'bulle_infos' => $rubrique->bulle_infos,
        ]);

        return redirect()->route('admin.scenarios.show', $rubrique->scenario_id);
    }

    public function destroy(Rubrique $rubrique)
    {
        $scenarioId = $rubrique->scenario_id;

        Rubrique::whereKey($rubrique->getKey())->delete();

        return redirect()->route('admin.scenarios.show', $scenarioId);
    }
}
