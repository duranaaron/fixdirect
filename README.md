# FixDirect

A platform that connects people who need help with small jobs ("klusjes") to skilled helpers ("klussers").

## Requirements

- PHP 8.2+
- [Laravel Herd](https://herd.laravel.com) (or Valet/Homestead)
- Node.js 18+
- Composer
- SQLite

## Getting Started

```bash
# Install dependencies
composer install
npm install

# Environment
cp .env.example .env
php artisan key:generate

# Database
php artisan migrate --seed

# Storage link (for image uploads)
php artisan storage:link

# Dev servers
php artisan reverb:start   # WebSocket server (for real-time chat)
npm run dev                # Vite dev server
```

Then visit `http://fixdirect.test` (or your configured Herd domain).

---

## Stripe Setup (Payments & Escrow)

FixDirect uses Stripe for escrow payments. In local dev you can use Stripe's **test mode** — no real money is charged.

### 1. Get Your Test API Keys

1. Create a free account at [dashboard.stripe.com](https://dashboard.stripe.com)
2. Toggle **"Test mode"** ON (top-right of the dashboard)
3. Go to **Developers → API keys**
4. Copy the keys into your `.env`:

```env
STRIPE_KEY=pk_test_...          # Publishable key
STRIPE_SECRET=sk_test_...       # Secret key (click "Reveal")
```

### 2. Set Up Local Webhooks

When a user completes a Stripe Checkout, Stripe sends a webhook to confirm the payment. For local dev, use the **Stripe CLI** to forward these events to your app.

#### Install the Stripe CLI

```bash
# Windows
winget install Stripe.StripeCLI

# macOS
brew install stripe/stripe-cli/stripe
```

#### Log in (one-time)

```bash
stripe login
```

This opens your browser to connect the CLI to your Stripe account.

#### Start the listener

```bash
stripe listen --forward-to http://fixdirect.test/stripe/webhook --events checkout.session.completed,payment_intent.succeeded
```

The CLI will print a webhook signing secret:

```
> Ready! Your webhook signing secret is whsec_abc123... (^C to quit)
```

Copy that `whsec_...` value into your `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_abc123...
```

> **Note:** The signing secret changes each time you restart `stripe listen`. Update your `.env` accordingly.

### 3. Testing a Payment Flow

1. Create a klusje, have another user make an offer, and accept it
2. Click "Fund Escrow" on the klusje page — this redirects to Stripe Checkout
3. Use the test card number **`4242 4242 4242 4242`** with any future date and any CVC
4. After checkout, Stripe sends the webhook → the payment is marked as "held" in escrow
5. Complete the klusje to release the payment to the klusser

### Without Stripe Keys

If no `STRIPE_SECRET` is set, the app falls back to a **fake payment flow** where you can simulate checkout completion without Stripe. This is useful for quick testing.

---

## Real-Time (Reverb)

Chat messages and price proposals update in real-time via [Laravel Reverb](https://reverb.laravel.com). Make sure the WebSocket server is running:

```bash
php artisan reverb:start
```

Your `.env` should have:

```env
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=fixdirect
REVERB_APP_KEY=fixdirect-key
REVERB_APP_SECRET=fixdirect-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```
