<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Devis extends Model
{
    protected $fillable = [
    'scenario_id',
        'client_nom',
        'dispositif',
        'nombre_batiments',
        'capacite_eh',
        'nombre_chambres',
        'type_effluents',
        'installateur',
        'type_installateur',
        'installateur_agree_nom',
        'type_realisation',
        'coefficient_difficulte',
        'remise_valeur',
        'remise_type',
        'total_ht',
        'total_tva',
        'total_ttc',
        'statut',
        'archived_at',
    ];

    protected $casts = [
        'archived_at' => 'datetime',
    ];

    public function scenario()
    {
        return $this->belongsTo(Scenario::class);
    }

    public function lignes()
    {
        return $this->hasMany(DevisLigne::class);
    }

    public function mainOeuvres()
    {
        return $this->hasMany(DevisMainOeuvre::class);
    }

    public function reponses()
    {
        return $this->hasMany(DevisReponse::class);
    }

}
