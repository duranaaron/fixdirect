<?php

namespace App\Http\Controllers;

use App\Enums\WithdrawalStatus;
use App\Http\Requests\StoreWithdrawalRequest;
use App\Models\Withdrawal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WithdrawalController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $withdrawals = $user->withdrawals()
            ->latest()
            ->get()
            ->map(fn (Withdrawal $w): array => [
                'id' => $w->id,
                'amount' => number_format((float) $w->amount, 2, ',', '.'),
                'iban' => $w->iban,
                'account_holder' => $w->account_holder,
                'status' => $w->status->value,
                'status_label' => $w->status->label(),
                'admin_note' => $w->admin_note,
                'created_at' => $w->created_at->format('d/m/Y H:i'),
                'processed_at' => $w->processed_at?->format('d/m/Y H:i'),
            ]);

        return Inertia::render('withdrawals/index', [
            'withdrawals' => $withdrawals,
            'available_balance' => number_format($user->availableBalance(), 2, ',', '.'),
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('withdrawals/create', [
            'available_balance' => number_format($user->availableBalance(), 2, ',', '.'),
            'available_balance_raw' => $user->availableBalance(),
        ]);
    }

    public function store(StoreWithdrawalRequest $request): RedirectResponse
    {
        $request->user()->withdrawals()->create([
            'amount' => $request->validated('amount'),
            'iban' => $request->validated('iban'),
            'account_holder' => $request->validated('account_holder'),
            'status' => WithdrawalStatus::Pending,
        ]);

        return redirect()
            ->route('withdrawals.index')
            ->with('success', 'Uitbetalingsverzoek aangemaakt. Je wordt op de hoogte gehouden.');
    }
}
