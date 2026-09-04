<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class DevisLigne extends Model
{
    public const CATEGORIE_PRESTATION = 'prestation';

    public const CATEGORIE_FOURNITURE = 'fourniture';

    public const CATEGORIES = [self::CATEGORIE_PRESTATION, self::CATEGORIE_FOURNITURE];

    protected $fillable = ['devis_id', 'categorie', 'produit_ref', 'libelle', 'quantite', 'prix_unitaire'];

    public function devis()
    {
        return $this->belongsTo(Devis::class);
    }

    /** @param  Builder<DevisLigne>  $query */
    public function scopeCategorie(Builder $query, string $categorie): void
    {
        $query->where('categorie', $categorie);
    }
}
