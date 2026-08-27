<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DevisMainOeuvre extends Model
{
    protected $fillable = ['devis_id', 'libelle', 'description', 'nombre_heures_chantier', 'nombre_heures_mini_pelle'];

    public function devis()
    {
        return $this->belongsTo(Devis::class);
    }

}
