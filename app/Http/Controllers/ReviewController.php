<?php

namespace App\Http\Controllers;

use App\Enums\KlusjeStatus;
use App\Http\Requests\StoreReviewRequest;
use App\Models\Klusje;
use App\Models\Review;
use App\Models\User;
use App\Notifications\ReviewReceived;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function myReviews(Request $request): Response
    {
        $user = $request->user();

        $reviewsReceived = Review::query()
            ->where('to_user_id', $user->id)
            ->with(['fromUser:id,name,profile_photo_path', 'klusje:id,title'])
            ->latest()
            ->get();

        $reviewsGiven = Review::query()
            ->where('from_user_id', $user->id)
            ->with(['toUser:id,name,profile_photo_path', 'klusje:id,title'])
            ->latest()
            ->get();

        $pendingAsPoster = $user->klusjes()
            ->where('status', KlusjeStatus::Completed->value)
            ->whereNotNull('assigned_klusser_id')
            ->whereDoesntHave('reviews', fn ($q) => $q->where('from_user_id', $user->id))
            ->with('assignedKlusser:id,name,profile_photo_path')
            ->get(['id', 'title', 'assigned_klusser_id']);

        $pendingAsKlusser = $user->assignedKlusjes()
            ->where('status', KlusjeStatus::Completed->value)
            ->whereDoesntHave('reviews', fn ($q) => $q->where('from_user_id', $user->id))
            ->with('user:id,name,profile_photo_path')
            ->get(['id', 'title', 'user_id']);

        return Inertia::render('profile/reviews', [
            'reviews_received' => $reviewsReceived,
            'reviews_given' => $reviewsGiven,
            'pending_as_poster' => $pendingAsPoster,
            'pending_as_klusser' => $pendingAsKlusser,
            'rating_avg' => $user->rating_avg,
            'rating_count' => $user->rating_count,
        ]);
    }

    public function store(StoreReviewRequest $request, Klusje $klusje): RedirectResponse
    {
        $target = User::findOrFail($request->integer('to_user_id'));

        $this->authorize('create', [Review::class, $klusje, $target]);

        $review = Review::create([
            'klusje_id' => $klusje->id,
            'from_user_id' => $request->user()->id,
            'to_user_id' => $target->id,
            'rating' => $request->integer('rating'),
            'comment' => $request->input('comment'),
        ]);

        $target->notify(new ReviewReceived($review));

        return back()->with('success', 'Bedankt voor je review.');
    }
}
