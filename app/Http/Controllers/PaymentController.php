<?php

namespace App\Http\Controllers;

use App\Enums\KlusjeStatus;
use App\Enums\PaymentStatus;
use App\Models\Klusje;
use App\Models\Payment;
use App\Models\PriceProposal;
use App\Services\PaymentGateway;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentGateway $gateway) {}

    public function balance(Request $request): InertiaResponse
    {
        $user = $request->user();
        $userId = $user->id;

        // Real klusje earnings (not topups, which have payer_id = payee_id).
        $totalEarned = Payment::where('payee_id', $userId)
            ->whereNotNull('klusje_id')
            ->where('status', PaymentStatus::Released->value)
            ->get(['amount', 'platform_fee'])
            ->sum(fn (Payment $p): float => (float) $p->amount - (float) $p->platform_fee);

        // Real klusje spending as opdrachtgever.
        $totalSpent = (float) Payment::where('payer_id', $userId)
            ->whereNotNull('klusje_id')
            ->whereIn('status', [PaymentStatus::Held->value, PaymentStatus::Released->value])
            ->sum('amount');

        $inEscrow = (float) Payment::where('payer_id', $userId)
            ->where('status', PaymentStatus::Held->value)
            ->sum('amount');

        $transactions = Payment::query()
            ->where(fn ($q) => $q->where('payer_id', $userId)->orWhere('payee_id', $userId))
            ->with('klusje:id,title')
            ->latest()
            ->get()
            ->map(function (Payment $p) use ($userId): array {
                $isTopup = $p->klusje_id === null && $p->payer_id === $userId && $p->payee_id === $userId;
                $isIncome = ! $isTopup && $p->payee_id === $userId;

                if ($isTopup) {
                    $role = 'topup';
                    $title = 'Balans Opwaardering';
                    $amount = (float) $p->amount;
                } elseif ($isIncome) {
                    $role = 'klusser';
                    $title = $p->klusje?->title ?? 'Klus';
                    $amount = (float) $p->amount - (float) $p->platform_fee;
                } else {
                    $role = 'vrager';
                    $title = $p->klusje?->title ?? 'Klus';
                    $amount = (float) $p->amount;
                }

                return [
                    'id' => $p->id,
                    'klusje_title' => $title,
                    'role' => $role,
                    'amount' => number_format($amount, 2, ',', '.'),
                    'is_income' => $isIncome || $isTopup,
                    'status' => $p->status->value,
                    'status_label' => $p->status->label(),
                    'date' => $p->created_at->format('d/m/Y'),
                ];
            });

        return Inertia::render('balance', [
            'total_earned' => number_format($totalEarned, 2, ',', '.'),
            'total_spent' => number_format($totalSpent, 2, ',', '.'),
            'in_escrow' => number_format($inEscrow, 2, ',', '.'),
            'transactions' => $transactions,
        ]);
    }

    // NIEUW: De Topup methode voor balans opwaarderingen
    public function topup(Request $request): InertiaResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:5',
        ]);

        Stripe::setApiKey(config('services.stripe.secret'));

        $paymentIntent = PaymentIntent::create([
            'amount' => $request->amount * 100, // Bedrag in centen
            'currency' => 'eur',
            'metadata' => [
                'type' => 'balance_topup',
                'user_id' => $request->user()->id,
            ],
        ]);

        return Inertia::render('checkout/show', [
            'clientSecret' => $paymentIntent->client_secret,
            'stripeKey' => config('services.stripe.key'),
            'isTopup' => true,
            'amount' => $request->amount,
        ]);
    }

    public function checkout(Request $request, Klusje $klusje): \Symfony\Component\HttpFoundation\Response
    {
        if ($klusje->user_id !== $request->user()->id) {
            throw new AuthorizationException('Alleen de opdrachtgever kan de escrow funden.');
        }

        if (! in_array($klusje->status, [KlusjeStatus::Assigned, KlusjeStatus::InProgress], true)) {
            throw new AuthorizationException('Escrow kan alleen worden gefund op een toegewezen klus.');
        }

        if (! $klusje->assigned_klusser_id) {
            throw new AuthorizationException('Geen klusser toegewezen aan deze klus.');
        }

        $existing = Payment::where('klusje_id', $klusje->id)
            ->whereIn('status', [PaymentStatus::Held->value, PaymentStatus::Released->value])
            ->first();

        if ($existing) {
            return redirect()->route('jobs.show', $klusje)
                ->with('info', 'Er staat al een actieve betaling voor deze klus.');
        }

        $amount = (float) $klusje->compensation;
        $feePercent = (float) config('payments.platform_fee_percent', 10);
        $platformFee = round($amount * $feePercent / 100, 2);

        $payment = Payment::create([
            'klusje_id' => $klusje->id,
            'payer_id' => $request->user()->id,
            'payee_id' => $klusje->assigned_klusser_id,
            'amount' => $amount,
            'platform_fee' => $platformFee,
            'currency' => 'eur',
            'status' => PaymentStatus::Pending,
        ]);

        $url = $this->gateway->checkout($payment);

        return Inertia::location($url);
    }

    public function fakeComplete(Request $request, Payment $payment): RedirectResponse
    {
        abort_unless(app()->environment('local', 'testing') || ! config('payments.stripe.secret'), 404);

        if ($payment->payer_id !== $request->user()?->id) {
            throw new AuthorizationException;
        }

        $this->markPaymentHeld($payment);

        return redirect()->route('jobs.show', $payment->klusje)
            ->with('success', 'Betaling ontvangen en in escrow geplaatst.');
    }

    public function webhook(Request $request): Response
    {
        $event = $this->gateway->parseWebhook(
            $request->getContent(),
            $request->header('Stripe-Signature', ''),
        );

        if (! $event) {
            return response('Invalid signature', 400);
        }

        if ($event['type'] === 'checkout.session.completed' || $event['type'] === 'payment_intent.succeeded') {
            // StripeGateway::parseWebhook returns the Stripe object directly under 'data'.
            $object = $event['data'] ?? [];
            $metadata = $object['metadata'] ?? [];

            // 1. Balans opwaardering (top-up)
            if (isset($metadata['type']) && $metadata['type'] === 'balance_topup') {
                $userId = $metadata['user_id'] ?? null;
                $intentId = $object['id'] ?? null;
                $amountInEuros = ($object['amount'] ?? 0) / 100;

                if ($userId && $intentId && $amountInEuros > 0
                    && ! Payment::where('stripe_payment_intent_id', $intentId)->exists()) {
                    Payment::create([
                        'payee_id' => $userId,
                        'payer_id' => $userId,
                        'amount' => $amountInEuros,
                        'platform_fee' => 0,
                        'currency' => 'eur',
                        'status' => PaymentStatus::Released,
                        'stripe_payment_intent_id' => $intentId,
                        'paid_at' => now(),
                        'released_at' => now(),
                    ]);

                    Log::info("Opwaardering als Payment opgeslagen voor user {$userId}: €{$amountInEuros}");
                }
            }
            // 2. Klusje escrow funding
            else {
                $intentId = $object['payment_intent'] ?? $object['id'] ?? null;
                $proposalId = $metadata['proposal_id'] ?? null;
                $paymentId = $metadata['payment_id'] ?? null;

                if ($proposalId && ($proposal = PriceProposal::find($proposalId))) {
                    $this->recordProposalEscrow($proposal, $intentId);
                } elseif ($paymentId && ($payment = Payment::find($paymentId))) {
                    $this->markPaymentHeld($payment, $intentId);
                }
            }
        }

        return response('ok');
    }

    public function release(Payment $payment): void
    {
        if ($payment->status !== PaymentStatus::Held) {
            return;
        }

        DB::transaction(function () use ($payment) {
            $transferId = $this->gateway->transfer($payment);

            $payment->update([
                'status' => PaymentStatus::Released,
                'released_at' => now(),
                'stripe_transfer_id' => $transferId,
            ]);
        });
    }

    public function refund(Payment $payment): void
    {
        if ($payment->status !== PaymentStatus::Held) {
            return;
        }

        DB::transaction(function () use ($payment) {
            $refundId = $this->gateway->refund($payment);

            $payment->update([
                'status' => PaymentStatus::Refunded,
                'refunded_at' => now(),
                'stripe_refund_id' => $refundId,
            ]);
        });
    }

    private function markPaymentHeld(Payment $payment, ?string $intentId = null): void
    {
        if ($payment->status !== PaymentStatus::Pending) {
            return;
        }

        $payment->update([
            'status' => PaymentStatus::Held,
            'held_at' => now(),
            'paid_at' => now(),
            'stripe_payment_intent_id' => $intentId ?? $payment->stripe_payment_intent_id,
        ]);
    }

    public function recordProposalEscrow(PriceProposal $proposal, ?string $intentId): void
    {
        $conversation = $proposal->conversation;
        $klusje = $conversation?->klusje;

        if ($klusje === null) {
            return;
        }

        if ($intentId && Payment::where('stripe_payment_intent_id', $intentId)->exists()) {
            return;
        }

        $alreadyFunded = $klusje->payments()
            ->whereIn('status', [PaymentStatus::Held->value, PaymentStatus::Released->value])
            ->exists();

        if ($alreadyFunded) {
            return;
        }

        $amount = (float) $proposal->amount;
        $feePercent = (float) config('payments.platform_fee_percent', 10);
        $platformFee = round($amount * $feePercent / 100, 2);

        DB::transaction(function () use ($conversation, $klusje, $amount, $platformFee, $intentId): void {
            Payment::create([
                'klusje_id' => $klusje->id,
                'payer_id' => $conversation->owner_id,
                'payee_id' => $conversation->starter_id,
                'amount' => $amount,
                'platform_fee' => $platformFee,
                'currency' => 'eur',
                'status' => PaymentStatus::Held,
                'stripe_payment_intent_id' => $intentId,
                'paid_at' => now(),
                'held_at' => now(),
            ]);

            if ($klusje->status === KlusjeStatus::Open) {
                $klusje->update([
                    'status' => KlusjeStatus::Assigned,
                    'assigned_klusser_id' => $conversation->starter_id,
                ]);
            }
        });
    }
}
