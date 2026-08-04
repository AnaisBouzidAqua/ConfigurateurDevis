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
        Schema::create('devis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scenario_id')->nullable()->constrained()->nullOnDelete();

            // Copie des champs du "Dossier" AquaConnect, en lecture seule et informationnels.
            $table->string('client_nom')->nullable();
            $table->string('dispositif')->nullable();
            $table->unsignedInteger('nombre_batiments')->nullable();
            $table->unsignedInteger('capacite_eh')->nullable();
            $table->unsignedInteger('nombre_chambres')->nullable();
            $table->string('type_effluents')->nullable();
            $table->string('installateur')->nullable();
            $table->string('type_installateur')->nullable();
            $table->string('installateur_agree_nom')->nullable();
            $table->string('type_realisation')->nullable();

            $table->decimal('coefficient_difficulte', 5, 2)->default(0);
            $table->decimal('remise_valeur', 10, 2)->nullable();
            $table->string('remise_type')->nullable(); // 'montant' ou 'pourcentage'

            $table->decimal('total_ht', 10, 2)->default(0);
            $table->decimal('total_tva', 10, 2)->default(0);
            $table->decimal('total_ttc', 10, 2)->default(0);

            $table->string('statut')->default('brouillon'); // 'brouillon' ou 'valide'
            $table->timestamp('archived_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devis');
    }
};
