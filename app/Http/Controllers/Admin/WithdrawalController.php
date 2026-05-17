<?php

namespace App\Http\Controllers\Admin;

use App\Enums\WithdrawalStatus;
use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class WithdrawalController extends Controller
{
    public function index(Request $request): Response
    {
        $withdrawals = Withdrawal::query()
            ->with(['user:id,name,email', 'processedBy:id,name'])
            ->when($request->string('status')->isNotEmpty(), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->string('search')->isNotEmpty(), function ($q) use ($request) {
                $term = '%'.$request->string('search').'%';
                $q->whereHas('user', fn ($u) => $u->where('name', 'like', $term)->orWhere('email', 'like', $term));
            })
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('admin/withdrawals/index', [
            'withdrawals' => $withdrawals,
            'filters' => [
                'status' => $request->string('status')->toString(),
                'search' => $request->string('search')->toString(),
            ],
            'statuses' => array_map(
                fn (WithdrawalStatus $c): array => ['value' => $c->value, 'label' => $c->label()],
                WithdrawalStatus::cases(),
            ),
        ]);
    }

    public function show(Withdrawal $withdrawal): Response
    {
        $withdrawal->load(['user:id,name,email', 'processedBy:id,name']);

        return Inertia::render('admin/withdrawals/show', [
            'withdrawal' => [
                'id' => $withdrawal->id,
                'amount' => number_format((float) $withdrawal->amount, 2, ',', '.'),
                'iban' => $withdrawal->iban,
                'account_holder' => $withdrawal->account_holder,
                'status' => $withdrawal->status->value,
                'status_label' => $withdrawal->status->label(),
                'admin_note' => $withdrawal->admin_note,
                'created_at' => $withdrawal->created_at->format('d/m/Y H:i'),
                'processed_at' => $withdrawal->processed_at?->format('d/m/Y H:i'),
                'user' => $withdrawal->user,
                'processed_by' => $withdrawal->processedBy,
                'available_balance' => number_format($withdrawal->user->availableBalance(), 2, ',', '.'),
            ],
            'statuses' => array_map(
                fn (WithdrawalStatus $c): array => ['value' => $c->value, 'label' => $c->label()],
                WithdrawalStatus::cases(),
            ),
        ]);
    }

    public function updateStatus(Request $request, Withdrawal $withdrawal): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(WithdrawalStatus::class)],
            'admin_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $status = WithdrawalStatus::from($validated['status']);

        $withdrawal->update([
            'status' => $status,
            'admin_note' => $validated['admin_note'] ?? $withdrawal->admin_note,
            'processed_by' => $request->user()->id,
            'processed_at' => $status->isFinal() ? now() : $withdrawal->processed_at,
        ]);

        return back()->with('success', 'Status bijgewerkt naar '.$status->label().'.');
    }
}
