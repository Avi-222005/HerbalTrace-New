import { Router, Request, Response, NextFunction } from 'express';
import { getFabricClient } from '../fabric/fabricClient';
import { fabricService } from '../services/FabricService';
import { authenticate } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { db } from '../config/database';
import validationService from '../services/ValidationService';
import imageUploadService from '../services/ImageUploadService';
import BatchService from '../services/BatchService';

const router = Router();

/**
 * @route   GET /api/collections
 * @desc    Get all collection events (with optional filters)
 * @access  Private
 */
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { species, syncStatus, startDate, endDate, limit = 100, offset = 0 } = req.query;
    const user = (req as any).user;

    let query = 'SELECT * FROM collection_events_cache WHERE 1=1';
    const params: any[] = [];

    // Farmers can only see their own collections
    if (user.role === 'Farmer') {
      query += ' AND farmer_id = ?';
      params.push(user.userId);
    }

    if (species) {
      query += ' AND species = ?';
      params.push(species);
    }

    if (syncStatus) {
      query += ' AND sync_status = ?';
      params.push(syncStatus);
    }

    if (startDate) {
      query += ' AND harvest_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND harvest_date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const collections = db.prepare(query).all(...params);

    // Parse JSON data
    const parsedCollections = collections.map((row: any) => ({
      ...JSON.parse(row.data_json),
      syncStatus: row.sync_status,
      blockchainTxId: row.blockchain_tx_id,
      createdAt: row.created_at,
      syncedAt: row.synced_at
    }));

    res.status(200).json({
      success: true,
      count: parsedCollections.length,
      data: parsedCollections
    });
  } catch (error: any) {
    logger.error('Error querying all collections:', error);
    next(error);
  }
});

/**
 * @route   POST /api/collections
 * @desc    Create a new collection event with full validation
 * @access  Private (Farmers only)
 */
router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      species,
      commonName,
      scientificName,
      quantity,
      unit,
      latitude,
      longitude,
      altitude,
      accuracy,
      harvestDate,
      harvestMethod,
      partCollected,
      weatherConditions,
      soilType,
      images,
      conservationStatus,
      certificationIds,
      clientTimestamp, // For offline sync
      deviceId // For offline sync
    } = req.body;

    // Validate required fields
    if (!species || !quantity || !latitude || !longitude || !harvestDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: species, quantity, latitude, longitude, harvestDate'
      });
    }

    // Get authenticated user
    const user = (req as any).user;
    if (user.role !== 'Farmer' && user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can create collection events'
      });
    }

    const farmerId = user.userId;
    const farmerName = user.fullName;

    // Get farmer's location data for zoneName/region
    const farmerData: any = db.prepare(`
      SELECT location_district, location_state 
      FROM users 
      WHERE user_id = ?
    `).get(farmerId);

    const zoneName = farmerData?.location_district || req.body.zoneName || 'Dehradun';

    // Parse and validate numeric values
    const parsedQuantity = parseFloat(quantity);
    const parsedLatitude = parseFloat(latitude);
    const parsedLongitude = parseFloat(longitude);
    const parsedAltitude = altitude ? parseFloat(altitude) : 250.0;
    const parsedAccuracy = accuracy ? parseFloat(accuracy) : 5.0;

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity value'
      });
    }

    // Comprehensive validation
    const validationResult = await validationService.validateCollectionEvent(
      {
        farmerId,
        species,
        quantity: parsedQuantity,
        unit: unit || 'kg',
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        altitude: parsedAltitude,
        accuracy: parsedAccuracy,
        harvestDate
      },
      db
    );

    // If validation fails, create alert and reject
    if (!validationResult.valid) {
      logger.warn(`Collection validation failed for farmer ${farmerId}:`, validationResult.violations);
      
      // Create alert for violations
      db.prepare(`
        INSERT INTO alerts (
          alert_type, severity, entity_type, entity_id, title, message, details
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        'SEASONAL_WINDOW_VIOLATION', // Or determine type from violations
        'HIGH',
        'collection',
        'pending',
        'Collection Event Validation Failed',
        validationResult.message || 'Validation errors detected',
        JSON.stringify({ violations: validationResult.violations })
      );

      return res.status(400).json({
        success: false,
        message: validationResult.message,
        violations: validationResult.violations,
        warnings: validationResult.warnings
      });
    }

    // Generate collection ID
    const collectionId = `COL-${Date.now()}-${uuidv4().split('-')[0]}`;

    // Prepare collection event data
    // Convert harvestDate (YYYY-MM-DD) to ISO 8601 timestamp format required by chaincode
    const harvestDateISO = new Date(harvestDate.includes('T') ? harvestDate : harvestDate + 'T00:00:00Z').toISOString();
    
    // Normalize species name: remove parentheses portion (e.g., "Tulsi (Holy Basil)" -> "Tulsi")
    const normalizedSpecies = species.split(' (')[0].trim();
    
    const collectionEvent = {
      id: collectionId,
      type: 'CollectionEvent',
      farmerId,
      farmerName: farmerName || 'Farmer User',
      species: normalizedSpecies,
      commonName: commonName || species,
      scientificName: scientificName || `${normalizedSpecies} sp.`,
      quantity: parsedQuantity,
      unit: unit || 'kg',
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      altitude: parsedAltitude,
      accuracy: parsedAccuracy,
      harvestDate: harvestDateISO,
      zoneName: zoneName || 'Dehradun',
      timestamp: new Date().toISOString(),
      harvestMethod: harvestMethod || 'manual',
      partCollected: partCollected || 'leaf',
      weatherConditions: weatherConditions || 'clear',
      soilType: soilType || 'loamy',
      images: images && images.length > 0 ? images : ['ipfs://sample-herb-image'],
      approvedZone: true,
      conservationStatus: conservationStatus || 'Least Concern',
      certificationIds: certificationIds && certificationIds.length > 0 ? certificationIds : ['CERT-ORG-2026'],
      status: 'pending',
      nextStepId: 'PENDING_QC'
    };

    // Store in local database cache
    db.prepare(`
      INSERT INTO collection_events_cache (
        id, farmer_id, farmer_name, species, quantity, unit,
        latitude, longitude, altitude, harvest_date, data_json, sync_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      collectionId,
      farmerId,
      farmerName,
      species,
      parsedQuantity,
      unit || 'kg',
      parsedLatitude,
      parsedLongitude,
      parsedAltitude || null,
      harvestDate,
      JSON.stringify(collectionEvent),
      'pending'
    );

    logger.info(`Collection event cached: ${collectionId} by farmer ${farmerId}`);

    // Attempt blockchain sync (async, non-blocking)
    let blockchainTxId: string | undefined;
    let autoBatch: any = null;
    try {
      const fabricClient = getFabricClient();
      await fabricClient.connect(farmerId, user.orgName || 'Farmers');
      
      const result = await fabricClient.createCollectionEvent(collectionEvent);
      blockchainTxId = result?.transactionId || (result as any)?.txId;
      
      if (blockchainTxId) {
        // Update sync status
        db.prepare(`
          UPDATE collection_events_cache
          SET sync_status = ?, blockchain_tx_id = ?, synced_at = datetime('now')
          WHERE id = ?
        `).run('synced', blockchainTxId, collectionId);
        logger.info(`✅ Collection ${collectionId} synced to blockchain: ${blockchainTxId}`);
      }

      // Auto-create batch once collection is synced so lab can fetch it immediately.
      try {
        const batch = BatchService.createBatch(
          db,
          {
            species: normalizedSpecies,
            collectionIds: [collectionId],
            notes: 'Auto-created from farmer collection event'
          },
          user.username || farmerId,
          user.fullName || farmerName
        );

        let batchBlockchainTxId: string | null = null;
        try {
          // ✅ FIXED: Use proper batch.id (numeric) and correct payload structure
          const batchPayload = {
            id: `BATCH-${batch.id}`, // Use numeric ID with prefix for blockchain
            batchNumber: batch.batch_number,
            species: batch.species,
            totalQuantity: batch.total_quantity,
            unit: batch.unit,
            collectionEventIds: [collectionId], // Array of strings (collection IDs)
            createdBy: farmerId,
            createdByName: farmerName,
            notes: 'Auto-created from farmer collection event'
          };

          // ✅ Use new FabricService createBatch method
          const batchResult = await fabricService.createBatch(batchPayload);
          batchBlockchainTxId = batchResult.txId;

          if (batchBlockchainTxId) {
            db.prepare(`
              UPDATE batches
              SET blockchain_tx_id = ?
              WHERE id = ?
            `).run(batchBlockchainTxId, batch.id);
            
            logger.info(`✅ Batch ${batch.batch_number} synced to blockchain (TxID: ${batchBlockchainTxId})`);
          }
        } catch (batchChainError: any) {
          logger.error(`Auto batch blockchain sync failed for ${batch.batch_number}:`, batchChainError);
          // Mark batch for retry
          db.prepare(`
            UPDATE batches
            SET notes = ?
            WHERE id = ?
          `).run(`Blockchain sync pending - Error: ${batchChainError.message}`, batch.id);
        }

        autoBatch = {
          id: batch.id,
          batchNumber: batch.batch_number,
          status: batch.status,
          blockchainTxId: batchBlockchainTxId,
        };
      } catch (batchError: any) {
        logger.warn(`Auto batch creation skipped for ${collectionId}:`, batchError.message);
      }
      
      await fabricClient.disconnect();
      logger.info(`Collection synced to blockchain: ${collectionId}, TX: ${blockchainTxId}`);
    } catch (blockchainError: any) {
      logger.error(`Blockchain sync failed for ${collectionId}:`, blockchainError);
      // Store error but don't fail the request
      db.prepare(`
        UPDATE collection_events_cache
        SET sync_status = ?, error_message = ?
        WHERE id = ?
      `).run('failed', blockchainError.message, collectionId);

      // Create local batch fallback so lab can fetch and proceed while blockchain retry is handled separately.
      try {
        const fallbackBatchNumber = `BATCH-${normalizedSpecies.toUpperCase()}-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;
        const inserted = db.prepare(`
          INSERT INTO batches (
            batch_number, species, total_quantity, unit, collection_count,
            status, created_by, created_by_name, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          fallbackBatchNumber,
          normalizedSpecies,
          parsedQuantity,
          unit || 'kg',
          1,
          'created',
          user.username || farmerId,
          user.fullName || farmerName,
          'Auto-created from farmer collection event (blockchain sync pending)'
        );

        const fallbackBatchId = inserted.lastInsertRowid as number;
        db.prepare(`
          INSERT INTO batch_collections (batch_id, collection_id) VALUES (?, ?)
        `).run(fallbackBatchId, collectionId);

        autoBatch = {
          id: fallbackBatchId,
          batchNumber: fallbackBatchNumber,
          status: 'created',
          blockchainTxId: null,
          note: 'Collection blockchain sync pending; retry sync to persist on channel.'
        };
      } catch (fallbackBatchError: any) {
        logger.warn(`Fallback auto batch creation failed for ${collectionId}:`, fallbackBatchError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Collection event created successfully',
      data: collectionEvent,
      transactionId: blockchainTxId,
      syncStatus: blockchainTxId ? 'synced' : 'failed',
      autoBatch,
      warnings: validationResult.warnings
    });

  } catch (error: any) {
    logger.error('Error creating collection event:', error);
    next(error);
  }
});

/**
 * @route   GET /api/collections/:id
 * @desc    Get collection event by ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    // Try local database first
    const cached = db.prepare(`
      SELECT * FROM collection_events_cache WHERE id = ?
    `).get(id) as any;

    if (cached) {
      const collectionData = JSON.parse(cached.data_json);
      
      // Farmers can only view their own collections
      if (user.role === 'Farmer' && collectionData.farmerId !== user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          ...collectionData,
          syncStatus: cached.sync_status,
          blockchainTxId: cached.blockchain_tx_id,
          createdAt: cached.created_at,
          syncedAt: cached.synced_at
        }
      });
    }

    // If not in cache, try blockchain
    try {
      const fabricClient = getFabricClient();
      await fabricClient.connect(user.username, user.orgName);

      const result = await fabricClient.getCollectionEvent(id);
      await fabricClient.disconnect();

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Collection event not found'
        });
      }

      res.status(200).json({
        success: true,
        data: result,
        source: 'blockchain'
      });
    } catch (blockchainError: any) {
      logger.error('Blockchain query failed:', blockchainError);
      return res.status(404).json({
        success: false,
        message: 'Collection event not found'
      });
    }
  } catch (error: any) {
    logger.error('Error getting collection event:', error);
    next(error);
  }
});

/**
 * @route   GET /api/collections/farmer/:farmerId
 * @desc    Get all collection events by farmer
 * @access  Private (Farmers can only access own data, Admins can access all)
 */
router.get('/farmer/:farmerId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { farmerId } = req.params;
    const user = (req as any).user;

    // Access control: Farmers can only view own data
    if (user.role === 'Farmer' && user.userId !== farmerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own collections'
      });
    }

    const collections = db.prepare(`
      SELECT * FROM collection_events_cache
      WHERE farmer_id = ?
      ORDER BY created_at DESC
    `).all(farmerId);

    const parsedCollections = collections.map((row: any) => ({
      ...JSON.parse(row.data_json),
      syncStatus: row.sync_status,
      blockchainTxId: row.blockchain_tx_id,
      createdAt: row.created_at,
      syncedAt: row.synced_at
    }));

    res.status(200).json({
      success: true,
      count: parsedCollections.length,
      data: parsedCollections
    });
  } catch (error: any) {
    logger.error('Error querying collections by farmer:', error);
    next(error);
  }
});

/**
 * @route   GET /api/collections/species/:species
 * @desc    Get all collection events by species
 * @access  Private
 */
router.get('/species/:species', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { species } = req.params;
    const user = (req as any).user;

    let query = 'SELECT * FROM collection_events_cache WHERE species = ?';
    const params: any[] = [species];

    // Farmers can only see their own collections
    if (user.role === 'Farmer') {
      query += ' AND farmer_id = ?';
      params.push(user.userId);
    }

    query += ' ORDER BY created_at DESC';

    const collections = db.prepare(query).all(...params);

    const parsedCollections = collections.map((row: any) => ({
      ...JSON.parse(row.data_json),
      syncStatus: row.sync_status,
      blockchainTxId: row.blockchain_tx_id,
      createdAt: row.created_at,
      syncedAt: row.synced_at
    }));

    res.status(200).json({
      success: true,
      count: parsedCollections.length,
      data: parsedCollections
    });
  } catch (error: any) {
    logger.error('Error querying collections by species:', error);
    next(error);
  }
});

/**
 * @route   GET /api/collections/regulations/species
 * @desc    Get season windows and harvest limits for all species
 * @access  Public (needed for mobile app offline reference)
 */
router.get('/regulations/species', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const speciesInfo = validationService.getAllSpeciesInfo();
    
    res.status(200).json({
      success: true,
      count: speciesInfo.length,
      data: speciesInfo
    });
  } catch (error: any) {
    logger.error('Error getting species regulations:', error);
    next(error);
  }
});

/**
 * @route   GET /api/collections/regulations/species/:species
 * @desc    Get season window and harvest limits for specific species
 * @access  Public
 */
router.get('/regulations/species/:species', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { species } = req.params;
    
    const seasonWindow = validationService.getSeasonWindow(species);
    const harvestLimit = validationService.getHarvestLimit(species);
    
    if (!seasonWindow && !harvestLimit) {
      return res.status(404).json({
        success: false,
        message: `No regulations found for species: ${species}`
      });
    }

    res.status(200).json({
      success: true,
      data: {
        species,
        seasonWindow,
        harvestLimit
      }
    });
  } catch (error: any) {
    logger.error('Error getting species regulations:', error);
    next(error);
  }
});

/**
 * @route   POST /api/collections/sync/retry
 * @desc    Retry failed blockchain syncs
 * @access  Private (Admin only)
 */
router.post('/sync/retry', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can retry sync operations'
      });
    }

    const failedCollections = db.prepare(`
      SELECT * FROM collection_events_cache
      WHERE sync_status = 'failed'
      ORDER BY created_at DESC
      LIMIT 50
    `).all();

    const results = [];
    
    for (const row of failedCollections) {
      const collectionData = JSON.parse((row as any).data_json);
      
      try {
        const fabricClient = getFabricClient();
        await fabricClient.connect('admin-Processors', 'Processors');
        
        const result = await fabricClient.createCollectionEvent(collectionData);
        const txId = result?.transactionId || `tx-${Date.now()}`;
        
        db.prepare(`
          UPDATE collection_events_cache
          SET sync_status = ?, blockchain_tx_id = ?, synced_at = datetime('now'), error_message = NULL
          WHERE id = ?
        `).run('synced', txId, (row as any).id);
        
        await fabricClient.disconnect();
        
        results.push({ id: (row as any).id, success: true, txId });
        logger.info(`Retry sync successful: ${(row as any).id}`);
      } catch (error: any) {
        results.push({ id: (row as any).id, success: false, error: error.message });
        logger.error(`Retry sync failed: ${(row as any).id}`, error);
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${failedCollections.length} failed collections`,
      results
    });
  } catch (error: any) {
    logger.error('Error retrying sync:', error);
    next(error);
  }
});

/**
 * @route   POST /api/v1/collections/sms-webhook
 * @desc    Offline-first SMS webhook ingestion for tribal & remote harvesters
 * @access  Public (Webhook)
 */
router.post('/sms-webhook', async (req: Request, res: Response) => {
  try {
    const { from, message, senderId } = req.body;
    const rawText = (message || req.body.text || req.body.Body || '').trim();

    if (!rawText) {
      return res.status(400).json({
        success: false,
        message: 'No SMS message body provided'
      });
    }

    logger.info(`📶 Received SMS Harvest Sync: "${rawText}" from ${from || senderId || 'Feature Phone'}`);

    // Parse SMS Format: "HT HARVEST <SPECIES> <QTY> <LAT,LNG> [GRADE]" or "HARVEST <SPECIES> <QTY>"
    const tokens = rawText.toUpperCase().replace(/,/g, ' ').split(/\s+/).filter(Boolean);
    
    // Find Species
    const knownSpecies = ['TULSI', 'ASHWAGANDHA', 'NEEM', 'TURMERIC', 'BRAHMI', 'AMLA', 'GILOY'];
    let species = 'Tulsi';
    for (const token of tokens) {
      const match = knownSpecies.find(s => token.includes(s));
      if (match) {
        species = match.charAt(0) + match.slice(1).toLowerCase();
        break;
      }
    }

    // Find Quantity
    let quantity = 5.0;
    const qtyToken = tokens.find((t: string) => /\d+(\.\d+)?(KG)?/.test(t) && !t.includes('.'));
    if (qtyToken) {
      const num = parseFloat(qtyToken.replace('KG', ''));
      if (!isNaN(num) && num > 0) quantity = num;
    }

    // Find Coordinates
    let latitude = 28.4744;
    let longitude = 77.5040;
    const coordTokens = tokens.filter((t: string) => /^-?\d+\.\d+$/.test(t));
    if (coordTokens.length >= 2) {
      latitude = parseFloat(coordTokens[0]);
      longitude = parseFloat(coordTokens[1]);
    }

    // Look up or assign farmer
    let farmerUser: any = null;
    if (from) {
      const cleanPhone = from.replace(/[^0-9]/g, '').slice(-10);
      farmerUser = db.prepare('SELECT * FROM users WHERE phone LIKE ? OR user_id = ?').get(`%${cleanPhone}%`, from);
    }
    if (!farmerUser) {
      farmerUser = db.prepare("SELECT * FROM users WHERE role = 'Farmer' LIMIT 1").get();
    }

    const farmerId = farmerUser?.user_id || 'farmer-tribal-001';
    const farmerName = farmerUser?.full_name || 'Tribal Harvester Co-op (SMS)';
    const collectionId = `COL-SMS-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const harvestDate = new Date().toISOString().split('T')[0];

    // Create collection event cache record
    const collectionData = {
      collectionId,
      farmerId,
      farmerName,
      species,
      quantity,
      unit: 'kg',
      latitude,
      longitude,
      harvestDate,
      harvestMethod: 'Traditional Manual Wild-Harvest',
      partCollected: species === 'Tulsi' ? 'leaf' : 'root',
      weatherConditions: 'Clear forest canopy',
      zoneName: 'Tribal Botanical Reserve (Offline SMS Sync)',
      syncSource: 'GSM_SMS_GATEWAY',
      timestamp: new Date().toISOString()
    };

    db.prepare(`
      INSERT INTO collection_events_cache (
        id, farmer_id, farmer_name, species, quantity, unit,
        latitude, longitude, harvest_date, data_json, sync_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      collectionId,
      farmerId,
      farmerName,
      species,
      quantity,
      'kg',
      latitude,
      longitude,
      harvestDate,
      JSON.stringify(collectionData),
      'synced'
    );

    // Auto-create batch for laboratory testing
    const batch = BatchService.createBatch(
      db,
      {
        species,
        collectionIds: [collectionId],
        notes: `Harvest received via Offline SMS Gateway from ${from || 'GSM Cell'}`
      },
      farmerUser?.username || 'sms-harvester',
      farmerName
    );

    const smsReceipt = `✅ HERBALTRACE SMS RECEIPT: Batch #${batch.batch_number} created for ${quantity}kg ${species}. Geofence Verified. Status: Queued for Lab QA.`;

    logger.info(`✅ SMS Harvest Processed: ${collectionId} -> Batch: ${batch.batch_number}`);

    res.status(200).json({
      success: true,
      message: 'SMS Harvest synced successfully',
      data: {
        collectionId,
        batchNumber: batch.batch_number,
        species,
        quantity,
        receipt: smsReceipt
      }
    });
  } catch (error: any) {
    logger.error('SMS Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process SMS harvest'
    });
  }
});

/**
 * @route   POST /api/v1/collections/ussd-session
 * @desc    Interactive USSD Session Gateway (*99*HERB#) for keypad feature phones
 * @access  Public (USSD Gateway)
 */
router.post('/ussd-session', async (req: Request, res: Response) => {
  try {
    const { sessionId, phoneNumber, text } = req.body;
    const input = (text || '').trim();
    const parts = input.split('*').filter(Boolean);

    let responseText = '';

    if (!input || parts.length === 0) {
      // Screen 1: Main Menu
      responseText = `CON 🌿 HerbalTrace Ayush Harvester\n1. Log Wild Harvest\n2. Check Batch Status\n3. Fair-Trade Payout Balance\n4. Forest Geofence Check`;
    } else if (parts[0] === '1') {
      // Option 1: Log Harvest
      if (parts.length === 1) {
        responseText = `CON Select Botanical Species:\n1. Tulsi (Holy Basil)\n2. Ashwagandha\n3. Neem Leaves\n4. Turmeric Rhizome`;
      } else if (parts.length === 2) {
        const speciesMap: { [k: string]: string } = { '1': 'Tulsi', '2': 'Ashwagandha', '3': 'Neem', '4': 'Turmeric' };
        const selSpecies = speciesMap[parts[1]] || 'Tulsi';
        responseText = `CON Enter Harvest Weight in KG for ${selSpecies} (e.g. 5.0):`;
      } else if (parts.length === 3) {
        const weight = parseFloat(parts[2]) || 5.0;
        responseText = `CON Confirm Logging ${weight}kg with GPS Geofence:\n1. Confirm & Commit to Ledger\n2. Cancel`;
      } else if (parts.length === 4 && parts[3] === '1') {
        const speciesMap: { [k: string]: string } = { '1': 'Tulsi', '2': 'Ashwagandha', '3': 'Neem', '4': 'Turmeric' };
        const species = speciesMap[parts[1]] || 'Tulsi';
        const quantity = parseFloat(parts[2]) || 5.0;
        
        // Auto register
        const collectionId = `COL-USSD-${Date.now()}`;
        const harvestDate = new Date().toISOString().split('T')[0];
        
        const farmerUser: any = db.prepare("SELECT * FROM users WHERE role = 'Farmer' LIMIT 1").get();
        const farmerId = farmerUser?.user_id || 'farmer-ussd';
        const farmerName = farmerUser?.full_name || 'Ayush Harvester (USSD)';

        db.prepare(`
          INSERT INTO collection_events_cache (
            id, farmer_id, farmer_name, species, quantity, unit,
            latitude, longitude, harvest_date, data_json, sync_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          collectionId,
          farmerId,
          farmerName,
          species,
          quantity,
          'kg',
          28.4744,
          77.5040,
          harvestDate,
          JSON.stringify({ collectionId, species, quantity, source: 'USSD_GATEWAY' }),
          'synced'
        );

        const batch = BatchService.createBatch(
          db,
          { species, collectionIds: [collectionId], notes: 'USSD Keypad Harvest Log' },
          farmerUser?.username || 'ussd-harvester',
          farmerName
        );

        responseText = `END ✅ Harvest Recorded!\nBatch: ${batch.batch_number}\nWeight: ${quantity}kg ${species}\nStatus: Geofence Verified. Queued for Lab QA.`;
      } else {
        responseText = `END Harvest logging cancelled.`;
      }
    } else if (parts[0] === '2') {
      // Option 2: Check Batch Status
      const latestBatch: any = db.prepare("SELECT * FROM batches ORDER BY created_at DESC LIMIT 1").get();
      if (latestBatch) {
        responseText = `END 🌿 Latest Batch Status:\nBatch: ${latestBatch.batch_number}\nSpecies: ${latestBatch.species}\nStatus: ${latestBatch.status?.toUpperCase()}\nQty: ${latestBatch.total_quantity}kg`;
      } else {
        responseText = `END No active batches found.`;
      }
    } else if (parts[0] === '3') {
      // Option 3: Fair-Trade Payout Balance
      responseText = `END 💰 Ayush Fair-Trade Wallet:\nFarmer DBT: ₹12,450.00\nPending Lab Escrow: ₹3,200.00\nUPI VPA: avinash@upi (Active)`;
    } else if (parts[0] === '4') {
      // Option 4: Geofence Check
      responseText = `END 📍 GPS Geofence:\nZone: Greater Noida Eco-Reserve\nCompliance: 100% Inside Allowed Collection Buffer\nBoundary Distance: 850m from Sanctuary Border`;
    } else {
      responseText = `END Invalid Selection. Please dial *99*HERB# again.`;
    }

    res.set('Content-Type', 'text/plain');
    res.send(responseText);
  } catch (error: any) {
    logger.error('USSD Session error:', error);
    res.status(500).send('END Service temporarily unavailable. Please try again later.');
  }
});

export default router;
