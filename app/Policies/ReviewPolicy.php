<?php

namespace App\Policies;

use App\Enums\KlusjeStatus;
use App\Models\Klusje;
use App\Models\Review;
use App\Models\User;

class ReviewPolicy
{
    public function create(User $user, Klusje $klusje, User $target): bool
    {
        if ($klusje->status !== KlusjeStatus::Completed) {
            return false;
        }

        $participants = array_filter([
            $klusje->user_id,
            $klusje->assigned_klusser_id,
        ]);

        if (! in_array($user->id, $participants, true)) {
            return false;
        }

        if (! in_array($target->id, $participants, true)) {
            return false;
        }

        if ($user->id === $target->id) {
            return false;
        }

        return ! Review::query()
            ->where('klusje_id', $klusje->id)
            ->where('from_user_id', $user->id)
            ->where('to_user_id', $target->id)
            ->exists();
    }
}
