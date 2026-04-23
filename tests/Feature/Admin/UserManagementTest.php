<?php

use App\Models\User;

beforeEach(function () {
    $this->withoutVite();
    $this->admin = User::factory()->create(['email_verified_at' => now(), 'is_admin' => true]);
});

it('lists users with a search filter', function () {
    User::factory()->create(['name' => 'Alice Example', 'email_verified_at' => now()]);
    User::factory()->create(['name' => 'Bob Different', 'email_verified_at' => now()]);

    $this->actingAs($this->admin)
        ->get('/admin/users?search=Alice')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/users/index')
            ->has('users.data', 1)
            ->where('users.data.0.name', 'Alice Example')
        );
});

it('suspends and unsuspends users', function () {
    $target = User::factory()->create(['email_verified_at' => now()]);

    $this->actingAs($this->admin)
        ->post("/admin/users/{$target->id}/suspend")
        ->assertRedirect();
    expect($target->fresh()->suspended_at)->not->toBeNull();

    $this->actingAs($this->admin)
        ->post("/admin/users/{$target->id}/unsuspend")
        ->assertRedirect();
    expect($target->fresh()->suspended_at)->toBeNull();
});

it('prevents an admin from suspending themselves', function () {
    $this->actingAs($this->admin)
        ->post("/admin/users/{$this->admin->id}/suspend")
        ->assertStatus(422);
});
