#!/bin/bash

# Bloomtech Hub Deployment Script
# This script builds and deploys the application to production

set -e  # Exit on any error

echo "🚀 Starting Bloomtech Hub Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_status "Installing dependencies..."

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

print_status "Building frontend..."

# Build frontend for production
cd src
npm run build
cd ..

# Create frontend distribution directory
mkdir -p frontend-dist
cp -r src/dist/* frontend-dist/

print_status "Setting up environment..."

# Create logs directory
mkdir -p logs

# Check if .env file exists in backend
if [ ! -f "backend/.env" ]; then
    print_warning "No .env file found in backend. Please create one with production settings."
    print_status "You can copy from env.example and update with your production values."
fi

print_status "Installing PM2 globally..."
npm install -g pm2

print_status "Starting applications with PM2..."

# Start applications with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup

print_status "Deployment completed successfully!"
print_status "Your application should now be running on:"
echo "  - Frontend: https://bloomtechub.com"
echo "  - Backend API: https://bloomtechub.com/api"
echo ""
print_status "PM2 Status:"
pm2 status
echo ""
print_status "To view logs:"
echo "  - Backend logs: pm2 logs bloomtech-backend"
echo "  - Frontend logs: pm2 logs bloomtech-frontend"
echo ""
print_status "To restart applications:"
echo "  - pm2 restart all"
echo ""
print_status "To stop applications:"
echo "  - pm2 stop all"
