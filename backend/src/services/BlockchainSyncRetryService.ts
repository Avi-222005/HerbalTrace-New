/**
 * Blockchain Sync Retry Service
 * 
 * Background service to retry failed blockchain synchronizations
 * for batches and collection events.
 */

import { db } from '../config/database';
import { fabricService } from './FabricService';
import { logger } from '../utils/logger';

export class BlockchainSyncRetryService {
  private retryInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private readonly RETRY_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRY_ATTEMPTS = 5;

  /**
   * Start the retry service
   */
  start(): void {
    if (this.isRunning) {
      logger.warn('Blockchain sync retry service is already running');
      return;
    }

    logger.info('Starting blockchain sync retry service...');
    this.isRunning = true;

    // Run immediately on start
    this.retryFailedSyncs();

    // Then run periodically
    this.retryInterval = setInterval(() => {
      this.retryFailedSyncs();
    }, this.RETRY_INTERVAL_MS);

    logger.info(`✅ Blockchain sync retry service started (interval: ${this.RETRY_INTERVAL_MS / 1000}s)`);
  }

  /**
   * Stop the retry service
   */
  stop(): void {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }
    this.isRunning = false;
    logger.info('Blockchain sync retry service stopped');
  }

  /**
   * Retry failed blockchain synchronizations
   */
  private async retryFailedSyncs(): Promise<void> {
    logger.info('🔄 Checking for failed blockchain syncs to retry...');

    try {
      await this.retryFailedBatchSyncs();
      await this.retryFailedCollectionSyncs();
    } catch (error: any) {
      logger.error('Error in retry service:', error);
    }
  }

  /**
   * Retry failed batch synchronizations
   */
  private async retryFailedBatchSyncs(): Promise<void> {
    // Find batches without blockchain transaction IDs
    const failedBatches = db.prepare(`
      SELECT * FROM batches
      WHERE blockchain_tx_id IS NULL
      AND created_at > datetime('now', '-7 days')
      ORDER BY created_at DESC
      LIMIT 10
    `).all() as any[];

    if (failedBatches.length === 0) {
      logger.info('No failed batch syncs to retry');
      return;
    }

    logger.info(`Found ${failedBatches.length} batches to retry blockchain sync`);

    for (const batch of failedBatches) {
      try {
        // Get collection IDs for this batch
        const collectionLinks = db.prepare(`
          SELECT collection_id FROM batch_collections WHERE batch_id = ?
        `).all(batch.id) as any[];

        const collectionEventIds = collectionLinks.map(link => link.collection_id);

        if (collectionEventIds.length === 0) {
          logger.warn(`Batch ${batch.batch_number} has no collection events, skipping`);
          continue;
        }

        // Prepare batch payload for blockchain
        const batchPayload = {
          id: `BATCH-${batch.id}`,
          batchNumber: batch.batch_number,
          species: batch.species,
          totalQuantity: batch.total_quantity,
          unit: batch.unit,
          collectionEventIds: collectionEventIds,
          createdBy: batch.created_by,
          createdByName: batch.created_by_name,
          assignedTo: batch.assigned_to || '',
          assignedToName: batch.assigned_to_name || '',
          notes: batch.notes || ''
        };

        // Attempt to create batch on blockchain
        const result = await fabricService.createBatch(batchPayload);

        // Update batch with blockchain transaction ID
        db.prepare(`
          UPDATE batches
          SET blockchain_tx_id = ?, notes = ?
          WHERE id = ?
        `).run(
          result.txId,
          batch.notes ? batch.notes.replace(/\[Blockchain sync pending[^\]]*\]/g, '').trim() : '',
          batch.id
        );

        logger.info(`✅ Retry successful: Batch ${batch.batch_number} synced to blockchain (TxID: ${result.txId})`);

      } catch (error: any) {
        logger.error(`❌ Retry failed for batch ${batch.batch_number}:`, error.message);
        
        // Update retry count
        const currentNotes = batch.notes || '';
        const retryMatch = currentNotes.match(/retry attempt (\d+)/);
        const retryCount = retryMatch ? parseInt(retryMatch[1]) + 1 : 1;

        if (retryCount >= this.MAX_RETRY_ATTEMPTS) {
          logger.warn(`Max retry attempts reached for batch ${batch.batch_number}`);
          db.prepare(`
            UPDATE batches
            SET notes = ?
            WHERE id = ?
          `).run(
            `${currentNotes}\n[Blockchain sync failed after ${retryCount} attempts - Manual intervention required]`,
            batch.id
          );
        } else {
          db.prepare(`
            UPDATE batches
            SET notes = ?
            WHERE id = ?
          `).run(
            `${currentNotes.replace(/retry attempt \d+/, '')}\n[Blockchain sync pending - retry attempt ${retryCount}/${this.MAX_RETRY_ATTEMPTS}]`,
            batch.id
          );
        }
      }
    }
  }

  /**
   * Retry failed collection event synchronizations
   */
  private async retryFailedCollectionSyncs(): Promise<void> {
    // Find collection events with failed sync status
    const failedCollections = db.prepare(`
      SELECT * FROM collection_events_cache
      WHERE sync_status = 'failed'
      AND created_at > datetime('now', '-7 days')
      ORDER BY created_at DESC
      LIMIT 10
    `).all() as any[];

    if (failedCollections.length === 0) {
      logger.info('No failed collection syncs to retry');
      return;
    }

    logger.info(`Found ${failedCollections.length} collection events to retry blockchain sync`);

    for (const collection of failedCollections) {
      try {
        // Parse collection data
        let collectionData: any = {};
        try {
          collectionData = JSON.parse(collection.data_json || '{}');
        } catch {
          logger.warn(`Invalid data_json for collection ${collection.id}, skipping`);
          continue;
        }

        // Prepare collection event payload
        const eventPayload = {
          id: collection.id,
          type: 'CollectionEvent',
          farmerId: collection.farmer_id,
          farmerName: collection.farmer_name,
          species: collection.species,
          commonName: collectionData.commonName || collection.species,
          scientificName: collectionData.scientificName || '',
          quantity: collection.quantity,
          unit: collection.unit,
          latitude: collection.latitude,
          longitude: collection.longitude,
          altitude: collection.altitude || 0,
          accuracy: collectionData.accuracy || 0,
          harvestDate: new Date(collection.harvest_date + 'T00:00:00Z').toISOString(),
          timestamp: collection.created_at,
          harvestMethod: collectionData.harvestMethod || 'manual',
          partCollected: collectionData.partCollected || 'unknown',
          weatherConditions: collectionData.weatherConditions || '',
          soilType: collectionData.soilType || '',
          images: collectionData.images || [],
          approvedZone: collectionData.approvedZone || false,
          zoneName: collectionData.zoneName || '',
          conservationStatus: collectionData.conservationStatus || '',
          certificationIDs: collectionData.certificationIDs || [],
          status: 'verified'
        };

        // Attempt to sync to blockchain
        const result = await fabricService.submitTransaction('CreateCollectionEvent', JSON.stringify(eventPayload));
        const txId = JSON.parse(result || '{}').txId || result;

        // Update collection with success status
        db.prepare(`
          UPDATE collection_events_cache
          SET sync_status = ?, blockchain_tx_id = ?, error_message = NULL
          WHERE id = ?
        `).run('synced', txId, collection.id);

        logger.info(`✅ Retry successful: Collection ${collection.id} synced to blockchain (TxID: ${txId})`);

      } catch (error: any) {
        logger.error(`❌ Retry failed for collection ${collection.id}:`, error.message);
        
        // Update error message
        db.prepare(`
          UPDATE collection_events_cache
          SET error_message = ?
          WHERE id = ?
        `).run(`Retry failed: ${error.message}`, collection.id);
      }
    }
  }

  /**
   * Manually trigger a retry for a specific batch
   */
  async retryBatchSync(batchId: number): Promise<{ success: boolean; message: string; txId?: string }> {
    try {
      const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(batchId) as any;
      
      if (!batch) {
        return { success: false, message: 'Batch not found' };
      }

      if (batch.blockchain_tx_id) {
        return { success: false, message: 'Batch already synced to blockchain', txId: batch.blockchain_tx_id };
      }

      // Get collection IDs
      const collectionLinks = db.prepare(`
        SELECT collection_id FROM batch_collections WHERE batch_id = ?
      `).all(batchId) as any[];

      const collectionEventIds = collectionLinks.map(link => link.collection_id);

      const batchPayload = {
        id: `BATCH-${batch.id}`,
        batchNumber: batch.batch_number,
        species: batch.species,
        totalQuantity: batch.total_quantity,
        unit: batch.unit,
        collectionEventIds: collectionEventIds,
        createdBy: batch.created_by,
        createdByName: batch.created_by_name,
        assignedTo: batch.assigned_to || '',
        assignedToName: batch.assigned_to_name || '',
        notes: batch.notes || ''
      };

      const result = await fabricService.createBatch(batchPayload);

      db.prepare(`
        UPDATE batches
        SET blockchain_tx_id = ?
        WHERE id = ?
      `).run(result.txId, batch.id);

      return {
        success: true,
        message: 'Batch successfully synced to blockchain',
        txId: result.txId
      };
    } catch (error: any) {
      logger.error(`Manual retry failed for batch ${batchId}:`, error);
      return { success: false, message: error.message };
    }
  }
}

// Singleton instance
export const blockchainSyncRetryService = new BlockchainSyncRetryService();

export default BlockchainSyncRetryService;
