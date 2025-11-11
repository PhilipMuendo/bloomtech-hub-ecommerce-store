# BloomTech Hub Technical Reference

> **Owner note**: This document captures the full technical context of the BloomTech Hub e-commerce platform so future maintainers (or you coming back later) can rebuild, run, and deploy the system end to end without reading the entire codebase. Keep this document close to your deployment playbook and update it whenever significant changes land.

---

## 1. System Overview

BloomTech Hub is a full-stack e-commerce platform composed of:

- A **React 18 + TypeScript** single-page application served by Vite.
- A **Node.js (ESM) + Express** API that exposes REST endpoints for the store, admin workflows, payments, and operational tooling.
- A **MySQL 8** database accessed through Sequelize ORM (current canonical source of truth) with a legacy layer of Mongoose models maintained for migration scripts and tooling.
- Payment integrations for **Pesapal**, **M-Pesa**, and internal **bank transfer** flows, backed by rich operational scripts and documentation under `docs/`.

Local development runs the frontend on port `8081` (Vite) and the backend on port `5000`. Production deployments typically serve the SPA from a CDN/static host and the API from a Node or container runtime fronted by Nginx.

---

## 2. Architecture at a Glance

```
[React SPA (Vite, port 8081)] --> Axios/React Query --> [Express API (port 5000)] --> [MySQL 8 via Sequelize]
                                     |
                                     +--> Nodemailer SMTP (transactional mail)
                                     +--> Pesapal REST + webhooks
                                     +--> M-Pesa STK Push + callbacks
                                     +--> File storage: backend/public/lovable-uploads
```

Key cross-cutting concerns:

- Shared JWT authentication (tokens issued by backend, stored client-side).
- Role-based guards for admin, warehouse, and superadmin features.
- Security middleware stack covering headers, XSS, SQL/NoSQL injection, rate limiting, request size, and CORS.
- Extensive operational scripts (`backend/scripts/`) to migrate data, audit tables, seed fixtures, and validate environments.
- Documentation and deployment tooling consolidated under `docs/` and `deployment/`.

---

## 3. Technology Stack

| Layer            | Tooling / Frameworks                                                                                 | Notes |
|------------------|--------------------------------------------------------------------------------------------------------|-------|
| Frontend         | React 18, TypeScript 5, Vite 5, React Router 6, React Query 5, Tailwind CSS 3, shadcn/ui, Framer Motion | SPA with modular UI system under `src/components/ui`. |
| Backend API      | Node 20+, Express 4/5 hybrid (ESM), Sequelize 6, MySQL 8, JWT, Multer, Nodemailer, Morgan, Helmet       | Uses `sequelize_models` for relational entities. Legacy Mongoose layer in `backend/models` retained for scripts. |
| Security         | helmet, express-rate-limit, hpp, custom XSS/sql sanitizers, JWT auth middleware                        | Configurable via `backend/middleware/security.js`. |
| Payments         | Pesapal V3, M-Pesa, Bank transfer invoice generation                                                   | Documentation in `docs/` and controllers/routes under `backend/controllers` and `backend/routes`. |
| Tooling & Ops    | Jest + Supertest, Nodemon, Sequelize CLI, PM2 (`deployment/ecosystem.config.js`), Docker Compose        | Additional shell scripts for cPanel and Nginx automation live in `deployment/`. |

---

## 4. Repository Layout

| Path | Purpose |
|------|---------|
| `src/` | Frontend SPA source. Key subfolders: `components/`, `pages/`, `context/`, `hooks/`, `data/`, `lib/`, `utils/`, `assets/`. |
| `public/` | Frontend static assets (favicons, robots, placeholders). |
| `dist/` | Generated Vite build artifacts (do not edit manually). |
| `backend/` | Express API, Sequelize models, controllers, routes, middleware, scripts, migrations, and server entrypoint. |
| `backend/public/` | Uploaded assets served via `/public` (notably `lovable-uploads/`). |
| `backend/email-logs/` | JSON audit of emails sent in staging/testing. |
| `docs/` | Project documentation. Includes pre-existing guides and this technical reference; backend-specific docs live in `docs/backend/`. |
| `deployment/` | Deployment assets (Docker Compose, PM2 ecosystem file, cPanel scripts, nginx config). |
| `scripts/` | Project-wide helper scripts. `check-orders.js` uses the canonical Sequelize layer; `check-orders.root.js` preserves the divergent legacy implementation for comparison. |
| `tailwind.config.ts`, `postcss.config.js`, `tsconfig*.json`, `vite.config.ts` | Build and tooling configuration for the frontend. |
| `package.json`, `backend/package.json` | Dependency manifests for frontend/root tooling and backend respectively. |

---

## 5. Environment & Configuration

### 5.1 Prerequisites

- Node.js 20.x (minimum 18, but align with production runtime).
- npm 9+ (or compatible package manager).
- MySQL 8 (local instance or Docker container).
- Git, and optional Docker / Docker Compose for containerized setup.

### 5.2 Backend Environment Variables

Create `backend/.env` based on `backend/env.example`. Key variables:

| Variable | Description |
|----------|-------------|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_TEST_NAME` | MySQL connection details for main and test databases. |
| `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` | JWT signing secrets and TTLs. Refresh secret defaults in `backend/config/index.js`. |
| `PORT`, `NODE_ENV` | Express server port (default `5000`) and environment. |
| `FRONTEND_URL`, `BACKEND_URL` | Used in emails and payment callbacks. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Nodemailer SMTP credentials. |
| `ADMIN_EMAIL` | Primary support contact used in notifications. |
| `MPESA_*` | Credentials for M-Pesa STK push integration. |
| `PESAPAL_*` | Pesapal V3 credentials and endpoints. Sandbox defaults live in `backend/pesapal.env`. |
| `FLUTTERWAVE_*` | Reserved for future integration (optional). |
| `MAX_FILE_SIZE`, `UPLOAD_PATH` | Limits and storage path for Multer uploads. |

> Place sensitive keys only in `.env` and `.env.production`. Never commit them.

### 5.3 Frontend Environment Variables

Create `.env` at the repo root for Vite (values must be prefixed with `VITE_`):

| Variable | Description |
|----------|-------------|
| `VITE_BACKEND_HOST` | Base URL for API calls. Defaults to `http://localhost:5000` when unset. |
| `VITE_GOOGLE_CLIENT_ID` | Enables Google OAuth button logic (optional). |

### 5.4 Local Setup Steps

```sh
# Clone
git clone <repository-url>
cd bloomtech-hub-ecommerce-store

# Install frontend/root toolchain
yarn install # or npm install / pnpm install

# Install backend dependencies
cd backend
npm install
cd ..

# Database bootstrapping
mysql -u root -p <<'SQL'
CREATE DATABASE IF NOT EXISTS bloomtech_db CHARACTER SET utf8mb4;
CREATE DATABASE IF NOT EXISTS bloomtech_db_test CHARACTER SET utf8mb4;
SQL

# Seed data (optional but recommended for local feature parity)
cd backend
npm run migrate
npm run db:seed
cd ..
```

Run development servers in separate terminals:

```sh
# Terminal 1 - backend
cd backend
npm run dev

# Terminal 2 - frontend
npm run dev
# Vite listens on http://localhost:8081 (see vite.config.ts)
```

### 5.5 Docker-Based Setup

`deployment/docker-compose.yml` provisions MySQL and the backend API:

```sh
# Build and start backend + MySQL
cd deployment
docker compose up --build

# Access API at http://localhost:5000, MySQL at localhost:3306
```

> The compose file mounts `backend/` into the container. Run migrations inside the backend service container if necessary (`docker compose exec backend npm run migrate`).

### 5.6 Running the Test Suite

Backend uses Jest + Supertest:

```sh
cd backend
npm test
```

Ensure `bloomtech_db_test` exists and credentials in `.env` cover the test database.

Currently there is no automated frontend test suite configured. Use `npm run lint` at the repo root to enforce ESLint/TypeScript rules.

---

## 6. Backend Architecture Details

### 6.1 Entry Point & Middleware Chain

- `backend/server.js` loads `.env` files, registers security middleware, sets up CORS (environment aware), mounts routers, and starts the HTTP server after `sequelize.sync()` completes.
- Security pipeline (order intentional):
  1. `helmet` (`securityHeaders`) for CSP and core headers.
  2. Custom XSS sanitization on body/query/params.
  3. SQL and NoSQL injection detection (with route-specific exclusions).
  4. HTTP parameter pollution protection (`hpp`).
  5. Request size enforcement (10 MB).
  6. API rate limiting (global via `/api/`).
  7. Morgan logging in `combined` format.

### 6.2 Routing & Controllers

Routes live under `backend/routes/` and map directly to controllers in `backend/controllers/`. Key modules:

| Route Prefix | Controller | Responsibilities |
|--------------|------------|------------------|
| `/api/auth` | `authController.js` | Registration, login, email verification, JWT refresh/reset flows. |
| `/api/users` | `userController.js` | User management, role updates, profile queries. |
| `/api/products` | `productController.js` | CRUD, featured listings, search/filter logic, file uploads. |
| `/api/orders` | `orderController.js` | Order creation, status updates, admin reporting. |
| `/api/cart` | `cartController.js` | Cart line management tied to authenticated users. |
| `/api/wishlist` | `wishlistController.js` | Wishlist CRUD per user. |
| `/api/reviews` | `reviewController.js` | Customer reviews with admin moderation. |
| `/api/quotes` | `quoteController.js` | Quote submission and admin conversion workflows. |
| `/api/newsletter` | `newsletterController.js` | Subscriber enrollment and export. |
| `/api/dashboard` | `dashboardController.js` | Aggregated stats for admin UI. |
| `/api/payments` | `pesapalController.js`, `pesapalV3Controller.js`, `bankTransferController.js`, `paymentController.js` | Payment initiation, callbacks, manual bank transfer confirmation, invoice PDF generation. |
| `/api/audit` | `auditController.js` | Audit trail retrieval and logging. |
| `/api/contact` | `contactController.js` | Customer support intake and status tracking. |
| `/api/campaigns`, `/api/blog`, `/api/subcategories` | Content and taxonomy endpoints powering marketing/admin features. |

All async controllers are typically wrapped via the `asyncHandler` utility from `middleware/errorHandler.js` to guarantee central error handling.

### 6.3 Authentication & Authorization

- `middleware/requireAuth.js` enforces JWT validation, ensures the user exists, and checks account status flags (`active`, `suspended`).
- `middleware/roleAuth.js` provides shortcuts (`requireAdmin`, `requireSuperAdmin`, `requireWarehouse`, `requireRole([...])`) for route-level RBAC.
- Tokens are issued in `authController` using `jsonwebtoken` with secrets from `.env`.

### 6.4 Data Layer

- Primary ORM: Sequelize models defined under `backend/sequelize_models/`. `index.js` dynamically loads all model definitions, establishes associations, and exports both the model registry (`db`) and `sequelize` instance.
- Associations cover Users ⇄ Orders ⇄ OrderItems ⇄ Products, reviews, wishlists, quotes, transactions, audits, etc. Extend this in `sequelize_models/index.js` when adding new relations.
- Legacy Layer: `backend/models/` (Mongoose schemas) and `backend/legacy_models/` remain for historical migrations and tooling. These should not be used for new features; prefer Sequelize.
- Migrations: `backend/migrations/` contains sequential files compatible with `sequelize-cli`. Run via `npm run migrate` and `npm run migrate:undo`.
- Seeders: `backend/seeders/` (invoked by `npm run db:seed`).

### 6.5 File Storage

- Uploaded files (product images, invoices) live in `backend/public/lovable-uploads/` and are exposed at `/public/…` via static middleware. Ensure this directory exists in deployments and is backed up if necessary.

### 6.6 Email & Notification System

- Nodemailer configured via SMTP variables. Utility scripts `backend/setup-email.js` and `backend/scripts/test-email-config.js` help verify credentials.
- Email logs recorded as JSON under `backend/email-logs/` during development/testing for auditing.

### 6.7 Operational Scripts

`backend/scripts/` houses task-specific Node scripts. Broad categories:

- **Data migration & cleanup**: `migrate-mongodb-to-mysql.js`, `migrate-data.js`, `cleanupSubcategories.js`, `fixProductCategories.js`, etc.
- **Validation & diagnostics**: `checkProducts.js`, `checkOrders.js`, `checkAssociations.js`, `validate-data.js`.
- **Account utilities**: `createSuperAdmin.js`, `fixAdminPassword.js`, `verifyAccounts.js`.
- **Payment & email testing**: `test-payment-flow.js`, `test-email-flow.js`, `test-bank-transfer.js`.
- **Environment prep**: `setup-database.js`, `setup-env.js`, `update-env.js`.

Run scripts with `node scripts/<script-name>.js` from `backend/`. Review the script before executing in production environments.

### 6.8 Testing & Quality

- Tests live in `backend/tests/` (e.g., `pesapalController.test.js`) and now include the relocated `test-*.js` utilities for manual verification.
- Use Jest CLI (`npm test`) to run the suite. Set `NODE_ENV=test` and ensure your test database is isolated.

### 6.9 Logging & Error Handling

- `morgan` prints HTTP access logs in the console.
- Centralized error handler (`middleware/errorHandler.js`) masks sensitive data, categorizes Sequelize, JWT, rate limit, and upload errors, and returns safe JSON responses.
- For long-term ops, consider shipping logs to an external system; PM2 configuration already captures stdout/stderr to files under `logs/` (configurable in `deployment/ecosystem.config.js`).

---

## 7. Frontend Architecture Details

### 7.1 Build & Tooling

- `vite.config.ts` sets the dev server to `::` (all interfaces) on port `8081` and proxies `/api` calls to the backend in development. In production builds, `/api` requests hit `https://bloomtechub.com` unless overridden by environment config.
- `tsconfig.json` defines the `@/*` alias pointing to `src/*` and relaxes some strictness (e.g., `noImplicitAny = false`).
- Tailwind configuration extends shadcn tokens and animations (`tailwind.config.ts`).

### 7.2 Directory Breakdown

| Directory | Purpose |
|-----------|---------|
| `src/components/` | Core UI components (cards, headers, payment modals) and shadcn primitives under `ui/`. |
| `src/pages/` | Route-level views (customer storefront, auth pages, admin dashboard, warehouse panels). |
| `src/context/` | React context providers (AuthContext, CartContext). |
| `src/hooks/` | Custom hooks (`useWishlist`, `useReviews`, `useToast`, `use-mobile`). |
| `src/data/` | Static data such as county lists or configuration constants. |
| `src/utils/` | Client-side real-time helpers (e.g., `realTimeUpdates.ts`). |
| `src/lib/utils.ts` | Utility helpers used throughout the UI (class name merging, formatting). |

### 7.3 State Management & Data Fetching

- Global auth and cart state rely on React Context providers.
- Server interactions primarily use Axios + React Query for caching, refetching, and mutation management.
- Form management leverages React Hook Form + Zod/Yup schema validation depending on context.

### 7.4 Routing & Guarding

- React Router defines customer and admin routes. `ProtectedRoute.tsx` wraps private routes and redirects based on authentication/role.
- Admin layout and warehouse layout components gate functionality by role (see `AdminLayout.tsx`, `WarehouseLayout.tsx`).

### 7.5 UI System

- shadcn/ui components under `src/components/ui/` provide consistent design primitives with Tailwind theming.
- TailwindCSS classes orchestrate responsive behavior; `tailwind-merge` and `class-variance-authority` help manage variants.
- Animations handled by Framer Motion and Embla carousel for dynamic sections.

### 7.6 Integrations & Utilities

- `GoogleLoginButton.tsx` reads `VITE_GOOGLE_CLIENT_ID` to optionally render OAuth login.
- Admin product management page references `VITE_BACKEND_HOST` for API base.
- File uploads interact with the `/api/upload` endpoint, returning public URLs under `/public/lovable-uploads`.

### 7.7 Build Outputs

- `npm run build` writes production assets to `dist/`. Serve the contents statically (e.g., via Nginx or CDN) pointing unmatched routes back to `index.html` to preserve SPA routing.
- `npm run preview` serves the build locally for smoke tests.

### 7.8 Linting

- ESLint config lives in `eslint.config.js` with React, TypeScript, and React Hook rules.
- Run `npm run lint` from the repo root to check source files.

---

## 8. Domain Workflows & Integrations

### 8.1 Payments

- **Pesapal**: `backend/controllers/pesapalController.js` and `pesapalV3Controller.js` manage initiation, token exchange, status polling, and webhook callbacks. Environment-specific credentials live in `.env` or `pesapal.env`. Ensure webhook URLs are publicly reachable and configured in Pesapal dashboard.
- **M-Pesa**: STK push flow triggered from checkout. Callback handler updates order and transaction tables. Requires safaricom credentials and accessible callback endpoints.
- **Bank Transfer**: Covers orders above the configured threshold. `bankTransferController.js` generates proforma invoices (PDF via `utils/pdfUtils.js`), saves audit information, and expects manual confirmation by admins.

### 8.2 Email Notifications

- Triggered on account registration, order events, invoice generation, password reset, and alerts. Templates typically live inside controllers or `utils/emailService.js`.
- SMTP credentials must allow “less secure app” access or use app passwords (for Gmail-enabled setups). Use `backend/scripts/test-email-config.js` to validate.

### 8.3 Auditing & Analytics

- Dashboard metrics aggregated via `dashboardController.js`, hitting Sequelize models for counts and revenue sums.
- `auditService.js` records admin actions for accountability.

### 8.4 Content & Marketing

- Blog articles, campaigns, and newsletter signup endpoints feed into marketing pages in the SPA.
- County lists and other static references stored under `src/data/`.

### 8.5 Legacy Migration Context

- Project history includes a MongoDB phase. Legacy models (`backend/models/` and `backend/legacy_models/`) plus migration scripts help reconcile data. When modifying schemas, ensure both legacy utilities and Sequelize migrations reflect the change or retire unused scripts.

---

## 9. Deployment & Operations

### 9.1 Deployment Folder Assets

| File | Purpose |
|------|---------|
| `deployment/docker-compose.yml` | Local/production container stack for backend + MySQL. Adjust environment variables before deploying. |
| `deployment/ecosystem.config.js` | PM2 process configuration for backend API and a static frontend (`frontend-dist` folder). Logs default to `./logs/`. |
| `deployment/nginx.conf` | Reverse proxy and static asset configuration suitable for a single host deployment (serve SPA + proxy `/api`). |
| `deployment/deploy.sh`, `deployment/cpanel-deploy.sh`, `deployment/cpanel-htaccess.conf` | Automation scripts for typical hosting setups (cPanel, bare metal). |

### 9.2 Build & Release Flow

1. **Frontend**
   ```sh
   npm run build
   rsync dist/ <static-host>:/var/www/html
   ```
2. **Backend**
   ```sh
   cd backend
   npm install --production
   npm run migrate  # run in production DB context
   pm2 start ../deployment/ecosystem.config.js
   ```
3. **Environment Variables**: Mirror `.env` values in production (e.g., via PM2 ecosystem `env` block, systemd, or managed secret store).
4. **MySQL**: Provision remote MySQL with appropriate user/password. Import schema using migrations; seed only when bootstrapping non-production environments.
5. **Webhooks & Domains**: Update Pesapal/M-Pesa callback URLs to the live domain or ngrok tunnel during testing.

### 9.3 Monitoring & Logging

- PM2 logs accessible via `pm2 logs bloomtech-backend`.
- Consider shipping logs to CloudWatch/ELK for production.
- Database backups: schedule nightly exports of `bloomtech_db`. Store uploads directory snapshots alongside DB backups.

---

## 10. Maintenance & Troubleshooting

- **Duplicate Files**: Two artifacts require manual review after the latest reorganization:
  - `backend/pesapalV3Controller.duplicate.js` retains an alternate implementation. Diff it against `backend/controllers/pesapalV3Controller.js` and delete once reconciled.
  - `scripts/check-orders.root.js` mirrors the canonical `scripts/check-orders.js` but references a legacy path and contains an embedded error log. Clean/fix or remove after confirming the desired script.
- **Database Issues**: Use diagnostic scripts (`backend/scripts/checkOrders.js`, `validate-data.js`) to inspect data integrity. Always back up before running destructive scripts.
- **Email Failures**: Check `backend/email-logs/` for JSON dumps when SMTP credentials fail. Ensure `LESS SECURE APPS` or app passwords are configured for Gmail.
- **Payment Callbacks**: Confirm accessible public URLs, correct credentials, and check logs around `/api/payments/.../callback`. Use tools like ngrok or localtunnel in development.
- **Migrations**: Keep `backend/migrations/` synchronized with Sequelize models. Use `npm run migrate:undo` to revert the last migration during development.
- **Security Reviews**: Revisiting `middleware/security.js` is mandatory when adding new public routes to ensure they pass through sanitization and rate limiting.

---

## 11. Reference Appendices

### 11.1 Useful Commands

```sh
# Lint frontend + backend TypeScript
npm run lint

# Format (use editor integration; no unified formatter configured)

# Run a specific backend script
cd backend
node scripts/test-payment-flow.js

# Regenerate Prisma-like types (not used) - relies on Sequelize definitions
# Add new model -> create migration -> update associations in sequelize_models/index.js

# Sync production with latest migrations
ssh <host> "cd /var/www/bloomtech-hub/backend && npm run migrate"
```

### 11.2 Documentation Map

- `docs/CPANEL_QUICK_START.md` - hosting instructions specific to cPanel.
- `docs/backend/*.md` - environment setup, database guides, migration notes, Pesapal v3 integration, security baseline.
- `docs/pesapal-detailed-integration-plan.md`, `docs/pesapal-integration-plan.md` - payment implementation deep dives.
- `docs/BANK_TRANSFER_SYSTEM.md`, `docs/ID_GENERATION_SYSTEM.md` - domain-specific processes.

Keep this technical reference updated alongside code changes. A new feature should come with:

1. Updated models/migrations.
2. Controller + route + validation changes.
3. Frontend API integration and UI adjustments.
4. Documentation updates here and, when warranted, a dedicated guide in `docs/`.

---

## 12. Change Log for This Document

- **2025-11-11** - Initial comprehensive draft generated post repository reorganization.
