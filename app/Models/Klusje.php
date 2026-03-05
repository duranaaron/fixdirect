<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Klusje extends Model
{
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
