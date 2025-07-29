// Usage: node scripts/test-wishlist-fix.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testWishlistFix() {
  try {
    console.log('🧪 Testing Wishlist Fix...\n');
    
    const baseURL = 'http://localhost:5000';
    
    // Login as admin
    console.log('📋 Logging in as admin...');
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
    
    // Test wishlist with different products
    const products = [2, 3, 4, 5]; // Different product IDs
    
    for (const productId of products) {
      try {
        console.log(`\n📋 Testing wishlist with product ID: ${productId}`);
        
        const wishlistResponse = await fetch(`${baseURL}/api/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
          },
          body: JSON.stringify({
            productId: productId
          })
        });
        
        console.log(`📋 POST /api/wishlist (product ${productId}): ${wishlistResponse.status} ${wishlistResponse.statusText}`);
        
        if (wishlistResponse.ok) {
          const data = await wishlistResponse.json();
          console.log(`   ✅ Wishlist item created: ${data.id}`);
        } else {
          const errorData = await wishlistResponse.text();
          console.log(`   - Error: ${errorData}`);
        }
        
      } catch (error) {
        console.log(`   - Connection error: ${error.message}`);
      }
    }
    
    // Test getting wishlist
    console.log('\n📋 Testing GET wishlist...');
    try {
      const getWishlistResponse = await fetch(`${baseURL}/api/wishlist`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      
      console.log(`📋 GET /api/wishlist: ${getWishlistResponse.status} ${getWishlistResponse.statusText}`);
      
      if (getWishlistResponse.ok) {
        const data = await getWishlistResponse.json();
        console.log(`   ✅ Wishlist items: ${data.length}`);
        data.forEach(item => {
          console.log(`   - Product ID: ${item.productId}, Wishlist ID: ${item.id}`);
        });
      } else {
        const errorData = await getWishlistResponse.text();
        console.log(`   - Error: ${errorData}`);
      }
      
    } catch (error) {
      console.log(`   - Connection error: ${error.message}`);
    }
    
    console.log('\n🎉 Wishlist Fix Test Complete!');
    
  } catch (error) {
    console.error('❌ Wishlist fix test failed:', error);
  }
}

testWishlistFix(); 