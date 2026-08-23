/**
 * Test script to create a product with QR code from manufacturing end
 * This simulates the complete manufacturing workflow
 */

const Database = require('better-sqlite3');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const fs = require('fs');

const db = new Database('./data/herbaltrace.db');

console.log('\n🏭 HerbalTrace - Product Creation with QR Code Test\n');
console.log('='.repeat(60));

// Step 1: Get available batch
console.log('\n📦 Step 1: Fetching available batches...');
const batches = db.prepare(`
  SELECT * FROM batches 
  WHERE status = 'quality_tested' 
  ORDER BY created_at DESC 
  LIMIT 1
`).all();

if (batches.length === 0) {
  console.error('❌ No quality-tested batches available!');
  process.exit(1);
}

const batch = batches[0];
console.log(`✓ Found batch: ${batch.batch_number}`);
console.log(`  Species: ${batch.species}`);
console.log(`  Quantity: ${batch.total_quantity} ${batch.unit}`);
console.log(`  Status: ${batch.status}`);

// Step 2: Get batch collections for traceability
console.log('\n🌾 Step 2: Fetching batch collections...');
const collections = db.prepare(`
  SELECT ce.*, bc.batch_id
  FROM collection_events_cache ce
  JOIN batch_collections bc ON ce.id = bc.collection_id
  WHERE bc.batch_id = ?
`).all(batch.id);
console.log(`✓ Found ${collections.length} collection(s) in batch`);

// Step 3: Get QC test results
console.log('\n🔬 Step 3: Fetching quality test results...');
const qcTests = db.prepare(`
  SELECT * FROM qc_tests 
  WHERE batch_id = ? AND status = 'completed'
`).all(batch.batch_number);
console.log(`✓ Found ${qcTests.length} completed QC test(s)`);

// Step 4: Create product
console.log('\n🏭 Step 4: Creating final product...');
const productId = `PROD-${uuidv4()}`;
const qrCode = `QR-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
const timestamp = new Date().toISOString();

const productData = {
  id: productId,
  product_name: `Premium ${batch.species} Extract`,
  product_type: 'extract',
  quantity: batch.total_quantity * 0.5, // 50% yield from raw material
  unit: batch.unit,
  batch_id: batch.id,
  manufacturer_id: 'MFG-001',
  manufacturer_name: 'HerbalTrace Manufacturer',
  manufacture_date: new Date().toISOString().split('T')[0],
  expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year expiry
  qr_code: qrCode,
  ingredients: JSON.stringify([{ name: batch.species, percentage: 100 }]),
  certifications: JSON.stringify(['Organic Certified', 'GMP Certified', 'ISO 9001:2015']),
  blockchain_tx_id: null,
  status: 'manufactured',
  created_at: timestamp,
  updated_at: timestamp
};

// Insert product into database
const insertProduct = db.prepare(`
  INSERT INTO products (
    id, product_name, product_type, quantity, unit, batch_id,
    manufacturer_id, manufacturer_name, manufacture_date, expiry_date, 
    qr_code, ingredients, certifications, blockchain_tx_id, status,
    created_at, updated_at
  ) VALUES (
    @id, @product_name, @product_type, @quantity, @unit, @batch_id,
    @manufacturer_id, @manufacturer_name, @manufacture_date, @expiry_date,
    @qr_code, @ingredients, @certifications, @blockchain_tx_id, @status,
    @created_at, @updated_at
  )
`);

insertProduct.run(productData);
console.log(`✓ Product created: ${productData.product_name}`);
console.log(`  Product ID: ${productId}`);
console.log(`  QR Code: ${qrCode}`);
console.log(`  Quantity: ${productData.quantity} ${productData.unit}`);
console.log(`  Manufacture Date: ${productData.manufacture_date}`);
console.log(`  Expiry Date: ${productData.expiry_date}`);

// Step 5: Generate QR Code Image
console.log('\n📱 Step 5: Generating QR Code...');
const qrUrl = `http://localhost:3000/verify/${qrCode}`;
const qrFilename = `QR-${qrCode}.png`;

QRCode.toFile(qrFilename, qrUrl, {
  width: 800,
  margin: 2,
  color: {
    dark: '#2e7d32',  // Green color matching theme
    light: '#FFFFFF'
  }
}, (err) => {
  if (err) {
    console.error('❌ QR code generation failed:', err);
  } else {
    console.log(`✓ QR Code image saved: ${qrFilename}`);
    console.log(`  Verification URL: ${qrUrl}`);
  }
});

// Step 6: Display QR in terminal
console.log('\n📱 Step 6: Displaying QR Code in terminal...');
QRCode.toString(qrUrl, { type: 'terminal', small: true }, (err, qrString) => {
  if (err) {
    console.error('❌ Terminal QR failed:', err);
  } else {
    console.log('\nScan this QR code with your phone:\n');
    console.log(qrString);
  }
});

// Step 7: Summary
setTimeout(() => {
  console.log('\n' + '='.repeat(60));
  console.log('✅ PRODUCT CREATION COMPLETE!\n');
  console.log('📋 Summary:');
  console.log(`   • Product: ${productData.name}`);
  console.log(`   • Batch: ${batch.batch_number} (${batch.species})`);
  console.log(`   • Collections: ${collections.length} farmer source(s)`);
  console.log(`   • QC Tests: ${qcTests.length} quality test(s) passed`);
  console.log(`   • QR Code: ${qrCode}`);
  console.log(`   • QR Image: ${qrFilename}`);
  console.log(`\n🌐 Verification URL: ${qrUrl}`);
  console.log('\n📱 Next Steps:');
  console.log('   1. Open the verification URL in browser');
  console.log('   2. Scan the QR code PNG with your phone');
  console.log('   3. View complete product traceability');
  console.log('\n' + '='.repeat(60) + '\n');
}, 500);
