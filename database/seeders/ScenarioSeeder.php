<?php

namespace Database\Seeders;

use App\Models\Scenario;
use Illuminate\Database\Seeder;

class ScenarioSeeder extends Seeder
{
    public function run(): void
    {
        $scenarios = [
            ['famille' => "Jardin d'Assainissement", 'nom' => 'Roseaux bac'],
            ['famille' => "Jardin d'Assainissement", 'nom' => 'Roseaux géo'],
            ['famille' => "Jardin d'Assainissement", 'nom' => 'Iris bac'],
            ['famille' => "Jardin d'Assainissement", 'nom' => 'Iris géo'],
            ['famille' => 'PhytoCompact', 'nom' => 'Carex'],
        ];

        foreach ($scenarios as $scenario) {
            Scenario::create($scenario);
        }
    }
}
