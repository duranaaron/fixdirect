<?php

namespace App\Policies;

use App\Enums\OfferStatus;
use App\Models\Offer;
use App\Models\User;

class OfferPolicy
{
    public function view(User $user, Offer $offer): bool
    {
        return $user->id === $offer->klusser_id
            || $user->id === $offer->klusje->user_id;
    }

    public function accept(User $user, Offer $offer): bool
    {
        return $user->id === $offer->klusje->user_id
            && $offer->status === OfferStatus::Pending;
    }

    public function reject(User $user, Offer $offer): bool
    {
        return $user->id === $offer->klusje->user_id
            && $offer->status === OfferStatus::Pending;
    }

    public function withdraw(User $user, Offer $offer): bool
    {
        return $user->id === $offer->klusser_id
            && in_array($offer->status, [OfferStatus::Pending, OfferStatus::CounterOffered]);
    }

    public function counterOffer(User $user, Offer $offer): bool
    {
        return $user->id === $offer->klusje->user_id
            && $offer->status === OfferStatus::Pending;
    }

    public function acceptCounter(User $user, Offer $offer): bool
    {
        return $user->id === $offer->klusser_id
            && $offer->status === OfferStatus::CounterOffered;
    }
}
