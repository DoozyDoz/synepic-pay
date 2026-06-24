# synepic-pay

Self-hosted Pesapal prefill middleware for the Synepic Sales & Profit Dashboard Setup.
Produces the short STK-push flow: customer enters their Mobile Money number on a branded
page → is redirected to Pesapal's hosted checkout (number prefilled, address/email/names
prefilled by this server) → picks MTN/Airtel → approves the PIN prompt on their phone →
lands on a success page.

Lives at **pay.synepic.com**. Reuses the Synepic Pesapal merchant account. No database,
no IPN processing — for validation you reconcile payments manually in the Pesapal dashboard
and record them in Invoice Ninja (invoice.synepic.com).

## Routes

- `/deposit` — pay the UGX 175,000 deposit
- `/balance` — pay the UGX 175,000 balance on delivery
- `POST /api/order` — `{ phone, type: 'deposit'|'balance' }` → `{ redirect_url }`
- `GET /api/pesapal/callback` — Pesapal browser redirect after payment → `/success` or `/cancelled`
- `GET|POST /api/pesapal/ipn` — Pesapal IPN endpoint (logs only for validation)

## Setup

1. Copy `.env.example` to `.env` and fill in `PESAPAL_CONSUMER_KEY` / `PESAPAL_CONSUMER_SECRET`
   (the Synepic merchant account credentials — same ones fastnet uses).
2. Deploy to the VPS (Dokploy), pointing the domain `pay.synepic.com` at the app.
3. **Register the IPN URL** (only after the app is live so Pesapal can reach it):
   ```bash
   npm run register-ipn
   ```
   Copy the printed `ipn_id` into `.env` as `PESAPAL_NOTIFICATION_ID`, redeploy.
4. Self-pay test: open `/deposit`, enter your own number, approve the MoMo PIN, land on
   `/success`, then confirm the payment in the Pesapal dashboard and issue the Invoice Ninja
   receipt. (You'll lose only the Pesapal transaction fee — the cost of a true end-to-end test.)

## WhatsApp wiring

Update the `/payment` quick reply to send `https://pay.synepic.com/deposit`, and add a
`/balance` quick reply sending `https://pay.synepic.com/balance`.

## Notes

- This app registers its **own** Pesapal IPN URL + `notification_id` — do **not** reuse
  fastnet's, or fastnet's IPN handler will try to treat analytics payments as WiFi vouchers.
- `billing_address` (phone, email, country, names) is prefilled server-side so the customer
  never fills the long Pesapal form. The phone is the one field the customer must enter —
  Pesapal needs it to push the STK prompt.
- For validation there is no DB and no IPN processing. Post-validation: add an IPN handler
  that records payments and auto-issues Invoice Ninja receipts.