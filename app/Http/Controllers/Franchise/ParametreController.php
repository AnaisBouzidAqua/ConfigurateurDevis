<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use App\Models\TauxHoraire;
use Illuminate\Http\Request;

class ParametreController extends Controller
{
    /**
     * Affiche la liste des taux horaires globaux.
     */
    public function edit()
    {
        return inertia('franchise/parametres', [
            'tauxHoraires' => TauxHoraire::orderBy('id')->get(),
        ]);
    }

    /**
     * Ajoute un nouveau type de taux horaire.
     */
    public function storeTauxHoraire(Request $request)
    {
        $validated = $request->validate([
            'libelle' => 'required|string|max:255',
            'montant' => 'required|numeric|min:0',
        ]);

        TauxHoraire::create($validated);

        return redirect()->route('franchise.parametres.edit');
    }

    /**
     * Met a jour le montant d'un taux horaire existant.
     */
    public function updateTauxHoraire(Request $request, TauxHoraire $tauxHoraire)
    {
        $validated = $request->validate([
            'montant' => 'required|numeric|min:0',
        ]);

        $tauxHoraire->update($validated);

        return redirect()->route('franchise.parametres.edit');
    }

    /**
     * Supprime un taux horaire.
     */
    public function destroyTauxHoraire(TauxHoraire $tauxHoraire)
    {
        $tauxHoraire->delete();

        return redirect()->route('franchise.parametres.edit');
    }
}
