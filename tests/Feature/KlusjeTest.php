<?php

use App\Enums\KlusjeStatus;
use App\Models\Klusje;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->withoutVite();
});

it('lists open klusjes on /find', function () {
    Klusje::factory()->count(3)->create(['status' => KlusjeStatus::Open->value]);
    Klusje::factory()->create(['status' => KlusjeStatus::Completed->value]);

    $this->get('/find')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('find')
            ->has('klusjes.data', 3)
            ->where('klusjes.total', 3)
        );
});

it('paginates klusjes in groups of 12', function () {
    Klusje::factory()->count(15)->create(['status' => KlusjeStatus::Open->value]);

    $this->get('/find')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('klusjes.data', 12)
            ->where('klusjes.total', 15)
            ->where('klusjes.last_page', 2)
        );
});

it('filters klusjes by category query string', function () {
    Klusje::factory()->create(['category' => 'Montage', 'status' => KlusjeStatus::Open->value]);
    Klusje::factory()->create(['category' => 'Schilderen', 'status' => KlusjeStatus::Open->value]);

    $this->get('/find?category=Montage')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('klusjes.data', 1)
            ->where('klusjes.data.0.category', 'Montage')
        );
});

it('filters klusjes by search term', function () {
    Klusje::factory()->create(['title' => 'IKEA kast monteren', 'status' => KlusjeStatus::Open->value]);
    Klusje::factory()->create(['title' => 'Tuin schoonmaken', 'status' => KlusjeStatus::Open->value]);

    $this->get('/find?search=IKEA')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('klusjes.data', 1)
            ->where('klusjes.data.0.title', 'IKEA kast monteren')
        );
});

it('allows a verified user to create a klusje', function () {
    Storage::fake('public');
    $user = User::factory()->create(['email_verified_at' => now()]);

    $this->actingAs($user)
        ->post('/jobs', [
            'title' => 'Test klus',
            'category' => 'Montage',
            'location' => 'Gent',
            'date' => now()->addDays(3)->toDateString(),
            'compensation' => 50,
            'description' => 'Iets dat gedaan moet worden.',
            'images' => [UploadedFile::fake()->image('a.jpg')],
        ])
        ->assertRedirect(route('find'));

    $this->assertDatabaseHas('klusjes', [
        'title' => 'Test klus',
        'user_id' => $user->id,
        'status' => KlusjeStatus::Open->value,
    ]);
});

it('rejects invalid klusje data', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);

    $this->actingAs($user)
        ->post('/jobs', ['title' => ''])
        ->assertSessionHasErrors(['title', 'category', 'location', 'date', 'compensation', 'description']);
});

it('allows the owner to update an open klusje', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $klusje = Klusje::factory()->create([
        'user_id' => $user->id,
        'status' => KlusjeStatus::Open->value,
    ]);

    $this->actingAs($user)
        ->patch("/jobs/{$klusje->id}", [
            'title' => 'Nieuwe titel',
            'category' => $klusje->category,
            'location' => $klusje->location,
            'date' => $klusje->date->toDateString(),
            'compensation' => $klusje->compensation,
            'description' => 'Een nieuwe, geldige beschrijving.',
        ])
        ->assertRedirect();

    expect($klusje->fresh()->title)->toBe('Nieuwe titel');
});

it('forbids other users from updating a klusje', function () {
    $owner = User::factory()->create(['email_verified_at' => now()]);
    $other = User::factory()->create(['email_verified_at' => now()]);
    $klusje = Klusje::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($other)
        ->patch("/jobs/{$klusje->id}", [
            'title' => 'x',
            'category' => 'Montage',
            'location' => 'Gent',
            'date' => now()->addDay()->toDateString(),
            'compensation' => 10,
            'description' => 'Een geldige beschrijving.',
        ])
        ->assertForbidden();
});

it('forbids updates once a klusje is no longer open', function () {
    $owner = User::factory()->create(['email_verified_at' => now()]);
    $klusje = Klusje::factory()->create([
        'user_id' => $owner->id,
        'status' => KlusjeStatus::Assigned->value,
    ]);

    $this->actingAs($owner)
        ->patch("/jobs/{$klusje->id}", [
            'title' => 'x',
            'category' => 'Montage',
            'location' => 'Gent',
            'date' => now()->addDay()->toDateString(),
            'compensation' => 10,
            'description' => 'Een geldige beschrijving.',
        ])
        ->assertForbidden();
});

it('allows the owner to delete an open klusje', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $klusje = Klusje::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->delete("/jobs/{$klusje->id}")
        ->assertRedirect();

    $this->assertDatabaseMissing('klusjes', ['id' => $klusje->id]);
});

it('forbids other users from deleting a klusje', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create(['email_verified_at' => now()]);
    $klusje = Klusje::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($other)
        ->delete("/jobs/{$klusje->id}")
        ->assertForbidden();
});

it('shows mine page with owned klusjes', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    Klusje::factory()->count(2)->create(['user_id' => $user->id]);
    Klusje::factory()->create();

    $this->actingAs($user)
        ->get('/my/klusjes')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('klusjes/mine')
            ->has('klusjes', 2)
        );
});

it('lets the owner mark an assigned klusje as complete when escrow is held', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $klusser = User::factory()->create();
    $klusje = Klusje::factory()->create([
        'user_id' => $user->id,
        'assigned_klusser_id' => $klusser->id,
        'status' => KlusjeStatus::Assigned->value,
    ]);
    \App\Models\Payment::create([
        'klusje_id' => $klusje->id,
        'payer_id' => $user->id,
        'payee_id' => $klusser->id,
        'amount' => 50,
        'platform_fee' => 5,
        'currency' => 'eur',
        'status' => \App\Enums\PaymentStatus::Held->value,
        'held_at' => now(),
    ]);

    $this->actingAs($user)
        ->post("/jobs/{$klusje->id}/complete")
        ->assertRedirect();

    $fresh = $klusje->fresh();
    expect($fresh->status)->toBe(KlusjeStatus::Completed);
    expect($fresh->completed_at)->not->toBeNull();
});

it('lets the owner cancel a klusje', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $klusje = Klusje::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->post("/jobs/{$klusje->id}/cancel")
        ->assertRedirect();

    expect($klusje->fresh()->status)->toBe(KlusjeStatus::Cancelled);
});
