<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    /** @use HasFactory<\Database\Factories\ReviewFactory> */
    use HasFactory;

    protected $fillable = [
        'klusje_id',
        'from_user_id',
        'to_user_id',
        'rating',
        'comment',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::saved(fn (Review $review) => self::recalculateUserRating($review->to_user_id));
        static::deleted(fn (Review $review) => self::recalculateUserRating($review->to_user_id));
    }

    private static function recalculateUserRating(int $userId): void
    {
        $stats = static::query()
            ->where('to_user_id', $userId)
            ->selectRaw('AVG(rating) as avg, COUNT(*) as cnt')
            ->first();

        User::whereKey($userId)->update([
            'rating_avg' => $stats?->avg !== null ? round((float) $stats->avg, 2) : null,
            'rating_count' => (int) ($stats?->cnt ?? 0),
        ]);
    }

    public function klusje(): BelongsTo
    {
        return $this->belongsTo(Klusje::class);
    }

    public function fromUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function toUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }
}
