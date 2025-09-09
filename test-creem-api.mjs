const CREEM_API_KEY = 'creem_test_4u0pO5wRzrvcIKa5vLjBIK';
const CREEM_PRODUCT_ID = 'prod_VNpWNdsTUA5sRhQbtn7Jz';

async function testCreemAPI() {
  console.log('Testing Creem API...');
  console.log('API Key:', CREEM_API_KEY);
  console.log('Product ID:', CREEM_PRODUCT_ID);
  
  try {
    // Test 1: List products
    console.log('\n1. Testing list products...');
    const productsResponse = await fetch('https://api.creem.io/v1/products/search', {
      method: 'GET',
      headers: {
        'x-api-key': CREEM_API_KEY,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Products response status:', productsResponse.status);
    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      console.log('Products:', JSON.stringify(productsData, null, 2));
    } else {
      const errorText = await productsResponse.text();
      console.log('Products error:', errorText);
    }
    
    // Test 2: Create checkout session
    console.log('\n2. Testing create checkout...');
    const checkoutResponse = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'x-api-key': CREEM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: CREEM_PRODUCT_ID,
        success_url: 'http://localhost:3001/pricing?success=true',
        metadata: {
          project: 'ai-video-generator',
          interval: 'month',
          userId: '28sltpmf751lly',
          test: 'true'
        }
      }),
    });
    
    console.log('Checkout response status:', checkoutResponse.status);
    if (checkoutResponse.ok) {
      const checkoutData = await checkoutResponse.json();
      console.log('Checkout session:', JSON.stringify(checkoutData, null, 2));
    } else {
      const errorText = await checkoutResponse.text();
      console.log('Checkout error:', errorText);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testCreemAPI();