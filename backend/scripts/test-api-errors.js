// Usage: node scripts/test-api-errors.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testApiErrors() {
  try {
    console.log('🧪 Testing API Errors...\n');
    
    const baseURL = 'http://localhost:5000';
    
    // Step 1: Test without authentication
    console.log('📋 Step 1: Testing without authentication...');
    
    try {
      const quoteResponse = await fetch(`${baseURL}/api/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890',
          items: [{ productId: 1, quantity: 1 }],
          message: 'Test quote request'
        })
      });
      
      console.log(`📋 POST /api/quotes (no auth): ${quoteResponse.status} ${quoteResponse.statusText}`);
      if (!quoteResponse.ok) {
        const errorData = await quoteResponse.text();
        console.log(`   - Error: ${errorData}`);
      }
    } catch (error) {
      console.log(`   - Connection error: ${error.message}`);
    }
    
    try {
      const wishlistResponse = await fetch(`${baseURL}/api/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: 1
        })
      });
      
      console.log(`📋 POST /api/wishlist (no auth): ${wishlistResponse.status} ${wishlistResponse.statusText}`);
      if (!wishlistResponse.ok) {
        const errorData = await wishlistResponse.text();
        console.log(`   - Error: ${errorData}`);
      }
    } catch (error) {
      console.log(`   - Connection error: ${error.message}`);
    }
    
    // Step 2: Login and test with authentication
    console.log('\n📋 Step 2: Testing with authentication...');
    
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
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Login successful!');
        console.log(`   - User ID: ${loginData.id}`);
        console.log(`   - Role: ${loginData.role}`);
        
        // Test quotes with auth
        try {
          const quoteResponse = await fetch(`${baseURL}/api/quotes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify({
              name: 'Test User',
              email: 'test@example.com',
              phone: '1234567890',
              items: [{ productId: 1, quantity: 1 }],
              message: 'Test quote request'
            })
          });
          
          console.log(`📋 POST /api/quotes (with auth): ${quoteResponse.status} ${quoteResponse.statusText}`);
          if (quoteResponse.ok) {
            const data = await quoteResponse.json();
            console.log(`   - Quote created: ${data.id}`);
          } else {
            const errorData = await quoteResponse.text();
            console.log(`   - Error: ${errorData}`);
          }
        } catch (error) {
          console.log(`   - Connection error: ${error.message}`);
        }
        
        // Test wishlist with auth
        try {
          const wishlistResponse = await fetch(`${baseURL}/api/wishlist`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify({
              productId: 1
            })
          });
          
          console.log(`📋 POST /api/wishlist (with auth): ${wishlistResponse.status} ${wishlistResponse.statusText}`);
          if (wishlistResponse.ok) {
            const data = await wishlistResponse.json();
            console.log(`   - Wishlist item created: ${data.id}`);
          } else {
            const errorData = await wishlistResponse.text();
            console.log(`   - Error: ${errorData}`);
          }
        } catch (error) {
          console.log(`   - Connection error: ${error.message}`);
        }
        
      } else {
        const errorData = await loginResponse.text();
        console.log(`❌ Login failed: ${errorData}`);
      }
      
    } catch (error) {
      console.log(`❌ Login connection error: ${error.message}`);
    }
    
    // Step 3: Test with regular user
    console.log('\n📋 Step 3: Testing with regular user...');
    
    try {
      const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'alice.johnson@example.com',
          password: 'AlicePass123!'
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Regular user login successful!');
        console.log(`   - User ID: ${loginData.id}`);
        console.log(`   - Role: ${loginData.role}`);
        
        // Test quotes with regular user
        try {
          const quoteResponse = await fetch(`${baseURL}/api/quotes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify({
              name: 'Alice Johnson',
              email: 'alice.johnson@example.com',
              phone: '1234567890',
              items: [{ productId: 1, quantity: 1 }],
              message: 'Test quote request from regular user'
            })
          });
          
          console.log(`📋 POST /api/quotes (regular user): ${quoteResponse.status} ${quoteResponse.statusText}`);
          if (quoteResponse.ok) {
            const data = await quoteResponse.json();
            console.log(`   - Quote created: ${data.id}`);
          } else {
            const errorData = await quoteResponse.text();
            console.log(`   - Error: ${errorData}`);
          }
        } catch (error) {
          console.log(`   - Connection error: ${error.message}`);
        }
        
      } else {
        const errorData = await loginResponse.text();
        console.log(`❌ Regular user login failed: ${errorData}`);
      }
      
    } catch (error) {
      console.log(`❌ Regular user login connection error: ${error.message}`);
    }
    
    console.log('\n🎉 API Error Test Complete!');
    
  } catch (error) {
    console.error('❌ API error test failed:', error);
  }
}

testApiErrors(); 