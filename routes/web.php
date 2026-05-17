<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\KlusjeController as AdminKlusjeController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\WithdrawalController as AdminWithdrawalController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KlusjeController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OfferController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PriceProposalController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\WithdrawalController;
use App\Models\Klusje;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

/*
|--------------------------------------------------------------------------
| Publieke Routes
|--------------------------------------------------------------------------
*/

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
        'openKlusjeCount' => Klusje::where('status', 'open')->count(),
    ]);
})->name('home');

Route::get('/find', [KlusjeController::class, 'index'])->name('find');
Route::get('jobs/{klusje}', [KlusjeController::class, 'show'])->name('jobs.show');
Route::get('users/{user}', [UserProfileController::class, 'show'])->name('users.show');
Route::get('/user/{user}', [UserController::class, 'show'])->name('user.profile');

/*
|--------------------------------------------------------------------------
| Geautoriseerde Routes (Ingelogde Gebruikers)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard & Balans
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('my/balance', [PaymentController::class, 'balance'])->name('balance');

    // Uitbetalingen (Withdrawals)
    Route::get('my/withdrawals', [WithdrawalController::class, 'index'])->name('withdrawals.index');
    Route::get('my/withdrawals/create', [WithdrawalController::class, 'create'])->name('withdrawals.create');
    Route::post('my/withdrawals', [WithdrawalController::class, 'store'])->name('withdrawals.store');

    // Klusjes (Aanmaken & Beheren)
    Route::get('create', [KlusjeController::class, 'create'])->name('create');
    Route::post('jobs', [KlusjeController::class, 'store'])->name('jobs.store');
    Route::get('my/klusjes', [KlusjeController::class, 'mine'])->name('klusjes.mine');
    Route::get('jobs/{klusje}/edit', [KlusjeController::class, 'edit'])->name('jobs.edit');
    Route::put('jobs/{klusje}', [KlusjeController::class, 'update'])->name('jobs.update'); // Veranderd van patch naar put
    Route::delete('jobs/{klusje}', [KlusjeController::class, 'destroy'])->name('jobs.destroy');
    Route::post('jobs/{klusje}/complete', [KlusjeController::class, 'complete'])->name('jobs.complete');
    Route::post('jobs/{klusje}/cancel', [KlusjeController::class, 'cancel'])->name('jobs.cancel');

    // Checkout & Opwaarderen (Stripe)
    Route::get('checkout/success', [CheckoutController::class, 'success'])->name('checkout.success'); // Moet BOVEN de {proposal} route staan!
    Route::post('checkout/topup', [CheckoutController::class, 'topup'])->name('checkout.topup');
    Route::get('checkout/{proposal}', [CheckoutController::class, 'show'])->name('checkout.show');

    // Biedingen (Offers)
    Route::get('jobs/{klusje}/offers', [OfferController::class, 'forKlusje'])->name('klusjes.offers');
    Route::get('my/offers', [OfferController::class, 'mine'])->name('offers.mine');
    Route::post('offers', [OfferController::class, 'store'])->name('offers.store');
    Route::post('offers/{offer}/accept', [OfferController::class, 'accept'])->name('offers.accept');
    Route::post('offers/{offer}/reject', [OfferController::class, 'reject'])->name('offers.reject');
    Route::post('offers/{offer}/counter', [OfferController::class, 'counterOffer'])->name('offers.counter');
    Route::post('offers/{offer}/accept-counter', [OfferController::class, 'acceptCounter'])->name('offers.accept-counter');
    Route::delete('offers/{offer}', [OfferController::class, 'withdraw'])->name('offers.withdraw');

    // Reviews
    Route::get('my/reviews', [ReviewController::class, 'myReviews'])->name('reviews.mine');
    Route::post('jobs/{klusje}/reviews', [ReviewController::class, 'store'])->name('reviews.store');

    // Notificaties
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->name('notifications.mark-all-read');
    Route::post('notifications/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.read');

    // Oude Payments (Optioneel, als je de nieuwe checkout gebruikt kunnen deze wellicht weg)
    Route::post('jobs/{klusje}/checkout', [PaymentController::class, 'checkout'])->name('payments.checkout');
    Route::get('payments/{payment}/fake-complete', [PaymentController::class, 'fakeComplete'])->name('payments.fake-complete');

    // Conversaties & Berichten
    Route::get('conversations', [ConversationController::class, 'index'])->name('conversations.index');
    Route::post('conversations', [ConversationController::class, 'store'])->name('conversations.store');
    Route::get('conversations/{conversation}', [ConversationController::class, 'show'])->name('conversations.show');
    Route::post('conversations/{conversation}/messages', [MessageController::class, 'store'])->name('conversations.messages.store');

    // Prijsvoorstellen in chat
    Route::post('conversations/{conversation}/proposals', [PriceProposalController::class, 'store'])->name('conversations.proposals.store');
    Route::patch('proposals/{priceProposal}/accept', [PriceProposalController::class, 'accept'])->name('proposals.accept');
    Route::patch('proposals/{priceProposal}/decline', [PriceProposalController::class, 'decline'])->name('proposals.decline');
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

        Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
        Route::get('users/{user}', [AdminUserController::class, 'show'])->name('users.show');
        Route::post('users/{user}/suspend', [AdminUserController::class, 'suspend'])->name('users.suspend');
        Route::post('users/{user}/unsuspend', [AdminUserController::class, 'unsuspend'])->name('users.unsuspend');

        Route::get('klusjes', [AdminKlusjeController::class, 'index'])->name('klusjes.index');
        Route::get('klusjes/{klusje}', [AdminKlusjeController::class, 'show'])->name('klusjes.show');
        Route::post('klusjes/{klusje}/cancel', [AdminKlusjeController::class, 'cancel'])->name('klusjes.cancel');

        Route::get('withdrawals', [AdminWithdrawalController::class, 'index'])->name('withdrawals.index');
        Route::get('withdrawals/{withdrawal}', [AdminWithdrawalController::class, 'show'])->name('withdrawals.show');
        Route::post('withdrawals/{withdrawal}/status', [AdminWithdrawalController::class, 'updateStatus'])->name('withdrawals.status');
    });

/*
|--------------------------------------------------------------------------
| Webhooks
|--------------------------------------------------------------------------
*/

// Deze moet buiten de middleware blijven omdat Stripe hiernaartoe post zonder ingelogd te zijn
Route::post('stripe/webhook', [PaymentController::class, 'webhook'])->name('payments.webhook');

require __DIR__.'/settings.php';
