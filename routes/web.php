<?php

use App\Http\Controllers\Admin\ScenarioController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/scenarios', [ScenarioController::class, 'index'])->name('scenarios.index');
    Route::post('/scenarios', [ScenarioController::class, 'store'])->name('scenarios.store');
});


Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
