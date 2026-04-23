<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    /** @use HasFactory<\Database\Factories\PaymentFactory> */
    use HasFactory;

    protected $fillable = [
        'klusje_id',
        'payer_id',
        'payee_id',
        'amount',
        'platform_fee',
        'currency',
        'stripe_payment_intent_id',
        'stripe_checkout_session_id',
        'status',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'platform_fee' => 'decimal:2',
            'paid_at' => 'datetime',
            'status' => PaymentStatus::class,
        ];
    }

    public function klusje(): BelongsTo
    {
        return $this->belongsTo(Klusje::class);
    }

    public function payer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'payer_id');
    }

    public function payee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'payee_id');
    }
}
