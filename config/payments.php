<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Platform fee
    |--------------------------------------------------------------------------
    |
    | Percentage (0-100) that the platform retains on every successful klusje
    | payment. 10% means the klusser receives 90% of the compensation.
    */
    'platform_fee_percent' => env('PLATFORM_FEE_PERCENT', 10),

    /*
    |--------------------------------------------------------------------------
    | Stripe
    |--------------------------------------------------------------------------
    |
    | Install `stripe/stripe-php` before enabling real charges:
    |   composer require stripe/stripe-php
    */
    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        'connect_enabled' => env('STRIPE_CONNECT_ENABLED', false),
    ],
];
