<?php

namespace App\Http\Controllers;

use App\Events\PriceProposalSent;
use App\Events\PriceProposalUpdated;
use App\Http\Requests\StorePriceProposalRequest;
use App\Models\Conversation;
use App\Models\PriceProposal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PriceProposalController extends Controller
{
    public function store(StorePriceProposalRequest $request, Conversation $conversation): RedirectResponse
    {
        $pendingProposals = $conversation->priceProposals()->where('status', 'pending')->get();

        foreach ($pendingProposals as $pending) {
            $pending->update([
                'status' => 'declined',
                'responded_at' => now(),
            ]);

            broadcast(new PriceProposalUpdated($pending))->toOthers();
        }

        $proposal = $conversation->priceProposals()->create([
            'user_id' => $request->user()->id,
            'amount' => $request->validated('amount'),
            'scheduled_at' => $request->validated('scheduled_at'),
        ]);

        $proposal->load('user:id,name');

        broadcast(new PriceProposalSent($proposal))->toOthers();

        return back();
    }

    public function accept(Request $request, PriceProposal $priceProposal): RedirectResponse
    {
        $this->authorizeResponse($request, $priceProposal);

        $priceProposal->update([
            'status' => 'accepted',
            'responded_at' => now(),
        ]);

        broadcast(new PriceProposalUpdated($priceProposal))->toOthers();

        return back();
    }

    public function decline(Request $request, PriceProposal $priceProposal): RedirectResponse
    {
        $this->authorizeResponse($request, $priceProposal);

        $priceProposal->update([
            'status' => 'declined',
            'responded_at' => now(),
        ]);

        broadcast(new PriceProposalUpdated($priceProposal))->toOthers();

        return back();
    }

    private function authorizeResponse(Request $request, PriceProposal $priceProposal): void
    {
        $conversation = $priceProposal->conversation;

        abort_unless(
            $request->user()->id === $conversation->starter_id
            || $request->user()->id === $conversation->owner_id,
            403
        );

        abort_if($request->user()->id === $priceProposal->user_id, 403);

        abort_unless($priceProposal->status === 'pending', 422);
    }
}
