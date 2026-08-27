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

        // Certaines references existent en double dans le catalogue (ex: un
        // produit isole ET une variante EH partagent la meme reference, avec
        // des prix differents) : seule la ligne on_sale=1 est la bonne, l'autre
        // est une ancienne fiche desactivee.
        $lignes = collect($response->json('table'))
            ->filter(fn (array $ligne) => in_array($ligne['on_sale'] ?? null, ['1', 1], true))
            // Une reference vide n'est pas exploitable pour associer un produit
            // a une question, quel que soit le produit derriere (pas la meme
            // chose qu'une reference dupliquee, voir plus bas).
            ->filter(fn (array $ligne) => trim($ligne['reference'] ?? '') !== '');

        // Meme apres ces filtres, certaines references (non vides, cette
        // fois) restent utilisees par deux produits differents a la fois
        // (ex: PPCR3EH) : des fiches encore en cours de creation cote
        // AquaConnect. On les ignore tant qu'elles n'ont pas ete finalisees,
        // plutot que d'en choisir une au hasard.
        $occurrencesParRef = $lignes->countBy('reference');
        $lignesRetenues = $lignes->filter(fn (array $ligne) => $occurrencesParRef[$ligne['reference']] === 1)->values();

        foreach ($lignesRetenues as $ligne) {
            Produit::updateOrCreate(
                ['ref' => $ligne['reference']],
                ['nom' => $ligne['name'], 'prix' => $ligne['price']],
            );
        }

        $ignorees = $lignes->count() - $lignesRetenues->count();

        $this->info($lignesRetenues->count().' produits synchronises.');

        if ($ignorees > 0) {
            $this->warn($ignorees.' lignes ignorees (reference dupliquee sans distinction possible).');
        }

        return self::SUCCESS;
    }
}
