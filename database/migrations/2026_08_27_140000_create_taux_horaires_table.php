<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('taux_horaires', function (Blueprint $table) {
            $table->id();
            $table->string('libelle');
            $table->decimal('montant', 10, 2)->default(0);
            $table->timestamps();
        });

        // Reprend les 2 taux fixes existants comme premieres lignes de la
        // nouvelle liste dynamique, pour ne rien perdre de la config actuelle.
        $parametre = DB::table('parametres')->first();

        DB::table('taux_horaires')->insert([
            ['libelle' => 'Chantier', 'montant' => $parametre->taux_horaire_chantier ?? 0, 'created_at' => now(), 'updated_at' => now()],
            ['libelle' => 'Mini-pelle', 'montant' => $parametre->taux_horaire_mini_pelle ?? 0, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('taux_horaires');
    }
};
