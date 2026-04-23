<?php

use App\Enums\KlusjeStatus;
use App\Enums\PaymentStatus;
use App\Models\Klusje;
use App\Models\Payment;
use App\Models\User;

beforeEach(function () {
    $this->withoutVite();
    $this->admin = User::factory()->create(['email_verified_at' => now(), 'is_admin' => true]);
});

it('lists klusjes with status filter', function () {
    Klusje::factory()->count(2)->create(['status' => KlusjeStatus::Open->value]);
    Klusje::factory()->create(['status' => KlusjeStatus::Completed->value]);

    $this->actingAs($this->admin)
        ->get('/admin/klusjes?status=open')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/klusjes/index')
            ->has('klusjes.data', 2)
        );
});

it('admin cancel triggers refund when escrow is held', function () {
    $owner = User::factory()->create();
    $klusser = User::factory()->create();
    $klusje = Klusje::factory()->create([
        'user_id' => $owner->id,
        'assigned_klusser_id' => $klusser->id,
        'status' => KlusjeStatus::Assigned->value,
    ]);
    $payment = Payment::create([
        'klusje_id' => $klusje->id,
        'payer_id' => $owner->id,
        'payee_id' => $klusser->id,
        'amount' => 80,
        'platform_fee' => 8,
        'currency' => 'eur',
        'status' => PaymentStatus::Held->value,
        'held_at' => now(),
    ]);

    $this->actingAs($this->admin)
        ->post("/admin/klusjes/{$klusje->id}/cancel")
        ->assertRedirect();

    expect($klusje->fresh()->status)->toBe(KlusjeStatus::Cancelled);
    expect($payment->fresh()->status)->toBe(PaymentStatus::Refunded);
    expect($payment->fresh()->stripe_refund_id)->toStartWith('fake_refund_');
});
