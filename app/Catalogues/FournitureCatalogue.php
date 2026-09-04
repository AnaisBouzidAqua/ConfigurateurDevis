<?php

namespace App\Catalogues;

use Illuminate\Support\Collection;

/**
 * Liste des fournitures sélectionnables lors d'un chiffrage.
 *
 * Données fictives en attendant l'intégration AquaConnect : le jour où la
 * source est disponible, seul le corps de {@see all()} change (un appel HTTP
 * à la place du tableau en dur), le reste de l'application est inchangé.
 *
 * @phpstan-type ArticleCatalogue array{ref: string, nom: string, prix: float}
 */
class FournitureCatalogue
{
    /**
     * @return Collection<int, ArticleCatalogue>
     */
    public static function all(): Collection
    {
        return collect([
            ['ref' => 'FOUR-EPDM', 'nom' => 'Géomembrane EPDM 1,2 mm (m²)', 'prix' => 14.50],
            ['ref' => 'FOUR-GEOTEX', 'nom' => 'Géotextile de protection 300 g/m² (m²)', 'prix' => 2.80],
            ['ref' => 'FOUR-SABLE', 'nom' => 'Sable lavé pour massif filtrant (tonne)', 'prix' => 62.00],
            ['ref' => 'FOUR-GRAVIER', 'nom' => 'Gravier roulé pour massif filtrant (tonne)', 'prix' => 48.00],
            ['ref' => 'FOUR-REGARD', 'nom' => 'Regard de répartition PEHD', 'prix' => 145.00],
            ['ref' => 'FOUR-RELEVAGE', 'nom' => 'Poste de relevage équipé pompe', 'prix' => 1290.00],
            ['ref' => 'FOUR-PVC100', 'nom' => 'Tuyau PVC assainissement Ø100 (ml)', 'prix' => 6.90],
            ['ref' => 'FOUR-ROSEAUX', 'nom' => 'Plants de roseaux Phragmites (lot de 100)', 'prix' => 85.00],
            ['ref' => 'FOUR-VENTIL', 'nom' => 'Kit de ventilation primaire + secondaire', 'prix' => 110.00],
        ]);
    }
}
