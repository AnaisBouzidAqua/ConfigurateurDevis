<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * `devis_lignes` accueille les articles ajoutés manuellement à un devis
     * depuis le Chiffrage : prestations de service et fournitures. La catégorie
     * distingue les deux ; produit_ref devient nullable pour un futur article
     * libre (sans référence catalogue).
     */
    public function up(): void
    {
        Schema::table('devis_lignes', function (Blueprint $table) {
            $table->string('categorie')->after('devis_id');
            $table->string('produit_ref')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('devis_lignes', function (Blueprint $table) {
            $table->dropColumn('categorie');
            $table->string('produit_ref')->nullable(false)->change();
        });
    }
};
