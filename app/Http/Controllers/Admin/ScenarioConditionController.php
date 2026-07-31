<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Scenario;
use Illuminate\Http\Request;

class ScenarioConditionController extends Controller
{
    public function store(Request $request, Scenario $scenario)
    {
        $validated = $request->validate([
            'question_id' => 'required|exists:questions,id',
            'question_option_id' => 'required|exists:question_options,id',
        ]);

        $scenario->conditions()->create($validated);

        return redirect()->route('admin.scenarios.show', $scenario);
    }
}
