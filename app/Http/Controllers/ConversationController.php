<?php

namespace App\Http\Controllers;

use App\Enums\KlusjeStatus;
use App\Models\Conversation;
use App\Models\Klusje;
use App\Models\Offer;
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
            ->with([
                'klusje:id,title,category,compensation',
                'starter:id,name,profile_photo_path',
                'owner:id,name,profile_photo_path',
                'latestMessage',
            ])
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

        $conversation->load([
            'klusje.images',
            'klusje.user:id,name,profile_photo_path',
            'klusje.assignedKlusser:id,name,profile_photo_path',
            'starter:id,name,profile_photo_path,bio,location,rating_avg,rating_count,created_at',
            'owner:id,name,profile_photo_path,bio,location,rating_avg,rating_count,created_at',
        ]);

        $viewer = $request->user();
        $counterpart = $viewer->id === $conversation->starter_id
            ? $conversation->owner
            : $conversation->starter;

        $messages = $conversation->messages()
            ->with('user:id,name,profile_photo_path')
            ->oldest()
            ->get()
            ->map(fn ($message) => [
                'kind' => 'message',
                'id' => 'message-'.$message->id,
                'at' => $message->created_at->toIso8601String(),
                'author_id' => $message->user_id,
                'author_name' => $message->user?->name,
                'body' => $message->body,
            ]);

        $offers = Offer::query()
            ->where('klusje_id', $conversation->klusje_id)
            ->where('klusser_id', $conversation->starter_id)
            ->orderBy('created_at')
            ->get()
            ->map(fn (Offer $offer) => [
                'kind' => 'offer',
                'id' => 'offer-'.$offer->id,
                'at' => $offer->created_at->toIso8601String(),
                'offer_id' => $offer->id,
                'author_id' => $offer->klusser_id,
                'amount' => (float) $offer->proposed_compensation,
                'message' => $offer->message,
                'status' => $offer->status->value,
                'responded_at' => $offer->updated_at->notEqualTo($offer->created_at)
                    ? $offer->updated_at->toIso8601String()
                    : null,
            ]);

        $timeline = $messages->concat($offers)->sortBy('at')->values();

        $priceProposals = $conversation->priceProposals()
            ->with('user:id,name')
            ->oldest()
            ->get();

        $conversation->messages()
            ->where('user_id', '!=', $viewer->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $counterpartStats = [
            'completed_as_klusser' => $counterpart->assignedKlusjes()
                ->where('status', KlusjeStatus::Completed->value)
                ->count(),
            'posted_count' => $counterpart->klusjes()->count(),
            'member_since' => $counterpart->created_at?->format('Y'),
        ];

        return Inertia::render('conversations/show', [
            'conversation' => [
                'id' => $conversation->id,
                'klusje_id' => $conversation->klusje_id,
                'starter_id' => $conversation->starter_id,
                'owner_id' => $conversation->owner_id,
                'klusje' => $conversation->klusje,
            ],
            'counterpart' => [
                'id' => $counterpart->id,
                'name' => $counterpart->name,
                'profile_photo_path' => $counterpart->profile_photo_path,
                'bio' => $counterpart->bio,
                'location' => $counterpart->location,
                'rating_avg' => $counterpart->rating_avg,
                'rating_count' => $counterpart->rating_count,
            ],
            'counterpartStats' => $counterpartStats,
            'timeline' => $timeline,
            'viewerRole' => $viewer->id === $conversation->owner_id ? 'owner' : 'starter',
            'latestOffer' => $offers->last(),
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
