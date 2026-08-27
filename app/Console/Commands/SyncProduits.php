<?php

namespace App\Console\Commands;

use App\Models\Produit;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SyncProduits extends Command
{
    protected $signature = 'produits:sync';

    protected $description = "Synchronise la table produits depuis AquaConnect (table TSaskitProduitPrestashop, via doAquaPilot.php)";

    public function handle(): int
    {
        $response = Http::asForm()->post(config('aquaconnect.url').'/ajax/api/doAquaPilot.php', [
            // TSaskitProduitPrestashop est toujours resynchronisee entierement
            // (DateModif vide), pas de sync incrementale pour cette table.
            'DateModif' => '',
            'table' => 'TSaskitProduitPrestashop',
            'mode' => 'GET_TABLE',
            'AquaSessionId' => config('aquaconnect.session_id'),
        ]);

        if (! $response->successful() || ! is_array($response->json('table'))) {
            $this->error('Erreur lors de la synchronisation des produits.');

            return self::FAILURE;
        }

        $lignes = $response->json('table');

        foreach ($lignes as $ligne) {
            Produit::updateOrCreate(
                ['ref' => $ligne['reference']],
                ['nom' => $ligne['name'], 'prix' => $ligne['price']],
            );
        }

        $this->info(count($lignes).' produits synchronises.');

        return self::SUCCESS;
    }
}
