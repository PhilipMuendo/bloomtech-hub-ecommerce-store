import fetch from 'node-fetch';

const testImageUrls = async () => {
  try {
    console.log('Testing image URL fixing for ngrok...');
    
    // Test the products API
    const response = await fetch('http://localhost:5000/api/products');
    const data = await response.json();
    
    console.log('Products found:', data.products?.length || 0);
    
    if (data.products && data.products.length > 0) {
      console.log('\nSample product image URLs:');
      data.products.slice(0, 3).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}: ${product.imageUrl}`);
      });
    }
    
    console.log('\n✅ Image URL test completed');
  } catch (error) {
    console.error('❌ Error testing image URLs:', error.message);
  }
};

testImageUrls(); 