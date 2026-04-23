<?php

namespace App\Http\Controllers;

use App\Enums\KlusjeStatus;
use App\Enums\OfferStatus;
use App\Http\Requests\StoreKlusjeRequest;
use App\Http\Requests\UpdateKlusjeRequest;
use App\Models\Klusje;
use App\Notifications\KlusjeCompleted;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class KlusjeController extends Controller
{
    public function index(Request $request): Response
    {
        $klusjes = Klusje::query()
            ->with(['user', 'images'])
            ->where('status', KlusjeStatus::Open->value)
            ->when($request->string('category')->isNotEmpty(), fn ($q) => $q->where('category', $request->string('category')))
            ->when($request->string('location')->isNotEmpty(), fn ($q) => $q->where('location', 'like', '%'.$request->string('location').'%'))
            ->when($request->string('search')->isNotEmpty(), function ($q) use ($request) {
                $term = '%'.$request->string('search').'%';
                $q->where(fn ($inner) => $inner->where('title', 'like', $term)->orWhere('description', 'like', $term));
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        $categories = Klusje::query()
            ->where('status', KlusjeStatus::Open->value)
            ->select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return Inertia::render('find', [
            'klusjes' => $klusjes,
            'categories' => $categories,
            'filters' => [
                'category' => $request->string('category')->toString(),
                'location' => $request->string('location')->toString(),
                'search' => $request->string('search')->toString(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('create');
    }

    public function show(Request $request, Klusje $klusje): Response
    {
        $klusje->load(['images', 'user', 'assignedKlusser', 'reviews.fromUser']);

        $user = $request->user();
        $viewerOffer = $user
            ? $klusje->offers()->where('klusser_id', $user->id)->first(['id', 'status'])
            : null;

        $canReviewTarget = null;
        if ($user && $klusje->status === KlusjeStatus::Completed) {
            $targetId = null;
            if ($user->id === $klusje->user_id) {
                $targetId = $klusje->assigned_klusser_id;
            } elseif ($user->id === $klusje->assigned_klusser_id) {
                $targetId = $klusje->user_id;
            }

            if ($targetId) {
                $alreadyReviewed = $klusje->reviews()
                    ->where('from_user_id', $user->id)
                    ->where('to_user_id', $targetId)
                    ->exists();

                if (! $alreadyReviewed) {
                    $target = \App\Models\User::find($targetId);
                    if ($target) {
                        $canReviewTarget = ['id' => $target->id, 'name' => $target->name];
                    }
                }
            }
        }

        return Inertia::render('jobs', [
            'klusje' => $klusje,
            'viewerOffer' => $viewerOffer,
            'offerCount' => $user?->id === $klusje->user_id ? $klusje->offers()->count() : 0,
            'canReviewTarget' => $canReviewTarget,
        ]);
    }

    public function store(StoreKlusjeRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $klusje = $request->user()->klusjes()->create([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'location' => $validated['location'],
            'date' => $validated['date'],
            'compensation' => $validated['compensation'],
            'description' => $validated['description'],
            'status' => KlusjeStatus::Open,
        ]);

        $this->storeImages($request, $klusje);

        return redirect()->route('find')->with('success', 'Klusje succesvol geplaatst!');
    }

    public function edit(Klusje $klusje): Response
    {
        $this->authorize('update', $klusje);

        return Inertia::render('klusjes/edit', [
            'klusje' => $klusje->load('images'),
        ]);
    }

    public function update(UpdateKlusjeRequest $request, Klusje $klusje): RedirectResponse
    {
        $validated = $request->validated();

        $klusje->update([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'location' => $validated['location'],
            'date' => $validated['date'],
            'compensation' => $validated['compensation'],
            'description' => $validated['description'],
        ]);

        foreach ($validated['removed_image_ids'] ?? [] as $imageId) {
            $image = $klusje->images()->find($imageId);
            if ($image) {
                Storage::disk('public')->delete($image->image_path);
                $image->delete();
            }
        }

        $this->storeImages($request, $klusje);

        return redirect()
            ->route('klusjes.mine')
            ->with('success', 'Klusje bijgewerkt.');
    }

    public function destroy(Klusje $klusje): RedirectResponse
    {
        $this->authorize('delete', $klusje);

        foreach ($klusje->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $klusje->delete();

        return redirect()
            ->route('klusjes.mine')
            ->with('success', 'Klusje verwijderd.');
    }

    public function mine(Request $request): Response
    {
        $klusjes = $request->user()
            ->klusjes()
            ->with(['images', 'assignedKlusser'])
            ->latest()
            ->get();

        return Inertia::render('klusjes/mine', [
            'klusjes' => $klusjes,
        ]);
    }

    public function complete(Klusje $klusje): RedirectResponse
    {
        $this->authorize('complete', $klusje);

        $klusje->update([
            'status' => KlusjeStatus::Completed,
            'completed_at' => now(),
        ]);

        if ($klusje->assigned_klusser_id && $klusje->assignedKlusser) {
            $klusje->assignedKlusser->notify(new KlusjeCompleted($klusje));
        }

        return back()->with('success', 'Klus gemarkeerd als voltooid.');
    }

    public function cancel(Klusje $klusje): RedirectResponse
    {
        $this->authorize('cancel', $klusje);

        DB::transaction(function () use ($klusje) {
            $klusje->update([
                'status' => KlusjeStatus::Cancelled,
                'cancelled_at' => now(),
            ]);
            $klusje->offers()->pending()->update(['status' => OfferStatus::Rejected->value]);
        });

        return back()->with('success', 'Klus geannuleerd.');
    }

    private function storeImages(Request $request, Klusje $klusje): void
    {
        if (! $request->hasFile('images')) {
            return;
        }

        $hasPrimary = $klusje->images()->where('is_primary', true)->exists();

        foreach ($request->file('images') as $index => $image) {
            $path = $image->store('klusjes', 'public');

            $klusje->images()->create([
                'image_path' => $path,
                'is_primary' => ! $hasPrimary && $index === 0,
            ]);
        }
    }
}
