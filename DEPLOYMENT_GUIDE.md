# Deployment Guide: Bloomtech Hub on GoDaddy VPS

This guide will walk you through deploying your application to a GoDaddy VPS running Ubuntu.

## Prerequisites
- **VPS Access**: IP Address and root password (provided by GoDaddy).
- **Domain Name**: A domain (e.g., `example.com`) pointed to your VPS IP address.
  - Create an **A Record** for `@` pointing to your VPS IP.
  - Create an **A Record** for `www` pointing to your VPS IP.

## Step 1: Connect to your VPS
Open your terminal (PowerShell or Command Prompt on Windows) and SSH into your server:
```bash
ssh root@<YOUR_VPS_IP>
```
*Type `yes` if asked to confirm authenticity, then enter your password.*

## Step 2: Prepare the Server
We have prepared a script to automate the installation of Node.js, Nginx, Docker, and PM2.

1.  **Create the setup script on the server**:
    ```bash
    nano setup_vps.sh
    ```
2.  **Copy and Paste** the content of `deployment/setup_vps.sh` from your local project into this file.
3.  **Save and Exit**: Press `Ctrl+X`, then `Y`, then `Enter`.
4.  **Run the script**:
    ```bash
    chmod +x setup_vps.sh
    ./setup_vps.sh
    ```

## Step 3: Set up the Project Directory
We will use `/var/www/bloomtech-hub-ecommerce-store` as the project directory.

```bash
# Create directory and change ownership
sudo mkdir -p /var/www/bloomtech-hub-ecommerce-store
sudo chown -R $USER:$USER /var/www/bloomtech-hub-ecommerce-store
```

## Step 4: Upload Your Code
You can upload your code using `scp` (run this from your **local machine**, not the VPS).

```bash
# Run this from your local project root
scp -r ./* root@<YOUR_VPS_IP>:/var/www/bloomtech-hub-ecommerce-store
```
*Note: This copies everything. For a cleaner deployment, you might want to exclude `node_modules` and `.git` manually or use git to pull the repo on the server.*

## Step 5: Configure Environment Variables
You need to set up your production environment variables.

1.  **SSH back into your VPS**.
2.  **Navigate to the project**:
    ```bash
    cd /var/www/bloomtech-hub-ecommerce-store
    ```
3.  **Create backend .env**:
    ```bash
    cp backend/.env.example backend/.env
    nano backend/.env
    ```
    *Update the values, especially database credentials if you change them.*

## Step 6: Start the Database (Docker)
We will use Docker Compose to run MySQL.

```bash
cd /var/www/bloomtech-hub-ecommerce-store/deployment
docker compose up -d
```
*This starts MySQL in the background.*

## Step 7: Deploy the Application
Now we build and start the Node.js apps.

```bash
cd /var/www/bloomtech-hub-ecommerce-store
chmod +x deployment/deploy.sh
./deployment/deploy.sh
```

## Step 8: Configure Nginx
1.  **Copy the config**:
    ```bash
    sudo cp deployment/nginx.conf /etc/nginx/sites-available/bloomtech
    ```
2.  **Edit the config** (IMPORTANT):
    ```bash
    sudo nano /etc/nginx/sites-available/bloomtech
    ```
    *Change `server_name bloomtechub.com` to your actual domain name.*
3.  **Enable the site**:
    ```bash
    sudo ln -s /etc/nginx/sites-available/bloomtech /etc/nginx/sites-enabled/
    sudo rm /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl restart nginx
    ```

## Step 9: Enable SSL (HTTPS)
Secure your site with a free Let's Encrypt certificate.

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
*Follow the prompts. Certbot will automatically update your Nginx config.*

## Troubleshooting
- **View Logs**: `pm2 logs`
- **Restart App**: `pm2 restart all`
- **Database Status**: `docker compose ps`
