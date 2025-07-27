// Usage: node scripts/test-auth-flow.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testAuthFlow() {
  try {
    console.log('🧪 Testing Authentication Flow...\n');
    
    const baseURL = 'http://localhost:5000';
    
    // Step 1: Test login
    console.log('📋 Step 1: Testing login...');
    try {
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
      
      console.log('📋 Login response:', loginResponse.status, loginResponse.statusText);
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Login successful!');
        console.log('   - User ID:', loginData.id);
        console.log('   - Role:', loginData.role);
        console.log('   - Token length:', loginData.token ? loginData.token.length : 'N/A');
        
        // Step 2: Test dashboard with token
        console.log('\n📋 Step 2: Testing dashboard with token...');
        const dashboardResponse = await fetch(`${baseURL}/api/dashboard/summary`, {
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📋 Dashboard response:', dashboardResponse.status, dashboardResponse.statusText);
        
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          console.log('✅ Dashboard access successful!');
          console.log('   - Total Products:', dashboardData.totalProducts);
          console.log('   - Total Users:', dashboardData.totalUsers);
        } else {
          const errorData = await dashboardResponse.text();
          console.log('❌ Dashboard access failed:', errorData);
        }
        
      } else {
        const errorData = await loginResponse.text();
        console.log('❌ Login failed:', errorData);
      }
      
    } catch (error) {
      console.log('❌ Connection failed:', error.message);
    }
    
    console.log('\n🎉 Authentication Flow Test Complete!');
    
  } catch (error) {
    console.error('❌ Auth flow test failed:', error);
  }
}

testAuthFlow(); 