# Architecture

A guide to how the BloomTech Hub e-commerce system is put together, for
developers joining the project.

## Overview

A single-page React storefront + admin console backed by an Express/MySQL REST
API. Customers browse a product catalog, build a cart, and check out via Pesapal
or bank transfer. Staff manage catalog, orders, quotes, content, and users
through role-gated admin and warehouse areas.

```
Browser ──HTTP──> nginx (frontend container) ──/api ──> Express API ──> MySQL
                     │ serves the built SPA        │
                     └ /public (uploads) proxied ──┘         Redis (rate-limit / cache / queue)
```

## Tech stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18, Vite, TypeScript, Tailwind + shadcn/ui, React Router, TanStack Query, React Hook Form + Zod/Yup, framer-motion |
| Backend   | Node.js, Express, Sequelize ORM, MySQL 8, JWT auth, nodemailer, multer |
| Infra     | Docker Compose (nginx, Node, MySQL, Redis), PM2 (bare-metal option) |
| Payments  | Pesapal, manual bank transfer |

## Repository layout

```
/
├── src/                      # Frontend (React)
│   ├── pages/                # Route-level pages
│   │   ├── admin/            # Admin console pages (role-gated)
│   │   └── warehouse/        # Warehouse pages (role-gated)
│   ├── components/           # Shared components
│   │   └── ui/               # shadcn/ui primitives + design-system (typography)
│   ├── context/             # React context providers (CartContext, AuthContext)
│   ├── hooks/                # Reusable hooks (useDebounce, useWishlist, ...)
│   ├── services/             # API client wrappers (api.ts + per-domain files)
│   ├── types/                # Shared TypeScript types
│   └── index.css             # Design tokens + typography scale
├── backend/
│   ├── server.js             # App entry: middleware chain + route mounting
│   ├── routes/               # Express routers (one per domain)
│   ├── controllers/          # Request handlers
│   ├── services/             # Business logic (audit, email, ...)
│   ├── sequelize_models/     # Sequelize models + DB connection (index.js)
│   ├── migrations/           # Sequelize migrations (numbered)
│   ├── middleware/           # security.js, errorHandler.js, requestId.js
│   └── utils/                # logger (winston), helpers
├── Dockerfile                # Frontend image (build -> nginx)
├── docker-compose.yml        # Full stack
└── docker/nginx.conf         # SPA serving + /api and /public proxy
```

## Request lifecycle (backend)

`server.js` wires middleware in this order:
1. `requestId` — attaches a correlation id to each request.
2. `securityHeaders` (helmet) → CORS → `hpp` → JSON/urlencoded body parsers (10 MB cap).
3. XSS / SQL / NoSQL injection guards, request-size limit.
4. `apiRateLimiter` on `/api/*` (auth and payment routes get stricter limiters).
5. `morgan` request logging, `/public` static uploads.
6. Domain routers under `/api/v1?/<domain>` (see `routes/`).
7. `notFoundHandler` and central `errorHandler`.

## Authentication & authorization

- Login returns a **JWT** (`authController`, 30-day expiry) that the frontend
  stores in `localStorage` (`src/context/AuthContext.tsx`) and sends as a
  `Bearer` token.
- Roles: `customer`, `warehouse`, `admin`, `superadmin`. The frontend
  `ProtectedRoute` gates routes (`requireAdmin`, `allowedRoles`); the backend
  re-checks on protected endpoints.
- Account lockout fields guard against brute force (migration 041).

> Security hardening notes and the plan to move tokens to HttpOnly cookies are in
> [SECURITY.md](SECURITY.md).

## Data & domains

Each business domain has a model + migration + router + controller. Key ones:
`products`, `subcategories`, `orders`, `bankTransfer`, `quotes`, `users`,
`reviews`, `newsletter`/`campaigns`, `contact`, `auditLogs`, `blog`, `settings`,
`dashboard`, `wishlist`, `cart`.

Product catalog reads (`GET /api/products`) support pagination, category/
subcategory filters, sort, and search; indexes for these live in migration 045.

## Frontend data flow

- **Server state** → TanStack Query (`src/pages/Shop.tsx` is the reference: query
  keys encode all filters, with debounced search and request cancellation).
  Global defaults (staleTime, no refetch-on-focus) are set in `src/App.tsx`.
- **Cart** → `CartContext`, persisted to `localStorage`.
- **Auth** → `AuthContext`.
- Pages and admin pages are **lazy-loaded** and vendor code is split into
  cacheable chunks (`vite.config.ts`). `xlsx` is dynamically imported on export.

## Design system

Tokens (HSL CSS variables) live in `src/index.css` — brand is a deep-blue
`primary` with a green `accent`, plus `success`/`warning` semantics. Use the
typography scale (`.text-display`/`-h1`…`-caption`) or the `<Heading>`/`<Text>`
components (`src/components/ui/typography.tsx`) rather than ad-hoc text classes.

## Related docs
- [CONTRIBUTING.md](CONTRIBUTING.md) — local setup and workflow
- [DEPLOYMENT-VPS.md](DEPLOYMENT-VPS.md) — self-hosted deployment
- [SCALING.md](SCALING.md) — scaling roadmap
- [SECURITY.md](SECURITY.md) — security posture and checklist
- [DOCKER.md](DOCKER.md) — container quickstart
