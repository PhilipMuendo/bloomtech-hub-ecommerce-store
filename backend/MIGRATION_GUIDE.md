# 🚀 MongoDB to MySQL Migration Guide

## Overview
This guide provides step-by-step instructions for migrating the BLOOMTECH Hub platform from MongoDB to MySQL using Sequelize ORM.

## Prerequisites

### 1. MySQL Server Setup
- **WAMP Server**: Install and configure WAMP server
- **Database**: Create database `bloomtech_db`
- **User**: Use `root` with empty password (default WAMP setup)

### 2. Environment Configuration
Copy `env.example` to `.env` and configure:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=bloomtech_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development

# Legacy MongoDB (for data migration)
MONGO_URI=mongodb://localhost:27017/bloomtech-hub
```

## Migration Steps

### Step 1: Setup Database
```bash
cd backend
npm run db:setup
```

This will:
- Connect to MySQL server
- Create `bloomtech_db` database if it doesn't exist
- Verify database connection

### Step 2: Run Migrations
```bash
npm run migrate
```

This creates all necessary tables:
- `users` - User accounts and authentication
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `cart_items` - Shopping cart
- `wishlists` - User wishlists
- `reviews` - Product reviews
- `quotes` - Quote requests
- `quote_items` - Quote line items
- `messages` - Quote messages
- `blogs` - Blog posts
- `campaigns` - Email campaigns
- `newsletters` - Newsletter subscribers
- `transactions` - Payment transactions
- `backinstockalerts` - Stock alerts

### Step 3: Seed Sample Data
```bash
npm run db:seed
```

This creates:
- Super admin user (admin@bloomtech.com / SuperSecure@123)
- Sample products across categories
- Sample blog posts
- Sample newsletter subscribers

### Step 4: Migrate Existing Data (Optional)
If you have existing MongoDB data:
```bash
npm run db:migrate-data
```

This migrates:
- Users (with passwords preserved)
- Products
- Blogs
- Orders (with items)

### Step 5: Start the Server
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## Database Schema

### Core Tables

#### Users
- `id` (Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR, Hashed)
- `role` (ENUM: user, admin, superadmin)
- `status` (ENUM: active, suspended)
- `isAdmin` (BOOLEAN)
- `verified` (BOOLEAN)
- `verificationToken` (VARCHAR)
- `verificationTokenExpires` (DATETIME)
- `resetPasswordToken` (VARCHAR)
- `resetPasswordExpires` (DATETIME)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

#### Products
- `id` (Primary Key)
- `name` (VARCHAR)
- `description` (TEXT)
- `price` (DECIMAL)
- `category` (VARCHAR)
- `stock` (INTEGER)
- `imageUrl` (VARCHAR)
- `featured` (BOOLEAN)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

#### Orders
- `id` (Primary Key)
- `userId` (Foreign Key to Users)
- `total` (DECIMAL)
- `status` (ENUM: pending, processing, delivered, cancelled, awaiting_payment, paid)
- `shippingAddress` (TEXT)
- `trackingNumber` (VARCHAR)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

#### Order Items
- `id` (Primary Key)
- `orderId` (Foreign Key to Orders)
- `productId` (Foreign Key to Products)
- `quantity` (INTEGER)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify-email` - Verify email
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Products
- `GET /api/products` - Get all products (with pagination)
- `GET /api/products/:id` - Get specific product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/search` - Search products

### Orders
- `GET /api/orders` - Get user orders or all orders (admin)
- `GET /api/orders/:id` - Get specific order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status (admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove item from cart

### Wishlist
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add item to wishlist
- `DELETE /api/wishlist/:id` - Remove item from wishlist

### Reviews
- `GET /api/reviews` - Get product reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Quotes
- `GET /api/quotes` - Get quotes (admin)
- `GET /api/quotes/user` - Get user quotes
- `POST /api/quotes` - Create quote request
- `PUT /api/quotes/:id/status` - Update quote status
- `POST /api/quotes/:id/message` - Add message to quote

### Blogs
- `GET /api/blogs` - Get all blogs
- `GET /api/blogs/:slug` - Get specific blog
- `POST /api/blogs` - Create blog (admin)
- `PUT /api/blogs/:id` - Update blog (admin)
- `DELETE /api/blogs/:id` - Delete blog (admin)

### Dashboard (Admin)
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/revenue-trend` - Get revenue trend
- `GET /api/dashboard/orders-by-category` - Get orders by category
- `GET /api/dashboard/user-signups` - Get user signups trend
- `GET /api/dashboard/quote-summary` - Get quote summary (superadmin)

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure MySQL server is running
   - Check database credentials in `.env`
   - Verify database `bloomtech_db` exists

2. **Migration Errors**
   - Run `npm run migrate:undo:all` to reset
   - Then run `npm run migrate` again

3. **Authentication Issues**
   - Check JWT_SECRET in `.env`
   - Ensure user is verified
   - Check user status is 'active'

4. **Data Migration Issues**
   - Ensure MongoDB is running
   - Check MONGO_URI in `.env`
   - Verify MongoDB data exists

### Reset Database
To completely reset the database:
```bash
npm run db:reset
```

This will:
- Undo all migrations
- Run migrations again
- Seed fresh data

## Production Deployment

### Environment Variables
Set these in production:
```env
NODE_ENV=production
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASS=your-mysql-password
DB_NAME=bloomtech_db
JWT_SECRET=your-production-jwt-secret
```

### Database Backup
```bash
mysqldump -u root -p bloomtech_db > backup.sql
```

### Database Restore
```bash
mysql -u root -p bloomtech_db < backup.sql
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check server logs for detailed error messages
4. Verify database connectivity and permissions

---

**Migration Complete!** 🎉

Your BLOOMTECH Hub platform is now running on MySQL with Sequelize ORM. 