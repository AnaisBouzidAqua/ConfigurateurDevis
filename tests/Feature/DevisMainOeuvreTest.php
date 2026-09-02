<?php

use App\Models\Devis;
use App\Models\TauxHoraire;

test('ajoute une ligne de main d oeuvre avec des heures sur plusieurs taux', function () {
    $devis = Devis::create([]);
    $chantier = TauxHoraire::create(['libelle' => 'Chantier', 'montant' => 45]);
    $miniPelle = TauxHoraire::create(['libelle' => 'Mini-pelle', 'montant' => 70]);

    $this->post(route('franchise.devis.main_oeuvre.store', $devis), [
        'libelle' => 'Terrassement',
        'description' => 'Preparation du terrain',
        'heures' => [
            ['taux_horaire_id' => $chantier->id, 'nombre_heures' => 10],
            ['taux_horaire_id' => $miniPelle->id, 'nombre_heures' => 4],
        ],
    ])->assertRedirect();

    $mainOeuvre = $devis->mainOeuvres()->firstOrFail();

    expect($mainOeuvre->libelle)->toBe('Terrassement');
    expect($mainOeuvre->heures)->toHaveCount(2);
    $this->assertDatabaseHas('devis_main_oeuvre_heures', [
        'devis_main_oeuvre_id' => $mainOeuvre->id,
        'taux_horaire_id' => $chantier->id,
        'nombre_heures' => 10,
    ]);
});

test('modifie une ligne de main d oeuvre : titre, description et heures', function () {
    $devis = Devis::create([]);
    $a = TauxHoraire::create(['libelle' => 'A', 'montant' => 10]);
    $b = TauxHoraire::create(['libelle' => 'B', 'montant' => 20]);

    $mainOeuvre = $devis->mainOeuvres()->create(['libelle' => 'Ancien', 'description' => 'ancienne']);
    $mainOeuvre->heures()->attach($a->id, ['nombre_heures' => 5]);
    $mainOeuvre->heures()->attach($b->id, ['nombre_heures' => 3]);

    $this->put(route('franchise.devis.main_oeuvre.update', [$devis, $mainOeuvre]), [
        'libelle' => 'Nouveau',
        'description' => 'nouvelle',
        'heures' => [
            ['taux_horaire_id' => $a->id, 'nombre_heures' => 8],
        ],
    ])->assertRedirect();

    $mainOeuvre->refresh();
    expect($mainOeuvre->libelle)->toBe('Nouveau');
    expect($mainOeuvre->description)->toBe('nouvelle');
    expect($mainOeuvre->heures)->toHaveCount(1);
    expect($mainOeuvre->heures->first()->pivot->nombre_heures)->toEqual(8);
});

test('refuse une ligne de main d oeuvre sans aucune heure', function () {
    $devis = Devis::create([]);

    $this->post(route('franchise.devis.main_oeuvre.store', $devis), [
        'libelle' => 'Terrassement',
        'description' => 'x',
        'heures' => [],
    ])->assertSessionHasErrors('heures');
});

test('refuse une ligne de main d oeuvre referencant un taux horaire inconnu', function () {
    $devis = Devis::create([]);

    $this->post(route('franchise.devis.main_oeuvre.store', $devis), [
        'libelle' => 'Terrassement',
        'description' => 'x',
        'heures' => [
            ['taux_horaire_id' => 999, 'nombre_heures' => 5],
        ],
    ])->assertSessionHasErrors('heures.0.taux_horaire_id');
});

test('le cout de la main d oeuvre somme les heures par leur taux et alimente le total', function () {
    $devis = Devis::create([]);
    $gros = TauxHoraire::create(['libelle' => 'Gros oeuvre', 'montant' => 45]);
    $pelle = TauxHoraire::create(['libelle' => 'Pelle', 'montant' => 70]);

    $mainOeuvre = $devis->mainOeuvres()->create([
        'libelle' => 'Terrassement',
        'description' => 'x',
    ]);
    $mainOeuvre->heures()->attach($gros->id, ['nombre_heures' => 10]); // 10 * 45 = 450
    $mainOeuvre->heures()->attach($pelle->id, ['nombre_heures' => 4]); // 4 * 70 = 280

    $this->get(route('franchise.devis.show', $devis))
        ->assertInertia(fn ($page) => $page
            ->where('mainOeuvres.0.heures.0.libelle', 'Gros oeuvre')
            ->where('mainOeuvres.0.heures.0.nombre_heures', 10)
            ->where('mainOeuvres.0.cout', fn ($cout) => (float) $cout === 730.0)
            ->where('totaux.total_ht', fn ($total) => (float) $total === 730.0));
});
