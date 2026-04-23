<?php

namespace App\Models;

use App\Enums\KlusjeStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Klusje extends Model
{
    /** @use HasFactory<\Database\Factories\KlusjeFactory> */
    use HasFactory;

    protected $table = 'klusjes';

    protected $fillable = [
        'title',
        'category',
        'location',
        'date',
        'compensation',
        'description',
        'status',
        'assigned_klusser_id',
        'completed_at',
        'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'compensation' => 'decimal:2',
            'status' => KlusjeStatus::class,
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function images(): HasMany
    {
        return $this->hasMany(KlusjeImage::class)->orderBy('is_primary', 'desc');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedKlusser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_klusser_id');
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class);
    }

    public function acceptedOffer(): HasOne
    {
        return $this->hasOne(Offer::class)->where('status', 'accepted');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
