<?php

namespace App\Http\Controllers;

use App\Models\Klusje;
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

        $jobs = $ownedKlusjes->map(fn (Klusje $klusje): array => [
            'id' => $klusje->id,
            'title' => $klusje->title,
            'date' => $klusje->date->format('Y-m-d'),
            'status' => $klusje->status->label(),
            'price' => '€'.number_format((float) $klusje->compensation, 2, ',', '.'),
            'rol' => 'vrager',
        ])->values();

        return Inertia::render('dashboard', [
            'klusjes' => $jobs,
            'stats' => [
                'doenerCount' => 0,
                'vragerCount' => $ownedKlusjes->count(),
                'saldoMaand' => '€0,00',
            ],
        ]);
    }
}
