<?php

use App\Enums\KlusjeStatus;
use App\Enums\PaymentStatus;
use App\Models\Klusje;
use App\Models\Payment;
use App\Models\User;
use App\Notifications\KlusjeCompleted;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    $this->withoutVite();
    $this->owner = User::factory()->create(['email_verified_at' => now()]);
    $this->klusser = User::factory()->create(['email_verified_at' => now()]);
    $this->klusje = Klusje::factory()->create([
        'user_id' => $this->owner->id,
        'assigned_klusser_id' => $this->klusser->id,
        'status' => KlusjeStatus::Assigned->value,
    ]);
});

it('creates a pending payment and redirects when owner starts checkout', function () {
    $this->actingAs($this->owner)
        ->post("/jobs/{$this->klusje->id}/checkout")
        ->assertRedirect();

    $this->assertDatabaseHas('payments', [
        'klusje_id' => $this->klusje->id,
        'payer_id' => $this->owner->id,
        'payee_id' => $this->klusser->id,
        'status' => PaymentStatus::Pending->value,
    ]);
});

it('computes the platform fee from config', function () {
    config(['payments.platform_fee_percent' => 10]);

    $this->actingAs($this->owner)
        ->post("/jobs/{$this->klusje->id}/checkout");

    $payment = Payment::firstWhere('klusje_id', $this->klusje->id);
    expect((float) $payment->platform_fee)->toEqualWithDelta((float) $this->klusje->compensation * 0.10, 0.01);
});

it('forbids non-owners from starting checkout', function () {
    $outsider = User::factory()->create(['email_verified_at' => now()]);
    $this->actingAs($outsider)
        ->post("/jobs/{$this->klusje->id}/checkout")
        ->assertForbidden();
});

it('refuses checkout when no klusser is assigned', function () {
    $open = Klusje::factory()->create([
        'user_id' => $this->owner->id,
        'status' => KlusjeStatus::Open->value,
    ]);

    $this->actingAs($this->owner)
        ->post("/jobs/{$open->id}/checkout")
        ->assertForbidden();
});

it('funds escrow on fake-complete without completing the klusje', function () {
    $this->actingAs($this->owner)->post("/jobs/{$this->klusje->id}/checkout");
    $payment = Payment::firstWhere('klusje_id', $this->klusje->id);

    $this->actingAs($this->owner)
        ->get("/payments/{$payment->id}/fake-complete")
        ->assertRedirect();

    $fresh = $payment->fresh();
    expect($fresh->status)->toBe(PaymentStatus::Held);
    expect($fresh->held_at)->not->toBeNull();
    expect($this->klusje->fresh()->status)->toBe(KlusjeStatus::Assigned);
});

it('releases escrow on klusje completion', function () {
    Notification::fake();

    $payment = Payment::create([
        'klusje_id' => $this->klusje->id,
        'payer_id' => $this->owner->id,
        'payee_id' => $this->klusser->id,
        'amount' => 100,
        'platform_fee' => 10,
        'currency' => 'eur',
        'status' => PaymentStatus::Held->value,
        'held_at' => now()->subMinutes(5),
    ]);

    $this->actingAs($this->owner)
        ->post("/jobs/{$this->klusje->id}/complete")
        ->assertRedirect();

    $fresh = $payment->fresh();
    expect($fresh->status)->toBe(PaymentStatus::Released);
    expect($fresh->released_at)->not->toBeNull();
    expect($fresh->stripe_transfer_id)->toStartWith('fake_transfer_');
    expect($this->klusje->fresh()->status)->toBe(KlusjeStatus::Completed);
    Notification::assertSentTo($this->klusser, KlusjeCompleted::class);
});

it('blocks completion without a held payment', function () {
    $this->actingAs($this->owner)
        ->post("/jobs/{$this->klusje->id}/complete")
        ->assertForbidden();
    expect($this->klusje->fresh()->status)->toBe(KlusjeStatus::Assigned);
});

it('refunds on cancel when escrow is funded', function () {
    $payment = Payment::create([
        'klusje_id' => $this->klusje->id,
        'payer_id' => $this->owner->id,
        'payee_id' => $this->klusser->id,
        'amount' => 100,
        'platform_fee' => 10,
        'currency' => 'eur',
        'status' => PaymentStatus::Held->value,
        'held_at' => now()->subMinutes(5),
    ]);

    $this->actingAs($this->owner)
        ->post("/jobs/{$this->klusje->id}/cancel")
        ->assertRedirect();

    $fresh = $payment->fresh();
    expect($fresh->status)->toBe(PaymentStatus::Refunded);
    expect($fresh->refunded_at)->not->toBeNull();
    expect($fresh->stripe_refund_id)->toStartWith('fake_refund_');
    expect($this->klusje->fresh()->status)->toBe(KlusjeStatus::Cancelled);
});

it('cancel with no payment still works', function () {
    $open = Klusje::factory()->create([
        'user_id' => $this->owner->id,
        'status' => KlusjeStatus::Open->value,
    ]);

    $this->actingAs($this->owner)
        ->post("/jobs/{$open->id}/cancel")
        ->assertRedirect();

    expect($open->fresh()->status)->toBe(KlusjeStatus::Cancelled);
});

it('ignores duplicate release calls', function () {
    $payment = Payment::create([
        'klusje_id' => $this->klusje->id,
        'payer_id' => $this->owner->id,
        'payee_id' => $this->klusser->id,
        'amount' => 100,
        'platform_fee' => 10,
        'currency' => 'eur',
        'status' => PaymentStatus::Released->value,
        'released_at' => now()->subHour(),
        'stripe_transfer_id' => 'fake_transfer_original',
    ]);

    app(\App\Http\Controllers\PaymentController::class)->release($payment->fresh());

    expect($payment->fresh()->stripe_transfer_id)->toBe('fake_transfer_original');
});
