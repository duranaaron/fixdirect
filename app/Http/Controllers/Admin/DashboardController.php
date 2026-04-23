<?php

namespace App\Http\Controllers\Admin;

use App\Enums\KlusjeStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Klusje;
use App\Models\Payment;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'userCount' => User::count(),
                'suspendedCount' => User::whereNotNull('suspended_at')->count(),
                'activeKlusjeCount' => Klusje::whereIn('status', [
                    KlusjeStatus::Open->value,
                    KlusjeStatus::Assigned->value,
                    KlusjeStatus::InProgress->value,
                ])->count(),
                'completedThisMonth' => Klusje::where('status', KlusjeStatus::Completed->value)
                    ->where('completed_at', '>=', $startOfMonth)
                    ->count(),
                'escrowHeldTotal' => (float) Payment::where('status', PaymentStatus::Held->value)->sum('amount'),
                'platformFeeThisMonth' => (float) Payment::where('status', PaymentStatus::Released->value)
                    ->where('released_at', '>=', $startOfMonth)
                    ->sum('platform_fee'),
            ],
        ]);
    }
}
