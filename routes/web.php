<?php

use App\Http\Controllers\KlusjeController;
use App\Models\Klusje;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    $recenteKlusjes = Klusje::with(['user', 'images'])
        ->where('status', 'open')
        ->latest()
        ->take(4)
        ->get();

    return Inertia::render('home', [
        'canRegister' => Features::enabled(Features::registration()),
        'recenteKlusjes' => $recenteKlusjes,
    ]);
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard', []);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/find', [KlusjeController::class, 'index'])->name('find');
Route::get('jobs/{klusje}', [KlusjeController::class, 'show'])->name('jobs.show');
Route::post('jobs', [KlusjeController::class, 'store'])->middleware(['auth', 'verified'])->name('jobs.store');

Route::get('create', function () {
    return Inertia::render('create', []);
})->middleware(['auth', 'verified'])->name('create');

require __DIR__.'/settings.php';
