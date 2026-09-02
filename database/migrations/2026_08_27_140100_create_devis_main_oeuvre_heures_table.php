<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('devis_main_oeuvre_heures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('devis_main_oeuvre_id')->constrained()->cascadeOnDelete();
            $table->foreignId('taux_horaire_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('nombre_heures')->default(0);
            $table->timestamps();
        });

        // Convertit les colonnes fixes nombre_heures_chantier/mini_pelle des
        // lignes de main d'oeuvre existantes en lignes de detail, pour ne pas
        // perdre l'historique des devis deja chiffres.
        $idChantier = DB::table('taux_horaires')->where('libelle', 'Chantier')->value('id');
        $idMiniPelle = DB::table('taux_horaires')->where('libelle', 'Mini-pelle')->value('id');

        $maintenant = now();

        foreach (DB::table('devis_main_oeuvres')->get() as $mainOeuvre) {
            $lignes = [];

            if ($mainOeuvre->nombre_heures_chantier > 0) {
                $lignes[] = [
                    'devis_main_oeuvre_id' => $mainOeuvre->id,
                    'taux_horaire_id' => $idChantier,
                    'nombre_heures' => $mainOeuvre->nombre_heures_chantier,
                    'created_at' => $maintenant,
                    'updated_at' => $maintenant,
                ];
            }

            if ($mainOeuvre->nombre_heures_mini_pelle > 0) {
                $lignes[] = [
                    'devis_main_oeuvre_id' => $mainOeuvre->id,
                    'taux_horaire_id' => $idMiniPelle,
                    'nombre_heures' => $mainOeuvre->nombre_heures_mini_pelle,
                    'created_at' => $maintenant,
                    'updated_at' => $maintenant,
                ];
            }

            if ($lignes !== []) {
                DB::table('devis_main_oeuvre_heures')->insert($lignes);
            }
        }

        Schema::table('devis_main_oeuvres', function (Blueprint $table) {
            $table->dropColumn(['nombre_heures_chantier', 'nombre_heures_mini_pelle']);
        });

        Schema::dropIfExists('parametres');
    }

    public function down(): void
    {
        Schema::create('parametres', function (Blueprint $table) {
            $table->id();
            $table->decimal('taux_horaire_chantier', 10, 2)->default(0);
            $table->decimal('taux_horaire_mini_pelle', 10, 2)->default(0);
            $table->timestamps();
        });

        Schema::table('devis_main_oeuvres', function (Blueprint $table) {
            $table->unsignedInteger('nombre_heures_chantier')->default(0);
            $table->unsignedInteger('nombre_heures_mini_pelle')->default(0);
        });

        Schema::dropIfExists('devis_main_oeuvre_heures');
    }
};
