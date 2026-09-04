<?php

namespace App\Catalogues;

/**
 * Taux de marge par défaut, par type de tarif. La marge s'applique aux
 * produits (résolus depuis le scénario) et aux fournitures — pas aux
 * prestations de service ni à la main d'œuvre.
 *
 * Données fictives en attendant AquaConnect (écran « Politique tarifaire ») :
 * seul le corps de {@see taux()} change quand la source est disponible.
 */
class PolitiqueTarifaire
{
    public const TARIF_PRO = 'pro';

    public const TARIF_PUBLIC = 'public';

    public const TARIF_AUTOCONSTRUCTEUR = 'autoconstructeur';

    /**
     * Taux de marge (en %) par type de tarif.
     *
     * @return array{pro: float, public: float, autoconstructeur: float}
     */
    public static function taux(): array
    {
        return [
            self::TARIF_PRO => 30.0,
            self::TARIF_PUBLIC => 30.0,
            self::TARIF_AUTOCONSTRUCTEUR => 30.0,
        ];
    }

    /**
     * Facteur multiplicatif à appliquer au prix d'achat pour un type de tarif
     * (ex : taux 30 % → 1.30).
     */
    public static function facteurMarge(string $typeTarif): float
    {
        return 1 + (self::taux()[$typeTarif] ?? 0) / 100;
    }
}
