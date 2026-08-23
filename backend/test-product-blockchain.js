const { getFabricClient } = require('./dist/fabric/fabricClient');

async function testProductCreation() {
  console.log('🏭 Testing Product Creation on Blockchain\n');
  
  try {
    const fabricClient = getFabricClient();
    console.log('🔌 Connecting as Manufacturers...');
    await fabricClient.connect('admin-Manufacturers', 'Manufacturers');
    console.log('✅ Connected!');

    const productData = {
      id: `PROD-TEST-${Date.now()}`,
      type: 'Product',
      productName: 'TEST Ashwagandha Capsules',
      productType: 'capsules',
      manufacturerId: 'test-manufacturer',
      manufacturerName: 'Test Manufacturer',
      batchId: 'BATCH-ASHWAGANDHA-20251208-8207',
      manufactureDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      quantity: 100,
      unit: 'bottles',
      qrCode: `QR-TEST-${Date.now()}`,
      ingredients: ['Ashwagandha Extract', 'Gelatin Capsule'],
      certifications: ['Organic', 'GMP'],
      status: 'manufactured',
      timestamp: new Date().toISOString()
    };

    console.log('\n📤 Submitting product to blockchain...');
    const result = await fabricClient.createProduct(productData);
    
    const txId = result?.transactionId || 'unknown';
    console.log(`\n✅ SUCCESS!`);
    console.log(`Product ID: ${productData.id}`);
    console.log(`Blockchain TX: ${txId}`);
    
    await fabricClient.disconnect();
    console.log('\n🎉 Product successfully stored on blockchain!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testProductCreation();
