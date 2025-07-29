// Test registration without email verification
const timestamp = Date.now();
const uniqueEmail = `testuser${timestamp}@example.com`;

console.log('🧪 Testing Registration (No Email Verification)...');
console.log(`📧 Using email: ${uniqueEmail}`);

fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Test User',
    email: uniqueEmail,
    password: 'TestPass123!'
  })
})
.then(response => {
  console.log(`📋 Registration Status: ${response.status} ${response.statusText}`);
  return response.text();
})
.then(data => {
  try {
    const jsonData = JSON.parse(data);
    if (jsonData.id) {
      console.log('✅ Registration successful!');
      console.log(`   - User ID: ${jsonData.id}`);
      console.log(`   - Name: ${jsonData.name}`);
      console.log(`   - Email: ${jsonData.email}`);
      console.log(`   - Verified: ${jsonData.verified}`);
      console.log(`   - Message: ${jsonData.message}`);
      
      // Test immediate login
      console.log('\n📋 Testing immediate login...');
      return fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: uniqueEmail,
          password: 'TestPass123!'
        })
      });
    } else {
      console.log('❌ Registration failed:', jsonData.error || jsonData.message);
    }
  } catch (e) {
    console.log('❌ Invalid JSON response:', data);
  }
})
.then(loginResponse => {
  if (loginResponse) {
    console.log(`📋 Login Status: ${loginResponse.status} ${loginResponse.statusText}`);
    return loginResponse.text();
  }
})
.then(loginData => {
  if (loginData) {
    try {
      const jsonData = JSON.parse(loginData);
      if (jsonData.token) {
        console.log('✅ Login successful!');
        console.log(`   - User ID: ${jsonData.id}`);
        console.log(`   - Role: ${jsonData.role}`);
        console.log(`   - Token received: Yes`);
        console.log('\n🎉 Email verification is DISABLED - users can register and login immediately!');
      } else {
        console.log('❌ Login failed:', jsonData.error || jsonData.message);
      }
    } catch (e) {
      console.log('❌ Invalid login JSON response:', loginData);
    }
  }
})
.catch(error => {
  console.log('❌ Connection error:', error.message);
}); 