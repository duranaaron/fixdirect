<?php

use App\Enums\KlusjeStatus;
use App\Models\Klusje;
use App\Models\Review;
use App\Models\User;

beforeEach(function () {
    $this->withoutVite();
    $this->owner = User::factory()->create(['email_verified_at' => now()]);
    $this->klusser = User::factory()->create(['email_verified_at' => now()]);
    $this->klusje = Klusje::factory()->create([
        'user_id' => $this->owner->id,
        'assigned_klusser_id' => $this->klusser->id,
        'status' => KlusjeStatus::Completed->value,
        'completed_at' => now(),
    ]);
});

it('lets the owner review the klusser after completion', function () {
    $this->actingAs($this->owner)
        ->post("/jobs/{$this->klusje->id}/reviews", [
            'to_user_id' => $this->klusser->id,
            'rating' => 5,
            'comment' => 'Prima werk!',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('reviews', [
        'klusje_id' => $this->klusje->id,
        'from_user_id' => $this->owner->id,
        'to_user_id' => $this->klusser->id,
        'rating' => 5,
    ]);
});

it('lets the klusser review the owner after completion', function () {
    $this->actingAs($this->klusser)
        ->post("/jobs/{$this->klusje->id}/reviews", [
            'to_user_id' => $this->owner->id,
            'rating' => 4,
        ])
        ->assertRedirect();

    expect($this->owner->fresh()->rating_avg)->toEqual('4.00');
    expect($this->owner->fresh()->rating_count)->toBe(1);
});

it('prevents reviewing before completion', function () {
    $open = Klusje::factory()->create([
        'user_id' => $this->owner->id,
        'assigned_klusser_id' => $this->klusser->id,
        'status' => KlusjeStatus::Open->value,
    ]);

    $this->actingAs($this->owner)
        ->post("/jobs/{$open->id}/reviews", [
            'to_user_id' => $this->klusser->id,
            'rating' => 5,
        ])
        ->assertForbidden();
});

it('prevents non-participants from reviewing', function () {
    $outsider = User::factory()->create(['email_verified_at' => now()]);

    $this->actingAs($outsider)
        ->post("/jobs/{$this->klusje->id}/reviews", [
            'to_user_id' => $this->klusser->id,
            'rating' => 5,
        ])
        ->assertForbidden();
});

it('prevents duplicate reviews', function () {
    Review::create([
        'klusje_id' => $this->klusje->id,
        'from_user_id' => $this->owner->id,
        'to_user_id' => $this->klusser->id,
        'rating' => 3,
    ]);

    $this->actingAs($this->owner)
        ->post("/jobs/{$this->klusje->id}/reviews", [
            'to_user_id' => $this->klusser->id,
            'rating' => 5,
        ])
        ->assertForbidden();
});

it('rejects invalid rating values', function () {
    $this->actingAs($this->owner)
        ->post("/jobs/{$this->klusje->id}/reviews", [
            'to_user_id' => $this->klusser->id,
            'rating' => 10,
        ])
        ->assertSessionHasErrors('rating');
});

it('recalculates user rating aggregate on review save', function () {
    Review::create([
        'klusje_id' => $this->klusje->id,
        'from_user_id' => $this->owner->id,
        'to_user_id' => $this->klusser->id,
        'rating' => 5,
    ]);

    $second = Klusje::factory()->create([
        'user_id' => User::factory(),
        'assigned_klusser_id' => $this->klusser->id,
        'status' => KlusjeStatus::Completed->value,
    ]);

    Review::create([
        'klusje_id' => $second->id,
        'from_user_id' => $second->user_id,
        'to_user_id' => $this->klusser->id,
        'rating' => 3,
    ]);

    expect($this->klusser->fresh()->rating_avg)->toEqual('4.00');
    expect($this->klusser->fresh()->rating_count)->toBe(2);
});
