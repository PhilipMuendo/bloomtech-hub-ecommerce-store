// Usage: node scripts/test-wishlist.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import db, { sequelize } from '../sequelize_models/index.js';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testWishlist() {
  try {
    console.log('🧪 Testing Wishlist Functionality...\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Get admin user
    const user = await db.User.findOne({ where: { email: 'admin@bloomtech.com' } });
    if (!user) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', user.email);
    
    // Get a product to test with
    const product = await db.Product.findOne();
    if (!product) {
      console.log('❌ No products found');
      return;
    }
    
    console.log('✅ Test product found:', product.name, '(ID:', product.id, ')');
    
    // Generate JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    console.log('✅ JWT token generated');
    
    // Test API endpoints
    const baseURL = 'http://localhost:5000';
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('\n📋 Testing Wishlist API Endpoints...');
    
    // Test 1: Get wishlist (should be empty initially)
    try {
      const response = await fetch(`${baseURL}/api/wishlist`, { headers });
      console.log('📋 GET /api/wishlist:', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('   - Wishlist items:', Array.isArray(data) ? data.length : 'N/A');
      } else {
        const error = await response.text();
        console.log('   - Error:', error);
      }
    } catch (error) {
      console.log('   - ❌ Failed to connect:', error.message);
    }
    
    // Test 2: Add to wishlist
    try {
      const response = await fetch(`${baseURL}/api/wishlist`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ productId: product.id })
      });
      console.log('📋 POST /api/wishlist:', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('   - Added to wishlist successfully');
      } else {
        const error = await response.text();
        console.log('   - Error:', error);
      }
    } catch (error) {
      console.log('   - ❌ Failed to connect:', error.message);
    }
    
    // Test 3: Get wishlist again (should have 1 item)
    try {
      const response = await fetch(`${baseURL}/api/wishlist`, { headers });
      console.log('📋 GET /api/wishlist (after add):', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('   - Wishlist items:', Array.isArray(data) ? data.length : 'N/A');
        if (Array.isArray(data) && data.length > 0) {
          console.log('   - First item product ID:', data[0].productId);
        }
      } else {
        const error = await response.text();
        console.log('   - Error:', error);
      }
    } catch (error) {
      console.log('   - ❌ Failed to connect:', error.message);
    }
    
    // Test 4: Remove from wishlist
    try {
      const response = await fetch(`${baseURL}/api/wishlist/${product.id}`, {
        method: 'DELETE',
        headers
      });
      console.log('📋 DELETE /api/wishlist/:id:', response.status, response.statusText);
      if (response.ok) {
        console.log('   - Removed from wishlist successfully');
      } else {
        const error = await response.text();
        console.log('   - Error:', error);
      }
    } catch (error) {
      console.log('   - ❌ Failed to connect:', error.message);
    }
    
    // Test 5: Get wishlist final (should be empty)
    try {
      const response = await fetch(`${baseURL}/api/wishlist`, { headers });
      console.log('📋 GET /api/wishlist (after remove):', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('   - Wishlist items:', Array.isArray(data) ? data.length : 'N/A');
      } else {
        const error = await response.text();
        console.log('   - Error:', error);
      }
    } catch (error) {
      console.log('   - ❌ Failed to connect:', error.message);
    }
    
    console.log('\n🎉 Wishlist Testing Complete!');
    
  } catch (error) {
    console.error('❌ Wishlist test failed:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

testWishlist(); 