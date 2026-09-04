<?php

use App\Models\Devis;
use App\Models\DevisReponse;
use App\Models\Produit;
use App\Models\Scenario;
use App\Models\TauxHoraire;

test('chantier clé en main → tarif public', function () {
    $devis = Devis::create(['installateur' => 'chantier_cle_en_main', 'type_installateur' => 'autoconstructeur']);

    expect($devis->typeTarif())->toBe('public');
});

test('vente de kit + autoconstructeur → tarif autoconstructeur', function () {
    $devis = Devis::create(['installateur' => 'vente_kit', 'type_installateur' => 'autoconstructeur']);

    expect($devis->typeTarif())->toBe('autoconstructeur');
});

test('vente de kit + installateur agréé → tarif pro', function () {
    $devis = Devis::create(['installateur' => 'vente_kit', 'type_installateur' => 'installateur_agree']);

    expect($devis->typeTarif())->toBe('pro');
});

test('vente de kit + installateur non agréé → tarif pro', function () {
    $devis = Devis::create(['installateur' => 'vente_kit', 'type_installateur' => 'installateur_non_agree']);

    expect($devis->typeTarif())->toBe('pro');
});

test('la marge est appliquée au prix des produits du scénario', function () {
    Produit::create(['ref' => 'REF1', 'nom' => 'Produit', 'prix' => 100]);
    $scenario = Scenario::create(['famille' => 'T', 'nom' => 'T']);
    $rubrique = $scenario->rubriques()->create(['titre' => 'S']);
    $question = $rubrique->questions()->create(['texte' => 'Q']);
    $option = $question->options()->create(['libelle' => 'Oui']);
    $option->produits()->create(['produit_ref' => 'REF1', 'quantite' => 1]);

    // vente de kit + agréé → tarif pro (marge 30 %) → 100 × 1,30 = 130
    $devis = Devis::create(['scenario_id' => $scenario->id, 'installateur' => 'vente_kit', 'type_installateur' => 'installateur_agree']);
    DevisReponse::create(['devis_id' => $devis->id, 'question_id' => $question->id, 'question_option_id' => $option->id]);

    $this->get(route('franchise.devis.show', $devis))
        ->assertInertia(fn ($page) => $page->where('resolution.0.prix', fn ($v) => (float) $v === 130.0));
});

test('la marge s applique aux fournitures mais pas aux prestations ni à la main d oeuvre', function () {
    $devis = Devis::create(['installateur' => 'vente_kit', 'type_installateur' => 'installateur_agree']); // tarif pro, marge 30 %

    $devis->lignes()->create([
        'categorie' => 'fourniture', 'produit_ref' => 'F', 'libelle' => 'Fourniture',
        'quantite' => 1, 'prix_unitaire' => 100,
    ]);
    $devis->lignes()->create([
        'categorie' => 'prestation', 'produit_ref' => 'P', 'libelle' => 'Prestation',
        'quantite' => 1, 'prix_unitaire' => 100,
    ]);
    $taux = TauxHoraire::create(['libelle' => 'Chantier', 'montant' => 100]);
    $mo = $devis->mainOeuvres()->create(['libelle' => 'MO', 'description' => 'x']);
    $mo->heures()->attach($taux->id, ['nombre_heures' => 1]);

    // fourniture 100 × 1,30 = 130 ; prestation 100 ; main d'œuvre 100 → 330
    $this->get(route('franchise.devis.show', $devis))
        ->assertInertia(fn ($page) => $page
            ->where('lignes.fourniture.0.prix_unitaire', fn ($v) => (float) $v === 130.0)
            ->where('lignes.prestation.0.prix_unitaire', fn ($v) => (float) $v === 100.0)
            ->where('totaux.total_ht', fn ($v) => (float) $v === 330.0)
            ->where('tarif.type', 'pro')
            ->where('tarif.taux_marge', fn ($v) => (float) $v === 30.0));
});
