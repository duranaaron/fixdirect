<?php

namespace App\Services;

use App\Models\Payment;
use RuntimeException;

/**
 * Real Stripe integration. Activates when stripe/stripe-php is installed
 * AND config('payments.stripe.secret') is set.
 *
 * Uses Stripe Checkout for the payer-facing flow and Stripe Connect
 * transfers for klusser payouts (requires `connect_enabled=true` and
 * a connected Express account on each payee).
 */
class StripeGateway implements PaymentGateway
{
    public function checkout(Payment $payment): string
    {
        if (! class_exists(\Stripe\StripeClient::class)) {
            throw new RuntimeException(
                'stripe/stripe-php is not installed. Run: composer require stripe/stripe-php',
            );
        }

        $stripe = new \Stripe\StripeClient(config('payments.stripe.secret'));

        $amountInCents = (int) round((float) $payment->amount * 100);
        $feeInCents = (int) round((float) $payment->platform_fee * 100);

        $params = [
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
            'metadata' => [
                'payment_id' => $payment->id,
                'klusje_id' => $payment->klusje_id,
            ],
        ];

        if (config('payments.stripe.connect_enabled') && $payment->payee->stripe_account_id) {
            $params['payment_intent_data'] = [
                'application_fee_amount' => $feeInCents,
                'transfer_data' => [
                    'destination' => $payment->payee->stripe_account_id,
                ],
            ];
        }

        $session = $stripe->checkout->sessions->create($params);

        $payment->update([
            'stripe_checkout_session_id' => $session->id,
            'stripe_payment_intent_id' => $session->payment_intent,
        ]);

        return $session->url;
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
}
