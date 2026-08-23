const Database = require('better-sqlite3');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

async function createProductSimple() {
  const db = new Database('./data/herbaltrace.db');
  
  try {
    console.log('📦 Fetching batch...');
    const batch = db.prepare('SELECT * FROM batches ORDER BY created_at DESC LIMIT 1').get();
    
    if (!batch) {
      console.error('❌ No batch found!');
      process.exit(1);
    }
    
    console.log(`✅ Found batch: ${batch.batch_number} (${batch.species})`);
    console.log(`   Quantity: ${batch.total_quantity} ${batch.unit}\n`);

    // Generate product details
    const productId = `PROD-${uuidv4()}`;
    const qrCode = `QR-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const timestamp = new Date().toISOString();
    const manufactureDate = new Date().toISOString().split('T')[0];
    const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const productName = `Premium ${batch.species} Extract`;
    const productType = 'extract'; // lowercase required by database constraint
    const quantity = parseFloat(batch.total_quantity) * 0.5;
    const ingredients = [{ name: batch.species, percentage: 100 }];
    const certifications = ['Organic Certified', 'GMP Certified', 'ISO 9001:2015'];

    console.log('💾 Saving product to database...');
    
    // Save product to database
    db.prepare(`
      INSERT INTO products (
        id, product_name, product_type, batch_id, manufacturer_id, manufacturer_name,
        quantity, unit, manufacture_date, expiry_date, qr_code,
        ingredients, certifications, blockchain_tx_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      productId,
      productName,
      productType,
      batch.batch_number,
      'manufacturer-test',
      'HerbalTrace Manufacturer',
      quantity,
      batch.unit,
      manufactureDate,
      expiryDate,
      qrCode,
      JSON.stringify(ingredients),
      JSON.stringify(certifications),
      null, // No blockchain for now
      'manufactured'
    );

    console.log('✅ Product saved to database\n');

    // Generate signed QR payload
    const qrPayload = {
      qrCode,
      productId,
      productName,
      batchId: batch.batch_number,
      species: batch.species,
      manufacturer: 'HerbalTrace Manufacturer',
      manufactureDate,
      expiryDate,
      blockchainTx: null,
      verified: true,
      timestamp,
    };

    const secret = process.env.QR_SIGNING_SECRET || 'herbaltrace-qr-secret-key-change-in-production';
    const dataToSign = JSON.stringify(qrPayload);
    const signature = crypto.createHmac('sha256', secret).update(dataToSign).digest('hex');

    const signedPayload = {
      ...qrPayload,
      signature,
    };

    // Generate QR code image
    console.log('🔲 Generating QR code image...');
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(signedPayload), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    console.log('✅ QR code generated\n');
    console.log('='.repeat(70));
    console.log('📋 PRODUCT CREATED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log(`Product ID:       ${productId}`);
    console.log(`Product Name:     ${productName}`);
    console.log(`Product Type:     ${productType}`);
    console.log(`Batch ID:         ${batch.batch_number}`);
    console.log(`Species:          ${batch.species}`);
    console.log(`Quantity:         ${quantity} ${batch.unit}`);
    console.log(`Manufacture Date: ${manufactureDate}`);
    console.log(`Expiry Date:      ${expiryDate}`);
    console.log(`Status:           manufactured`);
    console.log('='.repeat(70));
    console.log('\n🔲 QR CODE:');
    console.log('='.repeat(70));
    console.log(`QR Code ID: ${qrCode}`);
    console.log('='.repeat(70));
    console.log('\n📱 VERIFICATION URL:');
    console.log(`http://localhost:3000/verify/${qrCode}`);
    console.log(`http://localhost:3000/api/v1/qr/verify/${qrCode}`);
    console.log('='.repeat(70));
    
    console.log('\n🖼️  QR CODE IMAGE (Base64 Data URL):');
    console.log('='.repeat(70));
    console.log('First 100 characters:');
    console.log(qrCodeDataURL.substring(0, 100) + '...');
    console.log(`\nTotal length: ${qrCodeDataURL.length} characters`);
    console.log('\n💡 To view the QR code:');
    console.log('1. Copy the full base64 string below');
    console.log('2. Paste it in your browser address bar');
    console.log('3. Or save it to an HTML file and open it');
    console.log('='.repeat(70));
    console.log('\n🔗 FULL QR CODE IMAGE DATA URL:');
    console.log(qrCodeDataURL);
    console.log('='.repeat(70));

    // Test QR verification
    console.log('\n🔍 Testing QR payload signature...');
    const testSignature = crypto.createHmac('sha256', secret).update(JSON.stringify(qrPayload)).digest('hex');
    const isValid = testSignature === signature;
    console.log(`Signature valid: ${isValid ? '✅ YES' : '❌ NO'}`);
    
    console.log('\n✨ Product creation complete!');
    console.log(`\n📊 Database now has:`);
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    console.log(`   ${productCount} product(s)`);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  } finally {
    db.close();
  }
}

createProductSimple();
