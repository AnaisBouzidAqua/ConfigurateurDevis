<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use App\Models\Parametre;
use Illuminate\Http\Request;

class ParametreController extends Controller
{
    /**
     * Affiche le formulaire des taux horaires globaux.
     */
    public function edit()
    {
        return inertia('franchise/parametres', [
            'parametre' => Parametre::current(),
        ]);
    }

    /**
     * Enregistre les taux horaires globaux.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'taux_horaire_chantier' => 'required|numeric|min:0',
            'taux_horaire_mini_pelle' => 'required|numeric|min:0',
        ]);

        Parametre::current()->update($validated);

        return redirect()->route('franchise.parametres.edit');
    }
}
