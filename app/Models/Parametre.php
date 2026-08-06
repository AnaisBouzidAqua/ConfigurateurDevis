<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Parametre extends Model
{
    protected $fillable = ['taux_horaire_chantier', 'taux_horaire_mini_pelle'];

    public static function current(): self
    {
        return static::firstOrCreate([]);
    }
}
