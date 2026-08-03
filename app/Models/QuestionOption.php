<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionOption extends Model
{
    protected $fillable = ['question_id', 'libelle', 'question_suivante_id', 'rubrique_suivante_id'];

    protected $touches = ['question'];

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    public function questionSuivante()
    {
        return $this->belongsTo(Question::class, 'question_suivante_id');
    }

    public function produits()
    {
        return $this->hasMany(QuestionOptionProduit::class);
    }

    public function rubriqueSuivante()
    {
        return $this->belongsTo(Rubrique::class, 'rubrique_suivante_id');
    }
}
