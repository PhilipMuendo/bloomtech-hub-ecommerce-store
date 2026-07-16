# Scaling Guide

The app currently runs as a single backend instance. This document is the
roadmap for handling growth, ordered by impact. Redis is already part of the
compose stack (`docker-compose.yml`) so the shared-state items below can be
wired up immediately.

## Prerequisites for running >1 backend instance

Before you can put multiple backend replicas behind a load balancer, three
pieces of per-process state must be externalized. Until then, scale **vertically**
(bigger VPS) only.

### 1. Redis-backed rate limiting (blocker)

`express-rate-limit` uses an in-memory store by default, so each process counts
independently — useless across replicas or PM2 cluster workers.

```bash
cd backend && npm install rate-limit-redis ioredis
```

```js
// backend/middleware/security.js
import { RateLimiterMemory } from 'express-rate-limit'; // existing import stays
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);   // REDIS_URL is set in compose

const store = process.env.REDIS_URL
  ? new RedisStore({ sendCommand: (...args) => redis.call(...args) })
  : undefined; // falls back to memory in local dev without Redis

// add `store` to each limiter, e.g.:
export const apiRateLimiter = rateLimit({ windowMs: 60_000, max: 100, store });
```

### 2. Shared uploads (blocker)

Uploads are written to the backend's local disk (`public/lovable-uploads`).
- **Single VPS, multiple containers**: the compose `uploads` named volume is
  already shared — mount it on every backend replica. Sufficient for one host.
- **Multiple hosts / true scale-out**: move to object storage (S3 / Cloudflare R2
  / self-hosted MinIO) + CDN. Replace the multer `diskStorage` in
  `backend/routes/uploadRoutes.js` with `multer-s3`, and store the returned
  object URL. Serve via the bucket/CDN, not the app server.

### 3. Stateless sessions
Auth is already stateless (JWT), so no server-side session store is needed. Keep
it that way — don't introduce in-memory caches keyed to a single process.

## Database (the first real bottleneck)

### Connection pool
`sequelize_models/config.js` sets no pool, so Sequelize defaults to max 5
connections. Tune per environment:

```js
production: {
  // ...existing...
  pool: { max: 20, min: 2, acquire: 30000, idle: 10000 },
}
```

### Reads and indexes
- Catalog/read traffic dominates e-commerce — add **read replicas** and route
  read queries to them (Sequelize read/write replication config).
- Keep adding indexes as query patterns emerge (product indexes: migration 045).
- Audit Sequelize `include`s for **N+1 queries**; prefer eager loading with
  explicit `attributes` to avoid over-fetching.

### Search
Product search still uses `LIKE '%term%'` (un-indexable leading wildcard). At
scale, add a `FULLTEXT(name, description)` index and switch to `MATCH … AGAINST`,
or offload to a search engine (Meilisearch/OpenSearch) if search becomes central.

## Caching
- **CDN** in front of the frontend and product images — the biggest, cheapest
  latency win.
- **Server cache** for anonymous catalog responses (`GET /api/products`) in Redis
  with a short TTL, invalidated on product writes. The frontend already caches
  client-side via TanStack Query.
- Add `Cache-Control` headers to cacheable GETs so the CDN can edge-cache them.

## Background jobs
Email is sent inline in the request (`campaignController`, now BCC-batched). For
large lists this should move to a **queue** so requests return immediately:

```bash
cd backend && npm install bullmq ioredis
```
Enqueue send jobs on the API side; run a **separate worker process** (its own
container / PM2 app) that consumes the queue and sends via nodemailer with
retry/backoff. Reuse the same Redis. Good candidates for the queue: campaign
sends, order-confirmation emails, report generation.

## Observability
- Structured logs already via winston + request ids; ship them to a central
  store (Loki/ELK).
- Add a **readiness** probe (DB + Redis reachable) distinct from liveness
  (`/health`), and metrics (Prometheus/Grafana).
- Add error tracking (Sentry) on both frontend and backend.

## Deploy pipeline
- CI running `npm run typecheck`, `npm audit`, and backend tests on every PR.
- Run migrations as an explicit, gated deploy step (see DEPLOYMENT-VPS.md).
- Blue/green or rolling deploys once multiple replicas exist.

## Suggested sequence
1. Redis rate-limit store + DB connection pool (unblock + stabilize).
2. CDN for static assets and images.
3. Object storage for uploads (when going multi-host).
4. Email/report queue with a worker.
5. Read replicas + server-side catalog cache.
