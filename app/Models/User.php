<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\PaymentStatus;
use App\Enums\WithdrawalStatus;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'profile_photo_path',
        'bio',
        'location',
        'phone',
        'is_admin',
        'suspended_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'rating_avg' => 'decimal:2',
            'rating_count' => 'integer',
            'last_seen_at' => 'datetime',
            'is_admin' => 'boolean',
            'suspended_at' => 'datetime',
        ];
    }

    public function isSuspended(): bool
    {
        return $this->suspended_at !== null;
    }

    public function klusjes(): HasMany
    {
        return $this->hasMany(Klusje::class);
    }

    public function assignedKlusjes(): HasMany
    {
        return $this->hasMany(Klusje::class, 'assigned_klusser_id');
    }

    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class, 'klusser_id');
    }

    public function reviewsGiven(): HasMany
    {
        return $this->hasMany(Review::class, 'from_user_id');
    }

    public function reviewsReceived(): HasMany
    {
        return $this->hasMany(Review::class, 'to_user_id');
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'starter_id');
    }

    public function withdrawals(): HasMany
    {
        return $this->hasMany(Withdrawal::class);
    }

    /**
     * Available balance for withdrawal: klusje earnings + topups - klusje spending
     * - any pending/approved/paid withdrawal requests not yet rejected.
     */
    public function availableBalance(): float
    {
        $earnedFromKlusjes = Payment::where('payee_id', $this->id)
            ->whereNotNull('klusje_id')
            ->where('status', PaymentStatus::Released->value)
            ->get(['amount', 'platform_fee'])
            ->sum(fn (Payment $p): float => (float) $p->amount - (float) $p->platform_fee);

        $topups = (float) Payment::where('payer_id', $this->id)
            ->where('payee_id', $this->id)
            ->whereNull('klusje_id')
            ->where('status', PaymentStatus::Released->value)
            ->sum('amount');

        $spentOnKlusjes = (float) Payment::where('payer_id', $this->id)
            ->whereNotNull('klusje_id')
            ->whereIn('status', [PaymentStatus::Held->value, PaymentStatus::Released->value])
            ->sum('amount');

        $reservedForWithdrawal = (float) $this->withdrawals()
            ->whereIn('status', [
                WithdrawalStatus::Pending->value,
                WithdrawalStatus::Approved->value,
                WithdrawalStatus::Paid->value,
            ])
            ->sum('amount');

        return round($earnedFromKlusjes + $topups - $spentOnKlusjes - $reservedForWithdrawal, 2);
    }
}
