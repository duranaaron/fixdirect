<?php

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Klusje;
use App\Models\User;
use Illuminate\Support\Facades\Event;

beforeEach(function () {
    $this->withoutVite();
    $this->owner = User::factory()->create();
    $this->starter = User::factory()->create();
    $this->klusje = Klusje::factory()->create(['user_id' => $this->owner->id]);
});

it('can create a conversation from a klusje', function () {
    $this->actingAs($this->starter)
        ->post('/conversations', ['klusje_id' => $this->klusje->id])
        ->assertRedirect();

    $this->assertDatabaseHas('conversations', [
        'klusje_id' => $this->klusje->id,
        'starter_id' => $this->starter->id,
        'owner_id' => $this->owner->id,
    ]);
});

it('returns the same conversation on duplicate create', function () {
    $this->actingAs($this->starter)
        ->post('/conversations', ['klusje_id' => $this->klusje->id]);

    $this->actingAs($this->starter)
        ->post('/conversations', ['klusje_id' => $this->klusje->id]);

    expect(Conversation::count())->toBe(1);
});

it('cannot create a conversation with yourself', function () {
    $this->actingAs($this->owner)
        ->post('/conversations', ['klusje_id' => $this->klusje->id])
        ->assertForbidden();
});

it('shows only own conversations on index', function () {
    $otherUser = User::factory()->create();
    $otherKlusje = Klusje::factory()->create(['user_id' => $otherUser->id]);

    Conversation::create([
        'klusje_id' => $this->klusje->id,
        'starter_id' => $this->starter->id,
        'owner_id' => $this->owner->id,
    ]);

    Conversation::create([
        'klusje_id' => $otherKlusje->id,
        'starter_id' => $otherUser->id,
        'owner_id' => $otherUser->id,
    ]);

    $this->actingAs($this->starter)
        ->get('/conversations')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('conversations/index')
            ->has('conversations', 1)
        );
});

it('returns 403 for non-participants on show', function () {
    $conversation = Conversation::create([
        'klusje_id' => $this->klusje->id,
        'starter_id' => $this->starter->id,
        'owner_id' => $this->owner->id,
    ]);

    $outsider = User::factory()->create();

    $this->actingAs($outsider)
        ->get("/conversations/{$conversation->id}")
        ->assertForbidden();
});

it('allows participants to view a conversation', function () {
    $conversation = Conversation::create([
        'klusje_id' => $this->klusje->id,
        'starter_id' => $this->starter->id,
        'owner_id' => $this->owner->id,
    ]);

    $this->actingAs($this->starter)
        ->get("/conversations/{$conversation->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('conversations/show')
            ->has('conversation')
            ->has('counterpart')
            ->has('timeline')
            ->where('viewerRole', 'starter')
        );
});

it('can send a message', function () {
    $conversation = Conversation::create([
        'klusje_id' => $this->klusje->id,
        'starter_id' => $this->starter->id,
        'owner_id' => $this->owner->id,
    ]);

    Event::fake([MessageSent::class]);

    $this->actingAs($this->starter)
        ->post("/conversations/{$conversation->id}/messages", ['body' => 'Hallo!'])
        ->assertRedirect();

    $this->assertDatabaseHas('messages', [
        'conversation_id' => $conversation->id,
        'user_id' => $this->starter->id,
        'body' => 'Hallo!',
    ]);

    Event::assertDispatched(MessageSent::class);
});

it('prevents non-participants from sending messages', function () {
    $conversation = Conversation::create([
        'klusje_id' => $this->klusje->id,
        'starter_id' => $this->starter->id,
        'owner_id' => $this->owner->id,
    ]);

    $outsider = User::factory()->create();

    $this->actingAs($outsider)
        ->post("/conversations/{$conversation->id}/messages", ['body' => 'Hallo!'])
        ->assertForbidden();
});

it('requires authentication for conversations', function () {
    $this->get('/conversations')->assertRedirect('/login');
    $this->post('/conversations', ['klusje_id' => $this->klusje->id])->assertRedirect('/login');
});
