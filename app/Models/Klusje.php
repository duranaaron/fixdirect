<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'compensation' => 'decimal:2',
        ];
    }

    public function images()
    {
        return $this->hasMany(KlusjeImage::class)->orderBy('is_primary', 'desc');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }
}
