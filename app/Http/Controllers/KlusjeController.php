<?php

namespace App\Http\Controllers;

use App\Enums\KlusjeStatus;
use App\Enums\OfferStatus;
use App\Enums\PaymentStatus;
use App\Http\Requests\StoreKlusjeRequest;
use App\Http\Requests\UpdateKlusjeRequest;
use App\Models\Klusje;
use App\Models\Payment;
use App\Models\Review;
use App\Notifications\KlusjeCompleted;
use Illuminate\Auth\Access\AuthorizationException;
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
        $klusje->load(['images', 'user', 'assignedKlusser', 'reviews.fromUser', 'heldPayment']);

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
        $user = $request->user();

        // VEILIGHEIDSCHECK: Heeft de gebruiker genoeg saldo voor dit nieuwe klusje?
        $currentBalance = $this->getAvailableBalance($user);
        if ($currentBalance < (float) $validated['compensation']) {
            return back()->withErrors([
                'compensation' => 'Je balans (€' . number_format($currentBalance, 2, ',', '.') . ') is te laag om dit klusje te plaatsen. Waardeer eerst je saldo op.'
            ])->withInput();
        }

        $klusje = $user->klusjes()->create([
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
        $user = $request->user();

        // VEILIGHEIDSCHECK: Heeft de gebruiker genoeg saldo als hij de prijs verhoogt?
        $currentBalance = $this->getAvailableBalance($user);
        if ($currentBalance < (float) $validated['compensation']) {
            return back()->withErrors([
                'compensation' => 'Je balans (€' . number_format($currentBalance, 2, ',', '.') . ') is te laag om deze vergoeding te bieden. Waardeer eerst je saldo op.'
            ])->withInput();
        }

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

    public function destroy(Klusje $klusje, PaymentController $payments): RedirectResponse
    {
        $this->authorize('delete', $klusje);

        DB::transaction(function () use ($klusje, $payments) {
            $held = $klusje->payments()->where('status', PaymentStatus::Held->value)->first();
            if ($held) {
                $payments->refund($held);
            }

            foreach ($klusje->images as $image) {
                Storage::disk('public')->delete($image->image_path);
            }

            $klusje->delete();
        });

        return redirect()
            ->route('klusjes.mine')
            ->with('success', 'Klusje verwijderd.');
    }

    public function mine(Request $request): Response
    {
        $user = $request->user();

        $klusjes = $user->klusjes()
            ->with(['images', 'assignedKlusser', 'heldPayment'])
            ->latest()
            ->get();

        $reviewedIds = Review::where('from_user_id', $user->id)->pluck('klusje_id')->toArray();

        return Inertia::render('klusjes/mine', [
            'klusjes' => $klusjes->map(function (Klusje $k) use ($reviewedIds): array {
                $data = $k->toArray();
                $canReview = $k->status === KlusjeStatus::Completed
                    && $k->assigned_klusser_id !== null
                    && ! in_array($k->id, $reviewedIds);
                $data['review_target'] = $canReview && $k->assignedKlusser
                    ? ['id' => $k->assignedKlusser->id, 'name' => $k->assignedKlusser->name]
                    : null;

                return $data;
            }),
        ]);
    }

    public function complete(Klusje $klusje, PaymentController $payments): RedirectResponse
    {
        $this->authorize('complete', $klusje);

        $held = $klusje->payments()->where('status', PaymentStatus::Held->value)->first();
        if (! $held) {
            throw new AuthorizationException('Je kunt pas voltooien nadat de escrow is gefund.');
        }

        DB::transaction(function () use ($klusje, $held, $payments) {
            $payments->release($held);

            $klusje->update([
                'status' => KlusjeStatus::Completed,
                'completed_at' => now(),
            ]);
        });

        if ($klusje->assigned_klusser_id && $klusje->assignedKlusser) {
            $klusje->assignedKlusser->notify(new KlusjeCompleted($klusje));
        }

        return back()->with('success', 'Klus voltooid en uitbetaling vrijgegeven.');
    }

    public function cancel(Klusje $klusje, PaymentController $payments): RedirectResponse
    {
        $this->authorize('cancel', $klusje);

        DB::transaction(function () use ($klusje, $payments) {
            $held = $klusje->payments()->where('status', PaymentStatus::Held->value)->first();
            if ($held) {
                $payments->refund($held);
            }

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

    /**
     * Helper functie om de huidige balans van de gebruiker te berekenen.
     */
    private function getAvailableBalance($user): float
    {
        return (float) Payment::where('payee_id', $user->id)
            ->where('status', PaymentStatus::Released->value)
            ->selectRaw('COALESCE(SUM(amount - platform_fee), 0) as net')
            ->value('net');
    }
}