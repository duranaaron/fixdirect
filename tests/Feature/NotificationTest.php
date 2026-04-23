<?php

use App\Enums\KlusjeStatus;
use App\Enums\OfferStatus;
use App\Models\Klusje;
use App\Models\Offer;
use App\Models\User;
use App\Notifications\KlusjeCompleted;
use App\Notifications\NewOfferReceived;
use App\Notifications\OfferAccepted;
use App\Notifications\OfferRejected;
use App\Notifications\ReviewReceived;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    $this->withoutVite();
    Notification::fake();
    $this->owner = User::factory()->create(['email_verified_at' => now()]);
    $this->klusser = User::factory()->create(['email_verified_at' => now()]);
    $this->klusje = Klusje::factory()->create([
        'user_id' => $this->owner->id,
        'status' => KlusjeStatus::Open->value,
    ]);
});

it('notifies the owner when a new offer is submitted', function () {
    $this->actingAs($this->klusser)
        ->post('/offers', ['klusje_id' => $this->klusje->id]);

    Notification::assertSentTo($this->owner, NewOfferReceived::class);
});

it('notifies the klusser when the offer is accepted', function () {
    $offer = Offer::factory()->create([
        'klusje_id' => $this->klusje->id,
        'klusser_id' => $this->klusser->id,
        'status' => OfferStatus::Pending->value,
    ]);

    $this->actingAs($this->owner)
        ->post("/offers/{$offer->id}/accept");

    Notification::assertSentTo($this->klusser, OfferAccepted::class);
});

it('notifies siblings when their offer is auto-rejected by acceptance', function () {
    $primary = Offer::factory()->create([
        'klusje_id' => $this->klusje->id,
        'klusser_id' => $this->klusser->id,
        'status' => OfferStatus::Pending->value,
    ]);
    $other = User::factory()->create();
    $sibling = Offer::factory()->create([
        'klusje_id' => $this->klusje->id,
        'klusser_id' => $other->id,
        'status' => OfferStatus::Pending->value,
    ]);

    $this->actingAs($this->owner)
        ->post("/offers/{$primary->id}/accept");

    Notification::assertSentTo($other, OfferRejected::class);
});

it('notifies the assigned klusser when a klusje is completed', function () {
    $klusje = Klusje::factory()->create([
        'user_id' => $this->owner->id,
        'assigned_klusser_id' => $this->klusser->id,
        'status' => KlusjeStatus::Assigned->value,
    ]);

    $this->actingAs($this->owner)
        ->post("/jobs/{$klusje->id}/complete");

    Notification::assertSentTo($this->klusser, KlusjeCompleted::class);
});

it('notifies the target when a review is submitted', function () {
    $klusje = Klusje::factory()->create([
        'user_id' => $this->owner->id,
        'assigned_klusser_id' => $this->klusser->id,
        'status' => KlusjeStatus::Completed->value,
    ]);

    $this->actingAs($this->owner)
        ->post("/jobs/{$klusje->id}/reviews", [
            'to_user_id' => $this->klusser->id,
            'rating' => 5,
        ]);

    Notification::assertSentTo($this->klusser, ReviewReceived::class);
});
