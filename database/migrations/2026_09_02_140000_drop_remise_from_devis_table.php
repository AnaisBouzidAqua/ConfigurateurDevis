<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * La remise commerciale n'est plus calculée dans le simulateur de chiffrage.
     */
    public function up(): void
    {
        Schema::table('devis', function (Blueprint $table) {
            $table->dropColumn(['remise_valeur', 'remise_type']);
        });
    }

    public function down(): void
    {
        Schema::table('devis', function (Blueprint $table) {
            $table->decimal('remise_valeur', 10, 2)->nullable();
            $table->string('remise_type')->nullable();
        });
    }
};
