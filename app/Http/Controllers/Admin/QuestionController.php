<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rubrique;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function create(Rubrique $rubrique)
    {
        $rubrique->load('scenario');

        return inertia('admin/questions/create', [
            'rubrique' => $rubrique,
        ]);
    }

    public function store(Request $request, Rubrique $rubrique)
    {
        $validated = $request->validate([
            'texte' => 'required|string|max:255',
            'infos_bulle' => 'nullable|string',
        ]);

        $rubrique->questions()->create($validated);

        return redirect()->route('admin.scenarios.show', $rubrique->scenario_id);
    }
}
