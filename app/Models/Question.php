<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = ['texte', 'ordre'];

    public function options()
    {
        return $this->hasMany(QuestionOption::class);
    }

}
