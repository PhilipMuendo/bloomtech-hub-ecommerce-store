// Usage: node scripts/testAPI.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import db, { sequelize } from '../sequelize_models/index.js';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testAPI() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Find the admin user
    const user = await db.User.findOne({ where: { email: 'admin@bloomtech.com' } });
    if (!user) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('\n📝 Admin User Details:');
    console.log('- ID:', user.id);
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Verified:', user.verified);

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    console.log('\n🔐 JWT Token generated successfully');

    // Test API endpoints
    const baseURL = 'http://localhost:5000';
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('\n🧪 Testing API Endpoints...');

    // Test 1: Dashboard Summary
    try {
      const response = await fetch(`${baseURL}/api/dashboard/summary`, { headers });
      console.log('📊 Dashboard Summary:', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('   Data:', data);
      } else {
        const error = await response.text();
        console.log('   Error:', error);
      }
    } catch (error) {
      console.log('   ❌ Failed to connect:', error.message);
    }

    // Test 2: Quotes (this is causing the filter error)
    try {
      const response = await fetch(`${baseURL}/api/quotes`, { headers });
      console.log('📋 Quotes:', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('   Data type:', typeof data);
        console.log('   Is array:', Array.isArray(data));
        console.log('   Length:', Array.isArray(data) ? data.length : 'N/A');
        if (Array.isArray(data) && data.length > 0) {
          console.log('   First item:', data[0]);
        }
      } else {
        const error = await response.text();
        console.log('   Error:', error);
      }
    } catch (error) {
      console.log('   ❌ Failed to connect:', error.message);
    }

    // Test 3: Orders
    try {
      const response = await fetch(`${baseURL}/api/orders`, { headers });
      console.log('📦 Orders:', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('   Data type:', typeof data);
        console.log('   Is array:', Array.isArray(data));
      } else {
        const error = await response.text();
        console.log('   Error:', error);
      }
    } catch (error) {
      console.log('   ❌ Failed to connect:', error.message);
    }

    // Test 4: Products
    try {
      const response = await fetch(`${baseURL}/api/products`, { headers });
      console.log('🛍️ Products:', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('   Data type:', typeof data);
        console.log('   Is array:', Array.isArray(data));
        console.log('   Length:', Array.isArray(data) ? data.length : 'N/A');
      } else {
        const error = await response.text();
        console.log('   Error:', error);
      }
    } catch (error) {
      console.log('   ❌ Failed to connect:', error.message);
    }

  } catch (error) {
    console.error('❌ Error testing API:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

testAPI(); 