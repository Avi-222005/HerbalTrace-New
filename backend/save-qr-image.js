const QRCode = require('qrcode');
const fs = require('fs');
const crypto = require('crypto');

async function saveQRImage() {
  try {
    const qrCode = 'QR-1765180668325-F2BF93EF';
    const qrPayload = {
      qrCode,
      productId: 'PROD-8a9c58db-e019-4182-b195-c338a6f596d5',
      productName: 'Premium Tulsi Extract',
      batchId: 'BATCH-TULSI-20251207-8453',
      species: 'Tulsi',
      manufacturer: 'HerbalTrace Manufacturer',
      manufactureDate: '2025-12-08',
      expiryDate: '2026-12-08',
      blockchainTx: null,
      verified: true,
      timestamp: new Date().toISOString()
    };

    const secret = 'herbaltrace-qr-secret-key-change-in-production';
    const signature = crypto.createHmac('sha256', secret)
      .update(JSON.stringify(qrPayload))
      .digest('hex');

    const signedPayload = {
      ...qrPayload,
      signature
    };

    // Generate QR code as PNG file with just the URL (scannable by any QR reader)
    const verificationUrl = `http://localhost:3000/verify/${qrCode}`;
    const filename = `QR-${qrCode}.png`;
    await QRCode.toFile(filename, verificationUrl, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 800,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    console.log('✅ QR Code image saved successfully!');
    console.log(`📁 File: ${filename}`);
    console.log(`📍 Location: ${__dirname}\\${filename}`);
    console.log('\n📋 Product Details:');
    console.log(`   Product: ${qrPayload.productName}`);
    console.log(`   Product ID: ${qrPayload.productId}`);
    console.log(`   Batch: ${qrPayload.batchId}`);
    console.log(`   QR Code: ${qrCode}`);
    console.log(`   Verification: http://localhost:3000/verify/${qrCode}`);
    
  } catch (error) {
    console.error('❌ Error saving QR code:', error.message);
    process.exit(1);
  }
}

saveQRImage();
