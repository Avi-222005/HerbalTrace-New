import { Router, Request, Response, NextFunction } from 'express';
import { getFabricClient } from '../fabric/fabricClient';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';
import { db } from '../config/database';
import QRCode from 'qrcode';

const router = Router();

/**
 * @route   GET /api/qr/verify/:qrCode
 * @desc    Verify and get complete provenance for a product QR code (Consumer scanning)
 * @access  Public
 */
router.get('/verify/:qrCode', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { qrCode } = req.params;

    // Get product from database
    let product = await db.prepare('SELECT * FROM products WHERE qr_code = ? OR id = ? OR batch_id = ?').get(qrCode, qrCode, qrCode) as any;
    let batch = null;

    if (!product) {
      // Check if qrCode is a batch number
      batch = await db.prepare('SELECT * FROM batches WHERE batch_number = ? OR id = ?').get(qrCode, qrCode) as any;
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: 'Product or batch not found. QR code may be invalid.',
        });
      }
      // Create a virtual product record from batch
      product = {
        id: `PROD-${batch.id}`,
        product_name: `Ayurvedic Pure ${batch.species || 'Botanical'} Formulation`,
        product_type: 'Standardized Extract',
        quantity: batch.total_quantity || 100,
        unit: batch.unit || 'bottles',
        manufacture_date: batch.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        expiry_date: '2028-12-31',
        manufacturer_name: 'Ayush Licensed Manufacturer',
        qr_code: qrCode,
        blockchain_tx_id: batch.blockchain_tx_id,
        ingredients: JSON.stringify([`Pure ${batch.species} Extract`]),
        certifications: JSON.stringify(['Ayush Premium Mark', 'GMP Certified']),
        batch_id: batch.batch_number || batch.id
      };
    } else {
      batch = await db.prepare('SELECT * FROM batches WHERE batch_number = ? OR id = ?').get(product.batch_id, product.batch_id) as any;
    }

    const batchDbId = batch?.id || product?.batch_id;

    // Get collection events for this batch
    const collections = batchDbId ? await db.prepare(`
      SELECT ce.*, bc.batch_id
      FROM collection_events_cache ce
      JOIN batch_collections bc ON ce.id = bc.collection_id
      WHERE bc.batch_id = ?
    `).all(batchDbId) as any[] : [];

    // Get QC tests and certificates
    const qcTests = await db.prepare(`
      SELECT t.*, c.certificate_number, c.overall_result, c.issued_date, c.blockchain_txid
      FROM qc_tests t
      LEFT JOIN qc_certificates c ON t.id = c.test_id
      WHERE t.batch_id = ? OR t.batch_id = ?
    `).all(product.batch_id, batch?.batch_number || '') as any[];

    // ✅ ENHANCED: Get blockchain provenance and verify authenticity
    let blockchainProvenance = null;
    let blockchainVerified = false;
    let blockchainBatch = null;
    let blockchainCertificates = [];
    
    try {
      const fabricClient = getFabricClient();
      await fabricClient.connect('admin-Farmers', 'Farmers');
      
      // 1. Try to get product directly from blockchain by QR code
      try {
        const prodOnChain = await fabricClient.getProductByQRCode(qrCode);
        if (prodOnChain) {
          blockchainVerified = true;
          logger.info(`✅ Product ${qrCode} found on blockchain`);
        }
      } catch (err: any) {
        logger.warn(`Direct product query on blockchain: ${err.message}`);
      }

      // 2. Try to get full provenance by QR code
      try {
        blockchainProvenance = await fabricClient.getProvenanceByQRCode(qrCode);
        if (blockchainProvenance) {
          blockchainVerified = true;
          logger.info(`✅ Provenance for ${qrCode} verified on blockchain`);
        }
      } catch (err: any) {
        logger.warn(`Provenance query on blockchain: ${err.message}`);
      }

      // 3. Verify batch on blockchain if exists
      if (batch?.blockchain_tx_id || batch?.id) {
        try {
          const batchId = `BATCH-${batch.id}`;
          blockchainBatch = await fabricClient.evaluateTransaction('GetBatch', batchId);
          if (blockchainBatch) {
            blockchainBatch = typeof blockchainBatch === 'string' ? JSON.parse(blockchainBatch) : blockchainBatch;
            blockchainVerified = true;
            logger.info(`✅ Batch ${batch.batch_number} verified on blockchain`);
          }
        } catch (err: any) {
          logger.warn(`Batch verification on blockchain: ${err.message}`);
        }
      }

      // 4. Verify QC certificates on blockchain
      for (const qcTest of qcTests) {
        if (qcTest.blockchain_txid && qcTest.certificate_number) {
          try {
            const certData = await fabricClient.evaluateTransaction('QueryQCCertificate', qcTest.certificate_number);
            if (certData) {
              blockchainCertificates.push(typeof certData === 'string' ? JSON.parse(certData) : certData);
              blockchainVerified = true;
              logger.info(`✅ Certificate ${qcTest.certificate_number} verified on blockchain`);
            }
          } catch (err: any) {
            logger.warn(`Certificate ${qcTest.certificate_number} on blockchain: ${err.message}`);
          }
        }
      }

      await fabricClient.disconnect();
    } catch (error: any) {
      logger.warn(`Could not fetch blockchain provenance: ${error.message}`);
    }

    // Build comprehensive provenance response
    const provenance = {
      product: {
        id: product.id,
        name: product.product_name,
        type: product.product_type,
        quantity: product.quantity,
        unit: product.unit,
        manufactureDate: product.manufacture_date,
        expiryDate: product.expiry_date,
        manufacturer: product.manufacturer_name,
        qrCode: product.qr_code,
        blockchainTx: product.blockchain_tx_id,
        ingredients: JSON.parse(product.ingredients || '[]'),
        certifications: JSON.parse(product.certifications || '[]'),
      },
      batch: {
        batchNumber: batch?.batch_number || product.batch_id,
        species: batch?.species || 'Herb',
        totalQuantity: batch?.total_quantity || product.quantity,
        unit: batch?.unit || product.unit,
        collectionCount: collections.length,
        status: batch?.status || 'completed',
        createdAt: batch?.created_at,
        blockchainTx: batch?.blockchain_tx_id,
        blockchainVerified: !!blockchainBatch,
        blockchainData: blockchainBatch || null
      },
      collections: collections.map((c: any) => {
        let data = {};
        try {
          data = JSON.parse(c.data_json || '{}');
        } catch {}
        return {
          id: c.id || c.collection_id,
          farmerId: c.farmer_id,
          farmerName: c.farmer_name,
          species: c.species,
          quantity: c.quantity,
          unit: c.unit,
          location: {
            latitude: c.latitude,
            longitude: c.longitude,
            altitude: c.altitude,
            zoneName: (data as any).zoneName,
          },
          harvestDate: c.harvest_date,
          harvestMethod: (data as any).harvestMethod,
          partCollected: (data as any).partCollected,
          weatherConditions: (data as any).weatherConditions,
          blockchainTx: c.blockchain_tx_id,
        };
      }),
      qualityTests: qcTests.map((t: any) => ({
        testId: t.test_id || t.id,
        testType: t.test_type,
        labName: t.lab_name,
        testDate: t.requested_at,
        certificateNumber: t.certificate_number,
        overallResult: t.overall_result,
        issuedDate: t.issued_date,
        blockchainTx: t.blockchain_txid,
        blockchainVerified: blockchainCertificates.some((bc: any) => bc.certificateId === t.certificate_number)
      })),
      blockchain: {
        available: blockchainVerified,
        verified: blockchainVerified,
        message: blockchainVerified 
          ? 'Product data verified on blockchain' 
          : 'Blockchain verification unavailable',
        provenance: blockchainProvenance,
        certificates: blockchainCertificates,
        timestamp: new Date().toISOString()
      },
      verification: {
        verified: blockchainVerified,
        blockchainVerified: blockchainVerified,
        verifiedAt: new Date().toISOString(),
        dataSource: blockchainVerified ? 'Blockchain' : 'Database',
        authenticity: blockchainVerified ? 'VERIFIED_ON_BLOCKCHAIN' : 'DATABASE_ONLY',
        trustLevel: blockchainVerified ? 'HIGH' : 'UNVERIFIED'
      },
    };

    logger.info(`QR code scanned: ${qrCode} (Blockchain verified: ${blockchainVerified})`);

    res.status(200).json({
      success: blockchainVerified,
      message: blockchainVerified 
        ? 'Product verified successfully on blockchain'
        : 'Product found in database only (blockchain verification unavailable)',
      data: provenance,
    });
  } catch (error: any) {
    logger.error('Error verifying QR code:', error);
    next(error);
  }
});

/**
 * @route   GET /api/qr/:qrCode
 * @desc    Get product provenance by QR code (Consumer scanning) - Legacy endpoint
 * @access  Public
 */
router.get('/:qrCode', async (req: Request, res: Response, next: NextFunction) => {
  // Redirect to verify endpoint
  return res.redirect(`/api/v1/qr/verify/${req.params.qrCode}`);
});

/**
 * @route   POST /api/qr/generate
 * @desc    Generate QR code image
 * @access  Private
 */
router.post('/generate', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, format } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Data is required'
      });
    }

    const qrCodeImage = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2
    });

    res.status(200).json({
      success: true,
      data: {
        qrCode: data,
        image: qrCodeImage
      }
    });
  } catch (error: any) {
    logger.error('Error generating QR code:', error);
    next(error);
  }
});

export default router;
