<?php

namespace App\Models;

use Database\Factories\PriceProposalFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceProposal extends Model
{
    /** @use HasFactory<PriceProposalFactory> */
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'user_id',
        'amount',
        'scheduled_at',
        'status',
        'responded_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'scheduled_at' => 'datetime',
            'responded_at' => 'datetime',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
