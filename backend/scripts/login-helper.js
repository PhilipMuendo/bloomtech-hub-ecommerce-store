// Usage: node scripts/login-helper.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function loginHelper() {
  try {
    console.log('🔑 Login Helper - Getting Admin Token\n');
    
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
    console.log('   - User ID:', loginData.id);
    console.log('   - Name:', loginData.name);
    console.log('   - Role:', loginData.role);
    console.log('   - Token received');
    
    // Create the user object that should be stored in localStorage
    const userObject = {
      id: loginData.id,
      name: loginData.name,
      email: loginData.email,
      role: loginData.role,
      token: loginData.token
    };
    
    console.log('\n📋 User object for localStorage:');
    console.log(JSON.stringify(userObject, null, 2));
    
    console.log('\n🔧 Instructions for fixing admin dashboard:');
    console.log('1. Open your browser developer tools (F12)');
    console.log('2. Go to the Console tab');
    console.log('3. Run this command:');
    console.log(`   localStorage.setItem('user', '${JSON.stringify(userObject)}');`);
    console.log('4. Refresh the admin dashboard page');
    console.log('5. The dashboard should now load without errors');
    
    console.log('\n🎉 Login helper complete!');
    
  } catch (error) {
    console.error('❌ Login helper failed:', error);
  }
}

loginHelper(); 