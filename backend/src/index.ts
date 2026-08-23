import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST
dotenv.config();

// Import database
import { testConnection } from './config/database';
// import { connectRedis } from './config/redis'; // Disabled for hackathon
import { logger } from './utils/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import uploadRoutes from './routes/upload.routes';
import collectionRoutes from './routes/collection.routes';
import batchRoutes from './routes/batch.routes';
import qcRoutes from './routes/qc.routes';
import qualityRoutes from './routes/quality.routes';
import processingRoutes from './routes/processing.routes';
import productRoutes from './routes/product.routes';
import provenanceRoutes from './routes/provenance.routes';
import seasonWindowRoutes from './routes/seasonWindow.routes';
import harvestLimitRoutes from './routes/harvestLimit.routes';
import alertRoutes from './routes/alert.routes';
import analyticsRoutes from './routes/analytics.routes';
import healthRoutes from './routes/health.routes';
import blockchainRoutes from './routes/blockchain.routes';
import manufacturerRoutes from './routes/manufacturer.routes';
import qrRoutes from './routes/qr.routes';
import enumsRoutes from './routes/enums.routes';
import complaintRoutes from './routes/complaint.routes';

const app: Application = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || 'api/v1';

// Trust proxy (for deployment behind reverse proxy)
app.set('trust proxy', 1);

// CORS - Allow all origins for hackathon (restrict in production)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Compression
app.use(compression());

// Body parsing - Increased limits for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files - Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve public folder for verification pages
app.use(express.static(path.join(__dirname, '../public')));

// Welcome page
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    name: 'HerbalTrace API',
    version: '1.0.0',
    description: 'Blockchain-based Supply Chain Traceability for Herbal Products',
    blockchain: {
      network: 'Hyperledger Fabric',
      chaincode: process.env.FABRIC_CHAINCODE_NAME || 'herbaltrace',
      channel: process.env.FABRIC_CHANNEL_NAME || 'herbaltrace-channel'
    },
    endpoints: {
      health: '/health',
      auth: `/${API_PREFIX}/auth`,
      upload: `/${API_PREFIX}/upload`,
      collections: `/${API_PREFIX}/collections`,
      batches: `/${API_PREFIX}/batches`,
      qc: `/${API_PREFIX}/qc`,
      qualityTests: `/${API_PREFIX}/quality-tests`,
      processing: `/${API_PREFIX}/processing`,
      products: `/${API_PREFIX}/products`,
      provenance: `/${API_PREFIX}/provenance`,
      seasonWindows: `/${API_PREFIX}/season-windows`,
      harvestLimits: `/${API_PREFIX}/harvest-limits`,
      alerts: `/${API_PREFIX}/alerts`,
      analytics: `/${API_PREFIX}/analytics`
    }
  });
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes - All stakeholders
app.use(`/${API_PREFIX}/auth`, authRoutes);
app.use(`/${API_PREFIX}/upload`, uploadRoutes);
app.use(`/${API_PREFIX}/collections`, collectionRoutes);
app.use(`/${API_PREFIX}/batches`, batchRoutes);
app.use(`/${API_PREFIX}/qc`, qcRoutes);
app.use(`/${API_PREFIX}/quality-tests`, qualityRoutes);
app.use(`/${API_PREFIX}/processing`, processingRoutes);
app.use(`/${API_PREFIX}/products`, productRoutes);
app.use(`/${API_PREFIX}/provenance`, provenanceRoutes);
app.use(`/${API_PREFIX}/season-windows`, seasonWindowRoutes);
app.use(`/${API_PREFIX}/harvest-limits`, harvestLimitRoutes);
app.use(`/${API_PREFIX}/alerts`, alertRoutes);
app.use(`/${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`/${API_PREFIX}/health`, healthRoutes);
app.use(`/${API_PREFIX}/blockchain`, blockchainRoutes);
app.use(`/${API_PREFIX}/manufacturer`, manufacturerRoutes);
app.use(`/${API_PREFIX}/qr`, qrRoutes);
app.use(`/${API_PREFIX}/enums`, enumsRoutes);
app.use(`/${API_PREFIX}/complaints`, complaintRoutes);

// Verification page for QR codes (serves HTML, page fetches data from API)
app.get('/verify/:qrCode', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/verify.html'));
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server
// Initialize database and Redis before starting server
const startServer = async () => {
  let server: any = null;
  
  try {
    // Initialize database schema
    logger.info('Initializing database schema...');
    const { initializeDatabase } = await import('./config/database');
    initializeDatabase();
    
    // Test database connection
    logger.info('Testing database connection...');
    const dbConnected = await testConnection();
    if (dbConnected) {
      logger.info('✅ Database connected successfully');
    } else {
      logger.warn('⚠️  Database connection failed - continuing without database (some features may be limited)');
    }

    // Connect to Redis (optional) - Skip for now
    // try {
    //   await connectRedis();
    //   logger.info('✅ Redis connected successfully');
    // } catch (error) {
    //   logger.warn('⚠️  Redis connection failed - continuing without cache (some features may be limited)');
    // }
    logger.info('Redis caching disabled for hackathon - using in-memory cache');

    // Start HTTP server immediately
    server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🌿 HerbalTrace Backend API Server                           ║
║                                                                ║
║   Server:      http://localhost:${PORT}                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   Health:      http://localhost:${PORT}/health                     ║
║   API:         http://localhost:${PORT}/${API_PREFIX}                     ║
║                                                                ║
║   Blockchain:  ${process.env.FABRIC_CHAINCODE_NAME || 'herbaltrace'}                              ║
║   Channel:     ${process.env.FABRIC_CHANNEL_NAME || 'herbaltrace-channel'}                ║
║                                                                ║
║   Database:    ${dbConnected ? '✅ Connected' : '⚠️  Offline'}                        ║
║   Cache:       ${process.env.REDIS_HOST ? '✅ Ready' : '⚠️  Offline'}                           ║
║                                                                ║
║   Ready for:   ✅ Farmers  ✅ Labs  ✅ Processors               ║
║                ✅ Manufacturers  ✅ Consumers  ✅ Admins        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
      `);
    });

    // Initialize blockchain connection in background
    let blockchainConnected = false;
    (async () => {
      try {
        logger.info('🔗 Initializing blockchain connection in background...');
        const { fabricService } = await import('./services/FabricService');
        await fabricService.connect();
        blockchainConnected = true;
        logger.info('✅ Blockchain connected successfully');
      } catch (error: any) {
        logger.warn(`⚠️  Blockchain connection warning: ${error.message}`);
        logger.warn('⚠️  Continuing with database/local blockchain sync');
      }

      if (blockchainConnected) {
        try {
          logger.info('🔄 Starting blockchain sync retry service...');
          const { blockchainSyncRetryService } = await import('./services/BlockchainSyncRetryService');
          blockchainSyncRetryService.start();
          logger.info('✅ Blockchain sync retry service started');
        } catch (error: any) {
          logger.warn(`⚠️  Failed to start retry service: ${error.message}`);
        }
      }
    })();

    // Graceful shutdown
    const shutdown = async () => {
      if (server) {
        console.log('Shutdown signal received: closing HTTP server');
        
        // Stop retry service
        if (blockchainConnected) {
          try {
            const { blockchainSyncRetryService } = await import('./services/BlockchainSyncRetryService');
            blockchainSyncRetryService.stop();
            logger.info('✅ Blockchain sync retry service stopped');
          } catch (error: any) {
            logger.warn('Failed to stop retry service:', error.message);
          }
        }
        
        server.close(() => {
          console.log('HTTP server closed');
          process.exit(0);
        });
      }
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;




