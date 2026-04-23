<?php

namespace App\Http\Controllers;

use App\Enums\KlusjeStatus;
use App\Enums\PaymentStatus;
use App\Models\Klusje;
use App\Models\Payment;
use App\Services\PaymentGateway;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirect;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentGateway $gateway) {}

    public function checkout(Request $request, Klusje $klusje): SymfonyRedirect
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

        return redirect()->away($url);
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
            $paymentId = $event['data']['metadata']['payment_id'] ?? null;
            if ($paymentId && ($payment = Payment::find($paymentId))) {
                $this->markPaymentHeld($payment, $event['data']['payment_intent'] ?? null);
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
}
