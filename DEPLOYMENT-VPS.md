# Deployment Plan — Self-Hosted VPS

Step-by-step guide to deploying BloomTech Hub on a self-managed VPS using Docker
Compose, with TLS, backups, and a safe update process.

The stack (nginx-served frontend + Express API + MySQL + Redis) is defined in
[`docker-compose.yml`](docker-compose.yml). The frontend container publishes
port `8080`; a host-level reverse proxy terminates HTTPS in front of it.

---

## 0. Prerequisites
- A VPS (Ubuntu 22.04+ recommended). **Minimum** 2 vCPU / 4 GB RAM / 40 GB SSD
  for the full stack incl. MySQL.
- A domain name with DNS **A/AAAA records** pointing at the VPS IP.
- SSH access as a sudo-capable user.

## 1. Server preparation

```bash
# as root or sudo
apt update && apt upgrade -y

# Create a non-root deploy user
adduser deploy && usermod -aG sudo deploy

# Install Docker Engine + Compose plugin
curl -fsSL https://get.docker.com | sh
usermod -aG docker deploy

# Firewall: allow SSH + HTTP + HTTPS only
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable
```

Log back in as `deploy` for the remaining steps.

## 2. Get the code and configure

```bash
git clone <your-repo-url> bloomtech && cd bloomtech

cp .env.docker.example .env
```

Edit `.env` and set **strong, unique** values:
- `DB_PASS`, `DB_ROOT_PASSWORD`
- `JWT_SECRET` (long random string: `openssl rand -hex 32`)
- `FRONTEND_URL` / `BACKEND_URL` → `https://your-domain.com`
- `SMTP_*` and `PESAPAL_*` (use **live** Pesapal credentials + real callback URL)

> Never commit `.env`. Confirm `git status` shows it ignored.

## 3. Build and start

```bash
docker compose up -d --build
docker compose ps            # all services healthy?
```

## 4. Initialize the database

```bash
# Run migrations (first deploy and after every release with new migrations)
docker compose exec backend npx sequelize-cli db:migrate

# Optional: seed reference data
docker compose exec backend npm run db:seed
```

Create the first admin per the app's bootstrap (set `FIRST_ADMIN_*` env vars if
supported, or promote a registered user directly in the DB).

At this point the site answers on `http://<vps-ip>:8080`. Do **not** expose it
like this publicly — put TLS in front (next step).

## 5. HTTPS with a reverse proxy (Caddy — simplest)

Caddy auto-provisions and renews Let's Encrypt certificates.

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
# (follow caddyserver.com/docs/install for the apt repo, then:)
sudo apt install caddy
```

`/etc/caddy/Caddyfile`:
```
your-domain.com, www.your-domain.com {
    encode gzip
    reverse_proxy localhost:8080
}
```

```bash
sudo systemctl reload caddy
```

Caddy now serves HTTPS and forwards to the frontend container, which proxies
`/api` and `/public` to the backend. Enable HSTS in the Caddyfile once you're
confident the domain is HTTPS-only.

> Prefer nginx? Use `certbot --nginx` and `proxy_pass http://localhost:8080;`
> — the reference in `deployment/nginx.conf` shows the headers to set.

## 6. Backups (do this before launch, not after)

MySQL data lives in the `mysql_data` volume. Schedule daily dumps:

```bash
# /home/deploy/backup-db.sh
#!/usr/bin/env bash
set -euo pipefail
STAMP=$(date +%F_%H%M)
docker compose -f /home/deploy/bloomtech/docker-compose.yml exec -T db \
  sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' \
  | gzip > /home/deploy/backups/db_$STAMP.sql.gz
find /home/deploy/backups -name 'db_*.sql.gz' -mtime +14 -delete
```
```bash
mkdir -p /home/deploy/backups && chmod +x /home/deploy/backup-db.sh
crontab -e   # add:  0 2 * * *  /home/deploy/backup-db.sh
```

Also back up the `uploads` volume (product/blog images):
```bash
docker run --rm -v bloomtech_uploads:/data -v /home/deploy/backups:/backup \
  alpine tar czf /backup/uploads_$(date +%F).tar.gz -C /data .
```
Copy backups off-box (rsync/S3) regularly — a backup on the same VPS is not a backup.

## 7. Updating (releases)

```bash
cd /home/deploy/bloomtech
git pull
docker compose up -d --build            # rebuild changed images
docker compose exec backend npx sequelize-cli db:migrate   # if new migrations
docker compose ps
```
For safety, take a DB backup (step 6) immediately before migrating. Roll back a
bad release with `git checkout <previous-tag>` + rebuild; restore the DB from the
pre-migration dump if a migration must be reverted (`migrate:undo`).

## 8. Monitoring & logs

```bash
docker compose logs -f backend          # API logs (winston/morgan)
docker compose logs -f frontend         # nginx access/error
docker stats                            # resource usage
```
Recommended additions: an uptime monitor hitting `/health`, log shipping, and
Sentry (see SCALING.md → Observability).

## 9. Renaming the uploads path (optional, removes the "lovable" URL fingerprint)

Deferred from code because existing image URLs are stored in the DB — do it as a
deliberate, backed-up operation:

1. Back up the DB and the `uploads` volume (step 6).
2. In `backend/routes/uploadRoutes.js` and `backend/server.js`, change
   `public/lovable-uploads` → `public/uploads` (upload dir + generated URLs +
   static dir).
3. **Keep serving the old path too** for a transition period:
   `app.use('/public/lovable-uploads', express.static(pathToNewDir))` so
   existing links don't 404.
4. Update the compose `uploads` volume mount and the backend Dockerfile `mkdir`
   to the new path; move existing files into it.
5. Rewrite stored URLs with a migration:
   `UPDATE products SET imageUrl = REPLACE(imageUrl,'/lovable-uploads/','/uploads/');`
   (repeat for any other table storing image URLs, e.g. blogs).
6. Rebuild, migrate, verify images load, then retire the compatibility alias.

---

## Launch checklist
- [ ] `.env` has strong secrets; **Pesapal keys rotated** (see SECURITY.md)
- [ ] `docker compose ps` all healthy; migrations applied
- [ ] HTTPS working; HTTP→HTTPS redirect; HSTS on
- [ ] First admin created; role gating verified
- [ ] DB + uploads backups scheduled and copied off-box
- [ ] Checkout + payment tested end-to-end with live Pesapal
- [ ] Verification / password-reset emails deliver
- [ ] `npm audit` criticals addressed (see SECURITY.md)
- [ ] Uptime monitor + error tracking live
