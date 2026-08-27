<?php

use App\Models\Produit;

test('regroupe les declinaisons EH et ne garde que la plus petite taille', function () {
    Produit::create(['ref' => 'BFV2.5EH', 'nom' => 'KIT BAC PEHD', 'prix' => 1231.34]);
    Produit::create(['ref' => 'BFV5EH', 'nom' => 'KIT BAC PEHD', 'prix' => 2572.91]);
    Produit::create(['ref' => 'BFV10EH', 'nom' => 'KIT BAC PEHD', 'prix' => 5145.82]);
    Produit::create(['ref' => 'AUTREPROD', 'nom' => 'Autre produit', 'prix' => 42]);

    $produits = Produit::pourSelectionAdmin();

    expect($produits)->toHaveCount(2);
    expect($produits->pluck('ref')->sort()->values()->all())->toBe(['AUTREPROD', 'BFV2.5EH']);
});

test('laisse les references sans declinaison EH inchangees', function () {
    Produit::create(['ref' => 'MREHA', 'nom' => 'REHAUSSE PETIT REGARD', 'prix' => 10]);
    Produit::create(['ref' => 'MBARRE3', 'nom' => 'BARRE DE RENFORT', 'prix' => 15]);

    $produits = Produit::pourSelectionAdmin();

    expect($produits)->toHaveCount(2);
    expect($produits->pluck('ref')->sort()->values()->all())->toBe(['MBARRE3', 'MREHA']);
});

test('extrait le sku de base et la valeur EH d une reference de declinaison', function () {
    expect(Produit::skuBaseDeclinaison('BFV10EH'))->toBe('BFV');
    expect(Produit::skuBaseDeclinaison('BFV2.5EH'))->toBe('BFV');
    expect(Produit::skuBaseDeclinaison('MREHA'))->toBeNull();

    expect(Produit::valeurEhDeclinaison('BFV10EH'))->toBe(10.0);
    expect(Produit::valeurEhDeclinaison('BFV2.5EH'))->toBe(2.5);
    expect(Produit::valeurEhDeclinaison('MREHA'))->toBeNull();
});
