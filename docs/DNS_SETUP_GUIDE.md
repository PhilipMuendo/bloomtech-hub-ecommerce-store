# DNS Configuration Guide for bloomtechub.com

This guide will help you configure DNS settings for your BloomTech Hub domain.

## 🎯 **Required DNS Records**

### 1. A Records (IPv4)
```
Type: A
Name: @
Value: YOUR_VPS_IP_ADDRESS
TTL: 3600 (or default)

Type: A  
Name: www
Value: YOUR_VPS_IP_ADDRESS
TTL: 3600 (or default)
```

### 2. CNAME Records (Optional)
```
Type: CNAME
Name: api
Value: bloomtechub.com
TTL: 3600

Type: CNAME
Name: mail
Value: bloomtechub.com
TTL: 3600
```

### 3. MX Records (Email)
```
Type: MX
Name: @
Value: mail.bloomtechub.com
Priority: 10
TTL: 3600

Type: MX
Name: @
Value: mail2.bloomtechub.com
Priority: 20
TTL: 3600
```

### 4. TXT Records (Email Authentication)
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.google.com ~all
TTL: 3600

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:admin@bloomtechub.com
TTL: 3600
```

## 🌐 **Step-by-Step DNS Configuration**

### Step 1: Find Your VPS IP Address
```bash
# On your VPS, run:
curl ifconfig.me
# or
wget -qO- http://ipecho.net/plain
```

### Step 2: Access Your Domain Registrar
1. Log into your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
2. Navigate to DNS Management or DNS Settings
3. Find your domain: `bloomtechub.com`

### Step 3: Configure A Records
1. **Root Domain (@)**
   - Type: A
   - Name: @ (or leave blank)
   - Value: `YOUR_VPS_IP_ADDRESS`
   - TTL: 3600

2. **WWW Subdomain**
   - Type: A
   - Name: www
   - Value: `YOUR_VPS_IP_ADDRESS`
   - TTL: 3600

### Step 4: Configure Email Records (Optional)
If you plan to use custom email addresses:

1. **MX Records**
   - Type: MX
   - Name: @
   - Value: `mail.bloomtechub.com`
   - Priority: 10

2. **SPF Record**
   - Type: TXT
   - Name: @
   - Value: `v=spf1 include:_spf.google.com ~all`

3. **DMARC Record**
   - Type: TXT
   - Name: `_dmarc`
   - Value: `v=DMARC1; p=quarantine; rua=mailto:admin@bloomtechub.com`

## ⏱️ **DNS Propagation**

DNS changes can take 24-48 hours to fully propagate worldwide. However, most changes are visible within 1-4 hours.

### Check DNS Propagation
Use these tools to verify DNS propagation:
- [DNS Checker](https://dnschecker.org/)
- [What's My DNS](https://whatsmydns.net/)
- Command line: `nslookup bloomtechub.com`

### Test DNS Resolution
```bash
# Test A record
nslookup bloomtechub.com
nslookup www.bloomtechub.com

# Test MX record
nslookup -type=MX bloomtechub.com
```

## 🔧 **Common DNS Providers Setup**

### Cloudflare
1. Add your domain to Cloudflare
2. Update nameservers at your registrar
3. Configure DNS records in Cloudflare dashboard
4. Enable proxy (orange cloud) for additional security

### GoDaddy
1. Go to DNS Management
2. Add/Edit A records
3. Save changes

### Namecheap
1. Go to Advanced DNS
2. Add/Edit A records
3. Save changes

## 🚨 **Troubleshooting**

### Issue: Domain not resolving
**Solution:**
1. Check if A records are correctly set
2. Verify VPS IP address is correct
3. Wait for DNS propagation (up to 48 hours)

### Issue: WWW subdomain not working
**Solution:**
1. Ensure www A record points to same IP
2. Check nginx configuration includes www subdomain
3. Verify SSL certificate includes www subdomain

### Issue: Email not working
**Solution:**
1. Verify MX records are set correctly
2. Check SPF and DMARC records
3. Ensure email service is configured on VPS

## 📋 **Pre-Deployment DNS Checklist**

- [ ] A record for @ (root domain) points to VPS IP
- [ ] A record for www points to VPS IP
- [ ] MX records configured (if using custom email)
- [ ] SPF record configured (if using custom email)
- [ ] DMARC record configured (if using custom email)
- [ ] DNS propagation verified using online tools
- [ ] nslookup tests pass locally

## 🔗 **Useful Commands**

```bash
# Check current DNS records
dig bloomtechub.com
dig www.bloomtechub.com
dig MX bloomtechub.com

# Check DNS propagation
dig @8.8.8.8 bloomtechub.com
dig @1.1.1.1 bloomtechub.com

# Test domain resolution
ping bloomtechub.com
ping www.bloomtechub.com
```

Once DNS is configured and propagated, you can proceed with SSL certificate setup and deployment.
