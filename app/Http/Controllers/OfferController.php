<?php

namespace App\Http\Controllers;

use App\Enums\KlusjeStatus;
use App\Enums\OfferStatus;
use App\Http\Requests\StoreOfferRequest;
use App\Models\Klusje;
use App\Models\Offer;
use App\Notifications\NewOfferReceived;
use App\Notifications\OfferAccepted;
use App\Notifications\OfferRejected;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OfferController extends Controller
{
    public function store(StoreOfferRequest $request): RedirectResponse
    {
        $klusje = Klusje::findOrFail($request->integer('klusje_id'));

        $this->authorize('apply', $klusje);

        if (Offer::where('klusje_id', $klusje->id)->where('klusser_id', $request->user()->id)->exists()) {
            return back()->with('error', 'Je hebt al een bod uitgebracht op dit klusje.');
        }

        $offer = Offer::create([
            'klusje_id' => $klusje->id,
            'klusser_id' => $request->user()->id,
            'message' => $request->input('message'),
            'proposed_compensation' => $request->input('proposed_compensation'),
            'status' => OfferStatus::Pending,
        ]);

        $klusje->user->notify(new NewOfferReceived($offer));

        return back()->with('success', 'Je aanmelding is verzonden.');
    }

    public function accept(Offer $offer): RedirectResponse
    {
        $this->authorize('accept', $offer);

        $rejectedSiblings = collect();

        DB::transaction(function () use ($offer, &$rejectedSiblings) {
            $offer->update(['status' => OfferStatus::Accepted]);

            $offer->klusje->update([
                'status' => KlusjeStatus::Assigned,
                'assigned_klusser_id' => $offer->klusser_id,
            ]);

            $rejectedSiblings = Offer::where('klusje_id', $offer->klusje_id)
                ->where('id', '!=', $offer->id)
                ->where('status', OfferStatus::Pending->value)
                ->with('klusser')
                ->get();

            Offer::whereIn('id', $rejectedSiblings->pluck('id'))
                ->update(['status' => OfferStatus::Rejected->value]);
        });

        $offer->klusser->notify(new OfferAccepted($offer));
        foreach ($rejectedSiblings as $sibling) {
            $sibling->klusser->notify(new OfferRejected($sibling));
        }

        return back()->with('success', 'Aanmelding geaccepteerd. De klus is toegewezen.');
    }

    public function reject(Offer $offer): RedirectResponse
    {
        $this->authorize('reject', $offer);

        $offer->update(['status' => OfferStatus::Rejected]);
        $offer->klusser->notify(new OfferRejected($offer));

        return back()->with('success', 'Aanmelding afgewezen.');
    }

    public function withdraw(Offer $offer): RedirectResponse
    {
        $this->authorize('withdraw', $offer);

        $offer->update(['status' => OfferStatus::Withdrawn]);

        return back()->with('success', 'Aanmelding ingetrokken.');
    }

    public function mine(Request $request): Response
    {
        $offers = Offer::query()
            ->where('klusser_id', $request->user()->id)
            ->with(['klusje.user', 'klusje.images'])
            ->latest()
            ->get();

        return Inertia::render('offers/mine', [
            'offers' => $offers,
        ]);
    }

    public function forKlusje(Klusje $klusje): Response
    {
        if ($klusje->user_id !== auth()->id()) {
            throw new AuthorizationException('Je kunt alleen biedingen op je eigen klusjes bekijken.');
        }

        $offers = $klusje->offers()
            ->with('klusser')
            ->latest()
            ->get();

        return Inertia::render('klusjes/offers', [
            'klusje' => $klusje->load('user'),
            'offers' => $offers,
        ]);
    }
}
