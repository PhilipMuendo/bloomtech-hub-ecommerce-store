#!/bin/bash

# BloomTech Hub cPanel Deployment Script
# Optimized for cPanel hosting environments

set -e  # Exit on any error

echo "🚀 Starting BloomTech Hub cPanel Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_info "=========================================="
print_info "BloomTech Hub cPanel Deployment Script"
print_info "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    print_info "Contact your hosting provider to enable Node.js support."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

print_status "Installing dependencies..."

# Install root dependencies
print_info "Installing root dependencies..."
npm install

# Install backend dependencies
print_info "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
print_info "Installing frontend dependencies..."
cd src
npm install
cd ..

print_status "Building frontend for production..."

# Build frontend for production
cd src
npm run build
cd ..

# Create frontend distribution directory
print_info "Creating frontend distribution..."
mkdir -p frontend-dist
cp -r src/dist/* frontend-dist/

# Copy cPanel .htaccess configuration
print_info "Setting up cPanel .htaccess configuration..."
cp cpanel-htaccess.conf frontend-dist/.htaccess

print_status "Setting up environment..."

# Create logs directory
mkdir -p logs

# Check if .env file exists in backend
if [ ! -f "backend/.env" ]; then
    print_warning "No .env file found in backend. Creating from production template..."
    if [ -f "backend/.env.production" ]; then
        cp backend/.env.production backend/.env
        print_status "Created .env from production template."
        print_warning "IMPORTANT: Please update backend/.env with your actual cPanel database credentials!"
        print_info "Required updates:"
        echo "  - DB_USER: your_cpanel_username_bloomtech_user"
        echo "  - DB_PASSWORD: your_database_password"
        echo "  - DB_NAME: your_cpanel_username_bloomtech_db"
        echo "  - SMTP credentials for your domain email"
        echo ""
    else
        print_error "No production template found. Please create backend/.env manually."
        exit 1
    fi
fi

print_status "Setting up database..."

# Check if we can connect to database (basic check)
print_info "Please ensure your database is set up in cPanel before proceeding."
print_info "Required database setup in cPanel:"
echo "  1. Create database: bloomtech_db"
echo "  2. Create user with full privileges"
echo "  3. Update backend/.env with correct credentials"
echo ""

read -p "Have you set up the database in cPanel? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Please set up your database in cPanel first, then run this script again."
    exit 1
fi

# Run database migrations
print_info "Running database migrations..."
cd backend
npx sequelize-cli db:migrate

print_info "Seeding initial data..."
npx sequelize-cli db:seed:all

print_info "Creating super admin user..."
node scripts/create-fresh-superadmin.js
cd ..

print_status "cPanel deployment preparation completed!"
print_info "=========================================="
print_info "Next steps for cPanel deployment:"
print_info "=========================================="
echo ""
print_info "1. UPLOAD FILES TO CPANEL:"
echo "   - Upload the entire project folder to public_html"
echo "   - Or compress and upload via File Manager"
echo ""
print_info "2. SETUP NODE.JS APP IN CPANEL:"
echo "   - Go to 'Node.js Selector' in cPanel"
echo "   - Create new application:"
echo "     * Application Root: public_html/bloomtech-hub-ecommerce-store"
echo "     * Application URL: bloomtechub.com"
echo "     * Startup File: backend/server.js"
echo "   - Install dependencies"
echo "   - Start application"
echo ""
print_info "3. SETUP SSL CERTIFICATE:"
echo "   - Go to 'SSL/TLS' in cPanel"
echo "   - Install Let's Encrypt certificate"
echo "   - Enable 'Force HTTPS Redirect'"
echo ""
print_info "4. TEST YOUR APPLICATION:"
echo "   - Visit: https://bloomtechub.com"
echo "   - Admin login: muendophilip10@gmail.com / SuperSecure@123"
echo ""
print_info "5. CONFIGURE EMAIL (Optional):"
echo "   - Set up email accounts in cPanel"
echo "   - Update SMTP settings in backend/.env"
echo ""

print_status "Deployment files ready!"
print_info "Frontend files: ./frontend-dist/"
print_info "Backend files: ./backend/"
print_info "Environment file: ./backend/.env"
print_info "cPanel .htaccess: ./frontend-dist/.htaccess"
echo ""

print_warning "Remember to:"
echo "  - Update backend/.env with your actual cPanel database credentials"
echo "  - Set up your domain email accounts in cPanel"
echo "  - Configure SSL certificate in cPanel"
echo ""

print_status "🎉 BloomTech Hub is ready for cPanel deployment!"
print_info "Follow the CPANEL_DEPLOYMENT_GUIDE.md for detailed instructions."
