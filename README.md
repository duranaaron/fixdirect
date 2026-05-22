# FixDirect

FixDirect is een project ontwikkeld voor het vak **Practice Enterprise 1** aan [Thomas More](https://www.thomasmore.be/).

FixDirect is een platform dat mensen die hulp nodig hebben bij kleine klusjes verbindt met handige klussers.

Gebruikers kunnen klusjes plaatsen, offertes ontvangen van klussers, realtime chatten en betalingen veilig verwerken via een escrow-systeem.

---

## Teamleden

- [Nayl Laaraj](https://github.com/snako-p)
- [Stefan Camli](https://github.com/stefanbetmichael)
- [Aaron Duran](https://github.com/duranaaron)

---

## Vereisten

- PHP 8.2+
- [Laravel Herd](https://herd.laravel.com) (of Valet/Homestead)
- Node.js 18+
- Composer
- SQLite

---

## Project opstarten

### Dependencies installeren

```bash
composer install
npm install
```

### Environment configureren

```bash
cp .env.example .env
php artisan key:generate
```

### Database opzetten

```bash
php artisan migrate --seed
```

### Storage link maken (voor uploads)

```bash
php artisan storage:link
```

### Development services starten

```bash
php artisan reverb:start
npm run dev
```

Bezoek daarna:

```txt
http://fixdirect.test
```

(of je eigen geconfigureerde Herd-domein)

---

## Stripe configuratie (betalingen & escrow)

FixDirect gebruikt Stripe voor escrow-betalingen. Tijdens lokale development kan Stripe in testmodus gebruikt worden zodat er geen echte betalingen gebeuren.

### 1. Stripe API keys ophalen

1. Maak een account aan op https://dashboard.stripe.com
2. Zet "Test mode" aan
3. Ga naar Developers → API keys
4. Voeg de keys toe aan `.env`

```env
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
```

---

### 2. Lokale webhooks instellen

Stripe gebruikt webhooks om betalingen te bevestigen na checkout.

#### Stripe CLI installeren

```bash
# Windows
winget install Stripe.StripeCLI

# macOS
brew install stripe/stripe-cli/stripe
```

#### Inloggen

```bash
stripe login
```

#### Listener starten

```bash
stripe listen --forward-to http://fixdirect.test/stripe/webhook --events checkout.session.completed,payment_intent.succeeded
```

De CLI geeft een webhook secret terug:

```txt
whsec_abc123...
```

Voeg deze toe aan `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_abc123...
```

> Opmerking: deze secret verandert telkens wanneer `stripe listen` opnieuw wordt gestart.

---

### 3. Een betaling testen

1. Maak een klusje aan
2. Laat een andere gebruiker een bieding maken
3. Accepteer de bieding
4. Klik op "Betalen"
5. Gebruik deze testkaart:

```txt
4242 4242 4242 4242
```

Met:
- een willekeurige toekomstige datum
- een willekeurige CVC

Na de betaling stuurt Stripe een webhook en wordt de betaling in escrow geplaatst.

Wanneer het klusje voltooid wordt, wordt de betaling vrijgegeven aan de klusser.

---

## Fake payment flow

Wanneer er geen `STRIPE_SECRET` ingesteld is, gebruikt de applicatie automatisch een fake payment flow.

Hiermee kunnen betalingen gesimuleerd worden zonder Stripe, handig voor snelle testing.

---

## Realtime functionaliteit (Laravel Reverb)

Chatberichten en prijsvoorstellen werken realtime via [Laravel Reverb](https://reverb.laravel.com).

Start de websocket server met:

```bash
php artisan reverb:start
```

Gebruik volgende instellingen in `.env`:

```env
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=fixdirect
REVERB_APP_KEY=fixdirect-key
REVERB_APP_SECRET=fixdirect-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

---

## Belangrijke opmerking

De finale versie van het project bevindt zich op de `main` branch.

Na het indienen worden er geen wijzigingen meer gemaakt aan de `main` branch.

Nieuwe experimenten of verdere ontwikkeling gebeuren in aparte branches.
