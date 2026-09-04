<?php

namespace App\Models;

use App\Catalogues\PolitiqueTarifaire;
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
        'total_ht',
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

    /**
     * Type de tarif applicable, d'après les champs Dossier (venant d'AquaConnect) :
     * - « chantier clé en main » → tarif public
     * - « vente de kit » + autoconstructeur → tarif autoconstructeur
     * - « vente de kit » + installateur agréé / non agréé → tarif pro
     */
    public function typeTarif(): string
    {
        if ($this->installateur === 'chantier_cle_en_main') {
            return PolitiqueTarifaire::TARIF_PUBLIC;
        }

        return $this->type_installateur === 'autoconstructeur'
            ? PolitiqueTarifaire::TARIF_AUTOCONSTRUCTEUR
            : PolitiqueTarifaire::TARIF_PRO;
    }
}
