<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('question_option_produits', function (Blueprint $table) {
            $table->string('produit_ref')->nullable()->change();
            $table->string('libelle_libre')->nullable()->after('produit_ref');
            $table->decimal('prix_libre', 10, 2)->nullable()->after('libelle_libre');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('question_option_produits', function (Blueprint $table) {
            $table->dropColumn(['libelle_libre', 'prix_libre']);
            $table->string('produit_ref')->nullable(false)->change();
        });
    }
};
