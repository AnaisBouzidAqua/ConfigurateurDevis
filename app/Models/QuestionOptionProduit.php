<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionOptionProduit extends Model
{
    protected $fillable = ['question_option_id', 'produit_ref', 'quantite'];

    protected $touches = ['questionOption'];

    public function questionOption()
    {
        return $this->belongsTo(QuestionOption::class);
    }
}
