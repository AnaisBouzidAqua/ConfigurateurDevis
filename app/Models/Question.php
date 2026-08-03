<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = ['texte', 'ordre', 'rubrique_id', 'infos_bulle'];

    protected $touches = ['rubrique'];

    public function options()
    {
        return $this->hasMany(QuestionOption::class);
    }

    public function rubrique()
    {
        return $this->belongsTo(Rubrique::class);
    }
}
