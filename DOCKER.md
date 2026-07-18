# Docker Deployment

Runs the whole stack — MySQL, the Express API, and the nginx-served React
frontend — with one command. Suitable for local testing and the VPS.

## Services

| Service    | Image / build        | Role                                             |
|------------|----------------------|--------------------------------------------------|
| `db`       | `mysql:8.0`          | Database (data persisted in the `mysql_data` volume) |
| `backend`  | `./backend/Dockerfile` | Express API on port 5000 (internal)            |
| `frontend` | `./Dockerfile`       | nginx serving the SPA + proxying `/api`, `/public` |

Only the frontend is published to the host (default `:8080`). It reverse-proxies
`/api` and `/public` to the backend over the internal Docker network, so the
browser only ever talks to one origin (no CORS headaches).

## First run

```bash
cp .env.docker.example .env
# edit .env — set DB_PASS, DB_ROOT_PASSWORD, JWT_SECRET at minimum

docker compose up -d --build

# Apply database migrations (first run and after new migrations).
# sequelize-cli is fetched on demand via npx:
docker compose exec backend npx sequelize-cli db:migrate

# (optional) seed reference/demo data
docker compose exec backend npm run db:seed
```

Open http://localhost:8080 (or `http://<vps-ip>:8080`).

## Common commands

```bash
docker compose logs -f backend      # tail API logs
docker compose ps                   # status
docker compose down                 # stop (keeps volumes/data)
docker compose down -v              # stop and wipe data volumes
docker compose up -d --build        # rebuild after code changes
```

## Notes

- **Secrets**: `.env` is git-ignored. Never commit real credentials.
- **Uploads** (`backend/public/lovable-uploads`) persist in the `uploads` volume.
- **Ports**: change the published port with `FRONTEND_PORT` in `.env`.
- **TLS**: terminate HTTPS at a host-level reverse proxy (Caddy/Traefik/nginx)
  or a load balancer in front of the `frontend` container; the container itself
  serves plain HTTP on port 80.
