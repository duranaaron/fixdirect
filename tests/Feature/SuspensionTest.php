<?php

use App\Models\User;

beforeEach(function () {
    $this->withoutVite();
});

it('logs out a suspended user on the next request', function () {
    $user = User::factory()->create([
        'email_verified_at' => now(),
        'suspended_at' => now(),
    ]);

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertRedirect('/');

    expect(auth()->check())->toBeFalse();
});

it('allows active users to access authenticated routes', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);

    $this->actingAs($user)->get('/dashboard')->assertOk();
});
