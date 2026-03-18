<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Conversation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function store(Request $request, Conversation $conversation): RedirectResponse
    {
        abort_unless(
            $request->user()->id === $conversation->starter_id
            || $request->user()->id === $conversation->owner_id,
            403
        );

        $validated = $request->validate([
            'body' => 'required|string|max:5000',
        ]);

        $message = $conversation->messages()->create([
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        $conversation->touch();

        $message->load('user:id,name');

        broadcast(new MessageSent($message))->toOthers();

        return back();
    }
}
