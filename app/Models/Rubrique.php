<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rubrique extends Model
{
    protected $fillable = ['scenario_id', 'titre', 'bulle_infos', 'ordre'];

    protected $touches = ['scenario'];

    public function scenario()
    {
        return $this->belongsTo(Scenario::class);
    }

    public function questions()
    {
        return $this->hasMany(Question::class)->orderBy('ordre')->orderBy('id');
    }

}
