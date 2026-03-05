<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('home', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('find', function () {
    return Inertia::render('find');
})->name('find');

Route::get('jobs', function () {
    return Inertia::render('jobs');
})->name('jobs');

Route::get('create', function () {
    // Inertia::render zoekt in resources/js/Pages naar het bestand 'create'
    return Inertia::render('create');
})->name('create');
require __DIR__.'/settings.php';
