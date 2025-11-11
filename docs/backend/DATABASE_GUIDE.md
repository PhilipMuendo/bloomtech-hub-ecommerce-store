# MySQL Database Connection and Data Management Guide

## Overview
Your BLOOMTECH Hub platform uses MySQL as the primary database with Sequelize ORM for data management. This guide will help you connect to the database and add data to your platform.

## Database Configuration

### Current Settings (backend/config/config.js)
```javascript
{
  development: {
    username: "root",
    password: "", // Empty password
    database: "bloomtech_hub",
    host: "127.0.0.1",
    dialect: "mysql"
  }
}
```

### Prerequisites
1. **MySQL Server**: Make sure MySQL is installed and running on your system
2. **Database**: Create the database if it doesn't exist:
   ```sql
   CREATE DATABASE bloomtech_hub;
   ```

## Connecting to the Database

### Method 1: Start the Backend Server
The easiest way to connect is by starting your backend server:

```bash
cd backend
npm run dev
```

This will:
- Connect to MySQL automatically
- Sync all database tables
- Start the API server on port 5000

### Method 2: Run Database Scripts
You can run individual scripts to add data:

```bash
cd backend
node scripts/addSampleData.js
```

**Email Verification Scripts**:
```bash
# Verify all existing unverified accounts
node scripts/verifyAccounts.js
```

**Password Fix Scripts**:
```bash
# Fix admin password if login issues occur
node scripts/fixAdminPassword.js
```

## Available Data Models

### 1. User Model
- **Fields**: name, email, password, role, isAdmin, verified, status
- **Roles**: user, admin, superadmin

### 2. Product Model
- **Fields**: name, description, price, category, stock, imageUrl, featured
- **Categories**: Security Systems, Power Solutions, ICT Equipment, Electrical Materials


- **Fields**: title, content, image, author, slug, published

### 4. Order Model
- **Fields**: userId, totalAmount, status, shippingAddress, paymentMethod

### 5. CartItem Model
- **Fields**: userId, productId, quantity

### 6. Wishlist Model
- **Fields**: userId, productId

### 7. Review Model
- **Fields**: userId, productId, rating, comment

## Adding Data to Your Platform

### 1. Using the Sample Data Script
The `addSampleData.js` script creates:
- **Super admin user** (admin@bloomtech.com / SuperSecure@123) - **Pre-verified for immediate access**
- 4 sample products across different categories


**Note**: The super admin account is automatically verified and can login immediately. Regular user accounts require email verification.

### 2. Using API Endpoints
Once the server is running, you can use these endpoints:

#### Users
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/users` - Get all users (admin only)

#### Products
- `POST /api/products` - Create new product (admin only)
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get specific product
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)



#### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get specific order

### 3. Creating Custom Scripts
You can create custom scripts for bulk data import:

```javascript
// Example: custom-import.js
import db, { sequelize } from '../sequelize_models/index.js';

async function importCustomData() {
  try {
    // Your custom data import logic here
    const newProduct = await db.Product.create({
      name: 'Custom Product',
      description: 'Product description',
      price: 99.99,
      category: 'Security Systems',
      stock: 10,
      imageUrl: '/path/to/image.jpg',
      featured: false
    });
    
    console.log('Product created:', newProduct.id);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

importCustomData();
```

## Database Management Commands

### Run Migrations
```bash
npm run migrate
```

### Undo Last Migration
```bash
npm run migrate:undo
```

### Undo All Migrations
```bash
npm run migrate:undo:all
```

### Check Database Status
```bash
# Connect to MySQL and check tables
mysql -u root -p bloomtech_hub
SHOW TABLES;
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure MySQL server is running
   - Check if the port (3306) is not blocked
   - Verify host and credentials in config

2. **Database Not Found**
   - Create the database: `CREATE DATABASE bloomtech_hub;`

3. **Permission Denied**
   - Check MySQL user permissions
   - Ensure the user has access to the database

4. **Table Not Found**
   - Run migrations: `npm run migrate`
   - Check if Sequelize sync is working

5. **Email Verification Required**
   - Users cannot login without email verification
   - Use `node scripts/verifyAccounts.js` to verify all accounts
   - Or manually verify specific accounts in the database
   - Super admin account is pre-verified for immediate access

6. **Password Issues**
   - If login fails with correct credentials, password may be double-hashed
   - Use `node scripts/fixAdminPassword.js` to reset admin password
   - User model automatically hashes passwords on save

### Useful Commands

```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL service
sudo systemctl start mysql

# Connect to MySQL
mysql -u root -p

# Show databases
SHOW DATABASES;

# Use database
USE bloomtech_hub;

# Show tables
SHOW TABLES;

# Check table structure
DESCRIBE Users;
DESCRIBE Products;
```

## Security Best Practices

1. **Environment Variables**: Store database credentials in `.env` file
2. **Strong Passwords**: Use strong passwords for database users
3. **Limited Permissions**: Grant only necessary permissions to database users
4. **Regular Backups**: Set up regular database backups
5. **Connection Pooling**: Use connection pooling for production

## Next Steps

1. Start the backend server: `npm run dev`
2. Run the sample data script: `node scripts/addSampleData.js`
3. **Login with super admin**: admin@bloomtech.com / SuperSecure@123 (pre-verified)
4. Use the API endpoints to add more data
5. Create custom scripts for bulk data import as needed
6. For regular users, ensure email verification is set up or use `node scripts/verifyAccounts.js`

**Important**: The super admin account is pre-verified and can login immediately. Regular user accounts require email verification unless manually verified using the verification script.

Your database is now ready to store and manage data for your BLOOMTECH Hub e-commerce platform! 