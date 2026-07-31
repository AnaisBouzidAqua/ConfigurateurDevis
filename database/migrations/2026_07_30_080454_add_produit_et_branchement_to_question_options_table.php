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
        Schema::table('question_options', function (Blueprint $table) {
            $table->string('produit_ref')->nullable();
            $table->unsignedInteger('quantite')->nullable();
            $table->foreignId('question_suivante_id')->nullable()->constrained('questions')->nullOnDelete();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('question_options', function (Blueprint $table) {
            $table->dropForeign(['question_suivante_id']);
            $table->dropColumn(['produit_ref', 'quantite', 'question_suivante_id']);
        });
    }
};
