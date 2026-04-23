<?php

namespace App\Http\Controllers;

use App\Enums\KlusjeStatus;
use App\Models\Review;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class UserProfileController extends Controller
{
    public function show(User $user): Response
    {
        $completedAsKlusser = $user->assignedKlusjes()
            ->where('status', KlusjeStatus::Completed->value)
            ->count();

        $postedByUser = $user->klusjes()->count();

        $reviews = Review::query()
            ->where('to_user_id', $user->id)
            ->with(['fromUser:id,name,profile_photo_path', 'klusje:id,title'])
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('users/show', [
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'bio' => $user->bio,
                'location' => $user->location,
                'profile_photo_path' => $user->profile_photo_path,
                'rating_avg' => $user->rating_avg,
                'rating_count' => $user->rating_count,
                'completed_as_klusser' => $completedAsKlusser,
                'posted_count' => $postedByUser,
                'member_since' => $user->created_at->format('Y'),
            ],
            'reviews' => $reviews,
        ]);
    }
}
