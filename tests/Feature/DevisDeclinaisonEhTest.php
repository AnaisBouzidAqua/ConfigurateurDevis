<?php

use App\Models\Devis;
use App\Models\DevisReponse;
use App\Models\Produit;
use App\Models\Scenario;

function creerDevisAvecProduitEh(?int $capaciteEh, string $refConfiguree): Devis
{
    $scenario = Scenario::create(['famille' => 'Test', 'nom' => 'DeclinaisonEh']);
    $rubrique = $scenario->rubriques()->create(['titre' => 'Section']);
    $question = $rubrique->questions()->create(['texte' => 'Bac de rehausse ?']);
    $reponse = $question->options()->create(['libelle' => 'Oui']);
    $reponse->produits()->create(['produit_ref' => $refConfiguree, 'quantite' => 1]);

    $devis = Devis::create(['scenario_id' => $scenario->id, 'capacite_eh' => $capaciteEh]);
    DevisReponse::create([
        'devis_id' => $devis->id,
        'question_id' => $question->id,
        'question_option_id' => $reponse->id,
    ]);

    return $devis;
}

beforeEach(function () {
    Produit::create(['ref' => 'BFV2.5EH', 'nom' => 'KIT BAC PEHD', 'prix' => 1231.34]);
    Produit::create(['ref' => 'BFV5EH', 'nom' => 'KIT BAC PEHD', 'prix' => 2572.91]);
    Produit::create(['ref' => 'BFV10EH', 'nom' => 'KIT BAC PEHD', 'prix' => 5145.82]);
});

// Un devis sans champ « installateur » est facturé au tarif pro (marge 30 %) :
// le prix affiché est le prix catalogue majoré.
function prixTarifPro(float $prixCatalogue): float
{
    return round($prixCatalogue * 1.30, 2);
}

test('resout la declinaison EH qui correspond a la capacite EH du devis', function () {
    $devis = creerDevisAvecProduitEh(capaciteEh: 10, refConfiguree: 'BFV2.5EH');

    $reponse = $this->get(route('franchise.devis.show', $devis));

    $reponse->assertInertia(fn ($page) => $page
        ->where('resolution.0.produit_ref', 'BFV10EH')
        ->where('resolution.0.prix', prixTarifPro(5145.82))
        ->where('resolution.0.nom', 'KIT BAC PEHD (10 EH)'));
});

test('retombe sur la reference configuree si aucune declinaison ne correspond a la capacite EH', function () {
    $devis = creerDevisAvecProduitEh(capaciteEh: 7, refConfiguree: 'BFV2.5EH');

    $reponse = $this->get(route('franchise.devis.show', $devis));

    $reponse->assertInertia(fn ($page) => $page
        ->where('resolution.0.produit_ref', 'BFV2.5EH')
        ->where('resolution.0.prix', prixTarifPro(1231.34)));
});

test('garde la reference configuree quand le devis n a pas de capacite EH', function () {
    $devis = creerDevisAvecProduitEh(capaciteEh: null, refConfiguree: 'BFV5EH');

    $reponse = $this->get(route('franchise.devis.show', $devis));

    $reponse->assertInertia(fn ($page) => $page
        ->where('resolution.0.produit_ref', 'BFV5EH')
        ->where('resolution.0.prix', prixTarifPro(2572.91)));
});
