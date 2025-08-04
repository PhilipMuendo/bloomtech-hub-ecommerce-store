// Usage: node scripts/validate-data.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import db, { sequelize } from '../sequelize_models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function validateData() {
  try {
    console.log('🔍 Data Validation Report\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');
    
    // 1. Validate Users
    console.log('👥 Validating Users...');
    const users = await db.User.findAll();
    console.log(`📊 Total users: ${users.length}`);
    
    const userIssues = [];
    users.forEach((user, index) => {
      // Check required fields
      if (!user.name || user.name.trim() === '') {
        userIssues.push(`User ${index + 1}: Missing name`);
      }
      if (!user.email || user.email.trim() === '') {
        userIssues.push(`User ${index + 1}: Missing email`);
      }
      if (!user.password || user.password.trim() === '') {
        userIssues.push(`User ${index + 1}: Missing password`);
      }
      
      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        userIssues.push(`User ${index + 1}: Invalid email format - ${user.email}`);
      }
      
      // Check role values
      const validRoles = ['user', 'admin', 'superadmin', 'warehouse'];
      if (!validRoles.includes(user.role)) {
        userIssues.push(`User ${index + 1}: Invalid role - ${user.role}`);
      }
    });
    
    if (userIssues.length === 0) {
      console.log('✅ All users are valid');
    } else {
      console.log('⚠️ User issues found:');
      userIssues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    // 2. Validate Products
    console.log('\n🛍️ Validating Products...');
    const products = await db.Product.findAll();
    console.log(`📊 Total products: ${products.length}`);
    
    const productIssues = [];
    products.forEach((product, index) => {
      // Check required fields
      if (!product.name || product.name.trim() === '') {
        productIssues.push(`Product ${index + 1}: Missing name`);
      }
      if (!product.description || product.description.trim() === '') {
        productIssues.push(`Product ${index + 1}: Missing description`);
      }
      if (!product.price || product.price <= 0) {
        productIssues.push(`Product ${index + 1}: Invalid price - ${product.price}`);
      }
      if (!product.category || product.category.trim() === '') {
        productIssues.push(`Product ${index + 1}: Missing category`);
      }
      if (product.stock < 0) {
        productIssues.push(`Product ${index + 1}: Negative stock - ${product.stock}`);
      }
      
      // Check price format
      if (typeof product.price !== 'number') {
        productIssues.push(`Product ${index + 1}: Price is not a number - ${typeof product.price}`);
      }
      
      // Check stock format
      if (!Number.isInteger(product.stock)) {
        productIssues.push(`Product ${index + 1}: Stock is not an integer - ${product.stock}`);
      }
    });
    
    if (productIssues.length === 0) {
      console.log('✅ All products are valid');
    } else {
      console.log('⚠️ Product issues found:');
      productIssues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    // 3. Validate Orders
    console.log('\n📦 Validating Orders...');
    const orders = await db.Order.findAll({
      include: [
        { model: db.User, attributes: ['name', 'email'] },
        { model: db.OrderItem, include: [{ model: db.Product, attributes: ['name', 'price'] }] }
      ]
    });
    console.log(`📊 Total orders: ${orders.length}`);
    
    const orderIssues = [];
    orders.forEach((order, index) => {
      // Check required fields
      if (!order.userId) {
        orderIssues.push(`Order ${index + 1}: Missing user ID`);
      }
      if (!order.total || order.total <= 0) {
        orderIssues.push(`Order ${index + 1}: Invalid total - ${order.total}`);
      }
      if (!order.status) {
        orderIssues.push(`Order ${index + 1}: Missing status`);
      }
      
      // Check status values
      const validStatuses = ['pending', 'processing', 'delivered', 'cancelled', 'awaiting_payment', 'paid'];
      if (!validStatuses.includes(order.status)) {
        orderIssues.push(`Order ${index + 1}: Invalid status - ${order.status}`);
      }
      
      // Check order items
      if (!order.OrderItems || order.OrderItems.length === 0) {
        orderIssues.push(`Order ${index + 1}: No order items`);
      } else {
        // Validate total calculation
        let calculatedTotal = 0;
        order.OrderItems.forEach(item => {
          calculatedTotal += item.Product.price * item.quantity;
        });
        
        if (Math.abs(calculatedTotal - order.total) > 0.01) {
          orderIssues.push(`Order ${index + 1}: Total mismatch - Expected: ${calculatedTotal}, Actual: ${order.total}`);
        }
      }
    });
    
    if (orderIssues.length === 0) {
      console.log('✅ All orders are valid');
    } else {
      console.log('⚠️ Order issues found:');
      orderIssues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    // 4. Validate Reviews
    console.log('\n⭐ Validating Reviews...');
    const reviews = await db.Review.findAll({
      include: [
        { model: db.User, attributes: ['name', 'email'] },
        { model: db.Product, attributes: ['name'] }
      ]
    });
    console.log(`📊 Total reviews: ${reviews.length}`);
    
    const reviewIssues = [];
    reviews.forEach((review, index) => {
      // Check required fields
      if (!review.userId) {
        reviewIssues.push(`Review ${index + 1}: Missing user ID`);
      }
      if (!review.productId) {
        reviewIssues.push(`Review ${index + 1}: Missing product ID`);
      }
      if (!review.rating || review.rating < 1 || review.rating > 5) {
        reviewIssues.push(`Review ${index + 1}: Invalid rating - ${review.rating}`);
      }
      if (!review.comment || review.comment.trim() === '') {
        reviewIssues.push(`Review ${index + 1}: Missing comment`);
      }
      
      // Check rating format
      if (!Number.isInteger(review.rating)) {
        reviewIssues.push(`Review ${index + 1}: Rating is not an integer - ${review.rating}`);
      }
    });
    
    if (reviewIssues.length === 0) {
      console.log('✅ All reviews are valid');
    } else {
      console.log('⚠️ Review issues found:');
      reviewIssues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    // 5. Database Relationships Check
    console.log('\n🔗 Validating Database Relationships...');
    
    // Check for orphaned order items
    const orphanedOrderItems = await db.OrderItem.findAll({
      include: [
        { model: db.Order, required: false },
        { model: db.Product, required: false }
      ],
      where: {
        '$Order.id$': null,
        '$Product.id$': null
      }
    });
    
    if (orphanedOrderItems.length === 0) {
      console.log('✅ No orphaned order items found');
    } else {
      console.log(`⚠️ Found ${orphanedOrderItems.length} orphaned order items`);
    }
    
    // Check for orphaned reviews
    const orphanedReviews = await db.Review.findAll({
      include: [
        { model: db.User, required: false },
        { model: db.Product, required: false }
      ],
      where: {
        '$User.id$': null,
        '$Product.id$': null
      }
    });
    
    if (orphanedReviews.length === 0) {
      console.log('✅ No orphaned reviews found');
    } else {
      console.log(`⚠️ Found ${orphanedReviews.length} orphaned reviews`);
    }
    
    // Summary
    const totalIssues = userIssues.length + productIssues.length + orderIssues.length + reviewIssues.length;
    
    console.log('\n📊 Validation Summary:');
    console.log(`- Users: ${users.length} (${userIssues.length} issues)`);
    console.log(`- Products: ${products.length} (${productIssues.length} issues)`);
    console.log(`- Orders: ${orders.length} (${orderIssues.length} issues)`);
    console.log(`- Reviews: ${reviews.length} (${reviewIssues.length} issues)`);
    console.log(`- Total Issues: ${totalIssues}`);
    
    if (totalIssues === 0) {
      console.log('\n🎉 All data is valid and properly formatted!');
    } else {
      console.log('\n⚠️ Please fix the issues above to ensure data integrity.');
    }

  } catch (error) {
    console.error('❌ Data validation failed:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

validateData(); 