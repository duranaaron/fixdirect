<?php

namespace App\Models;

use Database\Factories\ConversationFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    /** @use HasFactory<ConversationFactory> */
    use HasFactory;

    protected $fillable = [
        'klusje_id',
        'starter_id',
        'owner_id',
    ];

    public function klusje(): BelongsTo
    {
        return $this->belongsTo(Klusje::class);
    }

    public function starter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'starter_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function latestMessage(): HasOne
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function priceProposals(): HasMany
    {
        return $this->hasMany(PriceProposal::class);
    }

    /**
     * @param  Builder<Conversation>  $query
     * @return Builder<Conversation>
     */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('starter_id', $user->id)
            ->orWhere('owner_id', $user->id);
    }
}
