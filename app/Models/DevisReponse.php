<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DevisReponse extends Model
{
    protected $fillable = ['devis_id', 'question_id', 'question_option_id'];

    public function devis()
    {
        return $this->belongsTo(Devis::class);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    public function questionOption()
    {
        return $this->belongsTo(QuestionOption::class);
    }

}
