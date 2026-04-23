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

it('creates a payment record and redirects when owner starts checkout', function () {
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

it('fake-complete marks payment succeeded and klusje completed', function () {
    Notification::fake();

    $this->actingAs($this->owner)->post("/jobs/{$this->klusje->id}/checkout");
    $payment = Payment::firstWhere('klusje_id', $this->klusje->id);

    $this->actingAs($this->owner)
        ->get("/payments/{$payment->id}/fake-complete")
        ->assertRedirect();

    expect($payment->fresh()->status)->toBe(PaymentStatus::Succeeded);
    expect($this->klusje->fresh()->status)->toBe(KlusjeStatus::Completed);
    Notification::assertSentTo($this->klusser, KlusjeCompleted::class);
});

it('ignores duplicate payment success markers', function () {
    $payment = Payment::create([
        'klusje_id' => $this->klusje->id,
        'payer_id' => $this->owner->id,
        'payee_id' => $this->klusser->id,
        'amount' => 50,
        'platform_fee' => 5,
        'status' => PaymentStatus::Succeeded->value,
        'paid_at' => now()->subHour(),
    ]);

    $originalPaidAt = $payment->paid_at;

    $this->actingAs($this->owner)
        ->get("/payments/{$payment->id}/fake-complete")
        ->assertRedirect();

    expect($payment->fresh()->paid_at->equalTo($originalPaidAt))->toBeTrue();
});
