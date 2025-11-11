# 🚀 BloomTech Hub cPanel Quick Start Guide

**Quick deployment guide for cPanel hosting to https://bloomtechub.com**

## ⚡ **Quick Steps (5 Minutes Setup)**

### 1. **Run Deployment Script**
```bash
./cpanel-deploy.sh
```

### 2. **Upload to cPanel**
- Compress project folder to `.zip`
- Upload via cPanel File Manager to `public_html`
- Extract files

### 3. **Setup Database in cPanel**
- Go to "MySQL Databases" in cPanel
- Create database: `bloomtech_db`
- Create user with full privileges
- Update `backend/.env` with credentials

### 4. **Setup Node.js App in cPanel**
- Go to "Node.js Selector"
- Create application:
  - **Root**: `public_html/bloomtech-hub-ecommerce-store`
  - **URL**: `bloomtechub.com`
  - **Startup**: `backend/server.js`
- Install dependencies & Start

### 5. **Setup SSL in cPanel**
- Go to "SSL/TLS"
- Install Let's Encrypt certificate
- Enable "Force HTTPS Redirect"

## 🎯 **Your Site is Live!**

**URL**: https://bloomtechub.com
**Admin**: https://bloomtechub.com/admin
- **Email**: muendophilip10@gmail.com
- **Password**: SuperSecure@123

## 📋 **Required cPanel Settings**

### Database Credentials Format
```env
DB_HOST=localhost
DB_NAME=cpanel_username_bloomtech_db
DB_USER=cpanel_username_bloomtech_user
DB_PASSWORD=your_password
```

### Email Configuration
```env
SMTP_HOST=mail.bloomtechub.com
SMTP_USER=noreply@bloomtechub.com
SMTP_PASS=your_email_password
```

## 🔧 **Troubleshooting**

### App Won't Start
1. Check Node.js version in cPanel
2. Verify all dependencies installed
3. Check error logs in Node.js Selector

### Database Connection Failed
1. Verify database credentials in `.env`
2. Check database exists in cPanel
3. Ensure user has proper permissions

### SSL Issues
1. Wait 24 hours for propagation
2. Check DNS settings
3. Try Let's Encrypt again

## 📞 **Need Help?**

- **Detailed Guide**: See `CPANEL_DEPLOYMENT_GUIDE.md`
- **Hosting Support**: Contact your cPanel hosting provider
- **Node.js Issues**: Check cPanel Node.js Selector documentation

---

**🎉 Your BloomTech Hub ecommerce store is now live on cPanel hosting!**
