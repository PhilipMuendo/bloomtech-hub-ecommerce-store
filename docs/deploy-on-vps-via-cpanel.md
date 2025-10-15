## Deploying BloomTech Hub Ecommerce on a Self‑Managed VPS via cPanel

This guide is tailored for this repository: React + Vite frontend (TypeScript) in the repo root and Node.js/Express + MySQL backend in `backend/`. We will deploy on a VPS with cPanel/WHM, serve the frontend via Apache from `public_html`, run the backend with PM2 on port 5000, and proxy `/api` from Apache to the backend.

### Prerequisites
- **VPS with cPanel/WHM** installed and licensed
- **Root or reseller access** to WHM (preferred) or at least cPanel access for the target account
- A **registered domain** (e.g., `example.com`)
- Basic familiarity with SSH/SFTP and your app’s build/start steps

### High-Level Flow (This Project)
1. Point your domain’s DNS to the VPS
2. Create a cPanel account (or use an existing one)
3. Upload this repo and install dependencies
4. Build frontend and place artifacts in `public_html/`
5. Configure backend env vars and start it with PM2 on port 5000
6. Configure Apache to proxy `/api` to `http://127.0.0.1:5000`
6. Enable SSL (HTTPS)
7. Configure database (if applicable)
8. Test and harden security

---

## 1) DNS and Domain

- In your domain registrar, set nameservers to the VPS’s nameservers (provided by your WHM) or create A records to point to the VPS public IP:
  - `@` (root/apex) → VPS_IP
  - `www` → VPS_IP
- Propagation can take 5–60 minutes (sometimes up to 24 hours).

## 2) Create or Use a cPanel Account

Using WHM (root/reseller):
- WHM → Account Functions → Create a New Account
- Choose primary domain (e.g., `example.com`), username, and package
- Log in to that account’s cPanel once created

If you already have a cPanel account for the domain, just log in to cPanel.

## 3) Upload the Repo and Install Dependencies

Option A — Upload via Git in cPanel (if enabled):
- cPanel → Git Version Control → Create → Enter repo URL → Clone into `~/bloomtech`

Option B — Upload via SFTP/File Manager:
- Upload the repository zip → Extract into home (for example `~/bloomtech-hub-ecommerce-store`)

Install dependencies:
1. cPanel → Terminal or SSH into the cPanel user
2. Navigate to the project root:
   ```bash
   cd ~/bloomtech-hub-ecommerce-store
   npm install
   cd backend && npm install && cd ..
   ```

## 4) Build and Publish the Frontend

1. From the project root, build the Vite app:
   ```bash
   npm run build
   ```
   This creates `dist/` in the repo root.
2. In cPanel → File Manager, set your domain’s document root to `public_html/`
3. Upload/copy the contents of `dist/` into `public_html/` (so `index.html` is directly inside `public_html/`)

Alternative using `ecosystem.config.js` frontend app: the repo includes a PM2 config to serve `frontend-dist` with `serve`. If you prefer this method, copy `dist/` to `frontend-dist/` and start the PM2 app `bloomtech-frontend`. We recommend Apache serving from `public_html/` for simplicity.

## 4) Organize Domains, Subdomains, and Document Roots

- cPanel → Domains → Create subdomains like `app.example.com`
- Assign each domain/subdomain a document root or application URL target
- For Node via cPanel App, use the “Application URL” dropdown; for PM2, use reverse proxy/vhost rules to direct the domain to your app port

## 5) Backend Environment Variables and Secrets

- Put the backend `.env` in `backend/.env`. Use the sample block below (see also `README.md`). Replace values for your server and domains:

```env
# Database
DB_HOST=localhost
DB_USER=cpanel_mysql_user
DB_PASSWORD=strong_password
DB_NAME=bloomtech_db
DB_TEST_NAME=bloomtech_db_test

# JWT
JWT_SECRET=your_jwt_secret

# Server
PORT=5000
NODE_ENV=production

# Email (example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# M-Pesa
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=...
MPESA_PASSKEY=...
MPESA_CALLBACK_URL=https://your-domain.com/api/payments/mpesa/callback

# Pesapal
PESAPAL_CONSUMER_KEY=...
PESAPAL_CONSUMER_SECRET=...
PESAPAL_CALLBACK_URL=https://your-domain.com/api/payments/pesapal/callback
```

Never commit secrets to git. Ensure file permissions restrict access to your user.

## 6) Start the Backend with PM2

We will use PM2 to run `backend/server.js` on port 5000.

Option A — Using the included PM2 ecosystem file:
```bash
cd ~/bloomtech-hub-ecommerce-store
npm install -g pm2 serve
pm2 start ecosystem.config.js
pm2 save
```
This will start two apps if you copied `dist/` to `frontend-dist/`: `bloomtech-backend` (port 5000) and `bloomtech-frontend` (static server on port 3000). If you are serving frontend via `public_html`, you can comment out or ignore the frontend app in `ecosystem.config.js`.

Option B — Manual PM2 start for backend only:
```bash
cd ~/bloomtech-hub-ecommerce-store/backend
pm2 start server.js --name bloomtech-backend --env production
pm2 save
```

Make PM2 start on reboot (if you have root/sudo):
```bash
pm2 startup
# follow the printed instruction to run the generated command
pm2 save
```

## 7) Configure Apache Reverse Proxy for /api

With the frontend in `public_html`, add an `.htaccess` in `public_html/` to proxy API calls to the backend:

```apache
RewriteEngine On

# Proxy /api to Node backend on 127.0.0.1:5000
RewriteCond %{REQUEST_URI} ^/api [NC]
RewriteRule ^(.*)$ http://127.0.0.1:5000/$1 [P,L]

# For single page app routing (optional)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

If proxying is restricted by server configuration, ask your host to enable proxy or set up a vhost include via WHM to proxy `/api` to `127.0.0.1:5000`.

## 8) SSL (HTTPS)

- cPanel → SSL/TLS Status → Run AutoSSL (uses Sectigo or Let’s Encrypt)
- Ensure domains and subdomains resolve to the VPS IP before running AutoSSL
- Force HTTPS redirection:
  - cPanel → Domains → Force HTTPS Redirect
  - Or use `.htaccess` redirect rules

## 9) Databases (MySQL + Sequelize)

- cPanel → MySQL Databases
  - Create database, user, and grant privileges
- cPanel → phpMyAdmin to import schema/data
- App configuration:
  - Backend uses `backend/.env` (see above)
  - Initialize schema/data using provided scripts:
    ```bash
    cd ~/bloomtech-hub-ecommerce-store/backend
    npm run db:setup
    npm run migrate
    npm run db:seed
    ```

## 10) File Upload Options

- cPanel → File Manager: drag-and-drop archives, then “Extract”
- SFTP: use your cPanel username/password or SSH key
- Git Version Control (if enabled): connect your repo and deploy to a directory

## 11) Logs and Debugging

- Apache logs: cPanel → Metrics → Errors, or `/usr/local/apache/logs/` (root)
- PM2 backend: `pm2 logs bloomtech-backend`
- If using `ecosystem.config.js`, logs are also written under `./logs/`

Payment webhooks: ensure the callback URLs in `.env` match your live domain and that `/api` proxying works over HTTPS.

## 12) Security and Hardening

- Keep system and app dependencies updated
- Use strong cPanel and SSH credentials; disable password SSH and use keys if possible
- Configure a firewall (CSF/ufw) and only open required ports
- Enable automatic SSL renewal (AutoSSL handles this)

## 13) Zero-Downtime Deploys (Optional)

- Node with PM2:
  ```bash
  pm2 start server.js --name myapp --update-env
  pm2 reload myapp
  ```
- Blue/Green: deploy to a new directory, swap the document root/symlink, then reload

## Quick Checklists

### Quick Checklist for This Project
- Build frontend: `npm run build`
- Copy `dist/` to `public_html/`
- Create MySQL DB/user; update `backend/.env`
- Start backend with PM2 on port 5000
- Add `.htaccess` in `public_html/` to proxy `/api` → `127.0.0.1:5000`
- Run AutoSSL and force HTTPS

---

## Troubleshooting (Project-Specific)

- Domain not resolving: check DNS A records and propagation
- 404s on SPA routes: ensure `.htaccess` SPA rewrite is present
- API 502/timeout: PM2 app down or port blocked; `pm2 status` and `pm2 logs`
- 404 on webhooks: confirm `MPESA_CALLBACK_URL`/`PESAPAL_CALLBACK_URL` use your live `https://your-domain.com/api/...`
- CORS issues locally: production should route via same domain; avoid mixing ports

---

## Useful Commands for This Repo

```bash
# Frontend build
npm ci
npm run build

# Backend setup
cd backend
npm ci
npm run db:setup
npm run migrate
npm run db:seed
pm2 start server.js --name bloomtech-backend
pm2 logs bloomtech-backend
pm2 save
```


