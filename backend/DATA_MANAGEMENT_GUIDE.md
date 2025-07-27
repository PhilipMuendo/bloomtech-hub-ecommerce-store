# 📊 Data Management Guide

This guide explains how to manually add data to your BLOOMTECH Hub platform and ensure it's properly saved in the MySQL database.

## 🗄️ Database Schema Overview

### Users Table
```sql
- id (INT, Primary Key, Auto Increment)
- name (VARCHAR(255), Required)
- email (VARCHAR(255), Required, Unique)
- password (VARCHAR(255), Required, Hashed)
- role (ENUM: 'user', 'admin', 'superadmin', Default: 'user')
- status (ENUM: 'active', 'inactive', 'suspended', Default: 'active')
- verified (BOOLEAN, Default: false)
- verificationToken (VARCHAR(255), Nullable)
- verificationTokenExpires (DATETIME, Nullable)
- resetPasswordToken (VARCHAR(255), Nullable)
- resetPasswordExpires (DATETIME, Nullable)
- createdAt (DATETIME, Auto)
- updatedAt (DATETIME, Auto)
```

### Products Table
```sql
- id (INT, Primary Key, Auto Increment)
- name (VARCHAR(255), Required)
- description (TEXT, Required)
- price (DECIMAL(10,2), Required)
- category (VARCHAR(255), Required)
- stock (INT, Required, Default: 0)
- imageUrl (VARCHAR(500), Required)
- featured (BOOLEAN, Default: false)
- createdAt (DATETIME, Auto)
- updatedAt (DATETIME, Auto)
```

### Orders Table
```sql
- id (INT, Primary Key, Auto Increment)
- userId (INT, Foreign Key to Users.id, Required)
- total (DECIMAL(10,2), Required)
- status (ENUM: 'pending', 'processing', 'delivered', 'cancelled', 'awaiting_payment', 'paid', Default: 'pending')
- shippingAddress (TEXT, Nullable)
- trackingNumber (VARCHAR(255), Unique, Auto-generated)
- createdAt (DATETIME, Auto)
- updatedAt (DATETIME, Auto)
```

### OrderItems Table
```sql
- id (INT, Primary Key, Auto Increment)
- orderId (INT, Foreign Key to Orders.id, Required)
- productId (INT, Foreign Key to Products.id, Required)
- quantity (INT, Required, Default: 1)
- createdAt (DATETIME, Auto)
- updatedAt (DATETIME, Auto)
```

## 🚀 Quick Start Commands

### 1. Add All Sample Data
```bash
cd backend
node scripts/add-manual-data.js
```

### 2. Add Users Only
```bash
cd backend
node scripts/add-users.js
```

### 3. Add Orders Only
```bash
cd backend
node scripts/add-orders.js
```

### 4. Validate Data Integrity
```bash
cd backend
node scripts/validate-data.js
```

## 📝 Manual Data Addition

### Adding Users

**Format Requirements:**
- Name: String (2-255 characters)
- Email: Valid email format, unique
- Password: String (will be automatically hashed)
- Role: 'user', 'admin', or 'superadmin'
- Status: 'active', 'inactive', or 'suspended'
- Verified: true/false

**Example:**
```javascript
const user = await db.User.create({
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'SecurePassword123!', // Will be hashed automatically
  role: 'user',
  status: 'active',
  verified: true
});
```

### Adding Products

**Format Requirements:**
- Name: String (2-255 characters, must contain letters)
- Description: String (minimum 10 characters)
- Price: Number (greater than 1.01)
- Category: String (minimum 2 characters)
- Stock: Integer (non-negative)
- ImageUrl: String (required)
- Featured: Boolean (optional)

**Example:**
```javascript
const product = await db.Product.create({
  name: 'LED Security Camera',
  description: 'High-definition wireless security camera with night vision.',
  price: 199.99,
  category: 'Security Systems',
  stock: 25,
  imageUrl: '/public/lovable-uploads/camera.jpg',
  featured: true
});
```

### Adding Orders

**Format Requirements:**
- userId: Must reference existing user
- items: Array of objects with productId and quantity
- total: Calculated from items (price × quantity)
- status: Valid order status
- shippingAddress: String (optional)
- trackingNumber: Auto-generated if not provided

**Example:**
```javascript
// First, create the order
const order = await db.Order.create({
  userId: 1, // Must exist in Users table
  total: 299.98, // Calculated from items
  status: 'pending',
  shippingAddress: '123 Main St, Nairobi, Kenya'
});

// Then, create order items
await db.OrderItem.create({
  orderId: order.id,
  productId: 1, // Must exist in Products table
  quantity: 2
});
```

## 🔍 Data Validation Rules

### User Validation
- ✅ Email must be unique
- ✅ Email must be valid format
- ✅ Password must be provided
- ✅ Role must be valid enum value
- ✅ Status must be valid enum value

### Product Validation
- ✅ Name must contain letters (not just numbers)
- ✅ Price must be greater than 1.01
- ✅ Stock must be non-negative integer
- ✅ ImageUrl must be provided
- ✅ Category must be at least 2 characters

### Order Validation
- ✅ User must exist
- ✅ Total must be positive
- ✅ Status must be valid enum value
- ✅ Order items must reference existing products
- ✅ Quantities must be positive integers

## 🛠️ Troubleshooting

### Common Issues

1. **"User not found" Error**
   - Ensure the user exists in the database
   - Check the user ID is correct
   - Verify the user hasn't been deleted

2. **"Product not found" Error**
   - Ensure the product exists in the database
   - Check the product ID is correct
   - Verify the product name matches exactly

3. **"Invalid price" Error**
   - Price must be a number greater than 1.01
   - Check for string vs number type issues
   - Ensure no negative values

4. **"Duplicate email" Error**
   - Email addresses must be unique
   - Check for existing users with same email
   - Use different email for new users

5. **"Invalid status" Error**
   - Use only valid status values:
     - Orders: 'pending', 'processing', 'delivered', 'cancelled', 'awaiting_payment', 'paid'
     - Users: 'active', 'inactive', 'suspended'

### Data Integrity Checks

Run the validation script to check for issues:
```bash
node scripts/validate-data.js
```

This will identify:
- Missing required fields
- Invalid data formats
- Orphaned records
- Relationship issues
- Calculation errors

## 📊 Database Statistics

### Check Current Data
```bash
# Count all records
node -e "
import('./sequelize_models/index.js').then(async ({ default: db }) => {
  const users = await db.User.count();
  const products = await db.Product.count();
  const orders = await db.Order.count();
  const reviews = await db.Review.count();
  console.log('Users:', users);
  console.log('Products:', products);
  console.log('Orders:', orders);
  console.log('Reviews:', reviews);
  process.exit(0);
});
"
```

### Backup Database
```bash
# Export data (if using MySQL)
mysqldump -u root -p bloomtech_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🔐 Security Best Practices

1. **Password Hashing**: All passwords are automatically hashed using bcrypt
2. **Input Validation**: All data is validated before saving
3. **SQL Injection Protection**: Using Sequelize ORM prevents SQL injection
4. **Data Sanitization**: Input is sanitized to prevent XSS attacks
5. **Access Control**: Role-based access control for admin functions

## 📞 Support

If you encounter issues:
1. Check the validation script output
2. Review the error messages in the console
3. Ensure all required fields are provided
4. Verify data types match the schema
5. Check for duplicate entries

For additional help, refer to the main documentation or contact support. 