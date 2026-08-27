<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    protected $fillable = ['ref', 'nom', 'prix'];

    /**
     * Extrait le "SKU de base" d'une reference de declinaison EH
     * (ex: "BFV10EH" -> "BFV"), ou null si ce n'est pas une declinaison EH.
     */
    public static function skuBaseDeclinaison(string $ref): ?string
    {
        if (preg_match('/^(.+?)\d+(?:\.\d+)?EH$/i', $ref, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Valeur EH portee par une reference de declinaison (ex: "BFV10EH" -> 10.0),
     * ou null si ce n'est pas une declinaison EH.
     */
    public static function valeurEhDeclinaison(string $ref): ?float
    {
        if (preg_match('/(\d+(?:\.\d+)?)EH$/i', $ref, $matches)) {
            return (float) $matches[1];
        }

        return null;
    }

    /**
     * Liste des produits proposee au picker admin : les declinaisons EH
     * (ex: BFV5EH, BFV10EH, meme produit "KIT BAC PEHD" en tailles differentes)
     * ne sont representees que par leur plus petite taille, pour eviter
     * qu'un admin non-technique se retrouve face a plusieurs lignes
     * quasi-identiques sans savoir laquelle choisir. La resolution du devis
     * se charge ensuite de choisir la bonne taille selon la capacite EH.
     */
    public static function pourSelectionAdmin(): Collection
    {
        return static::orderBy('nom')->get()
            ->groupBy(fn (Produit $produit) => static::skuBaseDeclinaison($produit->ref) ?? $produit->ref)
            ->map(function (Collection $groupe) {
                $representant = $groupe->sortBy(
                    fn (Produit $produit) => static::valeurEhDeclinaison($produit->ref) ?? 0,
                )->first();

                // Affiche a l'admin qu'il choisit une famille de declinaisons
                // (pas une taille precise) quand il y en a plus d'une, pour ne
                // pas laisser croire que la reference du representant est figee.
                $representant->a_des_declinaisons = $groupe->count() > 1;

                return $representant;
            })
            ->values()
            ->sortBy('nom')
            ->values();
    }
}
