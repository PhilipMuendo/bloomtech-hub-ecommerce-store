# Bloomtech Hub Deployment Guide

This guide will walk you through deploying your e-commerce platform to your VPS with cPanel.

## Prerequisites

- VPS with root access (2vCPU/4GB RAM)
- cPanel access
- Domain: bloomtechub.com
- Custom domain emails configured
- MySQL database created in cPanel

## Step 1: Prepare Your Local Environment

### 1.1 Update Frontend Configuration

Before deploying, we need to update the frontend to use your production domain:

1. Open `src/vite.config.ts` and update the server configuration:
```typescript
export default defineConfig({
  // ... other config
  server: {
    proxy: {
      '/api': {
        target: 'https://bloomtechub.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
```

2. Update `src/context/AuthContext.tsx` to use HTTPS:
```typescript
const response = await fetch('https://bloomtechub.com/api/auth/login', {
  // ... rest of the code
});
```

### 1.2 Generate Production Build

```bash
# In the project root
npm run build
```

## Step 2: Access Your VPS

### 2.1 Connect via SSH

```bash
ssh root@your-vps-ip
```

### 2.2 Update System

```bash
# Update package list
apt update && apt upgrade -y

# Install required packages
apt install -y curl wget git nginx mysql-client
```

## Step 3: Install Node.js

### 3.1 Install Node.js 18.x

```bash
# Download and install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3.2 Install PM2

```bash
npm install -g pm2
```

## Step 4: Setup Database

### 4.1 Create Database in cPanel

1. Log into cPanel
2. Go to "MySQL Databases"
3. Create a new database (e.g., `bloomtech_db`)
4. Create a database user
5. Assign the user to the database with all privileges
6. Note down the database credentials

### 4.2 Test Database Connection

```bash
mysql -h localhost -u your_db_user -p your_db_name
```

## Step 5: Upload Your Code

### 5.1 Upload via Git (Recommended)

```bash
# On your VPS
cd /home/username/public_html
git clone https://github.com/your-username/bloomtech-hub-ecommerce-store.git
cd bloomtech-hub-ecommerce-store
```

### 5.2 Or Upload via FTP/SFTP

Upload your entire project folder to `/home/username/public_html/`

## Step 6: Configure Environment Variables

### 6.1 Create Production Environment File

```bash
cd /home/username/public_html/bloomtech-hub-ecommerce-store
cp production.env.example backend/.env
nano backend/.env
```

### 6.2 Update with Your Values

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_actual_db_username
DB_PASSWORD=your_actual_db_password
DB_NAME=your_actual_db_name
DB_PORT=3306

# JWT Configuration (generate a strong secret)
JWT_SECRET=your-super-secure-jwt-secret-key-here-make-it-long-and-random

# Email Configuration
SMTP_HOST=mail.bloomtechub.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@bloomtechub.com
SMTP_PASS=your_email_password
SMTP_FROM=noreply@bloomtechub.com

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL
FRONTEND_URL=https://bloomtechub.com

# Admin Email
ADMIN_EMAIL=admin@bloomtechub.com
```

## Step 7: Setup Database Schema

### 7.1 Run Migrations

```bash
cd backend
npm install
npx sequelize-cli db:migrate
```

### 7.2 Seed Initial Data

```bash
npx sequelize-cli db:seed:all
```

### 7.3 Create Super Admin

```bash
node scripts/create-fresh-superadmin.js
```

## Step 8: Build Frontend

### 8.1 Install Dependencies and Build

```bash
cd /home/username/public_html/bloomtech-hub-ecommerce-store
npm install
cd src
npm install
npm run build
cd ..
mkdir -p frontend-dist
cp -r src/dist/* frontend-dist/
```

## Step 9: Configure Nginx

### 9.1 Update Nginx Configuration

```bash
# Copy the nginx configuration
cp nginx.conf /etc/nginx/sites-available/bloomtechub.com

# Update the path in the config file
sed -i 's|/home/username/public_html|/home/your_actual_username/public_html|g' /etc/nginx/sites-available/bloomtechub.com

# Enable the site
ln -s /etc/nginx/sites-available/bloomtechub.com /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Reload nginx
systemctl reload nginx
```

## Step 10: Setup SSL Certificate

### 10.1 Using cPanel SSL

1. Log into cPanel
2. Go to "SSL/TLS"
3. Install SSL certificate for bloomtechub.com
4. Enable "Force HTTPS Redirect"

### 10.2 Or Using Let's Encrypt

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d bloomtechub.com -d www.bloomtechub.com
```

## Step 11: Deploy Applications

### 11.1 Make Deploy Script Executable

```bash
chmod +x deploy.sh
```

### 11.2 Run Deployment

```bash
./deploy.sh
```

### 11.3 Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs bloomtech-backend
pm2 logs bloomtech-frontend

# Test the application
curl https://bloomtechub.com/health
```

## Step 12: Setup File Permissions

### 12.1 Set Proper Permissions

```bash
# Set ownership
chown -R www-data:www-data /home/username/public_html/bloomtech-hub-ecommerce-store

# Set permissions for uploads directory
chmod -R 755 /home/username/public_html/bloomtech-hub-ecommerce-store/backend/public
```

## Step 13: Test Your Application

### 13.1 Test Frontend

Visit: https://bloomtechub.com

### 13.2 Test Backend API

```bash
curl https://bloomtechub.com/api/products
```

### 13.3 Test Admin Login

Use the super admin credentials:
- Email: muendophilip10@gmail.com
- Password: SuperSecure@123

## Step 14: Monitoring and Maintenance

### 14.1 PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs

# Restart applications
pm2 restart all

# Stop applications
pm2 stop all

# Start applications
pm2 start all
```

### 14.2 Nginx Commands

```bash
# Test configuration
nginx -t

# Reload configuration
systemctl reload nginx

# Restart nginx
systemctl restart nginx
```

### 14.3 Database Backup

```bash
# Create backup script
nano /home/username/backup_db.sh
```

Add this content:
```bash
#!/bin/bash
mysqldump -u your_db_user -p your_db_name > /home/username/backups/bloomtech_$(date +%Y%m%d_%H%M%S).sql
```

## Troubleshooting

### Common Issues

1. **Port 5000 not accessible**
   - Check if firewall is blocking the port
   - Verify PM2 is running: `pm2 status`

2. **Database connection failed**
   - Verify database credentials in `.env`
   - Check if MySQL is running: `systemctl status mysql`

3. **SSL certificate issues**
   - Check certificate installation in cPanel
   - Verify domain DNS settings

4. **File upload issues**
   - Check directory permissions
   - Verify upload path in configuration

### Log Locations

- PM2 logs: `pm2 logs`
- Nginx logs: `/var/log/nginx/`
- Application logs: `./logs/`

## Security Checklist

- [ ] SSL certificate installed
- [ ] Strong JWT secret configured
- [ ] Database credentials secured
- [ ] File permissions set correctly
- [ ] Firewall configured
- [ ] Regular backups scheduled
- [ ] Monitoring set up

## Support

If you encounter any issues during deployment, check:
1. PM2 logs: `pm2 logs`
2. Nginx logs: `tail -f /var/log/nginx/error.log`
3. Application logs in the `logs/` directory

Your Bloomtech Hub e-commerce platform should now be live at https://bloomtechub.com!
