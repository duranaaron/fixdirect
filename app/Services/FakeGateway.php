<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Support\Str;

/**
 * Fake gateway used in tests and before Stripe is wired.
 * The "checkout URL" leads to a local stub endpoint that immediately
 * marks the payment as succeeded when visited by the payer.
 */
class FakeGateway implements PaymentGateway
{
    public function checkout(Payment $payment): string
    {
        $payment->update([
            'stripe_checkout_session_id' => 'fake_session_'.Str::random(24),
        ]);

        return route('payments.fake-complete', ['payment' => $payment->id]);
    }

    public function parseWebhook(string $payload, string $signature): ?array
    {
        return json_decode($payload, true) ?: null;
    }
}
