const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';

async function createProductWithQR() {
  try {
    console.log('🔐 Logging in as manufacturer...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      username: 'manufacturer',
      password: 'manufacturer123'
    });
    
    const token = loginRes.data.data.token;
    console.log('✅ Manufacturer logged in\n');

    console.log('📦 Fetching available batch...');
    const batchesRes = await axios.get(`${API_URL}/batches`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const batch = batchesRes.data.data[0];
    console.log(`✅ Found batch: ${batch.batch_number} (${batch.species})`);
    console.log(`   Status: ${batch.status}, Quantity: ${batch.total_quantity} ${batch.unit}\n`);

    console.log('🏭 Creating product with QR code...');
    const productData = {
      batchId: batch.id,
      productName: `Premium ${batch.species} Extract`,
      productType: 'EXTRACT',
      quantity: parseFloat(batch.total_quantity) * 0.5, // Use 50% of batch
      unit: batch.unit,
      manufactureDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year
      ingredients: [
        { name: batch.species, percentage: 100 }
      ],
      certifications: [
        'Organic Certified',
        'GMP Certified',
        'ISO 9001:2015'
      ],
      processingSteps: [
        {
          processType: 'EXTRACTION',
          temperature: '60°C',
          duration: '4 hours',
          equipment: 'Industrial Extractor XL-500',
          notes: 'Supercritical CO2 extraction process'
        }
      ]
    };

    const productRes = await axios.post(`${API_URL}/manufacturer/products`, productData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const product = productRes.data.data;
    console.log('✅ Product created successfully!\n');
    console.log('📋 PRODUCT DETAILS:');
    console.log('='.repeat(70));
    console.log(`Product ID:       ${product.id}`);
    console.log(`Product Name:     ${product.productName}`);
    console.log(`Product Type:     ${product.productType}`);
    console.log(`Batch ID:         ${product.batchId}`);
    console.log(`Quantity:         ${product.quantity} ${product.unit}`);
    console.log(`Manufacture Date: ${product.manufactureDate}`);
    console.log(`Expiry Date:      ${product.expiryDate}`);
    console.log(`Blockchain TX:    ${product.blockchainTxId || 'Pending'}`);
    console.log(`Collections:      ${product.collectionCount}`);
    console.log(`QC Tests:         ${product.qcTestCount}`);
    console.log(`Processing Steps: ${product.processingStepCount}`);
    console.log('='.repeat(70));
    console.log('\n🔲 QR CODE:');
    console.log('='.repeat(70));
    console.log(product.qrCode);
    console.log('='.repeat(70));

    console.log('\n📱 VERIFICATION URL:');
    console.log(`   ${product.verificationUrl}`);
    
    console.log('\n🔍 Verifying QR code...');
    const verifyRes = await axios.get(`${API_URL}/qr/verify/${product.qrCode}`);
    
    console.log('\n✅ QR VERIFICATION RESULT:');
    console.log('='.repeat(70));
    console.log(JSON.stringify(verifyRes.data, null, 2));
    console.log('='.repeat(70));
    
    console.log('\n🖼️  QR CODE IMAGE (Base64):');
    console.log('='.repeat(70));
    if (product.qrCodeImage) {
      console.log('QR Code Image Generated! You can:');
      console.log('1. Copy this base64 string and paste it in browser address bar');
      console.log('2. Or save it as an image file');
      console.log('\nBase64 Image Data (first 100 chars):');
      console.log(product.qrCodeImage.substring(0, 100) + '...');
      console.log(`\nFull length: ${product.qrCodeImage.length} characters`);
    }
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ ERROR:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

createProductWithQR();
