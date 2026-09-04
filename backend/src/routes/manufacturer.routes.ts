/**
 * Manufacturer Routes - Handle product creation, processing, and QR generation
 */

import { Router, Response } from 'express';
import { db } from '../config/database';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { logger } from '../utils/logger';
import { getFabricClient } from '../fabric/fabricClient';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

const router = Router();

/**
 * POST /api/v1/manufacturer/products
 * Create a final product from batch with QR code
 * 
 * Body:
 * {
 *   batchId: string (required)
 *   productName: string (required)
 *   productType: string (required) - "powder", "extract", "capsule", "oil"
 *   quantity: number (required)
 *   unit: string (required)
 *   manufactureDate: string (required)
 *   expiryDate: string (required)
 *   ingredients: string[] (required)
 *   certifications: string[] (optional)
 *   processingSteps: Array<{
 *     processType: string,
 *     temperature?: number,
 *     duration?: number,
 *     equipment?: string,
 *     notes?: string
 *   }> (required)
 * }
 */
router.post('/products', authenticate, authorize('Admin', 'Manufacturer'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      batchId,
      productName,
      productType,
      quantity,
      unit,
      manufactureDate,
      expiryDate,
      ingredients,
      certifications,
      processingSteps
    } = req.body;

    // Validation
    if (!batchId || !productName || !productType || !quantity || !unit || !manufactureDate || !expiryDate || !ingredients || !processingSteps) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: batchId, productName, productType, quantity, unit, manufactureDate, expiryDate, ingredients, processingSteps'
      });
    }

    // Get batch details
    const batch = db.prepare('SELECT * FROM batches WHERE id = ? OR batch_number = ?').get(batchId, batchId) as any;
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Enforce 1 QR for 1 batch rule: prevent re-manufacturing an already processed batch
    const existingProduct = db.prepare('SELECT * FROM products WHERE batch_id = ? OR batch_id = ?').get(batch.batch_number, batch.id) as any;
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: `Batch ${batch.batch_number} has already been formulated into product '${existingProduct.product_name}' (QR: ${existingProduct.qr_code}). Exactly 1 QR Passport is allowed per raw batch.`
      });
    }

    // Get batch collections
    const batchCollections = db.prepare(`
      SELECT ce.*, bc.batch_id
      FROM collection_events_cache ce
      JOIN batch_collections bc ON ce.id = bc.collection_id
      WHERE bc.batch_id = ?
    `).all(batch.id) as any[];

    // Get QC tests for batch
    const qcTests = db.prepare(`
      SELECT * FROM qc_tests WHERE batch_id = ? AND status = 'completed'
    `).all(batch.batch_number) as any[];

    // Get QC certificates
    const qcCertificates = db.prepare(`
      SELECT * FROM qc_certificates WHERE batch_id = ?
    `).all(batch.batch_number) as any[];

    const productId = `PROD-${uuidv4()}`;
    const qrCode = `QR-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const timestamp = new Date().toISOString();

    // 1. Record processing steps to blockchain (optional - will continue if blockchain is unavailable)
    const processingStepIds: string[] = [];
    let blockchainTxId = null;
    
    try {
      const fabricClient = getFabricClient();
      await fabricClient.connect(`admin-Manufacturers`, 'Manufacturers');

      for (const step of processingSteps) {
        const stepId = `PROC-${uuidv4()}`;
        const processingData = {
          id: stepId,
          type: 'ProcessingStep',
          previousStepId: batch.id,
          batchId: batch.batch_number,
          processorId: req.user!.userId,
          processorName: req.user!.name || req.user!.userId,
          processType: step.processType,
          processDate: manufactureDate,
          timestamp: timestamp,
          inputQuantity: batch.total_quantity,
          outputQuantity: quantity,
          unit: unit,
          temperature: step.temperature,
          duration: step.duration,
          equipment: step.equipment,
          parameters: step.notes ? { notes: step.notes } : {},
          qualityChecks: qcCertificates.map((cert: any) => cert.certificate_number),
          operatorId: req.user!.userId,
          operatorName: req.user!.name || req.user!.userId,
          location: 'Manufacturing Facility',
          status: 'completed',
        };

        try {
          await fabricClient.createProcessingStep(processingData);
          processingStepIds.push(stepId);
          logger.info(`Processing step recorded to blockchain: ${stepId}`);
        } catch (error: any) {
          logger.error(`Failed to record processing step to blockchain: ${error.message}`);
        }
      }

      // 2. Create product on blockchain
      const productData = {
        id: productId,
        type: 'Product',
        batchId: batch.batch_number,
        productName,
        productType,
        quantity,
        unit,
        manufactureDate,
        expiryDate,
        qrCode,
        ingredients,
        collectionEventIds: batchCollections.map((c: any) => c.collection_id || c.id),
        qualityTestIds: qcTests.map((t: any) => t.test_id || t.id),
        processingStepIds,
        manufacturerId: req.user!.userId,
        manufacturerName: req.user!.name || req.user!.userId,
        certifications: certifications || [],
        packagingDate: timestamp,
        status: 'manufactured',
        timestamp,
      };

      try {
        const result = await fabricClient.createProduct(productData);
        blockchainTxId = result?.transactionId || 'RECORDED';
        logger.info(`Product recorded to blockchain: ${productId}, TX: ${blockchainTxId}`);
      } catch (error: any) {
        logger.error(`Failed to record product to blockchain: ${error.message}`);
      }

      await fabricClient.disconnect();
    } catch (error: any) {
      logger.warn(`Blockchain unavailable - continuing without blockchain sync: ${error.message}`);
      blockchainTxId = 'BLOCKCHAIN_UNAVAILABLE';
    }

    // 3. Generate QR code image BEFORE saving to database
    // Dynamically resolve frontend host for authentic LAN & mobile phone scanning
    const getLocalIp = () => {
      try {
        const interfaces = os.networkInterfaces();
        for (const ifaceName of Object.keys(interfaces)) {
          const iface = interfaces[ifaceName];
          if (!iface) continue;
          for (const alias of iface) {
            if (alias.family === 'IPv4' && !alias.internal && alias.address !== '127.0.0.1') {
              return alias.address;
            }
          }
        }
      } catch (_) {}
      return '192.168.9.55';
    };

    const localLanIp = getLocalIp();
    let frontendBaseUrl = process.env.FRONTEND_URL || process.env.PUBLIC_SCAN_URL;
    if (!frontendBaseUrl) {
      const clientOrigin = req.headers.origin || req.headers.referer;
      if (clientOrigin) {
        try {
          const parsed = new URL(clientOrigin as string);
          frontendBaseUrl = `${parsed.protocol}//${parsed.host}`;
        } catch (e) {}
      }
    }
    if (!frontendBaseUrl) {
      const host = req.get('host') || `${localLanIp}:3000`;
      const clientHost = host.includes(':3000') ? host.replace(':3000', ':3001') : (host.includes(':') ? host : `${host}:3001`);
      frontendBaseUrl = `http://${clientHost}`;
    }

    // Replace localhost or 127.0.0.1 with local LAN IP so Google Lens and smartphones can reach it!
    if (frontendBaseUrl.includes('localhost') || frontendBaseUrl.includes('127.0.0.1')) {
      frontendBaseUrl = frontendBaseUrl.replace(/localhost|127\.0\.0\.1/g, localLanIp);
    }

    const verificationUrl = `${frontendBaseUrl}/verify/${qrCode}`;
    
    const qrPayloadTemp = {
      qrCode,
      productId,
      productName,
      batchId: batch.batch_number,
      species: batch.species,
      manufacturer: req.user!.name || req.user!.userId,
      manufactureDate,
      expiryDate,
      blockchainTx: blockchainTxId,
      verified: true,
      timestamp,
    };

    const secret = process.env.QR_SIGNING_SECRET || 'herbaltrace-qr-secret-key-change-in-production';
    const dataToSign = JSON.stringify(qrPayloadTemp);
    const signature = crypto.createHmac('sha256', secret).update(dataToSign).digest('hex');

    const signedPayload = {
      ...qrPayloadTemp,
      signature,
    };

    // Generate QR code image as data URL encoding the authentic URL
    const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // 4. Save product to database with QR image
    db.prepare(`
      INSERT INTO products (
        id, product_name, product_type, batch_id, manufacturer_id, manufacturer_name,
        quantity, unit, manufacture_date, expiry_date, qr_code, qr_code_image,
        ingredients, certifications, blockchain_tx_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      productId,
      productName,
      productType,
      batch.batch_number,
      req.user!.userId,
      req.user!.name || req.user!.userId,
      quantity,
      unit,
      manufactureDate,
      expiryDate,
      qrCode,
      qrCodeDataURL,
      JSON.stringify(ingredients),
      JSON.stringify(certifications || []),
      blockchainTxId,
      'manufactured'
    );

    // 5. Update batch status to processing_complete / manufactured
    db.prepare("UPDATE batches SET status = ?, updated_at = datetime('now') WHERE id = ? OR batch_number = ?")
      .run('processing_complete', batch.id, batch.batch_number);

    // Create product record with QR
    const product = {
      id: productId,
      productName,
      productType,
      batchId: batch.batch_number,
      quantity,
      unit,
      manufactureDate,
      expiryDate,
      qrCode,
      qrCodeImage: qrCodeDataURL,
      blockchainTxId,
      collectionCount: batchCollections.length,
      qcTestCount: qcTests.length,
      processingStepCount: processingStepIds.length,
      verificationUrl,
    };

    logger.info(`Product created successfully: ${productId} with QR: ${qrCode}`);

    res.status(201).json({
      success: true,
      message: 'Product created and recorded on blockchain successfully',
      data: product,
    });
  } catch (error: any) {
    logger.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product',
    });
  }
});

/**
 * GET /api/v1/manufacturer/products
 * Get all products
 */
router.get('/products', authenticate, authorize('Admin', 'Manufacturer'), async (req: AuthRequest, res: Response) => {
  try {
    const products = db.prepare(`
      SELECT * FROM products 
      ORDER BY created_at DESC
    `).all() as any[];

    // Parse JSON fields and convert snake_case to camelCase for each product
    const parsedProducts = products.map(product => ({
      id: product.id,
      productName: product.product_name,
      productType: product.product_type,
      batchId: product.batch_id,
      manufacturerId: product.manufacturer_id,
      manufacturerName: product.manufacturer_name,
      quantity: product.quantity,
      unit: product.unit,
      manufactureDate: product.manufacture_date,
      expiryDate: product.expiry_date,
      qrCode: product.qr_code,
      qrCodeImage: product.qr_code_image,
      ingredients: JSON.parse(product.ingredients || '[]'),
      certifications: JSON.parse(product.certifications || '[]'),
      blockchainTxId: product.blockchain_tx_id,
      status: product.status,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }));

    res.json({
      success: true,
      data: parsedProducts,
      total: parsedProducts.length,
    });
  } catch (error: any) {
    logger.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get products',
    });
  }
});

/**
 * GET /api/v1/manufacturer/products/:id
 * Get product details
 */
router.get('/products/:id', authenticate, authorize('Admin', 'Manufacturer'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Parse JSON fields and convert snake_case to camelCase
    const formattedProduct = {
      id: product.id,
      productName: product.product_name,
      productType: product.product_type,
      batchId: product.batch_id,
      manufacturerId: product.manufacturer_id,
      manufacturerName: product.manufacturer_name,
      quantity: product.quantity,
      unit: product.unit,
      manufactureDate: product.manufacture_date,
      expiryDate: product.expiry_date,
      qrCode: product.qr_code,
      qrCodeImage: product.qr_code_image,
      ingredients: JSON.parse(product.ingredients || '[]'),
      certifications: JSON.parse(product.certifications || '[]'),
      blockchainTxId: product.blockchain_tx_id,
      status: product.status,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    };

    res.json({
      success: true,
      data: formattedProduct,
    });
  } catch (error: any) {
    logger.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get product',
    });
  }
});

/**
 * GET /api/v1/manufacturer/batches
 * Get batches ready for manufacturing (quality_tested status)
 */
router.get('/batches', authenticate, authorize('Admin', 'Manufacturer'), async (req: AuthRequest, res: Response) => {
  try {
    const batches = db.prepare(`
      SELECT b.*, 
        (SELECT COUNT(*) FROM batch_collections WHERE batch_id = b.id) as collection_count,
        (SELECT COUNT(*) FROM qc_tests WHERE batch_id = b.batch_number AND status = 'completed') as qc_test_count
      FROM batches b
      WHERE b.status = 'quality_tested'
      ORDER BY b.created_at DESC
    `).all() as any[];

    res.json({
      success: true,
      data: batches,
      total: batches.length,
    });
  } catch (error: any) {
    logger.error('Get batches error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get batches',
    });
  }
});

export default router;
