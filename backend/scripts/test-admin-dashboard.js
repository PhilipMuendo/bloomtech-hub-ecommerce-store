// Usage: node scripts/test-admin-dashboard.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import db, { sequelize } from '../sequelize_models/index.js';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testAdminDashboard() {
  try {
    console.log('🧪 Testing Admin Dashboard Functionality...\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Get admin user
    const user = await db.User.findOne({ where: { email: 'admin@bloomtech.com' } });
    if (!user) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', user.email, '(Role:', user.role, ')');
    
    // Generate JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    console.log('✅ JWT token generated');
    
    // Test API endpoints
    const baseURL = 'http://localhost:5000';
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('\n📋 Testing Dashboard API Endpoints...');
    
    // Test 1: Dashboard Summary
    try {
      const response = await fetch(`${baseURL}/api/dashboard/summary`, { headers });
      console.log('📋 GET /api/dashboard/summary:', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('   - Total Products:', data.totalProducts);
        console.log('   - Total Orders:', data.totalOrders);
        console.log('   - Total Users:', data.totalUsers);
        console.log('   - Total Reviews:', data.totalReviews);
        console.log('   - Revenue:', data.revenue);
        console.log('   - Subscribers:', data.subscribers);
      } else {
        const error = await response.text();
        console.log('   - Error:', error);
      }
    } catch (error) {
      console.log('   - ❌ Failed to connect:', error.message);
    }
    
    // Test 2: Revenue Trend
    try {
      const response = await fetch(`${baseURL}/api/dashboard/revenue-trend`, { headers });
      console.log('📋 GET /api/dashboard/revenue-trend:', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('   - Revenue data points:', data.length);
        if (data.length > 0) {
          console.log('   - Sample data:', data[0]);
        }
      } else {
        const error = await response.text();
        console.log('   - Error:', error);
      }
    } catch (error) {
      console.log('   - ❌ Failed to connect:', error.message);
    }
    
    // Test 3: Orders by Category
    try {
      const response = await fetch(`${baseURL}/api/dashboard/orders-by-category`, { headers });
      console.log('📋 GET /api/dashboard/orders-by-category:', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('   - Category data points:', data.length);
        if (data.length > 0) {
          console.log('   - Sample data:', data[0]);
        }
      } else {
        const error = await response.text();
        console.log('   - Error:', error);
      }
    } catch (error) {
      console.log('   - ❌ Failed to connect:', error.message);
    }
    
    // Test 4: User Signups
    try {
      const response = await fetch(`${baseURL}/api/dashboard/user-signups`, { headers });
      console.log('📋 GET /api/dashboard/user-signups:', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('   - Signup data points:', data.length);
        if (data.length > 0) {
          console.log('   - Sample data:', data[0]);
        }
      } else {
        const error = await response.text();
        console.log('   - Error:', error);
      }
    } catch (error) {
      console.log('   - ❌ Failed to connect:', error.message);
    }
    
    // Test 5: Quote Summary (SuperAdmin only)
    if (user.role === 'superadmin') {
      try {
        const response = await fetch(`${baseURL}/api/dashboard/quote-summary`, { headers });
        console.log('📋 GET /api/dashboard/quote-summary:', response.status, response.statusText);
        if (response.ok) {
          const data = await response.json();
          console.log('   - Pending Quotes:', data.pendingQuotes);
          console.log('   - Closed This Month:', data.closedThisMonth);
        } else {
          const error = await response.text();
          console.log('   - Error:', error);
        }
      } catch (error) {
        console.log('   - ❌ Failed to connect:', error.message);
      }
    }
    
    // Test 6: Recent Orders
    try {
      const response = await fetch(`${baseURL}/api/orders?page=1&limit=4&sort=-createdAt`, { headers });
      console.log('📋 GET /api/orders (recent):', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('   - Orders found:', data.orders ? data.orders.length : 0);
        if (data.orders && data.orders.length > 0) {
          console.log('   - Sample order:', data.orders[0]);
        }
      } else {
        const error = await response.text();
        console.log('   - Error:', error);
      }
    } catch (error) {
      console.log('   - ❌ Failed to connect:', error.message);
    }
    
    console.log('\n🎉 Admin Dashboard Testing Complete!');
    
  } catch (error) {
    console.error('❌ Admin dashboard test failed:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

testAdminDashboard(); 