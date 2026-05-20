<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\PriceProposal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class CheckoutController extends Controller
{
    /**
     * Toont de checkout pagina voor een specifiek klusje (escrow)
     */
    public function show(PriceProposal $proposal)
    {
        // Zorg dat alleen de eigenaar/betaler deze pagina kan zien
        abort_if($proposal->conversation->owner_id !== auth()->id(), 403, 'Je hebt geen toegang tot deze betaling.');

        Stripe::setApiKey(config('services.stripe.secret'));

        $paymentIntent = PaymentIntent::create([
            'amount' => $proposal->amount * 100,
            'currency' => 'eur',
            'metadata' => [
                'proposal_id' => $proposal->id,
                'klusje_id' => $proposal->conversation->klusje_id,
            ],
        ]);

        return Inertia::render('checkout/show', [
            'clientSecret' => $paymentIntent->client_secret,
            'stripeKey' => config('services.stripe.key'),
            'proposal' => $proposal->load('conversation.klusje'),
        ]);
    }

    /**
     * Toont de checkout pagina voor het opwaarderen van de balans
     */
    public function topup(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:5',
        ]);

        Stripe::setApiKey(config('services.stripe.secret'));

        $paymentIntent = PaymentIntent::create([
            'amount' => $request->amount * 100,
            'currency' => 'eur',
            'metadata' => [
                'type' => 'balance_topup',
                'user_id' => auth()->id(),
            ],
        ]);

        return Inertia::render('checkout/show', [
            'clientSecret' => $paymentIntent->client_secret,
            'stripeKey' => config('services.stripe.key'),
            'isTopup' => true,
            'amount' => $request->amount,
        ]);
    }

    /**
     * De succes pagina waar Stripe naar terugstuurt na een betaling
     */
    public function success(Request $request)
    {
        // Debugging: Kijk of we hier binnenkomen (handig voor localhost)
        Log::info('Stripe Success URL aangeroepen', $request->all());

        if ($request->has('payment_intent')) {

            Stripe::setApiKey(config('services.stripe.secret'));

            try {
                $intent = PaymentIntent::retrieve($request->payment_intent);
                Log::info('PaymentIntent opgehaald bij Stripe', ['id' => $intent->id, 'status' => $intent->status, 'metadata' => $intent->metadata]);

                if ($intent->status !== 'succeeded') {
                    Log::warning('Checkout success aangeroepen voor niet-betaalde intent.', ['intent_id' => $intent->id, 'status' => $intent->status]);

                    return Inertia::render('checkout/success');
                }

                // Is dit een balans opwaardering?
                if (isset($intent->metadata->type) && $intent->metadata->type === 'balance_topup') {
                    $userId = $intent->metadata->user_id;
                    $amountInEuros = $intent->amount / 100;

                    // Voorkom dubbele boekingen (belangrijk als de webhook later óók afgaat)
                    $exists = Payment::where('stripe_payment_intent_id', $intent->id)->exists();

                    if (! $exists) {
                        Log::info('Nieuw Payment record aanmaken voor topup', ['user_id' => $userId, 'amount' => $amountInEuros]);

                        Payment::create([
                            'payee_id' => $userId,
                            'payer_id' => $userId,
                            'amount' => $amountInEuros,
                            'platform_fee' => 0,
                            'currency' => 'eur',
                            'status' => PaymentStatus::Released, // Model gebruikt Enum casting, dus dit is correct
                            'stripe_payment_intent_id' => $intent->id,
                            'paid_at' => now(),
                            'released_at' => now(),
                        ]);

                        Log::info('Payment succesvol aangemaakt in database.');
                    } else {
                        Log::warning('Betaling was al verwerkt.', ['intent_id' => $intent->id]);
                    }
                }
            } catch (\Exception $e) {
                Log::error('Fout in Checkout Success: '.$e->getMessage());
            }
        }

        return Inertia::render('checkout/success');
    }
}
