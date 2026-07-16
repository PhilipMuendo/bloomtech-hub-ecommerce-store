# Security & Pre-Launch Hardening

Status of security work and the remaining checklist before going live.

## ✅ Done in this branch
- **Removed a committed secret**: `backend/pesapal.env` is no longer tracked and
  is git-ignored. **You must still rotate those Pesapal credentials** — anything
  committed to git history should be treated as compromised.
- **Fixed `env.example`**: documents `DB_PASS` (the variable the app actually
  reads) and replaces real-looking Pesapal keys with placeholders.
- **Closed a production CORS hole** (`backend/middleware/security.js`): the prod
  config allowed *any* `*.ngrok.io` / `*.ngrok-free.app` origin with
  `credentials: true`, so an attacker-controlled tunnel could make credentialed
  requests to the live API. ngrok is now allowed only when
  `NODE_ENV !== 'production'`.
  > Left unstaged because that file has your in-progress work — review and commit
  > it alongside your security changes.

## 🔴 Must-do before launch

### 1. Rotate the leaked Pesapal credentials
Generate new consumer key/secret in the Pesapal dashboard. If the repo is or will
be public, also scrub history (`git filter-repo` / BFG) — untracking doesn't
remove the values from past commits.

### 2. Patch vulnerable dependencies
`npm audit` currently reports (production deps):
- **Frontend**: 24 vulns (1 critical, 12 high). The **critical is `xlsx`** —
  SheetJS has known prototype-pollution / ReDoS advisories with **no npm fix**.
  Remediate by upgrading to the vendor build (`https://cdn.sheetjs.com`) or
  switching the Newsletter export to a maintained lib (e.g. `exceljs`).
- **Backend**: 29 vulns (1 critical, 13 high). Critical is `form-data`; also
  `validator.js` URL-validation bypass (high).

Run `npm audit fix` (and `cd backend && npm audit fix`) for the non-breaking
fixes, then review the remainder. Do this in a dedicated commit so it doesn't
mix with feature work.

### 3. Serve over HTTPS
The frontend container serves plain HTTP:80. Terminate TLS at a reverse proxy
(Caddy/Traefik/nginx) or load balancer and enable HSTS. Ensure
`FRONTEND_URL` / `BACKEND_URL` use `https://`.

## 🟠 Strongly recommended

### 4. Move auth off localStorage
JWTs are stored in `localStorage` (`src/context/AuthContext.tsx`) and issued with
a **30-day** expiry (`authController.js`). localStorage tokens are stealable via
any XSS, and 30 days is a long compromise window.
- Preferred: issue the JWT in an **HttpOnly, Secure, SameSite=Strict/Lax cookie**
  and add CSRF protection (double-submit token) for state-changing routes.
- Minimum: shorten access-token expiry (e.g. 1h) and add refresh tokens.
This is a cross-cutting change — plan it as its own task, not a launch hotfix.

### 5. Lock down CORS & CSP
- Drive the allowed-origins list from an env var instead of the hardcoded array,
  and drop the bare-IP origins once the domain is live.
- Review the helmet Content-Security-Policy for production (the reference nginx
  CSP allows `'unsafe-inline'`).

### 6. Operational
- Ensure `JWT_SECRET` is a long random value per environment (never the example).
- Confirm login brute-force protection is active (account-lockout migration 041
  exists — verify it's wired up) plus the auth rate limiter.
- Set up automated MySQL backups and an error-monitoring service (Sentry etc.).
- Add a CI step running `npm run typecheck`, `npm audit`, and the backend tests.
