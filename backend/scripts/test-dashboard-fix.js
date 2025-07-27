// Usage: node scripts/test-dashboard-fix.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testDashboardFix() {
  try {
    console.log('🧪 Testing Dashboard Fix...\n');
    
    const baseURL = 'http://localhost:5000';
    
    // Step 1: Login as admin
    console.log('📋 Step 1: Logging in as admin...');
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@bloomtech.com',
        password: 'SuperSecure@123'
      })
    });
    
    if (!loginResponse.ok) {
      const errorData = await loginResponse.text();
      console.log('❌ Login failed:', errorData);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful!');
    console.log('   - User ID:', loginData.id);
    console.log('   - Role:', loginData.role);
    
    // Step 2: Test dashboard endpoints
    console.log('\n📋 Step 2: Testing dashboard endpoints...');
    
    const endpoints = [
      '/api/dashboard/summary',
      '/api/dashboard/revenue-trend',
      '/api/dashboard/orders-by-category',
      '/api/dashboard/user-signups',
      '/api/dashboard/quote-summary',
      '/api/orders?page=1&limit=4&sort=-createdAt'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseURL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`📋 ${endpoint}: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          
          // Check for order IDs in the response
          if (data.orders || data.recentOrders) {
            const orders = data.orders || data.recentOrders || [];
            console.log(`   - Orders found: ${orders.length}`);
            
            orders.forEach((order, index) => {
              const orderId = order.id || order._id;
              const idType = typeof orderId;
              console.log(`   - Order ${index + 1} ID: ${orderId} (${idType})`);
              
              // Test if we can safely convert to string and slice
              if (orderId) {
                try {
                  const sliced = orderId.toString().slice(-6);
                  console.log(`   - Order ${index + 1} sliced ID: ${sliced} ✅`);
                } catch (error) {
                  console.log(`   - Order ${index + 1} slice error: ${error.message} ❌`);
                }
              }
            });
          }
        } else {
          const errorData = await response.text();
          console.log(`   - Error: ${errorData}`);
        }
        
      } catch (error) {
        console.log(`   - Connection error: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Dashboard Fix Test Complete!');
    console.log('\n📋 Instructions:');
    console.log('1. Refresh your browser at http://localhost:8081/admin');
    console.log('2. The dashboard should now load without errors');
    console.log('3. Order IDs should display correctly');
    console.log('4. No more "slice is not a function" errors');
    
  } catch (error) {
    console.error('❌ Dashboard fix test failed:', error);
  }
}

testDashboardFix(); 