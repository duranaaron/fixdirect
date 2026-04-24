<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Models\Klusje;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $ownedKlusjes = Klusje::query()
            ->where('user_id', $user->id)
            ->orderBy('date')
            ->get();

        $assignedKlusjes = Klusje::query()
            ->where('assigned_klusser_id', $user->id)
            ->orderBy('date')
            ->get();

        $vragerJobs = $ownedKlusjes->map(fn (Klusje $klusje): array => [
            'id' => $klusje->id,
            'title' => $klusje->title,
            'date' => $klusje->date->format('Y-m-d'),
            'status' => $klusje->status->label(),
            'price' => '€'.number_format((float) $klusje->compensation, 2, ',', '.'),
            'rol' => 'vrager',
        ])->toBase();

        $doenerJobs = $assignedKlusjes->map(fn (Klusje $klusje): array => [
            'id' => $klusje->id,
            'title' => $klusje->title,
            'date' => $klusje->date->format('Y-m-d'),
            'status' => $klusje->status->label(),
            'price' => '€'.number_format((float) $klusje->compensation, 2, ',', '.'),
            'rol' => 'doener',
        ])->toBase();

        $saldoMaand = Payment::where('payee_id', $user->id)
            ->where('status', PaymentStatus::Released->value)
            ->whereYear('released_at', now()->year)
            ->whereMonth('released_at', now()->month)
            ->get(['amount', 'platform_fee'])
            ->sum(fn (Payment $p): float => (float) $p->amount - (float) $p->platform_fee);

        return Inertia::render('dashboard', [
            'klusjes' => $vragerJobs->merge($doenerJobs)->sortBy('date')->values(),
            'stats' => [
                'doenerCount' => $assignedKlusjes->count(),
                'vragerCount' => $ownedKlusjes->count(),
                'saldoMaand' => '€'.number_format($saldoMaand, 2, ',', '.'),
            ],
        ]);
    }
}
