<?php

use App\Http\Controllers\Admin\QuestionController;
use App\Http\Controllers\Admin\RubriqueController;
use App\Http\Controllers\Admin\ScenarioController;
use App\Http\Controllers\Franchise\DevisController;
use App\Http\Controllers\Franchise\ParametreController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/scenarios', [ScenarioController::class, 'index'])->name('scenarios.index');
    Route::get('/scenarios/{scenario}', [ScenarioController::class, 'show'])->name('scenarios.show');
    Route::post('/scenarios/{scenario}/rubriques', [RubriqueController::class, 'store'])->name('scenarios.rubriques.store');
    Route::put('/scenarios/{scenario}/rubriques/reorder', [RubriqueController::class, 'reorder'])->name('scenarios.rubriques.reorder');

    Route::put('/rubriques/{rubrique}', [RubriqueController::class, 'update'])->name('rubriques.update');
    Route::post('/rubriques/{rubrique}/duplicate', [RubriqueController::class, 'duplicate'])->name('rubriques.duplicate');
    Route::delete('/rubriques/{rubrique}', [RubriqueController::class, 'destroy'])->name('rubriques.destroy');

    Route::post('/rubriques/{rubrique}/questions', [QuestionController::class, 'store'])->name('rubriques.questions.store');
    Route::put('/rubriques/{rubrique}/questions/reorder', [QuestionController::class, 'reorder'])->name('rubriques.questions.reorder');
    Route::post('/questions/{question}/duplicate', [QuestionController::class, 'duplicate'])->name('questions.duplicate');
    Route::delete('/questions/{question}', [QuestionController::class, 'destroy'])->name('questions.destroy');
    Route::put('/questions/{question}', [QuestionController::class, 'update'])->name('questions.update');
});

Route::prefix('devis')->name('franchise.devis.')->group(function () {
    Route::get('/create', [DevisController::class, 'create'])->name('create');
    Route::get('/', [DevisController::class, 'index'])->name('index');
    Route::post('/', [DevisController::class, 'store'])->name('store');
    Route::get('/export', [DevisController::class, 'export'])->name('export');
    Route::get('/{devis}', [DevisController::class, 'show'])->name('show');
    Route::post('/{devis}/reponses', [DevisController::class, 'saveReponse'])->name('reponses.store');
    Route::post('/{devis}/tarification', [DevisController::class, 'updateTarification'])->name('tarification.update');
    Route::delete('/{devis}/reponses', [DevisController::class, 'clearReponses'])->name('reponses.clear');
    Route::post('/{devis}/main-oeuvre', [DevisController::class, 'storeMainOeuvre'])->name('main_oeuvre.store');
    Route::put('/{devis}/main-oeuvre/{mainOeuvre}', [DevisController::class, 'updateMainOeuvre'])->name('main_oeuvre.update');
    Route::delete('/{devis}/main-oeuvre/{mainOeuvre}', [DevisController::class, 'destroyMainOeuvre'])->name('main_oeuvre.destroy');
    Route::put('/{devis}/archiver', [DevisController::class, 'archiver'])->name('archiver');
});

Route::name('franchise.')->group(function () {
    Route::get('/parametres', [ParametreController::class, 'edit'])->name('parametres.edit');
    Route::post('/parametres/taux-horaires', [ParametreController::class, 'storeTauxHoraire'])->name('parametres.taux_horaires.store');
    Route::put('/parametres/taux-horaires/{tauxHoraire}', [ParametreController::class, 'updateTauxHoraire'])->name('parametres.taux_horaires.update');
    Route::delete('/parametres/taux-horaires/{tauxHoraire}', [ParametreController::class, 'destroyTauxHoraire'])->name('parametres.taux_horaires.destroy');
});


Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
