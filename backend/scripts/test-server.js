// Usage: node scripts/test-server.js

async function testServer() {
  try {
    console.log('🧪 Testing Server Connection...\n');
    
    // Test different ports
    const ports = [3000, 5000, 8000, 8080, 8081];
    
    for (const port of ports) {
      try {
        console.log(`📋 Testing port ${port}...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch(`http://localhost:${port}/api/products`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        console.log(`✅ Server found on port ${port}! Status: ${response.status}`);
        break;
      } catch (error) {
        console.log(`❌ Port ${port}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Server test failed:', error);
  }
}

testServer(); 