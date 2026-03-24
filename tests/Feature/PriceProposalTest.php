<?php

use App\Events\PriceProposalSent;
use App\Models\Conversation;
use App\Models\Klusje;
use App\Models\PriceProposal;
use App\Models\User;
use Illuminate\Support\Facades\Event;

beforeEach(function () {
    $this->withoutVite();
    $this->owner = User::factory()->create();
    $this->starter = User::factory()->create();
    $this->klusje = Klusje::factory()->create(['user_id' => $this->owner->id]);
    $this->conversation = Conversation::create([
        'klusje_id' => $this->klusje->id,
        'starter_id' => $this->starter->id,
        'owner_id' => $this->owner->id,
    ]);
});

it('allows a participant to create a price proposal', function () {
    Event::fake([PriceProposalSent::class]);

    $this->actingAs($this->starter)
        ->post("/conversations/{$this->conversation->id}/proposals", [
            'amount' => 75.00,
            'scheduled_at' => now()->addDays(5)->format('Y-m-d'),
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('price_proposals', [
        'conversation_id' => $this->conversation->id,
        'user_id' => $this->starter->id,
        'amount' => '75.00',
        'status' => 'pending',
    ]);

    Event::assertDispatched(PriceProposalSent::class);
});

it('prevents non-participants from creating proposals', function () {
    $outsider = User::factory()->create();

    $this->actingAs($outsider)
        ->post("/conversations/{$this->conversation->id}/proposals", [
            'amount' => 50.00,
            'scheduled_at' => now()->addDays(3)->format('Y-m-d'),
        ])
        ->assertForbidden();
});

it('validates proposal amount and date', function () {
    $this->actingAs($this->starter)
        ->post("/conversations/{$this->conversation->id}/proposals", [
            'amount' => '',
            'scheduled_at' => '',
        ])
        ->assertSessionHasErrors(['amount', 'scheduled_at']);
});

it('validates amount must be at least 1', function () {
    $this->actingAs($this->starter)
        ->post("/conversations/{$this->conversation->id}/proposals", [
            'amount' => 0.50,
            'scheduled_at' => now()->addDays(3)->format('Y-m-d'),
        ])
        ->assertSessionHasErrors(['amount']);
});

it('allows the other party to accept a proposal', function () {
    $proposal = PriceProposal::create([
        'conversation_id' => $this->conversation->id,
        'user_id' => $this->starter->id,
        'amount' => 100.00,
        'scheduled_at' => now()->addDays(5),
        'status' => 'pending',
    ]);

    $this->actingAs($this->owner)
        ->patch("/proposals/{$proposal->id}/accept")
        ->assertRedirect();

    expect($proposal->fresh()->status)->toBe('accepted')
        ->and($proposal->fresh()->responded_at)->not->toBeNull();
});

it('prevents the proposer from accepting their own proposal', function () {
    $proposal = PriceProposal::create([
        'conversation_id' => $this->conversation->id,
        'user_id' => $this->starter->id,
        'amount' => 100.00,
        'scheduled_at' => now()->addDays(5),
        'status' => 'pending',
    ]);

    $this->actingAs($this->starter)
        ->patch("/proposals/{$proposal->id}/accept")
        ->assertForbidden();
});

it('allows the other party to decline a proposal', function () {
    $proposal = PriceProposal::create([
        'conversation_id' => $this->conversation->id,
        'user_id' => $this->starter->id,
        'amount' => 100.00,
        'scheduled_at' => now()->addDays(5),
        'status' => 'pending',
    ]);

    $this->actingAs($this->owner)
        ->patch("/proposals/{$proposal->id}/decline")
        ->assertRedirect();

    expect($proposal->fresh()->status)->toBe('declined');
});

it('prevents accepting an already accepted proposal', function () {
    $proposal = PriceProposal::create([
        'conversation_id' => $this->conversation->id,
        'user_id' => $this->starter->id,
        'amount' => 100.00,
        'scheduled_at' => now()->addDays(5),
        'status' => 'accepted',
        'responded_at' => now(),
    ]);

    $this->actingAs($this->owner)
        ->patch("/proposals/{$proposal->id}/accept")
        ->assertUnprocessable();
});

it('shows proposals on the conversation page', function () {
    PriceProposal::create([
        'conversation_id' => $this->conversation->id,
        'user_id' => $this->starter->id,
        'amount' => 100.00,
        'scheduled_at' => now()->addDays(5),
        'status' => 'pending',
    ]);

    $this->actingAs($this->owner)
        ->get("/conversations/{$this->conversation->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('conversations/show')
            ->has('priceProposals', 1)
        );
});

it('shows accepted proposals on the dashboard', function () {
    PriceProposal::create([
        'conversation_id' => $this->conversation->id,
        'user_id' => $this->starter->id,
        'amount' => 100.00,
        'scheduled_at' => now()->addDays(5),
        'status' => 'accepted',
        'responded_at' => now(),
    ]);

    $this->actingAs($this->owner)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('klusjes', 1)
        );
});

it('does not show pending proposals on the dashboard', function () {
    PriceProposal::create([
        'conversation_id' => $this->conversation->id,
        'user_id' => $this->starter->id,
        'amount' => 100.00,
        'scheduled_at' => now()->addDays(5),
        'status' => 'pending',
    ]);

    $this->actingAs($this->owner)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('klusjes', 0)
        );
});
