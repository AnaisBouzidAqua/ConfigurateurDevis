<?php

namespace App\Catalogues;

use Illuminate\Support\Collection;

/**
 * Liste des prestations de service sélectionnables lors d'un chiffrage.
 *
 * Données fictives en attendant l'intégration AquaConnect : le jour où la
 * source est disponible, seul le corps de {@see all()} change (un appel HTTP
 * à la place du tableau en dur), le reste de l'application est inchangé.
 *
 * @phpstan-type ArticleCatalogue array{ref: string, nom: string, prix: float}
 */
class PrestationCatalogue
{
    /**
     * @return Collection<int, ArticleCatalogue>
     */
    public static function all(): Collection
    {
        return collect([
            ['ref' => 'PREST-ETUDE', 'nom' => 'Étude de conception et dimensionnement', 'prix' => 650.00],
            ['ref' => 'PREST-VISITE', 'nom' => 'Visite technique préalable', 'prix' => 180.00],
            ['ref' => 'PREST-IMPLANT', 'nom' => 'Implantation et piquetage sur site', 'prix' => 240.00],
            ['ref' => 'PREST-MES', 'nom' => 'Mise en service et formation de l\'usager', 'prix' => 320.00],
            ['ref' => 'PREST-SPANC', 'nom' => 'Rédaction du dossier de conformité SPANC', 'prix' => 290.00],
            ['ref' => 'PREST-ACCOMP', 'nom' => 'Accompagnement de l\'auto-constructeur (journée)', 'prix' => 480.00],
            ['ref' => 'PREST-ENTRETIEN', 'nom' => 'Contrat d\'entretien annuel', 'prix' => 210.00],
            ['ref' => 'PREST-FORMATION', 'nom' => 'Formation installateur agréé', 'prix' => 900.00],
        ]);
    }
}
