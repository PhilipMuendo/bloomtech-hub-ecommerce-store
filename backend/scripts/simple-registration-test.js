// Simple registration test
const timestamp = Date.now();
const uniqueEmail = `testuser${timestamp}@example.com`;

console.log('🧪 Testing Registration...');
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
  console.log(`📋 Status: ${response.status} ${response.statusText}`);
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
    } else {
      console.log('❌ Registration failed:', jsonData.error || jsonData.message);
    }
  } catch (e) {
    console.log('❌ Invalid JSON response:', data);
  }
})
.catch(error => {
  console.log('❌ Connection error:', error.message);
}); 