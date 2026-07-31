<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScenarioCondition extends Model
{
    protected $fillable = ['scenario_id', 'question_id', 'question_option_id'];

    public function scenario()
    {
        return $this->belongsTo(Scenario::class);
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
