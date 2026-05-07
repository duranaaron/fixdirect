<?php

namespace App\Http\Controllers;

use App\Models\PriceProposal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class CheckoutController extends Controller
{
    public function show(PriceProposal $proposal)
    {
        // Controleer of de ingelogde gebruiker wel de betaler is
        abort_if($proposal->conversation->owner_id !== auth()->id(), 403);

        // Stel je geheime Stripe sleutel in
        Stripe::setApiKey(env('STRIPE_SECRET'));

        // Maak een PaymentIntent aan. Stripe werkt in centen, dus €15.00 = 1500 cent.
        $paymentIntent = PaymentIntent::create([
            'amount' => $proposal->amount * 100,
            'currency' => 'eur',
            // Optioneel: stuur metadata mee zodat je in je Stripe dashboard ziet over welk klusje dit gaat
            'metadata' => [
                'proposal_id' => $proposal->id,
                'klusje_id' => $proposal->conversation->klusje_id,
            ],
        ]);

        return Inertia::render('checkout/show', [
            'clientSecret' => $paymentIntent->client_secret,
            'stripeKey' => env('STRIPE_KEY'),
            'proposal' => $proposal->load('conversation.klusje'),
        ]);
    }

    public function success()
    {
        // De gebruiker landt hier na een succesvolle betaling
        return Inertia::render('checkout/success');
    }

    public function topup(Request $request)
{
    $request->validate([
        'amount' => 'required|numeric|min:5'
    ]);

    \Stripe\Stripe::setApiKey(env('STRIPE_SECRET'));

    $paymentIntent = \Stripe\PaymentIntent::create([
        'amount' => $request->amount * 100, // Bedrag in centen
        'currency' => 'eur',
        'metadata' => [
            'type' => 'balance_topup',
            'user_id' => auth()->id(),
        ],
    ]);

    return Inertia::render('checkout/show', [
        'clientSecret' => $paymentIntent->client_secret,
        'stripeKey' => env('STRIPE_KEY'),
        'isTopup' => true,
        'amount' => $request->amount,
    ]);
}
}