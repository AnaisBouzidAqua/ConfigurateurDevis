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
        Schema::create('devis_main_oeuvres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('devis_id')->constrained()->cascadeOnDelete();
            $table->string('libelle');
            $table->unsignedInteger('nombre_heures_chantier')->default(0);
            $table->unsignedInteger('nombre_heures_mini_pelle')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devis_main_oeuvres');
    }
};
