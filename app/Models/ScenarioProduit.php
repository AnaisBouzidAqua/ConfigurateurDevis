<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScenarioProduit extends Model
{
    protected $fillable = ['scenario_id', 'produit_ref', 'quantite'];

    public function scenario()
    {
        return $this->belongsTo(Scenario::class);
    }
}
