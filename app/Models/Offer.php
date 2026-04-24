<?php

namespace App\Models;

use App\Enums\OfferStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Offer extends Model
{
    /** @use HasFactory<\Database\Factories\OfferFactory> */
    use HasFactory;

    protected $fillable = [
        'klusje_id',
        'klusser_id',
        'message',
        'proposed_compensation',
        'counter_offer_compensation',
        'counter_offer_message',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'proposed_compensation' => 'decimal:2',
            'counter_offer_compensation' => 'decimal:2',
            'status' => OfferStatus::class,
        ];
    }

    public function klusje(): BelongsTo
    {
        return $this->belongsTo(Klusje::class);
    }

    public function klusser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'klusser_id');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', OfferStatus::Pending->value);
    }
}
