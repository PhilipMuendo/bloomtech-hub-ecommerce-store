# Backend Deployment Guide for VPS (CentOS/WHM)

This guide provides step-by-step instructions for deploying the BLOOMTECH Hub backend to a VPS running CentOS with WHM/cPanel.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [MySQL Database Setup](#mysql-database-setup)
4. [Backend Deployment](#backend-deployment)
5. [PM2 Process Manager](#pm2-process-manager)
6. [Nginx Reverse Proxy (Optional)](#nginx-reverse-proxy-optional)
7. [SSL Certificate Setup](#ssl-certificate-setup)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:
- Root or sudo access to your VPS
- SSH access to the server
- Domain name pointed to your server IP
- Basic knowledge of Linux command line

---

## Server Setup

### 1. Update System Packages

```bash
sudo yum update -y
sudo yum install -y epel-release
```

### 2. Install Node.js (v18 or higher)

```bash
# Install Node.js 18.x LTS
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install Git

```bash
sudo yum install -y git

# Verify installation
git --version
```

### 4. Install PM2 Globally

```bash
sudo npm install -g pm2

# Verify installation
pm2 --version
```

---

## MySQL Database Setup

### 1. Access MySQL (via WHM/cPanel or SSH)

**Option A: Using WHM/cPanel**
1. Log in to WHM/cPanel
2. Navigate to "MySQL Databases"
3. Create a new database and user (see steps below)

**Option B: Using SSH**

```bash
# Log in to MySQL as root
mysql -u root -p
```

### 2. Create Database

```sql
-- Create the database
CREATE DATABASE sirphilip_bloomtech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Create Database User

```sql
-- Create user with password
CREATE USER 'sirphilip_bloomtech_user'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON sirphilip_bloomtech_db.* TO 'sirphilip_bloomtech_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Verify user creation
SELECT User, Host FROM mysql.user WHERE User = 'sirphilip_bloomtech_user';

-- Exit MySQL
EXIT;
```

### 4. Test Database Connection

```bash
mysql -u sirphilip_bloomtech_user -p sirphilip_bloomtech_db
# Enter password when prompted
# If successful, you'll see the MySQL prompt
EXIT;
```

---

## Backend Deployment

### 1. Navigate to Deployment Directory

```bash
# Create deployment directory if it doesn't exist
sudo mkdir -p /var/www/bloomtech
cd /var/www/bloomtech
```

### 2. Clone Repository

```bash
# Clone your repository (replace with your actual repo URL)
sudo git clone https://github.com/yourusername/bloomtech-hub-ecommerce-store.git .

# Or if already cloned, pull latest changes
sudo git pull origin main
```

### 3. Navigate to Backend Directory

```bash
cd backend
```

### 4. Install Dependencies

```bash
# Install production dependencies
npm install --production

# Or install all dependencies if you need dev tools
npm install
```

### 5. Configure Environment Variables

```bash
# Create .env file
nano .env
```

**Copy and configure the following (replace values with your actual credentials):**

```env
# Database Configuration
DB_HOST=localhost
DB_USER=sirphilip_bloomtech_user
DB_PASS=YOUR_SECURE_PASSWORD
DB_NAME=sirphilip_bloomtech_db
DB_DIALECT=mysql
DB_PORT=3306

# JWT Configuration
JWT_SECRET=YOUR_LONG_RANDOM_SECRET_KEY_HERE

# Server Configuration
PORT=5000
NODE_ENV=production

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=your-email@gmail.com

# Admin Email
ADMIN_EMAIL=admin@bloomtechub.com

# Pesapal Configuration
PESAPAL_CONSUMER_KEY="your-pesapal-consumer-key"
PESAPAL_CONSUMER_SECRET="your-pesapal-consumer-secret"
PESAPAL_CALLBACK_URL="https://bloomtechub.com/api/payments/pesapal/callback"
PESAPAL_API_ENDPOINT="https://pay.pesapal.com/v3/api"
BACKEND_URL="https://bloomtechub.com"
FRONTEND_URL="https://bloomtechub.com"

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://bloomtechub.com/api/auth/google/callback

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./public/lovable-uploads
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

### 6. Set Proper Permissions

```bash
# Set ownership
sudo chown -R $USER:$USER /var/www/bloomtech

# Set permissions
chmod 600 .env
chmod -R 755 public
```

### 7. Run Database Migrations

```bash
# Run migrations to create database tables
npm run migrate

# Optional: Seed initial data
npm run db:seed
```

### 8. Test the Application

```bash
# Test run the application
node server.js

# You should see:
# === Database Configuration ===
# Environment: production
# Host: localhost
# User: sirphilip_bloomtech_user
# Database: sirphilip_bloomtech_db
# Port: 3306
# ==============================
# ✓ Database connection established successfully
# ==============================
# ✓ Server running on port 5000
# ✓ Environment: production
# ==============================

# Press Ctrl+C to stop
```

---

## PM2 Process Manager

### 1. Start Application with PM2

```bash
# Start the application using ecosystem.config.cjs
pm2 start ecosystem.config.cjs

# Check status
pm2 status

# View logs
pm2 logs backend

# View real-time logs
pm2 logs backend --lines 50
```

### 2. Configure PM2 Startup

```bash
# Generate startup script
pm2 startup

# Copy and run the command that PM2 outputs
# It will look something like:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u yourusername --hp /home/yourusername

# Save current PM2 process list
pm2 save
```

### 3. Useful PM2 Commands

```bash
# Restart application
pm2 restart backend

# Restart with updated environment variables
pm2 restart backend --update-env

# Stop application
pm2 stop backend

# Delete from PM2
pm2 delete backend

# Monitor resources
pm2 monit

# View detailed info
pm2 info backend

# Clear logs
pm2 flush
```

---

## Nginx Reverse Proxy (Optional)

If you want to use Nginx as a reverse proxy (recommended for production):

### 1. Install Nginx

```bash
sudo yum install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/conf.d/bloomtech.conf
```

**Add the following configuration:**

```nginx
server {
    listen 80;
    server_name bloomtechub.com www.bloomtechub.com;

    # Redirect HTTP to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Serve static files
    location /public {
        alias /var/www/bloomtech/backend/public;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Frontend (if serving from same server)
    location / {
        root /var/www/bloomtech/frontend-dist;
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. Test and Reload Nginx

```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

---

## SSL Certificate Setup

### Using Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d bloomtechub.com -d www.bloomtechub.com

# Follow the prompts to:
# 1. Enter your email
# 2. Agree to terms
# 3. Choose whether to redirect HTTP to HTTPS (recommended: yes)

# Test auto-renewal
sudo certbot renew --dry-run

# Certbot will automatically renew certificates before expiry
```

### After SSL Setup

Update your `.env` file to use HTTPS URLs:

```bash
nano .env
```

Ensure these are using `https://`:
```env
PESAPAL_CALLBACK_URL="https://bloomtechub.com/api/payments/pesapal/callback"
BACKEND_URL="https://bloomtechub.com"
FRONTEND_URL="https://bloomtechub.com"
GOOGLE_REDIRECT_URI=https://bloomtechub.com/api/auth/google/callback
```

Restart the backend:
```bash
pm2 restart backend --update-env
```

---

## Troubleshooting

### Database Connection Issues

**Problem:** "Database authentication failed"

**Solutions:**
1. Verify database credentials in `.env`
2. Check MySQL user exists and has correct permissions:
   ```bash
   mysql -u root -p
   SELECT User, Host FROM mysql.user WHERE User = 'sirphilip_bloomtech_user';
   SHOW GRANTS FOR 'sirphilip_bloomtech_user'@'localhost';
   ```
3. Test connection manually:
   ```bash
   mysql -u sirphilip_bloomtech_user -p sirphilip_bloomtech_db
   ```

### Port Already in Use

**Problem:** "Port 5000 is already in use"

**Solutions:**
1. Check what's using the port:
   ```bash
   sudo lsof -i :5000
   ```
2. Kill the process or change PORT in `.env`

### PM2 Not Starting

**Problem:** Application crashes on PM2 start

**Solutions:**
1. Check PM2 logs:
   ```bash
   pm2 logs backend --lines 100
   ```
2. Verify environment variables are loaded:
   ```bash
   pm2 env backend
   ```
3. Test running directly:
   ```bash
   node server.js
   ```

### Environment Variables Not Loading

**Problem:** Environment variables are undefined

**Solutions:**
1. Verify `.env` file exists in backend directory:
   ```bash
   ls -la .env
   ```
2. Check file permissions:
   ```bash
   chmod 600 .env
   ```
3. Restart PM2 with update-env:
   ```bash
   pm2 restart backend --update-env
   ```

### Nginx 502 Bad Gateway

**Problem:** Nginx shows 502 error

**Solutions:**
1. Check if backend is running:
   ```bash
   pm2 status
   ```
2. Verify backend port matches Nginx config (default: 5000)
3. Check Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```
4. Ensure firewall allows connections:
   ```bash
   sudo firewall-cmd --permanent --add-service=http
   sudo firewall-cmd --permanent --add-service=https
   sudo firewall-cmd --reload
   ```

### File Upload Issues

**Problem:** File uploads failing

**Solutions:**
1. Create upload directory:
   ```bash
   mkdir -p public/lovable-uploads
   ```
2. Set proper permissions:
   ```bash
   chmod -R 755 public
   ```
3. Check disk space:
   ```bash
   df -h
   ```

---

## Maintenance Commands

### Update Application

```bash
cd /var/www/bloomtech/backend
git pull origin main
npm install --production
npm run migrate
pm2 restart backend --update-env
```

### Backup Database

```bash
# Create backup
mysqldump -u sirphilip_bloomtech_user -p sirphilip_bloomtech_db > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u sirphilip_bloomtech_user -p sirphilip_bloomtech_db < backup_20231203.sql
```

### Monitor Server Resources

```bash
# CPU and Memory usage
pm2 monit

# Disk usage
df -h

# System resources
top
```

---

## Security Checklist

- [ ] Strong database password set
- [ ] `.env` file permissions set to 600
- [ ] Firewall configured (only necessary ports open)
- [ ] SSL certificate installed
- [ ] Regular backups scheduled
- [ ] PM2 startup script configured
- [ ] Nginx security headers configured
- [ ] Database user has minimal required permissions
- [ ] Server packages regularly updated

---

## Support

For issues or questions:
- Check the troubleshooting section above
- Review PM2 logs: `pm2 logs backend`
- Review Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check application logs in `backend/logs/`

---

**Last Updated:** December 3, 2025
