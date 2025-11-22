#!/bin/bash

# Bloomtech Hub VPS Setup Script
# Run this script on your fresh Ubuntu VPS to install all dependencies

set -e

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Starting VPS Setup...${NC}"

# 1. Update System
echo -e "${GREEN}Updating system packages...${NC}"
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Node.js (v20 LTS)
echo -e "${GREEN}Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install Nginx
echo -e "${GREEN}Installing Nginx...${NC}"
sudo apt-get install -y nginx

# 4. Install Docker & Docker Compose (for Database)
echo -e "${GREEN}Installing Docker...${NC}"
# Add Docker's official GPG key:
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 5. Install PM2
echo -e "${GREEN}Installing PM2...${NC}"
sudo npm install -g pm2

# 6. Configure Firewall (UFW)
echo -e "${GREEN}Configuring Firewall...${NC}"
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
# Enable UFW if not already enabled (be careful not to lock yourself out)
# sudo ufw --force enable

# 7. Setup Swap (Prevent OOM during builds)
echo -e "${GREEN}Setting up 1GB Swap...${NC}"
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

echo -e "${GREEN}Setup Complete!${NC}"
echo "Versions installed:"
node -v
npm -v
docker --version
docker compose version
