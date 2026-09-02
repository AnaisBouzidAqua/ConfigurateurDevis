<?php

use App\Models\TauxHoraire;

test('la page parametres liste les taux horaires (Chantier et Mini-pelle repris de l ancienne config)', function () {
    $this->get(route('franchise.parametres.edit'))
        ->assertInertia(fn ($page) => $page
            ->component('franchise/parametres')
            ->has('tauxHoraires', 2)
            ->where('tauxHoraires.0.libelle', 'Chantier')
            ->where('tauxHoraires.1.libelle', 'Mini-pelle'));
});

test('ajoute un taux horaire', function () {
    $this->post(route('franchise.parametres.taux_horaires.store'), [
        'libelle' => 'Grue',
        'montant' => 120,
    ])->assertRedirect(route('franchise.parametres.edit'));

    expect(TauxHoraire::where('libelle', 'Grue')->value('montant'))->toEqual(120);
});

test('le libelle et le montant sont obligatoires pour ajouter un taux horaire', function () {
    $this->post(route('franchise.parametres.taux_horaires.store'), [])
        ->assertSessionHasErrors(['libelle', 'montant']);
});

test('modifie le montant d un taux horaire existant', function () {
    $taux = TauxHoraire::create(['libelle' => 'Chantier', 'montant' => 45]);

    $this->put(route('franchise.parametres.taux_horaires.update', $taux), ['montant' => 52.5])
        ->assertRedirect(route('franchise.parametres.edit'));

    expect($taux->fresh()->montant)->toEqual(52.5);
});

test('supprime un taux horaire', function () {
    $taux = TauxHoraire::create(['libelle' => 'Chantier', 'montant' => 45]);

    $this->delete(route('franchise.parametres.taux_horaires.destroy', $taux))
        ->assertRedirect(route('franchise.parametres.edit'));

    $this->assertModelMissing($taux);
});
