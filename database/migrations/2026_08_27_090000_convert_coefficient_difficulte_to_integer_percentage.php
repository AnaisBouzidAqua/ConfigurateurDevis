<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // coefficient_difficulte etait stocke comme fraction decimale (0.15 = +15%) ;
        // le calcul passe a un pourcentage entier (15 = +15%). On elargit d'abord la
        // colonne (decimal(5,2) ne peut pas contenir une valeur >= 10 une fois
        // multipliee par 100) avant de la multiplier, puis on la reduit en integer —
        // chaque valeur decimal(5,2) n'a que 2 decimales, donc *100 donne toujours un
        // nombre entier exact, sans arrondi a faire.
        Schema::table('devis', function (Blueprint $table) {
            $table->decimal('coefficient_difficulte', 10, 2)->default(0)->change();
        });

        DB::table('devis')->update(['coefficient_difficulte' => DB::raw('coefficient_difficulte * 100')]);

        Schema::table('devis', function (Blueprint $table) {
            $table->unsignedInteger('coefficient_difficulte')->default(0)->change();
        });
    }

    public function down(): void
    {
        Schema::table('devis', function (Blueprint $table) {
            $table->decimal('coefficient_difficulte', 10, 2)->default(0)->change();
        });

        DB::table('devis')->update(['coefficient_difficulte' => DB::raw('coefficient_difficulte / 100')]);

        Schema::table('devis', function (Blueprint $table) {
            $table->decimal('coefficient_difficulte', 5, 2)->default(0)->change();
        });
    }
};
