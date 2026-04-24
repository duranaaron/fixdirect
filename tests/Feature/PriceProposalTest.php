<?php

use App\Events\PriceProposalSent;
use App\Events\PriceProposalUpdated;
use App\Models\Conversation;
use App\Models\Klusje;
use App\Models\PriceProposal;
use App\Models\User;
use Illuminate\Support\Facades\Event;

beforeEach(function () {
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

it('invalidates previous pending proposals when creating a new proposal', function () {
    Event::fake([PriceProposalSent::class, PriceProposalUpdated::class]);

    $oldProposal = PriceProposal::create([
        'conversation_id' => $this->conversation->id,
        'user_id' => $this->starter->id,
        'amount' => 100.00,
        'scheduled_at' => now()->addDays(5),
        'status' => 'pending',
    ]);

    $this->actingAs($this->owner)
        ->post("/conversations/{$this->conversation->id}/proposals", [
            'amount' => 80.00,
            'scheduled_at' => now()->addDays(6)->format('Y-m-d'),
        ])
        ->assertRedirect();

    expect($oldProposal->fresh()->status)->toBe('declined')
        ->and($oldProposal->fresh()->responded_at)->not->toBeNull();

    Event::assertDispatched(PriceProposalUpdated::class, function ($event) use ($oldProposal) {
        return $event->priceProposal->id === $oldProposal->id;
    });
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

it('broadcasts when a proposal is accepted', function () {
    Event::fake([PriceProposalUpdated::class]);

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

    Event::assertDispatched(PriceProposalUpdated::class, function ($event) use ($proposal) {
        return $event->priceProposal->id === $proposal->id;
    });
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

it('broadcasts when a proposal is declined', function () {
    Event::fake([PriceProposalUpdated::class]);

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

    Event::assertDispatched(PriceProposalUpdated::class, function ($event) use ($proposal) {
        return $event->priceProposal->id === $proposal->id;
    });
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

// Skipped: these tests assert a proposal-driven dashboard (WIP upstream work).
// The dashboard now shows owned klusjes directly via DashboardController; these
// behaviors belong to the superseded proposal-backed design.
it('shows accepted proposals on the dashboard', function () {})->skip('Dashboard now renders owned klusjes, not price proposals.');

it('does not show pending proposals on the dashboard', function () {})->skip('Dashboard now renders owned klusjes, not price proposals.');
