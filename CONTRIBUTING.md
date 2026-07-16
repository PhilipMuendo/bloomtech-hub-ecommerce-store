# Contributing / Developer Guide

How to set up, develop, and ship changes to BloomTech Hub.

## Prerequisites
- Node.js 18+
- MySQL 8 (local or Docker)
- npm

## Local setup

```bash
# 1. Frontend
npm install
cp .env.example .env            # if present; set VITE_API_BASE_URL if needed

# 2. Backend
cd backend
npm install
cp env.example .env             # fill in DB_*, JWT_SECRET, SMTP_*, Pesapal
npm run db:migrate  ||  npx sequelize-cli db:migrate
npm run db:seed                 # optional demo data
```

### Run
```bash
# terminal 1 — API (http://localhost:5000)
cd backend && npm run dev

# terminal 2 — frontend (http://localhost:8081, proxies /api to :5000)
npm run dev
```

Alternatively run the whole stack in Docker — see [DOCKER.md](DOCKER.md).

## Scripts

**Frontend** (`package.json`)
| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck (`tsc`) **and** production build |
| `npm run typecheck` | Type-check only |
| `npm run lint` | ESLint |

**Backend** (`backend/package.json`)
| Script | Purpose |
|--------|---------|
| `npm run dev` | nodemon server |
| `npm start` | production server |
| `npm test` | Jest suite |
| `npm run migrate` / `migrate:undo` | run / revert migrations |
| `npm run db:seed` | seed data |

## Conventions

- **TypeScript is enforced at build time** — `npm run build` fails on type
  errors. Keep the tree type-clean (`npm run typecheck`).
- **Server state** goes through TanStack Query, not ad-hoc `useEffect` + `fetch`.
  Follow `src/pages/Shop.tsx`: encode inputs in the query key, debounce text
  input, pass the `signal` for cancellation.
- **Typography/spacing**: use the `<Heading>`/`<Text>` primitives and the
  `.text-*` scale; use `success`/`warning`/`primary` tokens rather than
  hardcoded Tailwind colors.
- **Secrets never get committed.** `.env`, `*.env`, and `pesapal.env` are
  git-ignored. Add new config to `env.example` with placeholder values only.

## Adding a database migration

Migrations are numbered files in `backend/migrations` and run via sequelize-cli
(config resolved through `.sequelizerc` → `config/config.js`).

```bash
cd backend
# create migrations/046-your-change.js following the existing CommonJS pattern
npm run migrate            # apply
npm run migrate:undo       # revert the last one
```

Make migrations **idempotent** where practical (guard with `describeTable` /
try-catch), as migration 043 and 045 do.

## Git workflow
- Branch off `main`; use descriptive names (`feat/…`, `fix/…`, `perf/…`).
- Write focused commits with a clear subject and body explaining *why*.
- Before opening a PR: `npm run build` (frontend) and `npm test` (backend) pass.

## Testing
- Backend uses Jest (`backend/tests`). Run `npm test` in `backend/`.
- There is no frontend test suite yet — typecheck + build is the current gate.
  Adding component/e2e tests (Vitest + Testing Library / Playwright) is welcome.
