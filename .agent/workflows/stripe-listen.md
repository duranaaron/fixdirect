---
description: Start the Stripe webhook listener for local development
---

// turbo-all

## Steps

1. Log in to Stripe (opens browser — only needed once)
```
stripe login
```

2. Forward Stripe webhook events to the local app
```
stripe listen --forward-to http://fixdirect.test/stripe/webhook --events checkout.session.completed,payment_intent.succeeded
```

3. Copy the webhook signing secret (`whsec_...`) printed in the terminal and set it in `.env`:
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```
