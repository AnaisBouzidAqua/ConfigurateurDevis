<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Scenario extends Model
{
    protected $fillable = ['famille', 'nom'];

    public function rubriques()
    {
        return $this->hasMany(Rubrique::class)->orderBy('ordre')->orderBy('id');
    }

    public function devis()
    {
        return $this->hasMany(Devis::class);
    }

}
