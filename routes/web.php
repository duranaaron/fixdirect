<?php

use App\Http\Controllers\ConversationController;
use App\Http\Controllers\KlusjeController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\PriceProposalController;
use App\Models\Klusje;
use App\Models\PriceProposal;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

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
    $user = request()->user();

    $klusjes = PriceProposal::query()
        ->where('status', 'accepted')
        ->whereHas('conversation', function ($query) use ($user) {
            $query->where('starter_id', $user->id)
                ->orWhere('owner_id', $user->id);
        })
        ->with(['conversation.klusje:id,title', 'conversation.starter:id,name', 'conversation.owner:id,name', 'user:id,name'])
        ->latest('scheduled_at')
        ->get()
        ->map(function (PriceProposal $proposal) use ($user) {
            $conversation = $proposal->conversation;
            $isDoener = $conversation->starter_id === $user->id;

            return [
                'id' => $proposal->id,
                'title' => $conversation->klusje->title ?? 'Klusje',
                'date' => $proposal->scheduled_at->format('Y-m-d'),
                'status' => $proposal->scheduled_at->isFuture() ? 'Binnenkort' : 'Voltooid',
                'price' => '€'.number_format($proposal->amount, 2, ',', '.'),
                'rol' => $isDoener ? 'doener' : 'vrager',
            ];
        });

    return Inertia::render('dashboard', [
        'klusjes' => $klusjes,
    ]);
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

    Route::post('conversations/{conversation}/proposals', [PriceProposalController::class, 'store'])->name('conversations.proposals.store');
    Route::patch('proposals/{priceProposal}/accept', [PriceProposalController::class, 'accept'])->name('proposals.accept');
    Route::patch('proposals/{priceProposal}/decline', [PriceProposalController::class, 'decline'])->name('proposals.decline');
    Route::post('klusjes/{klusje}/reviews', [ReviewController::class, 'store'])->name('reviews.store');
});

require __DIR__.'/settings.php';
