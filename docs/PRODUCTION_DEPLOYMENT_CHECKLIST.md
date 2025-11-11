# 🚀 BloomTech Hub Production Deployment Checklist

Complete deployment checklist for https://bloomtechub.com

## 📋 **Pre-Deployment Requirements**

### ✅ **VPS Requirements**
- [ ] VPS with root access (minimum 2vCPU, 4GB RAM)
- [ ] Ubuntu 20.04+ or CentOS 7+
- [ ] Public IP address
- [ ] SSH access configured
- [ ] Firewall configured (ports 22, 80, 443 open)

### ✅ **Domain Configuration**
- [ ] Domain `bloomtechub.com` registered
- [ ] DNS A records configured:
  - [ ] `@` → VPS_IP_ADDRESS
  - [ ] `www` → VPS_IP_ADDRESS
- [ ] DNS propagation verified (use dnschecker.org)
- [ ] Domain resolving to VPS IP

### ✅ **Hosting Provider Setup**
- [ ] cPanel access (if using shared hosting)
- [ ] MySQL database created
- [ ] Database user created with full privileges
- [ ] Email accounts configured (optional)

## 🔧 **VPS Preparation**

### ✅ **System Updates**
```bash
apt update && apt upgrade -y
apt install -y curl wget git nginx mysql-client ufw
```

### ✅ **Node.js Installation**
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Verify installation
node --version  # Should be v18.x.x
npm --version
```

### ✅ **PM2 Installation**
```bash
npm install -g pm2
pm2 startup
```

### ✅ **Firewall Configuration**
```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
```

## 🗄️ **Database Setup**

### ✅ **MySQL Database**
- [ ] Database created: `bloomtech_db`
- [ ] Database user created with full privileges
- [ ] Connection tested from VPS
- [ ] Database credentials documented

### ✅ **Database Connection Test**
```bash
mysql -h localhost -u your_db_user -p your_db_name
# Should connect successfully
```

## 📁 **Code Deployment**

### ✅ **Upload Code to VPS**
```bash
# Method 1: Git Clone (Recommended)
cd /home/username/public_html
git clone https://github.com/your-repo/bloomtech-hub-ecommerce-store.git
cd bloomtech-hub-ecommerce-store

# Method 2: Upload via SFTP/FTP
# Upload entire project folder to /home/username/public_html/
```

### ✅ **Environment Configuration**
```bash
# Copy production environment template
cp backend/.env.production backend/.env

# Edit with actual values
nano backend/.env
```

### ✅ **Required Environment Variables**
- [ ] `DB_HOST=localhost`
- [ ] `DB_USER=your_actual_db_user`
- [ ] `DB_PASSWORD=your_actual_db_password`
- [ ] `DB_NAME=your_actual_db_name`
- [ ] `JWT_SECRET=strong-random-secret`
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL=https://bloomtechub.com`
- [ ] `ADMIN_EMAIL=admin@bloomtechub.com`
- [ ] Email SMTP settings configured

## 🏗️ **Application Setup**

### ✅ **Dependencies Installation**
```bash
# Root dependencies
npm install

# Backend dependencies
cd backend && npm install && cd ..

# Frontend dependencies
cd src && npm install && cd ..
```

### ✅ **Database Migration**
```bash
cd backend
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### ✅ **Create Super Admin**
```bash
cd backend
node scripts/create-fresh-superadmin.js
# Note: Default credentials - muendophilip10@gmail.com / SuperSecure@123
```

### ✅ **Frontend Build**
```bash
cd src
npm run build
cd ..

# Create frontend distribution
mkdir -p frontend-dist
cp -r src/dist/* frontend-dist/
```

## 🌐 **Nginx Configuration**

### ✅ **Install Nginx**
```bash
apt install nginx -y
systemctl enable nginx
systemctl start nginx
```

### ✅ **Configure Nginx**
```bash
# Copy nginx configuration
cp nginx.conf /etc/nginx/sites-available/bloomtechub.com

# Update paths in config file
sed -i 's|/home/username/public_html|/home/your_actual_username/public_html|g' /etc/nginx/sites-available/bloomtechub.com

# Enable site
ln -s /etc/nginx/sites-available/bloomtechub.com /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Reload nginx
systemctl reload nginx
```

## 🔒 **SSL Certificate Setup**

### ✅ **Choose SSL Method**
- [ ] Let's Encrypt (Recommended)
- [ ] cPanel SSL
- [ ] Cloudflare SSL

### ✅ **Let's Encrypt Setup**
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Obtain certificate
certbot --nginx -d bloomtechub.com -d www.bloomtechub.com

# Test auto-renewal
certbot renew --dry-run

# Setup auto-renewal
crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx
```

### ✅ **SSL Verification**
- [ ] Certificate installed successfully
- [ ] HTTPS redirect working
- [ ] SSL Labs test shows A+ rating
- [ ] Certificate auto-renewal configured

## 🚀 **Application Deployment**

### ✅ **Run Deployment Script**
```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### ✅ **PM2 Status Check**
```bash
pm2 status
# Should show both bloomtech-backend and bloomtech-frontend running
```

### ✅ **Application Testing**
```bash
# Test backend API
curl https://bloomtechub.com/api/products

# Test frontend
curl -I https://bloomtechub.com
# Should return 200 OK
```

## 📁 **File Permissions**

### ✅ **Set Proper Permissions**
```bash
# Set ownership
chown -R www-data:www-data /home/username/public_html/bloomtech-hub-ecommerce-store

# Set upload directory permissions
chmod -R 755 /home/username/public_html/bloomtech-hub-ecommerce-store/backend/public
chmod -R 755 /home/username/public_html/bloomtech-hub-ecommerce-store/frontend-dist
```

## 🔍 **Testing & Verification**

### ✅ **Functional Testing**
- [ ] Website loads at https://bloomtechub.com
- [ ] Admin login works (muendophilip10@gmail.com / SuperSecure@123)
- [ ] Product pages load correctly
- [ ] User registration works
- [ ] File uploads work
- [ ] Email functionality works
- [ ] Payment integration works (if configured)

### ✅ **Performance Testing**
- [ ] Page load times acceptable (< 3 seconds)
- [ ] SSL Labs rating A or A+
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility tested

### ✅ **Security Testing**
- [ ] HTTPS enforced on all pages
- [ ] Security headers present
- [ ] No mixed content warnings
- [ ] Admin panel protected
- [ ] File upload security verified

## 📊 **Monitoring Setup**

### ✅ **PM2 Monitoring**
```bash
# Setup PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### ✅ **Log Monitoring**
```bash
# Check application logs
pm2 logs

# Check nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### ✅ **System Monitoring**
```bash
# Monitor system resources
htop
df -h
free -h
```

## 🔄 **Backup Strategy**

### ✅ **Database Backup**
```bash
# Create backup script
nano /home/username/backup_db.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u your_db_user -p your_db_name > /home/username/backups/bloomtech_$DATE.sql
find /home/username/backups/ -name "*.sql" -mtime +7 -delete

# Make executable and add to crontab
chmod +x /home/username/backup_db.sh
crontab -e
# Add: 0 2 * * * /home/username/backup_db.sh
```

### ✅ **Application Backup**
```bash
# Create application backup script
nano /home/username/backup_app.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /home/username/backups/bloomtech_app_$DATE.tar.gz /home/username/public_html/bloomtech-hub-ecommerce-store
find /home/username/backups/ -name "*.tar.gz" -mtime +7 -delete
```

## 🚨 **Troubleshooting Commands**

### ✅ **Common Issues & Solutions**
```bash
# Check PM2 status
pm2 status
pm2 logs bloomtech-backend
pm2 logs bloomtech-frontend

# Restart applications
pm2 restart all

# Check nginx status
systemctl status nginx
nginx -t

# Check database connection
mysql -h localhost -u your_db_user -p your_db_name

# Check SSL certificate
certbot certificates

# Check disk space
df -h

# Check memory usage
free -h
```

## 📋 **Final Verification**

### ✅ **Production Checklist**
- [ ] Website accessible at https://bloomtechub.com
- [ ] WWW redirect working (www.bloomtechub.com → bloomtechub.com)
- [ ] Admin panel accessible and functional
- [ ] All API endpoints responding correctly
- [ ] File uploads working
- [ ] Email notifications working
- [ ] SSL certificate valid and auto-renewing
- [ ] Database backups scheduled
- [ ] Application backups scheduled
- [ ] Monitoring in place
- [ ] Error logs being captured
- [ ] Performance acceptable
- [ ] Security measures in place

## 🎉 **Post-Deployment**

### ✅ **Update Documentation**
- [ ] Update README with production URLs
- [ ] Document admin credentials securely
- [ ] Update any hardcoded URLs in code
- [ ] Document backup procedures

### ✅ **Team Access**
- [ ] Provide admin access to team members
- [ ] Set up monitoring alerts
- [ ] Document maintenance procedures

### ✅ **Launch Announcement**
- [ ] Test all functionality thoroughly
- [ ] Prepare launch announcement
- [ ] Monitor for any issues post-launch

## 📞 **Support Information**

### ✅ **Emergency Contacts**
- [ ] VPS provider support contact
- [ ] Domain registrar support
- [ ] SSL certificate provider support

### ✅ **Documentation**
- [ ] All passwords stored securely
- [ ] Configuration files backed up
- [ ] Deployment procedures documented
- [ ] Rollback procedures documented

---

## 🎯 **Success Criteria**

Your BloomTech Hub deployment is successful when:
- ✅ Website loads at https://bloomtechub.com
- ✅ All features work correctly
- ✅ SSL certificate is valid and auto-renewing
- ✅ Database is backed up regularly
- ✅ Monitoring is in place
- ✅ Performance is acceptable
- ✅ Security measures are implemented

**🎉 Congratulations! Your BloomTech Hub ecommerce platform is now live at https://bloomtechub.com!**
