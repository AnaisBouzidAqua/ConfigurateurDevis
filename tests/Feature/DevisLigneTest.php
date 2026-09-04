<?php

use App\Models\Devis;

test('ajoute une prestation de service en figeant le prix du catalogue', function () {
    $devis = Devis::create([]);

    $this->post(route('franchise.devis.lignes.store', $devis), [
        'categorie' => 'prestation',
        'produit_ref' => 'PREST-ETUDE',
        'quantite' => 2,
    ])->assertRedirect();

    $this->assertDatabaseHas('devis_lignes', [
        'devis_id' => $devis->id,
        'categorie' => 'prestation',
        'produit_ref' => 'PREST-ETUDE',
        'libelle' => 'Étude de conception et dimensionnement',
        'quantite' => 2,
        'prix_unitaire' => 650.00,
    ]);
});

test('ajoute une fourniture', function () {
    $devis = Devis::create([]);

    $this->post(route('franchise.devis.lignes.store', $devis), [
        'categorie' => 'fourniture',
        'produit_ref' => 'FOUR-EPDM',
        'quantite' => 30,
    ])->assertRedirect();

    $this->assertDatabaseHas('devis_lignes', [
        'devis_id' => $devis->id,
        'categorie' => 'fourniture',
        'produit_ref' => 'FOUR-EPDM',
        'quantite' => 30,
    ]);
});

test('refuse une categorie hors prestation / fourniture', function () {
    $devis = Devis::create([]);

    $this->post(route('franchise.devis.lignes.store', $devis), [
        'categorie' => 'autre',
        'produit_ref' => 'PREST-ETUDE',
        'quantite' => 1,
    ])->assertSessionHasErrors('categorie');
});

test('refuse une reference absente du catalogue', function () {
    $devis = Devis::create([]);

    $this->post(route('franchise.devis.lignes.store', $devis), [
        'categorie' => 'prestation',
        'produit_ref' => 'PREST-INCONNU',
        'quantite' => 1,
    ])->assertNotFound();
});

test('refuse une quantite inferieure a 1', function () {
    $devis = Devis::create([]);

    $this->post(route('franchise.devis.lignes.store', $devis), [
        'categorie' => 'fourniture',
        'produit_ref' => 'FOUR-EPDM',
        'quantite' => 0,
    ])->assertSessionHasErrors('quantite');
});

test('supprime une ligne', function () {
    $devis = Devis::create([]);
    $ligne = $devis->lignes()->create([
        'categorie' => 'prestation',
        'produit_ref' => 'PREST-ETUDE',
        'libelle' => 'Étude',
        'quantite' => 1,
        'prix_unitaire' => 650,
    ]);

    $this->delete(route('franchise.devis.lignes.destroy', [$devis, $ligne]))->assertRedirect();

    $this->assertModelMissing($ligne);
});

test('les prestations et fournitures alimentent le Resultat', function () {
    $devis = Devis::create([]);
    $devis->lignes()->create([
        'categorie' => 'prestation', 'produit_ref' => 'PREST-ETUDE',
        'libelle' => 'Étude', 'quantite' => 1, 'prix_unitaire' => 650,
    ]);
    $devis->lignes()->create([
        'categorie' => 'fourniture', 'produit_ref' => 'FOUR-EPDM',
        'libelle' => 'EPDM', 'quantite' => 10, 'prix_unitaire' => 14.50,
    ]);

    // 650 + (10 x 14,50) = 795
    $this->get(route('franchise.devis.show', $devis))
        ->assertInertia(fn ($page) => $page->where('totaux.total_ht', fn ($v) => (float) $v === 795.0));
});

test('le payload show groupe les lignes par categorie et expose les catalogues', function () {
    $devis = Devis::create([]);
    $devis->lignes()->create([
        'categorie' => 'prestation', 'produit_ref' => 'PREST-ETUDE',
        'libelle' => 'Étude', 'quantite' => 1, 'prix_unitaire' => 650,
    ]);

    $this->get(route('franchise.devis.show', $devis))
        ->assertInertia(fn ($page) => $page
            ->has('lignes.prestation', 1)
            ->has('lignes.fourniture', 0)
            ->has('catalogues.prestation')
            ->has('catalogues.fourniture')
            ->where('catalogues.prestation.0.ref', 'PREST-ETUDE'));
});
