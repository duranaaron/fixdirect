<?php

use App\Enums\KlusjeStatus;
use App\Enums\OfferStatus;
use App\Models\Klusje;
use App\Models\Offer;
use App\Models\User;

beforeEach(function () {
    $this->withoutVite();
    $this->owner = User::factory()->create(['email_verified_at' => now()]);
    $this->klusser = User::factory()->create(['email_verified_at' => now()]);
    $this->klusje = Klusje::factory()->create([
        'user_id' => $this->owner->id,
        'status' => KlusjeStatus::Open->value,
    ]);
});

it('lets a klusser submit an offer', function () {
    $this->actingAs($this->klusser)
        ->post('/offers', [
            'klusje_id' => $this->klusje->id,
            'message' => 'Ik wil deze klus doen.',
            'proposed_compensation' => 40,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('offers', [
        'klusje_id' => $this->klusje->id,
        'klusser_id' => $this->klusser->id,
        'status' => OfferStatus::Pending->value,
    ]);
});

it('prevents the owner from applying to their own klusje', function () {
    $this->actingAs($this->owner)
        ->post('/offers', ['klusje_id' => $this->klusje->id])
        ->assertForbidden();
});

it('prevents duplicate offers from the same klusser', function () {
    Offer::factory()->create([
        'klusje_id' => $this->klusje->id,
        'klusser_id' => $this->klusser->id,
    ]);

    $this->actingAs($this->klusser)
        ->post('/offers', ['klusje_id' => $this->klusje->id])
        ->assertRedirect();

    expect(Offer::count())->toBe(1);
});

it('accepts an offer and rejects the siblings', function () {
    $other = User::factory()->create();
    $primary = Offer::factory()->create([
        'klusje_id' => $this->klusje->id,
        'klusser_id' => $this->klusser->id,
        'status' => OfferStatus::Pending->value,
    ]);
    $sibling = Offer::factory()->create([
        'klusje_id' => $this->klusje->id,
        'klusser_id' => $other->id,
        'status' => OfferStatus::Pending->value,
    ]);

    $this->actingAs($this->owner)
        ->post("/offers/{$primary->id}/accept")
        ->assertRedirect();

    expect($primary->fresh()->status)->toBe(OfferStatus::Accepted);
    expect($sibling->fresh()->status)->toBe(OfferStatus::Rejected);
    $klusje = $this->klusje->fresh();
    expect($klusje->status)->toBe(KlusjeStatus::Assigned);
    expect($klusje->assigned_klusser_id)->toBe($this->klusser->id);
});

it('rejects an offer', function () {
    $offer = Offer::factory()->create([
        'klusje_id' => $this->klusje->id,
        'klusser_id' => $this->klusser->id,
        'status' => OfferStatus::Pending->value,
    ]);

    $this->actingAs($this->owner)
        ->post("/offers/{$offer->id}/reject")
        ->assertRedirect();

    expect($offer->fresh()->status)->toBe(OfferStatus::Rejected);
});

it('lets the klusser withdraw their own offer', function () {
    $offer = Offer::factory()->create([
        'klusje_id' => $this->klusje->id,
        'klusser_id' => $this->klusser->id,
        'status' => OfferStatus::Pending->value,
    ]);

    $this->actingAs($this->klusser)
        ->delete("/offers/{$offer->id}")
        ->assertRedirect();

    expect($offer->fresh()->status)->toBe(OfferStatus::Withdrawn);
});

it('forbids the klusser from accepting their own offer', function () {
    $offer = Offer::factory()->create([
        'klusje_id' => $this->klusje->id,
        'klusser_id' => $this->klusser->id,
        'status' => OfferStatus::Pending->value,
    ]);

    $this->actingAs($this->klusser)
        ->post("/offers/{$offer->id}/accept")
        ->assertForbidden();
});

it('shows mine page with own offers', function () {
    Offer::factory()->count(2)->create(['klusser_id' => $this->klusser->id]);
    Offer::factory()->create();

    $this->actingAs($this->klusser)
        ->get('/my/offers')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('offers/mine')
            ->has('offers', 2)
        );
});

it('prevents applications to non-open klusjes', function () {
    $closed = Klusje::factory()->create([
        'user_id' => $this->owner->id,
        'status' => KlusjeStatus::Completed->value,
    ]);

    $this->actingAs($this->klusser)
        ->post('/offers', ['klusje_id' => $closed->id])
        ->assertForbidden();
});

it('cancelling a klusje rejects pending offers', function () {
    $offer = Offer::factory()->create([
        'klusje_id' => $this->klusje->id,
        'status' => OfferStatus::Pending->value,
    ]);

    $this->actingAs($this->owner)
        ->post("/jobs/{$this->klusje->id}/cancel")
        ->assertRedirect();

    expect($offer->fresh()->status)->toBe(OfferStatus::Rejected);
    expect($this->klusje->fresh()->status)->toBe(KlusjeStatus::Cancelled);
});
