import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { db } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Enums Routes - Provides dropdown/select options for frontend forms
 * 
 * These endpoints return configuration data that can be cached by the frontend
 * to populate dropdowns, select lists, and other form elements.
 */

// Herbal species list - used across all dashboards
const HERBAL_SPECIES = [
  { value: 'Ashwagandha', label: 'Ashwagandha (Withania somnifera)', scientificName: 'Withania somnifera' },
  { value: 'Turmeric', label: 'Turmeric (Curcuma longa)', scientificName: 'Curcuma longa' },
  { value: 'Brahmi', label: 'Brahmi (Bacopa monnieri)', scientificName: 'Bacopa monnieri' },
  { value: 'Tulsi', label: 'Tulsi (Ocimum sanctum)', scientificName: 'Ocimum sanctum' },
  { value: 'Neem', label: 'Neem (Azadirachta indica)', scientificName: 'Azadirachta indica' },
  { value: 'Aloe Vera', label: 'Aloe Vera (Aloe barbadensis)', scientificName: 'Aloe barbadensis' },
  { value: 'Ginger', label: 'Ginger (Zingiber officinale)', scientificName: 'Zingiber officinale' },
  { value: 'Giloy', label: 'Giloy (Tinospora cordifolia)', scientificName: 'Tinospora cordifolia' },
  { value: 'Amla', label: 'Amla (Phyllanthus emblica)', scientificName: 'Phyllanthus emblica' },
  { value: 'Shatavari', label: 'Shatavari (Asparagus racemosus)', scientificName: 'Asparagus racemosus' }
];

// Units for quantity measurement
const UNITS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'lb', label: 'Pounds (lb)' },
  { value: 'oz', label: 'Ounces (oz)' },
  { value: 'L', label: 'Liters (L)' },
  { value: 'mL', label: 'Milliliters (mL)' }
];

// Harvest methods
const HARVEST_METHODS = [
  { value: 'hand_picking', label: 'Hand Picking' },
  { value: 'cutting', label: 'Cutting' },
  { value: 'digging', label: 'Digging' },
  { value: 'pruning', label: 'Pruning' },
  { value: 'manual', label: 'Manual Harvesting' },
  { value: 'mechanical', label: 'Mechanical Harvesting' },
  { value: 'semi_mechanical', label: 'Semi-Mechanical' },
  { value: 'selective', label: 'Selective Harvesting' }
];

// Plant parts that can be collected
const PLANT_PARTS = [
  { value: 'whole_plant', label: 'Whole Plant' },
  { value: 'leaves', label: 'Leaves' },
  { value: 'roots', label: 'Roots' },
  { value: 'flowers', label: 'Flowers' },
  { value: 'seeds', label: 'Seeds' },
  { value: 'bark', label: 'Bark' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'rhizome', label: 'Rhizome' },
  { value: 'stem', label: 'Stem' }
];

// Weather conditions
const WEATHER_CONDITIONS = [
  { value: 'sunny', label: 'Sunny' },
  { value: 'cloudy', label: 'Cloudy' },
  { value: 'partly_cloudy', label: 'Partly Cloudy' },
  { value: 'rainy', label: 'Rainy' },
  { value: 'drizzle', label: 'Drizzle' },
  { value: 'windy', label: 'Windy' },
  { value: 'humid', label: 'Humid' }
];

// Soil types
const SOIL_TYPES = [
  { value: 'loamy', label: 'Loamy' },
  { value: 'clay', label: 'Clay' },
  { value: 'sandy', label: 'Sandy' },
  { value: 'silt', label: 'Silt' },
  { value: 'peaty', label: 'Peaty' },
  { value: 'chalky', label: 'Chalky' },
  { value: 'red_soil', label: 'Red Soil' },
  { value: 'black_soil', label: 'Black Soil' },
  { value: 'alluvial', label: 'Alluvial' }
];

// Test types for laboratory
const TEST_TYPES = [
  { value: 'moisture_content', label: 'Moisture Content', duration: '30 min', threshold: '< 12%' },
  { value: 'pesticide_residue', label: 'Pesticide Residue', duration: '2 hours', threshold: '< 0.1 ppm' },
  { value: 'heavy_metals', label: 'Heavy Metals', duration: '3 hours', threshold: '< 10 ppm' },
  { value: 'dna_authentication', label: 'DNA Authentication', duration: '4 hours', threshold: '> 95% match' },
  { value: 'microbial_load', label: 'Microbial Load', duration: '24 hours', threshold: '< 1000 CFU/g' },
  { value: 'aflatoxin', label: 'Aflatoxin Analysis', duration: '6 hours', threshold: '< 4 ppb' },
  { value: 'identity', label: 'Identity Test', duration: '1 hour', threshold: 'Pass/Fail' },
  { value: 'purity', label: 'Purity Test', duration: '2 hours', threshold: '> 95%' },
  { value: 'potency', label: 'Potency Test', duration: '3 hours', threshold: 'As specified' }
];

// Product types for manufacturer
const PRODUCT_TYPES = [
  { value: 'powder', label: 'Powder' },
  { value: 'extract', label: 'Extract' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'oil', label: 'Oil' },
  { value: 'syrup', label: 'Syrup' },
  { value: 'cream', label: 'Cream' },
  { value: 'tincture', label: 'Tincture' }
];

// Process types for manufacturing
const PROCESS_TYPES = [
  { value: 'cleaning', label: 'Cleaning & Sorting' },
  { value: 'drying', label: 'Drying' },
  { value: 'grinding', label: 'Grinding' },
  { value: 'extraction', label: 'Extraction' },
  { value: 'filtration', label: 'Filtration' },
  { value: 'concentration', label: 'Concentration' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'quality_check', label: 'Quality Check' }
];

// Complaint categories
const COMPLAINT_CATEGORIES = [
  { value: 'quality_issue', label: 'Quality Issue' },
  { value: 'delivery_delay', label: 'Delivery Delay' },
  { value: 'payment_issue', label: 'Payment Issue' },
  { value: 'documentation', label: 'Documentation Problem' },
  { value: 'compliance', label: 'Compliance Issue' },
  { value: 'technical', label: 'Technical Problem' },
  { value: 'other', label: 'Other' }
];

// User roles
const USER_ROLES = [
  { value: 'Farmer', label: 'Farmer', orgName: 'Farmers' },
  { value: 'Lab', label: 'Laboratory', orgName: 'Labs' },
  { value: 'Manufacturer', label: 'Manufacturer', orgName: 'Manufacturers' },
  { value: 'Consumer', label: 'Consumer', orgName: 'Consumers' },
  { value: 'Regulator', label: 'Regulator', orgName: 'Regulators' },
  { value: 'Processor', label: 'Processor', orgName: 'Processors' }
];

// Organizations
const ORGANIZATIONS = [
  { value: 'Farmers', label: 'Farmers Cooperative' },
  { value: 'Labs', label: 'Testing Laboratories' },
  { value: 'Manufacturers', label: 'Manufacturers' },
  { value: 'Processors', label: 'Processors' }
];

// Batch statuses
const BATCH_STATUSES = [
  { value: 'created', label: 'Created' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_processing', label: 'In Processing' },
  { value: 'processing_complete', label: 'Processing Complete' },
  { value: 'quality_tested', label: 'Quality Tested' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

// Violation types for regulator
const VIOLATION_TYPES = [
  { value: 'out_of_season', label: 'Out-of-Season Harvest' },
  { value: 'protected_area', label: 'Protected Area Violation' },
  { value: 'quota_exceeded', label: 'Quota Exceeded' },
  { value: 'quality_failure', label: 'Quality Test Failure' },
  { value: 'documentation', label: 'Documentation Incomplete' },
  { value: 'unauthorized', label: 'Unauthorized Activity' }
];

/**
 * GET /api/v1/enums
 * Get all enum values for form dropdowns
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        species: HERBAL_SPECIES,
        units: UNITS,
        harvestMethods: HARVEST_METHODS,
        plantParts: PLANT_PARTS,
        weatherConditions: WEATHER_CONDITIONS,
        soilTypes: SOIL_TYPES,
        testTypes: TEST_TYPES,
        productTypes: PRODUCT_TYPES,
        processTypes: PROCESS_TYPES,
        complaintCategories: COMPLAINT_CATEGORIES,
        roles: USER_ROLES,
        organizations: ORGANIZATIONS,
        batchStatuses: BATCH_STATUSES,
        violationTypes: VIOLATION_TYPES
      }
    });
  } catch (error: any) {
    logger.error('Error fetching enums:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enum values'
    });
  }
});

/**
 * GET /api/v1/enums/species
 * Get herbal species list
 */
router.get('/species', async (req: Request, res: Response) => {
  res.json({ success: true, data: HERBAL_SPECIES });
});

/**
 * GET /api/v1/enums/units
 * Get measurement units
 */
router.get('/units', async (req: Request, res: Response) => {
  res.json({ success: true, data: UNITS });
});

/**
 * GET /api/v1/enums/test-types
 * Get laboratory test types
 */
router.get('/test-types', async (req: Request, res: Response) => {
  res.json({ success: true, data: TEST_TYPES });
});

/**
 * GET /api/v1/enums/product-types
 * Get product types for manufacturer
 */
router.get('/product-types', async (req: Request, res: Response) => {
  res.json({ success: true, data: PRODUCT_TYPES });
});

/**
 * GET /api/v1/enums/complaint-categories
 * Get complaint categories
 */
router.get('/complaint-categories', async (req: Request, res: Response) => {
  res.json({ success: true, data: COMPLAINT_CATEGORIES });
});

/**
 * GET /api/v1/enums/roles
 * Get user roles
 */
router.get('/roles', async (req: Request, res: Response) => {
  res.json({ success: true, data: USER_ROLES });
});

/**
 * GET /api/v1/enums/organizations
 * Get organizations
 */
router.get('/organizations', async (req: Request, res: Response) => {
  res.json({ success: true, data: ORGANIZATIONS });
});

export default router;
