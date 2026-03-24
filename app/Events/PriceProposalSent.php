<?php

namespace App\Events;

use App\Models\PriceProposal;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PriceProposalSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public PriceProposal $priceProposal,
    ) {}

    /**
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.'.$this->priceProposal->conversation_id),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'priceProposal' => [
                'id' => $this->priceProposal->id,
                'conversation_id' => $this->priceProposal->conversation_id,
                'user_id' => $this->priceProposal->user_id,
                'amount' => $this->priceProposal->amount,
                'scheduled_at' => $this->priceProposal->scheduled_at->toISOString(),
                'status' => $this->priceProposal->status,
                'responded_at' => $this->priceProposal->responded_at?->toISOString(),
                'created_at' => $this->priceProposal->created_at->toISOString(),
                'updated_at' => $this->priceProposal->updated_at->toISOString(),
                'user' => [
                    'id' => $this->priceProposal->user->id,
                    'name' => $this->priceProposal->user->name,
                ],
            ],
        ];
    }
}
