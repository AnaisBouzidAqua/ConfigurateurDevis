<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Le Récapitulatif n'affiche plus qu'un seul montant (« Résultat » = total_ht) :
     * la TVA et le TTC ne sont plus calculés ni stockés.
     */
    public function up(): void
    {
        Schema::table('devis', function (Blueprint $table) {
            $table->dropColumn(['total_tva', 'total_ttc']);
        });
    }

    public function down(): void
    {
        Schema::table('devis', function (Blueprint $table) {
            $table->decimal('total_tva', 10, 2)->default(0);
            $table->decimal('total_ttc', 10, 2)->default(0);
        });
    }
};
