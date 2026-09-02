<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DevisMainOeuvre extends Model
{
    protected $fillable = ['devis_id', 'libelle', 'description'];

    public function devis()
    {
        return $this->belongsTo(Devis::class);
    }

    /**
     * Detail des heures saisies pour cette ligne, une par taux horaire
     * (ex: 20h "Chantier", 5h "Mini-pelle") — remplace les anciennes
     * colonnes fixes nombre_heures_chantier/nombre_heures_mini_pelle.
     */
    public function heures()
    {
        return $this->belongsToMany(TauxHoraire::class, 'devis_main_oeuvre_heures')
            ->withPivot('nombre_heures')
            ->withTimestamps();
    }
}
