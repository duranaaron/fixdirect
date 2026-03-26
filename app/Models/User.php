<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
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
        ];
    }

    public function klusjes(): HasMany
    {
        return $this->hasMany(Klusje::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'starter_id');
    }

    // Voeg dit toe in je User class:

// Reviews die deze gebruiker heeft gekregen
    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'reviewee_id');
    }

// Reviews die deze gebruiker heeft geschreven
    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

// Een handige helper om het gemiddelde op te halen
    public function getAverageRatingAttribute()
    {
        return $this->reviewsReceived()->avg('rating') ?? 0;
    }
}
