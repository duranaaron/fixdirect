<?php

namespace App\Services;

use App\Models\Payment;
use RuntimeException;

/**
 * Real Stripe integration. Activates when stripe/stripe-php is installed
 * AND config('payments.stripe.secret') is set.
 *
 * Uses the "Separate Charges and Transfers" pattern so the platform holds
 * funds in escrow: checkout charges the platform account, transfer() moves
 * the net payout to the connected klusser later.
 */
class StripeGateway implements PaymentGateway
{
    public function checkout(Payment $payment): string
    {
        $stripe = $this->stripe();

        $amountInCents = (int) round((float) $payment->amount * 100);

        $session = $stripe->checkout->sessions->create([
            'mode' => 'payment',
            'payment_method_types' => ['card', 'bancontact', 'ideal'],
            'line_items' => [[
                'price_data' => [
                    'currency' => $payment->currency,
                    'unit_amount' => $amountInCents,
                    'product_data' => [
                        'name' => "Klus: {$payment->klusje->title}",
                    ],
                ],
                'quantity' => 1,
            ]],
            'success_url' => url("/jobs/{$payment->klusje_id}?payment=success"),
            'cancel_url' => url("/jobs/{$payment->klusje_id}?payment=cancel"),
            'payment_intent_data' => [
                'transfer_group' => "klusje_{$payment->klusje_id}",
            ],
            'metadata' => [
                'payment_id' => $payment->id,
                'klusje_id' => $payment->klusje_id,
            ],
        ]);

        $payment->update([
            'stripe_checkout_session_id' => $session->id,
            'stripe_payment_intent_id' => $session->payment_intent,
        ]);

        return $session->url;
    }

    public function transfer(Payment $payment): ?string
    {
        $stripe = $this->stripe();

        $payee = $payment->payee;
        if (! $payee->stripe_account_id) {
            throw new RuntimeException('Klusser has no connected Stripe account; cannot release escrow.');
        }

        $netCents = (int) round($payment->net_payout * 100);

        $transfer = $stripe->transfers->create([
            'amount' => $netCents,
            'currency' => $payment->currency,
            'destination' => $payee->stripe_account_id,
            'transfer_group' => "klusje_{$payment->klusje_id}",
            'metadata' => [
                'payment_id' => $payment->id,
                'klusje_id' => $payment->klusje_id,
            ],
        ]);

        return $transfer->id;
    }

    public function refund(Payment $payment): ?string
    {
        $stripe = $this->stripe();

        if (! $payment->stripe_payment_intent_id) {
            throw new RuntimeException('No payment intent recorded; cannot refund.');
        }

        $refund = $stripe->refunds->create([
            'payment_intent' => $payment->stripe_payment_intent_id,
            'metadata' => [
                'payment_id' => $payment->id,
                'klusje_id' => $payment->klusje_id,
            ],
        ]);

        return $refund->id;
    }

    public function parseWebhook(string $payload, string $signature): ?array
    {
        if (! class_exists(\Stripe\Webhook::class)) {
            return null;
        }

        $secret = config('payments.stripe.webhook_secret');
        if (! $secret) {
            return null;
        }

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $signature, $secret);
        } catch (\Throwable) {
            return null;
        }

        return [
            'type' => $event->type,
            'data' => $event->data->object->toArray(),
        ];
    }

    private function stripe(): \Stripe\StripeClient
    {
        if (! class_exists(\Stripe\StripeClient::class)) {
            throw new RuntimeException(
                'stripe/stripe-php is not installed. Run: composer require stripe/stripe-php',
            );
        }

        return new \Stripe\StripeClient(config('payments.stripe.secret'));
    }
}
