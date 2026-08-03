<?php

use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Rubrique;
use App\Models\Scenario;
use App\Services\MoteurScenarios;

function creerRubrique(Scenario $scenario, string $titre): Rubrique
{
    return $scenario->rubriques()->create(['titre' => $titre]);
}

function creerQuestion(Rubrique $rubrique, string $texte): Question
{
    return $rubrique->questions()->create(['texte' => $texte]);
}

function creerReponse(Question $question, string $libelle, array $attributs = []): QuestionOption
{
    return $question->options()->create(array_merge(['libelle' => $libelle], $attributs));
}

test('parcourt sequentiellement les questions sans redirection et cumule les produits', function () {
    $scenario = Scenario::create(['famille' => 'Test', 'nom' => 'Sequentiel']);

    $rubrique1 = creerRubrique($scenario, 'Section 1');
    $question1 = creerQuestion($rubrique1, 'Question 1');
    $reponse1 = creerReponse($question1, 'Reponse A');
    $reponse1->produits()->create(['produit_ref' => 'PROD-A', 'quantite' => 1]);

    $rubrique2 = creerRubrique($scenario, 'Section 2');
    $question2 = creerQuestion($rubrique2, 'Question 2');
    $reponse2 = creerReponse($question2, 'Reponse B');
    $reponse2->produits()->create(['produit_ref' => 'PROD-B', 'quantite' => 2]);

    $produits = (new MoteurScenarios)->resoudre($scenario, [
        $question1->id => $reponse1->id,
        $question2->id => $reponse2->id,
    ]);

    expect($produits)->toHaveCount(2);
    expect($produits->firstWhere('produit_ref', 'PROD-A')['quantite'])->toBe(1);
    expect($produits->firstWhere('produit_ref', 'PROD-B')['quantite'])->toBe(2);
});

test('suit une redirection vers une question precise', function () {
    $scenario = Scenario::create(['famille' => 'Test', 'nom' => 'RedirectionQuestion']);
    $rubrique = creerRubrique($scenario, 'Section unique');

    $question1 = creerQuestion($rubrique, 'Question 1');
    $question2 = creerQuestion($rubrique, 'Question 2 (intermediaire, ignoree)');
    $question3 = creerQuestion($rubrique, 'Question 3 (cible de la redirection)');

    $reponse1 = creerReponse($question1, 'Va direct a la question 3', [
        'question_suivante_id' => $question3->id,
    ]);

    $reponse3 = creerReponse($question3, 'Reponse finale');
    $reponse3->produits()->create(['produit_ref' => 'PROD-FINAL', 'quantite' => 1]);

    // Si le moteur suivait l'ordre naturel, il s'arreterait a la question 2
    // (pas de reponse donnee pour elle) sans jamais atteindre PROD-FINAL.
    $produits = (new MoteurScenarios)->resoudre($scenario, [
        $question1->id => $reponse1->id,
        $question3->id => $reponse3->id,
    ]);

    expect($produits)->toHaveCount(1);
    expect($produits->first()['produit_ref'])->toBe('PROD-FINAL');
});

test('suit une redirection vers une section et va a sa premiere question', function () {
    $scenario = Scenario::create(['famille' => 'Test', 'nom' => 'RedirectionSection']);

    $rubrique1 = creerRubrique($scenario, 'Section 1');
    $question1 = creerQuestion($rubrique1, 'Question 1');

    $rubrique2 = creerRubrique($scenario, 'Section 2');
    $question2a = creerQuestion($rubrique2, 'Premiere question de la section 2');
    creerQuestion($rubrique2, 'Deuxieme question de la section 2');

    $reponse1 = creerReponse($question1, 'Va a la section 2', [
        'rubrique_suivante_id' => $rubrique2->id,
    ]);

    $reponse2a = creerReponse($question2a, 'Reponse');
    $reponse2a->produits()->create(['produit_ref' => 'PROD-SECTION2', 'quantite' => 1]);

    $produits = (new MoteurScenarios)->resoudre($scenario, [
        $question1->id => $reponse1->id,
        $question2a->id => $reponse2a->id,
    ]);

    expect($produits)->toHaveCount(1);
    expect($produits->first()['produit_ref'])->toBe('PROD-SECTION2');
});

test('additionne les quantites quand le meme produit est declenche plusieurs fois', function () {
    $scenario = Scenario::create(['famille' => 'Test', 'nom' => 'Cumul']);
    $rubrique = creerRubrique($scenario, 'Section');

    $question1 = creerQuestion($rubrique, 'Question 1');
    $reponse1 = creerReponse($question1, 'Reponse 1');
    $reponse1->produits()->create(['produit_ref' => 'PROD-X', 'quantite' => 2]);

    $question2 = creerQuestion($rubrique, 'Question 2');
    $reponse2 = creerReponse($question2, 'Reponse 2');
    $reponse2->produits()->create(['produit_ref' => 'PROD-X', 'quantite' => 3]);

    $produits = (new MoteurScenarios)->resoudre($scenario, [
        $question1->id => $reponse1->id,
        $question2->id => $reponse2->id,
    ]);

    expect($produits)->toHaveCount(1);
    expect($produits->first()['quantite'])->toBe(5);
});

test('sarrete si aucune reponse n a ete donnee pour la question courante', function () {
    $scenario = Scenario::create(['famille' => 'Test', 'nom' => 'ReponseManquante']);
    $rubrique = creerRubrique($scenario, 'Section');
    $question1 = creerQuestion($rubrique, 'Question 1');
    $question2 = creerQuestion($rubrique, 'Question 2');

    $reponse1 = creerReponse($question1, 'Reponse 1');
    $reponse1->produits()->create(['produit_ref' => 'PROD-1', 'quantite' => 1]);

    $reponse2 = creerReponse($question2, 'Reponse 2');
    $reponse2->produits()->create(['produit_ref' => 'PROD-2', 'quantite' => 1]);

    // On ne donne pas de reponse a la question 2
    $produits = (new MoteurScenarios)->resoudre($scenario, [
        $question1->id => $reponse1->id,
    ]);

    expect($produits)->toHaveCount(1);
    expect($produits->first()['produit_ref'])->toBe('PROD-1');
});

test('se protege contre une boucle de redirections', function () {
    $scenario = Scenario::create(['famille' => 'Test', 'nom' => 'Boucle']);
    $rubrique = creerRubrique($scenario, 'Section');

    $question1 = creerQuestion($rubrique, 'Question 1');
    $question2 = creerQuestion($rubrique, 'Question 2');

    $reponse1 = creerReponse($question1, 'Va a la question 2', [
        'question_suivante_id' => $question2->id,
    ]);
    $reponse2 = creerReponse($question2, 'Revient a la question 1', [
        'question_suivante_id' => $question1->id,
    ]);

    $produits = (new MoteurScenarios)->resoudre($scenario, [
        $question1->id => $reponse1->id,
        $question2->id => $reponse2->id,
    ]);

    // Ne doit pas boucler indefiniment ; simplement s'arreter sans produits.
    expect($produits)->toHaveCount(0);
});
