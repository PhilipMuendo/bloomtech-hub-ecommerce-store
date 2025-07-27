// Usage: node scripts/test-registration.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testRegistration() {
  try {
    console.log('🧪 Testing User Registration...\n');
    
    const baseURL = 'http://localhost:5000';
    
    // Test cases
    const testCases = [
      {
        name: 'Valid Registration',
        data: {
          name: 'Test User',
          email: 'testuser@example.com',
          password: 'TestPass123!'
        },
        expected: 'success'
      },
      {
        name: 'Duplicate Email',
        data: {
          name: 'Test User 2',
          email: 'admin@bloomtech.com', // Already exists
          password: 'TestPass123!'
        },
        expected: 'duplicate'
      },
      {
        name: 'Invalid Email',
        data: {
          name: 'Test User 3',
          email: 'invalid-email',
          password: 'TestPass123!'
        },
        expected: 'validation_error'
      },
      {
        name: 'Short Password',
        data: {
          name: 'Test User 4',
          email: 'testuser4@example.com',
          password: '123'
        },
        expected: 'validation_error'
      },
      {
        name: 'Simple Password',
        data: {
          name: 'Test User 5',
          email: 'testuser5@example.com',
          password: 'password'
        },
        expected: 'validation_error'
      },
      {
        name: 'Short Name',
        data: {
          name: 'A',
          email: 'testuser6@example.com',
          password: 'TestPass123!'
        },
        expected: 'validation_error'
      },
      {
        name: 'Numeric Name',
        data: {
          name: '12345',
          email: 'testuser7@example.com',
          password: 'TestPass123!'
        },
        expected: 'validation_error'
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`📋 Testing: ${testCase.name}`);
      
      try {
        const response = await fetch(`${baseURL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(testCase.data)
        });
        
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        const responseData = await response.text();
        let jsonData;
        try {
          jsonData = JSON.parse(responseData);
        } catch {
          jsonData = { raw: responseData };
        }
        
        if (response.ok) {
          console.log(`   ✅ Success: ${jsonData.message || 'User registered'}`);
          console.log(`   - User ID: ${jsonData.id}`);
          console.log(`   - Email: ${jsonData.email}`);
        } else {
          console.log(`   ❌ Error: ${jsonData.error || jsonData.message || 'Unknown error'}`);
        }
        
        // Check if result matches expectation
        if (testCase.expected === 'success' && response.ok) {
          console.log(`   ✅ Expected: ${testCase.expected} - Result: PASS`);
        } else if (testCase.expected === 'duplicate' && !response.ok && jsonData.error?.includes('already exists')) {
          console.log(`   ✅ Expected: ${testCase.expected} - Result: PASS`);
        } else if (testCase.expected === 'validation_error' && !response.ok) {
          console.log(`   ✅ Expected: ${testCase.expected} - Result: PASS`);
        } else {
          console.log(`   ❌ Expected: ${testCase.expected} - Result: FAIL`);
        }
        
      } catch (error) {
        console.log(`   ❌ Connection error: ${error.message}`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    // Test the specific case from the image
    console.log('📋 Testing Specific Case (Muendo)');
    try {
      const response = await fetch(`${baseURL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Muendo',
          email: 'philip.nzomba@gmail.com',
          password: 'TestPass123!'
        })
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      const responseData = await response.text();
      let jsonData;
      try {
        jsonData = JSON.parse(responseData);
      } catch {
        jsonData = { raw: responseData };
      }
      
      if (response.ok) {
        console.log(`   ✅ Success: ${jsonData.message || 'User registered'}`);
        console.log(`   - User ID: ${jsonData.id}`);
      } else {
        console.log(`   ❌ Error: ${jsonData.error || jsonData.message || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Connection error: ${error.message}`);
    }
    
    console.log('\n🎉 Registration Test Complete!');
    
  } catch (error) {
    console.error('❌ Registration test failed:', error);
  }
}

testRegistration(); 