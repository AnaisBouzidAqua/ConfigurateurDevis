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
        Schema::create('question_option_produits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_option_id')->constrained()->cascadeOnDelete();
            $table->string('produit_ref');
            $table->unsignedInteger('quantite')->default(1);
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('question_option_produits');
    }
};
