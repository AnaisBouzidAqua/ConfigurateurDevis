<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DevisLigne extends Model
{
   protected $fillable = ['devis_id', 'produit_ref', 'libelle', 'quantite', 'prix_unitaire'];

    public function devis()
    {
        return $this->belongsTo(Devis::class);
    }
}
