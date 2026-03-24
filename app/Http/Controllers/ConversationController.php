<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Klusje;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function index(Request $request): Response
    {
        $conversations = Conversation::query()
            ->forUser($request->user())
            ->with(['klusje:id,title', 'starter:id,name', 'owner:id,name', 'latestMessage'])
            ->withCount(['messages as unread_count' => function ($query) use ($request) {
                $query->where('user_id', '!=', $request->user()->id)
                    ->whereNull('read_at');
            }])
            ->latest('updated_at')
            ->get();

        return Inertia::render('conversations/index', [
            'conversations' => $conversations,
        ]);
    }

    public function show(Request $request, Conversation $conversation): Response
    {
        abort_unless(
            $request->user()->id === $conversation->starter_id
            || $request->user()->id === $conversation->owner_id,
            403
        );

        $conversation->load(['klusje:id,title', 'starter:id,name', 'owner:id,name']);

        $messages = $conversation->messages()
            ->with('user:id,name')
            ->oldest()
            ->get();

        $priceProposals = $conversation->priceProposals()
            ->with('user:id,name')
            ->oldest()
            ->get();

        $conversation->messages()
            ->where('user_id', '!=', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return Inertia::render('conversations/show', [
            'conversation' => $conversation,
            'messages' => $messages,
            'priceProposals' => $priceProposals,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'klusje_id' => 'required|exists:klusjes,id',
        ]);

        $klusje = Klusje::findOrFail($validated['klusje_id']);

        abort_if($request->user()->id === $klusje->user_id, 403);

        $conversation = Conversation::firstOrCreate(
            [
                'klusje_id' => $klusje->id,
                'starter_id' => $request->user()->id,
            ],
            [
                'owner_id' => $klusje->user_id,
            ]
        );

        return redirect()->route('conversations.show', $conversation);
    }
}
