<?php

use App\Http\Controllers\ConversationController;
use App\Http\Controllers\KlusjeController;
use App\Http\Controllers\MessageController;
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
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/find', [KlusjeController::class, 'index'])->name('find');
Route::get('jobs/{klusje}', [KlusjeController::class, 'show'])->name('jobs.show');
Route::post('jobs', [KlusjeController::class, 'store'])->middleware(['auth', 'verified'])->name('jobs.store');

Route::get('create', function () {
    return Inertia::render('create');
})->middleware(['auth', 'verified'])->name('create');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('conversations', [ConversationController::class, 'index'])->name('conversations.index');
    Route::post('conversations', [ConversationController::class, 'store'])->name('conversations.store');
    Route::get('conversations/{conversation}', [ConversationController::class, 'show'])->name('conversations.show');
    Route::post('conversations/{conversation}/messages', [MessageController::class, 'store'])->name('conversations.messages.store');
});

require __DIR__.'/settings.php';
