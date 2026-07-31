<?php

namespace App\Services;

use App\Models\Scenario;
use Illuminate\Support\Collection;

class MoteurScenarios
{
    /**
     * Determine quels scenarios se declenchent pour les reponses d'un franchise.
     *
     * @param  array<int, int>  $reponses  Reponses du franchise, au format [question_id => question_option_id].
     * @return Collection<int, Scenario> Les scenarios declenches (conditions et produits deja charges),
     *                                   pas encore les produits agreges — voir l'etape suivante.
     */
    public function resoudre(array $reponses): Collection
    {
        return Scenario::with(['conditions', 'produits'])
            ->get()
            ->filter(fn (Scenario $scenario) => $scenario->correspond($reponses));
    }

    /**
     * Calcule les produits a ajouter au devis, tous scenarios declenches confondus.
     * Si plusieurs scenarios ajoutent le meme produit, les quantites sont additionnees
     * plutot que d'avoir des lignes en double.
     *
     * @param  array<int, int>  $reponses
     * @return Collection<int, array{produit_ref: string, quantite: int}>
     */
    public function produitsDeclenches(array $reponses): Collection
    {
        return $this->resoudre($reponses)
            ->flatMap(fn (Scenario $scenario) => $scenario->produits)
            ->groupBy('produit_ref')
            ->map(fn (Collection $produits) => [
                'produit_ref' => $produits->first()->produit_ref,
                'quantite' => $produits->sum('quantite'),
            ])
            ->values();
    }
}
