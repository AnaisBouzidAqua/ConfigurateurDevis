<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Scenario extends Model
{
    protected $fillable = ['famille', 'nom'];

    public function conditions()
    {
        return $this->hasMany(ScenarioCondition::class);
    }

    public function produits()
    {
        return $this->hasMany(ScenarioProduit::class);
    }

   public function rubriques()
    {
        return $this->hasMany(Rubrique::class)->orderBy('ordre')->orderBy('id');
    }

    /**
     * Determine si ce scenario doit se declencher pour les reponses donnees.
     *
     * @param  array<int, int>  $reponses  Reponses du franchise, au format [question_id => question_option_id].
     * @return bool true seulement si TOUTES les conditions du scenario sont satisfaites (ET logique).
     *              Un scenario sans aucune condition ne se declenche jamais (evite un scenario
     *              mal configure qui matcherait tout le temps).
     */
    public function correspond(array $reponses): bool
    {
        if ($this->conditions->isEmpty()) {
            return false;
        }

        foreach ($this->conditions as $condition) {
            $reponseDonnee = $reponses[$condition->question_id] ?? null;

            if ($reponseDonnee !== $condition->question_option_id) {
                return false;
            }
        }

        return true;
    }
}
