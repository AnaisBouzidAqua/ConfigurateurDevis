<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Scenario;
use Illuminate\Http\Request;

class ScenarioProduitController extends Controller
{
    public function store(Request $request, Scenario $scenario)
    {
        $validated = $request->validate([
            'produit_ref' => 'required|string|max:255',
            'quantite' => 'required|integer|min:1',
        ]);

        $scenario->produits()->create($validated);

        return redirect()->route('admin.scenarios.show', $scenario);
    }
}
