// Test the exact endpoint that's failing
console.log('🧪 Testing Exact Endpoint...');

const testData = {
  name: 'Test User',
  email: 'testuser123@example.com',
  password: 'TestPass123!'
};

console.log('📋 Testing endpoint: POST /api/auth/register');
console.log('📋 Test data:', testData);

fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log(`📋 Response Status: ${response.status} ${response.statusText}`);
  console.log(`📋 Response Headers:`, Object.fromEntries(response.headers.entries()));
  return response.text();
})
.then(data => {
  console.log('📋 Response Body:', data);
  try {
    const jsonData = JSON.parse(data);
    console.log('📋 Parsed JSON:', jsonData);
  } catch (e) {
    console.log('📋 Raw response (not JSON):', data);
  }
})
.catch(error => {
  console.log('❌ Fetch Error:', error.message);
  console.log('❌ Error details:', error);
}); 