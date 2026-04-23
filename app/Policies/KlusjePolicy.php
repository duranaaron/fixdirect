<?php

namespace App\Policies;

use App\Enums\KlusjeStatus;
use App\Models\Klusje;
use App\Models\User;

class KlusjePolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Klusje $klusje): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Klusje $klusje): bool
    {
        return $user->id === $klusje->user_id
            && $klusje->status instanceof KlusjeStatus
            && $klusje->status->isEditable();
    }

    public function delete(User $user, Klusje $klusje): bool
    {
        return $user->id === $klusje->user_id
            && $klusje->status instanceof KlusjeStatus
            && $klusje->status->isEditable();
    }

    public function assign(User $user, Klusje $klusje): bool
    {
        return $user->id === $klusje->user_id
            && $klusje->status === KlusjeStatus::Open;
    }

    public function complete(User $user, Klusje $klusje): bool
    {
        return $user->id === $klusje->user_id
            && in_array($klusje->status, [KlusjeStatus::Assigned, KlusjeStatus::InProgress], true);
    }

    public function cancel(User $user, Klusje $klusje): bool
    {
        return $user->id === $klusje->user_id
            && $klusje->status instanceof KlusjeStatus
            && $klusje->status->isActive();
    }

    public function apply(User $user, Klusje $klusje): bool
    {
        return $user->id !== $klusje->user_id
            && $klusje->status === KlusjeStatus::Open;
    }
}
