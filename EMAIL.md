# Email Setup

The backend sends email through **nodemailer over generic SMTP**, configured
entirely by environment variables — so "going professional" is about pointing
those at a proper provider and adding DNS records, not changing code.

## Configuration (env vars)

| Variable | Purpose |
|----------|---------|
| `SMTP_HOST` | Provider SMTP host |
| `SMTP_PORT` | `587` (STARTTLS) or `465` (implicit TLS) |
| `SMTP_SECURE` | `true` only for port 465; `false` for 587 |
| `SMTP_USER` | Provider SMTP login |
| `SMTP_PASS` | Provider SMTP/API key (not an account password) |
| `SMTP_FROM` | Verified sender, e.g. `"BloomTech Hub <no-reply@bloomtechub.com>"` |

These drive `nodemailer.createTransport(...)` in the email service and
`controllers/campaignController.js`.

## Two separate needs

### 1. Branded mailboxes (human email: you@bloomtechub.com)
- **Zoho Mail** — free tier for one domain, cheap paid plans.
- **Google Workspace** / **Microsoft 365** — pricier, familiar.

### 2. Transactional & bulk sending (what the app does)
Verification, password reset, order confirmations, and newsletters. Do **not**
send these through a personal Gmail — it throttles and lands in spam. Use a
dedicated provider with SMTP:
- **Brevo (Sendinblue)** — generous free tier, handles transactional **and**
  campaigns (fits the newsletter feature). Recommended.
- **Amazon SES** — cheapest at volume, excellent deliverability, more setup.
- **Resend** / **Postmark** — great transactional deliverability.

## Deliverability DNS records (required — do all three)

Add what the provider gives you to your domain's DNS:
- **SPF** (TXT) — authorizes the provider to send for your domain.
- **DKIM** (TXT) — cryptographically signs outgoing mail (provider supplies keys).
- **DMARC** (TXT) — e.g. `v=DMARC1; p=quarantine; rua=mailto:dmarc@bloomtechub.com`.

Without SPF + DKIM, transactional mail is frequently marked spam.

## Example production `.env`

```env
SMTP_HOST=smtp-relay.brevo.com     # example (Brevo)
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<provider-smtp-login>
SMTP_PASS=<provider-smtp-key>
SMTP_FROM="BloomTech Hub <no-reply@bloomtechub.com>"
```

Use `no-reply@` / `orders@` for automated mail and a separate monitored mailbox
(e.g. `support@`) for replies.

## Verify

1. Trigger a real email (register a test account → verification email).
2. Confirm it lands in the **inbox**, not spam.
3. Score your setup at [mail-tester.com](https://www.mail-tester.com/) and fix
   any SPF/DKIM/DMARC gaps it reports.

## Recommended stack for BloomTech Hub
Zoho Mail for branded mailboxes + **Brevo** for app/transactional/campaign
sending, with SPF/DKIM/DMARC configured. Lowest cost with solid deliverability.

## At scale
Large campaign sends should move off the request path into a background queue —
see [SCALING.md](SCALING.md) → Background jobs.
