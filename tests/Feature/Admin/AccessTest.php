<?php

use App\Models\User;

beforeEach(function () {
    $this->withoutVite();
});

it('redirects unauthenticated visitors away from the admin area', function () {
    $this->get('/admin')->assertRedirect('/login');
});

it('forbids non-admin users from the admin area', function () {
    $user = User::factory()->create(['email_verified_at' => now(), 'is_admin' => false]);

    $this->actingAs($user)->get('/admin')->assertForbidden();
    $this->actingAs($user)->get('/admin/users')->assertForbidden();
    $this->actingAs($user)->get('/admin/klusjes')->assertForbidden();
});

it('lets admins into the admin area', function () {
    $admin = User::factory()->create(['email_verified_at' => now(), 'is_admin' => true]);

    $this->actingAs($admin)->get('/admin')->assertOk();
    $this->actingAs($admin)->get('/admin/users')->assertOk();
    $this->actingAs($admin)->get('/admin/klusjes')->assertOk();
});
