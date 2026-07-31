<?php

use App\Http\Controllers\Admin\QuestionController;
use App\Http\Controllers\Admin\RubriqueController;
use App\Http\Controllers\Admin\ScenarioConditionController;
use App\Http\Controllers\Admin\ScenarioController;
use App\Http\Controllers\Admin\ScenarioProduitController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/scenarios', [ScenarioController::class, 'index'])->name('scenarios.index');
    Route::get('/scenarios/{scenario}', [ScenarioController::class, 'show'])->name('scenarios.show');
    Route::post('/scenarios/{scenario}/conditions', [ScenarioConditionController::class, 'store'])->name('scenarios.conditions.store');
    Route::post('/scenarios/{scenario}/produits', [ScenarioProduitController::class, 'store'])->name('scenarios.produits.store');
    Route::post('/scenarios/{scenario}/rubriques', [RubriqueController::class, 'store'])->name('scenarios.rubriques.store');

    Route::put('/rubriques/{rubrique}', [RubriqueController::class, 'update'])->name('rubriques.update');
    Route::post('/rubriques/{rubrique}/duplicate', [RubriqueController::class, 'duplicate'])->name('rubriques.duplicate');
    Route::delete('/rubriques/{rubrique}', [RubriqueController::class, 'destroy'])->name('rubriques.destroy');

    Route::post('/rubriques/{rubrique}/questions', [QuestionController::class, 'store'])->name('rubriques.questions.store');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
