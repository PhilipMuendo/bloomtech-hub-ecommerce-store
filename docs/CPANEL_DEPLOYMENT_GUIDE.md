# 🚀 BloomTech Hub cPanel Deployment Guide

Complete deployment guide for BloomTech Hub on cPanel hosting to **https://bloomtechub.com**

## 📋 **Prerequisites**

### ✅ **cPanel Requirements**
- [ ] cPanel hosting account with Node.js support
- [ ] SSH access enabled (request from hosting provider if needed)
- [ ] MySQL database access
- [ ] SSL certificate available (Let's Encrypt or purchased)
- [ ] Domain `bloomtechub.com` pointed to your hosting

## 🌐 **Step 1: DNS Configuration**

### Configure DNS Records
1. **Log into your domain registrar** (GoDaddy, Namecheap, etc.)
2. **Update nameservers** to point to your cPanel hosting
3. **Or configure A records**:
   ```
   Type: A
   Name: @
   Value: YOUR_CPANEL_IP_ADDRESS
   
   Type: A  
   Name: www
   Value: YOUR_CPANEL_IP_ADDRESS
   ```

## 🗄️ **Step 2: Database Setup in cPanel**

### Create MySQL Database
1. **Login to cPanel**
2. **Go to "MySQL Databases"**
3. **Create Database**:
   - Database Name: `bloomtech_db`
   - Click "Create Database"

4. **Create Database User**:
   - Username: `bloomtech_user`
   - Password: Generate strong password
   - Click "Create User"

5. **Add User to Database**:
   - Select user: `bloomtech_user`
   - Select database: `bloomtech_db`
   - Check "All Privileges"
   - Click "Make Changes"

6. **Note down credentials**:
   ```
   DB_HOST: localhost
   DB_NAME: cpanel_username_bloomtech_db
   DB_USER: cpanel_username_bloomtech_user
   DB_PASSWORD: your_generated_password
   ```

## 📁 **Step 3: Upload Files via cPanel File Manager**

### Upload Project Files
1. **Open cPanel File Manager**
2. **Navigate to `public_html`**
3. **Upload your project files**:
   - Compress your project folder as `.zip`
   - Upload via File Manager
   - Extract in `public_html`

4. **Final structure should be**:
   ```
   public_html/
   ├── bloomtech-hub-ecommerce-store/
   │   ├── backend/
   │   ├── src/
   │   ├── package.json
   │   └── ...
   ```

## 🔧 **Step 4: SSH Configuration (if available)**

### Access via SSH
1. **Enable SSH** in cPanel (if not already enabled)
2. **Connect via SSH**:
   ```bash
   ssh username@your-domain.com
   ```

3. **Navigate to project directory**:
   ```bash
   cd public_html/bloomtech-hub-ecommerce-store
   ```

## 📦 **Step 5: Install Dependencies**

### Install Node.js Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd src
npm install
cd ..
```

## ⚙️ **Step 6: Environment Configuration**

### Create Production Environment File
1. **Copy production template**:
   ```bash
   cp backend/.env.production backend/.env
   ```

2. **Edit with cPanel values**:
   ```bash
   nano backend/.env
   ```

3. **Update these values**:
   ```env
   # Database Configuration (from cPanel MySQL setup)
   DB_HOST=localhost
   DB_USER=your_cpanel_username_bloomtech_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_cpanel_username_bloomtech_db
   DB_PORT=3306
   
   # JWT Configuration
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   
   # Email Configuration (cPanel email)
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

## 🏗️ **Step 7: Database Setup**

### Run Database Migrations
```bash
cd backend

# Run migrations
npx sequelize-cli db:migrate

# Seed initial data
npx sequelize-cli db:seed:all

# Create super admin
node scripts/create-fresh-superadmin.js
```

## 🎨 **Step 8: Build Frontend**

### Build React Application
```bash
cd src
npm run build
cd ..

# Create distribution directory
mkdir -p frontend-dist
cp -r src/dist/* frontend-dist/
```

## 🚀 **Step 9: Setup Node.js Application in cPanel**

### Configure Node.js App
1. **Go to "Node.js Selector"** in cPanel
2. **Create Application**:
   - Application Root: `public_html/bloomtech-hub-ecommerce-store`
   - Application URL: `bloomtechub.com`
   - Application Startup File: `backend/server.js`
   - Node.js Version: 18.x (or latest available)

3. **Install Dependencies**:
   - Click "Install Dependencies"
   - Wait for installation to complete

4. **Start Application**:
   - Click "Start Application"

## 🔒 **Step 9: SSL Certificate Setup**

### Install SSL Certificate
1. **Go to "SSL/TLS"** in cPanel
2. **Choose SSL option**:
   - **Let's Encrypt** (Free, recommended)
   - **Purchased certificate**
   - **AutoSSL** (if available)

3. **For Let's Encrypt**:
   - Click "Let's Encrypt"
   - Enter domains: `bloomtechub.com, www.bloomtechub.com`
   - Click "Issue"

4. **Enable HTTPS Redirect**:
   - Go to "Force HTTPS Redirect"
   - Enable for your domain

## 🌐 **Step 10: Configure .htaccess (Alternative to Nginx)**

### Create .htaccess for Frontend Routing
```bash
# Create .htaccess in frontend-dist
nano frontend-dist/.htaccess
```

Add this content:
```apache
RewriteEngine On

# Handle Angular and React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

## 🔧 **Step 11: Configure Subdomain for API (Optional)**

### Create API Subdomain
1. **Go to "Subdomains"** in cPanel
2. **Create subdomain**:
   - Subdomain: `api`
   - Document Root: `public_html/api`
   - Click "Create"

3. **Create API .htaccess**:
   ```bash
   # Create .htaccess in public_html/api
   nano public_html/api/.htaccess
   ```

   Add this content:
   ```apache
   RewriteEngine On
   RewriteRule ^(.*)$ http://localhost:5000/$1 [P,L]
   ```

## 📊 **Step 12: Testing & Verification**

### Test Your Application
1. **Test Frontend**: Visit https://bloomtechub.com
2. **Test API**: Visit https://bloomtechub.com/api/products
3. **Test Admin Login**:
   - Email: `muendophilip10@gmail.com`
   - Password: `SuperSecure@123`

### Verify SSL Certificate
- Check SSL Labs: https://www.ssllabs.com/ssltest/
- Ensure HTTPS redirect is working
- Test all pages load with HTTPS

## 🔄 **Step 13: Application Management**

### Start/Stop Application
1. **Go to "Node.js Selector"** in cPanel
2. **Manage your application**:
   - Start/Stop application
   - View logs
   - Restart if needed

### View Logs
1. **In Node.js Selector**, click "View Logs"
2. **Or access via SSH**:
   ```bash
   tail -f ~/logs/nodejs.log
   ```

## 🚨 **Troubleshooting cPanel Issues**

### Common Issues & Solutions

#### Issue: Application won't start
**Solutions**:
1. Check Node.js version compatibility
2. Verify all dependencies installed
3. Check environment variables
4. View error logs in Node.js Selector

#### Issue: Database connection failed
**Solutions**:
1. Verify database credentials in .env
2. Check database exists in cPanel
3. Ensure user has proper permissions

#### Issue: SSL certificate not working
**Solutions**:
1. Wait for certificate propagation (up to 24 hours)
2. Check DNS settings
3. Try Let's Encrypt again
4. Contact hosting support

#### Issue: Frontend not loading
**Solutions**:
1. Check .htaccess configuration
2. Verify build files in frontend-dist
3. Check file permissions
4. Ensure HTTPS redirect is enabled

## 📋 **cPanel Deployment Checklist**

### ✅ **Pre-Deployment**
- [ ] cPanel hosting with Node.js support
- [ ] SSH access enabled
- [ ] Domain pointed to hosting
- [ ] SSL certificate available

### ✅ **Database Setup**
- [ ] MySQL database created
- [ ] Database user created with privileges
- [ ] Credentials documented

### ✅ **File Upload**
- [ ] Project files uploaded to public_html
- [ ] Dependencies installed
- [ ] Environment file configured

### ✅ **Database Configuration**
- [ ] Migrations run successfully
- [ ] Initial data seeded
- [ ] Super admin created

### ✅ **Application Setup**
- [ ] Node.js application created in cPanel
- [ ] Application started successfully
- [ ] Frontend built and deployed

### ✅ **SSL & Security**
- [ ] SSL certificate installed
- [ ] HTTPS redirect enabled
- [ ] Security headers configured

### ✅ **Testing**
- [ ] Website loads at https://bloomtechub.com
- [ ] API endpoints working
- [ ] Admin login functional
- [ ] SSL certificate valid

## 🎯 **cPanel-Specific Benefits**

### Advantages of cPanel Deployment
- ✅ **Easy Management**: GUI interface for all operations
- ✅ **Automatic Backups**: Built-in backup system
- ✅ **SSL Management**: Easy SSL certificate installation
- ✅ **Email Integration**: Built-in email system
- ✅ **Database Management**: phpMyAdmin access
- ✅ **File Management**: Easy file upload/management
- ✅ **Support**: Hosting provider support available

## 📞 **Support Resources**

### cPanel Documentation
- [cPanel Node.js Documentation](https://docs.cpanel.net/cpanel/software/nodejs-selector/)
- [cPanel SSL Documentation](https://docs.cpanel.net/cpanel/security/ssl-tls/)

### Hosting Provider Support
- Contact your hosting provider for:
  - SSH access enablement
  - Node.js version updates
  - SSL certificate issues
  - Performance optimization

---

## 🎉 **Success!**

Your BloomTech Hub is now deployed on cPanel hosting at **https://bloomtechub.com**!

### Default Admin Access
- **URL**: https://bloomtechub.com/admin
- **Email**: muendophilip10@gmail.com
- **Password**: SuperSecure@123

### Next Steps
1. **Change default admin password**
2. **Configure your products and categories**
3. **Set up payment methods**
4. **Customize your store settings**
5. **Test all functionality thoroughly**

Your ecommerce platform is now live and ready for customers! 🚀
