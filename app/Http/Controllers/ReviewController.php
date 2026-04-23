<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReviewRequest;
use App\Models\Klusje;
use App\Models\Review;
use App\Models\User;
use App\Notifications\ReviewReceived;
use Illuminate\Http\RedirectResponse;

class ReviewController extends Controller
{
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
