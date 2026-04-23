<?php

namespace App\Services;

use App\Models\Payment;

/**
 * Abstraction over the payment provider (Stripe).
 *
 * Two drivers are available:
 *   - StripeGateway — real Stripe Checkout + Connect transfers.
 *     Requires `composer require stripe/stripe-php` and valid keys in
 *     config/payments.php.
 *   - FakeGateway — returns a deterministic success URL, used in tests and
 *     before Stripe is configured. Writes the payment_intent_id locally so
 *     downstream code continues to work.
 *
 * The binding lives in App\Providers\AppServiceProvider::register().
 */
interface PaymentGateway
{
    /**
     * Create a checkout session for the given pending payment.
     *
     * @return string URL to redirect the payer to.
     */
    public function checkout(Payment $payment): string;

    /**
     * Verify and parse a webhook payload. Returns an event-shape array
     * (`['type' => ..., 'data' => [...]]`) or null on signature failure.
     *
     * @return array{type: string, data: array<string, mixed>}|null
     */
    public function parseWebhook(string $payload, string $signature): ?array;
}
