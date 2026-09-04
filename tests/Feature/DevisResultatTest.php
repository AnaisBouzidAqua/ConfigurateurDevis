<?php

use App\Models\Devis;
use App\Models\TauxHoraire;

function devisAvecMainOeuvre(array $attributs, int $montantTaux, int $heures): Devis
{
    $devis = Devis::create($attributs);
    $taux = TauxHoraire::create(['libelle' => 'Chantier', 'montant' => $montantTaux]);
    $mainOeuvre = $devis->mainOeuvres()->create(['libelle' => 'Pose', 'description' => 'x']);
    $mainOeuvre->heures()->attach($taux->id, ['nombre_heures' => $heures]);

    return $devis;
}

test('le resultat applique le coefficient de difficulte', function () {
    // base 10 h x 100 = 1000 ; +10 % => 1100
    $devis = devisAvecMainOeuvre(['coefficient_difficulte' => 10], montantTaux: 100, heures: 10);

    $this->get(route('franchise.devis.show', $devis))
        ->assertInertia(fn ($page) => $page->where('totaux.total_ht', fn ($v) => (float) $v === 1100.0));
});

test('le recapitulatif n expose plus la TVA, le TTC ni la remise commerciale', function () {
    $devis = Devis::create([]);

    $this->get(route('franchise.devis.show', $devis))
        ->assertInertia(fn ($page) => $page
            ->has('totaux.total_ht')
            ->missing('totaux.total_tva')
            ->missing('totaux.total_ttc')
            ->missing('devis.remise_valeur')
            ->missing('devis.remise_type'));
});

test('le resultat calcule est persiste sur le devis', function () {
    $devis = devisAvecMainOeuvre([], montantTaux: 100, heures: 10);

    $this->get(route('franchise.devis.show', $devis));

    expect($devis->fresh()->total_ht)->toEqual(1000);
});
