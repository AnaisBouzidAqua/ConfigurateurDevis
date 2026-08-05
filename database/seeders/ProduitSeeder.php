<?php

namespace Database\Seeders;

use App\Models\Produit;
use Illuminate\Database\Seeder;

class ProduitSeeder extends Seeder
{
    public function run(): void
    {
        $produits = [
            ['ref' => 'EXT-10', 'nom' => 'Extension filtre 10 EH', 'prix' => 850.00],
            ['ref' => 'MFA-10', 'nom' => 'Massif filtrant alvéolaire 10 EH', 'prix' => 620.00],
            ['ref' => 'KIT-STD', 'nom' => "Kit standard d'installation", 'prix' => 320.00],
            ['ref' => 'KIT-BRISE-ROCHE', 'nom' => 'Kit brise-roche', 'prix' => 480.00],
            ['ref' => 'BAC-5PP', 'nom' => 'Bac 5 PP Relevage', 'prix' => 514.57],
        ];

        foreach ($produits as $produit) {
            Produit::updateOrCreate(['ref' => $produit['ref']], $produit);
        }
    }
}
