<?php

namespace App\Services;

use App\Models\Payment;

/**
 * Abstraction over the payment provider (Stripe).
 *
 * Two drivers are available:
 *   - StripeGateway — real Stripe Checkout + Separate Charges and Transfers.
 *     Requires `composer require stripe/stripe-php` and valid keys in
 *     config/payments.php.
 *   - FakeGateway — returns a deterministic success URL, used in tests and
 *     before Stripe is configured.
 *
 * The binding lives in App\Providers\AppServiceProvider::register().
 */
interface PaymentGateway
{
    /**
     * Create a checkout session for the given pending payment. The charge
     * lands on the platform account — funds are in escrow until released.
     *
     * @return string URL to redirect the payer to.
     */
    public function checkout(Payment $payment): string;

    /**
     * Transfer the payee's net payout (amount - platform fee) from the
     * platform balance to the klusser's connected account.
     *
     * @return string|null stripe_transfer_id, or null if the gateway is
     *                     a no-op fake.
     */
    public function transfer(Payment $payment): ?string;

    /**
     * Refund the full payment back to the payer.
     *
     * @return string|null stripe_refund_id, or null if the gateway is
     *                     a no-op fake.
     */
    public function refund(Payment $payment): ?string;

    /**
     * Verify and parse a webhook payload. Returns an event-shape array
     * (`['type' => ..., 'data' => [...]]`) or null on signature failure.
     *
     * @return array{type: string, data: array<string, mixed>}|null
     */
    public function parseWebhook(string $payload, string $signature): ?array;
}
