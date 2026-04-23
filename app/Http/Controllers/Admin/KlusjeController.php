<?php

namespace App\Http\Controllers\Admin;

use App\Enums\KlusjeStatus;
use App\Enums\OfferStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Controllers\PaymentController;
use App\Models\Klusje;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class KlusjeController extends Controller
{
    public function index(Request $request): Response
    {
        $klusjes = Klusje::query()
            ->with(['user:id,name', 'assignedKlusser:id,name', 'heldPayment'])
            ->when($request->string('status')->isNotEmpty(), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->string('search')->isNotEmpty(), function ($q) use ($request) {
                $term = '%'.$request->string('search').'%';
                $q->where('title', 'like', $term);
            })
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('admin/klusjes/index', [
            'klusjes' => $klusjes,
            'filters' => [
                'status' => $request->string('status')->toString(),
                'search' => $request->string('search')->toString(),
            ],
            'statuses' => array_map(fn ($c) => ['value' => $c->value, 'label' => $c->label()], KlusjeStatus::cases()),
        ]);
    }

    public function show(Klusje $klusje): Response
    {
        $klusje->load([
            'user:id,name,email',
            'assignedKlusser:id,name,email',
            'images',
            'offers.klusser:id,name',
            'reviews.fromUser:id,name',
            'payments',
        ]);

        return Inertia::render('admin/klusjes/show', [
            'klusje' => $klusje,
        ]);
    }

    public function cancel(Klusje $klusje, PaymentController $payments): RedirectResponse
    {
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
}
