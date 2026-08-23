# HerbalTrace: Complete API Reference

## Base URL

**Development**: `http://localhost:3000/api/v1`
**Production**: `https://api.herbaltrace.com/api/v1`

---

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Collection Management](#collection-management)
4. [Batch Management](#batch-management)
5. [Quality Control](#quality-control)
6. [Manufacturer & Products](#manufacturer--products)
7. [Consumer Verification](#consumer-verification)
8. [Dashboard & Analytics](#dashboard--analytics)

---

## Authentication

### POST /auth/login

Login with user credentials

**Request**:
```json
{
  "userId": "admin-001",
  "password": "admin123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "admin-001",
    "name": "Admin User",
    "role": "Admin",
    "organization": "HerbalTrace"
  }
}
```

**Headers Required**:
```
Content-Type: application/json
```

---

### POST /auth/register

Register new user (Admin only)

**Request**:
```json
{
  "userId": "farmer-001",
  "name": "Ramesh Kumar",
  "email": "ramesh@example.com",
  "password": "secure123",
  "role": "Farmer",
  "organization": "FarmersCoop",
  "phone": "+91-9876543210",
  "address": {
    "village": "Dehradun",
    "district": "Dehradun",
    "state": "Uttarakhand"
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "userId": "farmer-001",
    "name": "Ramesh Kumar",
    "role": "Farmer",
    "organization": "FarmersCoop"
  },
  "message": "User registered successfully"
}
```

**Headers Required**:
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

---

## User Management

### GET /users/profile

Get current user profile

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "userId": "farmer-001",
    "name": "Ramesh Kumar",
    "email": "ramesh@example.com",
    "role": "Farmer",
    "organization": "FarmersCoop",
    "phone": "+91-9876543210",
    "address": {
      "village": "Dehradun",
      "district": "Dehradun",
      "state": "Uttarakhand"
    },
    "createdAt": "2024-12-01T10:00:00.000Z"
  }
}
```

**Headers Required**:
```
Authorization: Bearer <token>
```

---

### PATCH /users/profile

Update user profile

**Request**:
```json
{
  "phone": "+91-9999999999",
  "address": {
    "village": "Rishikesh",
    "district": "Dehradun",
    "state": "Uttarakhand"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "userId": "farmer-001",
    "phone": "+91-9999999999",
    "address": {
      "village": "Rishikesh",
      "district": "Dehradun",
      "state": "Uttarakhand"
    }
  },
  "message": "Profile updated successfully"
}
```

**Headers Required**:
```
Authorization: Bearer <token>
```

---

## Collection Management

### POST /collections

Create new herb collection event (Farmer only)

**Request**:
```json
{
  "species": "Neem",
  "quantity": 50,
  "unit": "kg",
  "gpsCoordinates": {
    "latitude": 30.3165,
    "longitude": 78.0322
  },
  "collectionDate": "2024-12-09T08:30:00.000Z",
  "photos": [
    "https://storage.herbaltrace.com/photos/col-001-1.jpg",
    "https://storage.herbaltrace.com/photos/col-001-2.jpg"
  ],
  "notes": "Fresh harvest from organic farm"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "collectionId": "COL-1765278058044-3zle0o59g",
    "farmerId": "farmer-001",
    "farmerName": "Ramesh Kumar",
    "species": "Neem",
    "quantity": 50,
    "unit": "kg",
    "gpsCoordinates": {
      "latitude": 30.3165,
      "longitude": 78.0322
    },
    "collectionDate": "2024-12-09T08:30:00.000Z",
    "photos": [
      "https://storage.herbaltrace.com/photos/col-001-1.jpg",
      "https://storage.herbaltrace.com/photos/col-001-2.jpg"
    ],
    "status": "collected",
    "txId": "tx-col-1765278058044-3zle0o59g",
    "createdAt": "2024-12-09T08:30:58.044Z"
  },
  "message": "Collection recorded on blockchain"
}
```

**Headers Required**:
```
Authorization: Bearer <farmer-token>
Content-Type: application/json
```

---

### GET /collections

Get all collections (with filters)

**Query Parameters**:
- `species`: Filter by species (e.g., `Neem`)
- `status`: Filter by status (`collected`, `batched`, `consumed`)
- `farmerId`: Filter by farmer ID
- `startDate`: Filter by collection date (ISO 8601)
- `endDate`: Filter by collection date (ISO 8601)
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

**Example Request**:
```
GET /collections?species=Neem&status=collected&limit=20
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "collectionId": "COL-1765278058044-3zle0o59g",
      "farmerId": "farmer-001",
      "farmerName": "Ramesh Kumar",
      "species": "Neem",
      "quantity": 50,
      "unit": "kg",
      "gpsCoordinates": {
        "latitude": 30.3165,
        "longitude": 78.0322
      },
      "status": "collected",
      "createdAt": "2024-12-09T08:30:58.044Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

**Headers Required**:
```
Authorization: Bearer <token>
```

---

### GET /collections/:collectionId

Get collection details

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "collectionId": "COL-1765278058044-3zle0o59g",
    "farmerId": "farmer-001",
    "farmerName": "Ramesh Kumar",
    "species": "Neem",
    "quantity": 50,
    "unit": "kg",
    "gpsCoordinates": {
      "latitude": 30.3165,
      "longitude": 78.0322
    },
    "collectionDate": "2024-12-09T08:30:00.000Z",
    "photos": [
      "https://storage.herbaltrace.com/photos/col-001-1.jpg"
    ],
    "status": "collected",
    "txId": "tx-col-1765278058044-3zle0o59g",
    "createdAt": "2024-12-09T08:30:58.044Z"
  }
}
```

**Headers Required**:
```
Authorization: Bearer <token>
```

---

## Batch Management

### POST /batches

Create batch from collections (Admin only)

**Request**:
```json
{
  "species": "Neem",
  "collectionIds": [
    "COL-1765278058044-3zle0o59g",
    "COL-1765278060000-4abe1p60h"
  ]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "batchId": "BATCH-NEEM-20241209-4009",
    "batchNumber": "BATCH-NEEM-20241209-4009",
    "species": "Neem",
    "totalQuantity": 100,
    "unit": "kg",
    "collectionIds": [
      "COL-1765278058044-3zle0o59g",
      "COL-1765278060000-4abe1p60h"
    ],
    "status": "pending_quality_test",
    "createdBy": "admin-001",
    "txId": "tx-batch-1765279084621-1813o40tf",
    "createdAt": "2024-12-09T09:45:00.000Z"
  },
  "message": "Batch created successfully"
}
```

**Headers Required**:
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

---

### GET /batches

Get all batches (with filters)

**Query Parameters**:
- `species`: Filter by species
- `status`: Filter by status (`pending_quality_test`, `quality_tested`, `rejected`, `consumed`)
- `limit`: Number of results
- `offset`: Pagination offset

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "batchId": "BATCH-NEEM-20241209-4009",
      "species": "Neem",
      "totalQuantity": 100,
      "unit": "kg",
      "status": "pending_quality_test",
      "createdAt": "2024-12-09T09:45:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0
  }
}
```

**Headers Required**:
```
Authorization: Bearer <token>
```

---

### GET /batches/:batchId

Get batch details with full provenance

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "batchId": "BATCH-NEEM-20241209-4009",
    "batchNumber": "BATCH-NEEM-20241209-4009",
    "species": "Neem",
    "totalQuantity": 100,
    "unit": "kg",
    "status": "quality_tested",
    "qcTestId": "QC-TEST-1765279932251-Z4FM2Q",
    "createdBy": "admin-001",
    "txId": "tx-batch-1765279084621-1813o40tf",
    "createdAt": "2024-12-09T09:45:00.000Z",
    "collections": [
      {
        "collectionId": "COL-1765278058044-3zle0o59g",
        "farmerId": "farmer-001",
        "farmerName": "Ramesh Kumar",
        "quantity": 50,
        "gpsCoordinates": {
          "latitude": 30.3165,
          "longitude": 78.0322
        }
      }
    ],
    "qcTest": {
      "testId": "QC-TEST-1765279932251-Z4FM2Q",
      "labId": "lab-001",
      "labName": "NMPB Certified Lab",
      "moistureContent": 8.5,
      "pesticideLevel": 0.2,
      "heavyMetalLevel": 5.0,
      "dnaAuthentication": true,
      "testResult": "pass",
      "testDate": "2024-12-09T10:30:00.000Z"
    }
  }
}
```

**Headers Required**:
```
Authorization: Bearer <token>
```

---

## Quality Control

### POST /qc/submit-test-results

Submit quality test results (Lab only)

**Request**:
```json
{
  "batchId": "BATCH-NEEM-20241209-4009",
  "moistureContent": 8.5,
  "pesticideLevel": 0.2,
  "heavyMetalLevel": 5.0,
  "dnaAuthentication": true,
  "testDate": "2024-12-09T10:30:00.000Z",
  "certificateUrl": "https://storage.herbaltrace.com/certificates/qc-001.pdf",
  "notes": "All parameters within NMPB limits"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "testId": "QC-TEST-1765279932251-Z4FM2Q",
    "batchId": "BATCH-NEEM-20241209-4009",
    "labId": "lab-001",
    "labName": "NMPB Certified Lab",
    "moistureContent": 8.5,
    "pesticideLevel": 0.2,
    "heavyMetalLevel": 5.0,
    "dnaAuthentication": true,
    "testResult": "pass",
    "testDate": "2024-12-09T10:30:00.000Z",
    "certificateUrl": "https://storage.herbaltrace.com/certificates/qc-001.pdf",
    "txId": "tx-qc-1765279932251-Z4FM2Q"
  },
  "message": "Quality test submitted successfully"
}
```

**NMPB Compliance Rules**:
- Moisture content: ≤ 10%
- Pesticide level: ≤ 0.5 ppm
- Heavy metals: ≤ 10 ppm
- DNA authentication: Must be true

**Headers Required**:
```
Authorization: Bearer <lab-token>
Content-Type: application/json
```

---

### GET /qc/tests

Get all quality tests (with filters)

**Query Parameters**:
- `batchId`: Filter by batch ID
- `testResult`: Filter by result (`pass`, `fail`)
- `labId`: Filter by lab ID

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "testId": "QC-TEST-1765279932251-Z4FM2Q",
      "batchId": "BATCH-NEEM-20241209-4009",
      "labId": "lab-001",
      "labName": "NMPB Certified Lab",
      "testResult": "pass",
      "testDate": "2024-12-09T10:30:00.000Z"
    }
  ]
}
```

**Headers Required**:
```
Authorization: Bearer <token>
```

---

### GET /qc/tests/:testId

Get quality test details

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "testId": "QC-TEST-1765279932251-Z4FM2Q",
    "batchId": "BATCH-NEEM-20241209-4009",
    "labId": "lab-001",
    "labName": "NMPB Certified Lab",
    "moistureContent": 8.5,
    "pesticideLevel": 0.2,
    "heavyMetalLevel": 5.0,
    "dnaAuthentication": true,
    "testResult": "pass",
    "testDate": "2024-12-09T10:30:00.000Z",
    "certificateUrl": "https://storage.herbaltrace.com/certificates/qc-001.pdf",
    "txId": "tx-qc-1765279932251-Z4FM2Q"
  }
}
```

**Headers Required**:
```
Authorization: Bearer <token>
```

---

## Manufacturer & Products

### POST /manufacturer/products

Create product with QR code (Manufacturer only)

**Request**:
```json
{
  "productName": "Organic Neem Powder",
  "batchIds": ["BATCH-NEEM-20241209-4009"],
  "quantity": 50,
  "unit": "kg",
  "manufactureDate": "2024-12-09T12:00:00.000Z",
  "expiryDate": "2025-12-09T12:00:00.000Z"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "productId": "PROD-1765280057188-0734E53F",
    "productName": "Organic Neem Powder",
    "qrCode": "QR-1765280057188-0734E53F",
    "batchIds": ["BATCH-NEEM-20241209-4009"],
    "quantity": 50,
    "unit": "kg",
    "manufactureDate": "2024-12-09T12:00:00.000Z",
    "expiryDate": "2025-12-09T12:00:00.000Z",
    "manufacturerId": "manufacturer-001",
    "verificationUrl": "https://herbaltrace165343.vercel.app/verify/QR-1765280057188-0734E53F",
    "txId": "tx-prod-1765280057-4fa6",
    "createdAt": "2024-12-09T12:10:00.000Z"
  },
  "message": "Product created successfully"
}
```

**Headers Required**:
```
Authorization: Bearer <manufacturer-token>
Content-Type: application/json
```

---

### GET /manufacturer/products

Get all products (Manufacturer only)

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "productId": "PROD-1765280057188-0734E53F",
      "productName": "Organic Neem Powder",
      "qrCode": "QR-1765280057188-0734E53F",
      "manufactureDate": "2024-12-09T12:00:00.000Z",
      "createdAt": "2024-12-09T12:10:00.000Z"
    }
  ]
}
```

**Headers Required**:
```
Authorization: Bearer <manufacturer-token>
```

---

### GET /manufacturer/products/:productId

Get product details

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "productId": "PROD-1765280057188-0734E53F",
    "productName": "Organic Neem Powder",
    "qrCode": "QR-1765280057188-0734E53F",
    "batchIds": ["BATCH-NEEM-20241209-4009"],
    "quantity": 50,
    "unit": "kg",
    "manufactureDate": "2024-12-09T12:00:00.000Z",
    "expiryDate": "2025-12-09T12:00:00.000Z",
    "manufacturerId": "manufacturer-001",
    "verificationUrl": "https://herbaltrace165343.vercel.app/verify/QR-1765280057188-0734E53F",
    "txId": "tx-prod-1765280057-4fa6"
  }
}
```

**Headers Required**:
```
Authorization: Bearer <manufacturer-token>
```

---

## Consumer Verification

### GET /products/qr/:qrCode

Verify product by QR code (Public - No auth required)

**Example Request**:
```
GET /products/qr/QR-1765280057188-0734E53F
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "product": {
      "productId": "PROD-1765280057188-0734E53F",
      "productName": "Organic Neem Powder",
      "qrCode": "QR-1765280057188-0734E53F",
      "quantity": 50,
      "unit": "kg",
      "manufactureDate": "2024-12-09T12:00:00.000Z",
      "expiryDate": "2025-12-09T12:00:00.000Z"
    },
    "batches": [
      {
        "batchId": "BATCH-NEEM-20241209-4009",
        "species": "Neem",
        "totalQuantity": 100,
        "status": "consumed"
      }
    ],
    "qcTests": [
      {
        "testId": "QC-TEST-1765279932251-Z4FM2Q",
        "labName": "NMPB Certified Lab",
        "moistureContent": 8.5,
        "pesticideLevel": 0.2,
        "heavyMetalLevel": 5.0,
        "dnaAuthentication": true,
        "testResult": "pass"
      }
    ],
    "collections": [
      {
        "collectionId": "COL-1765278058044-3zle0o59g",
        "farmerName": "Ramesh Kumar",
        "quantity": 50,
        "gpsCoordinates": {
          "latitude": 30.3165,
          "longitude": 78.0322
        },
        "collectionDate": "2024-12-09T08:30:00.000Z"
      }
    ],
    "supplyChain": {
      "collection": {
        "location": "Dehradun, Uttarakhand",
        "date": "2024-12-09T08:30:00.000Z"
      },
      "testing": {
        "location": "Greater Noida, UP",
        "date": "2024-12-09T10:30:00.000Z"
      },
      "manufacturing": {
        "location": "Dehradun, Uttarakhand",
        "date": "2024-12-09T12:00:00.000Z"
      }
    }
  }
}
```

**No authentication required** - This is a public endpoint for consumers

---

## Dashboard & Analytics

### GET /dashboard/stats

Get dashboard statistics (Role-based)

**Response for Admin** (200 OK):
```json
{
  "success": true,
  "data": {
    "collections": {
      "total": 150,
      "thisMonth": 45,
      "byStatus": {
        "collected": 30,
        "batched": 100,
        "consumed": 20
      }
    },
    "batches": {
      "total": 25,
      "pending": 5,
      "tested": 18,
      "rejected": 2
    },
    "products": {
      "total": 12,
      "thisMonth": 4
    },
    "farmers": {
      "total": 50,
      "active": 35
    }
  }
}
```

**Response for Farmer** (200 OK):
```json
{
  "success": true,
  "data": {
    "myCollections": {
      "total": 12,
      "thisMonth": 3,
      "totalQuantity": 600,
      "unit": "kg"
    },
    "batchedCollections": 10,
    "pendingCollections": 2
  }
}
```

**Headers Required**:
```
Authorization: Bearer <token>
```

---

### GET /dashboard/recent-activity

Get recent activity (Last 20 transactions)

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "type": "product_created",
      "productId": "PROD-1765280057188-0734E53F",
      "productName": "Organic Neem Powder",
      "txId": "tx-prod-1765280057-4fa6",
      "timestamp": "2024-12-09T12:10:00.000Z"
    },
    {
      "type": "qc_test_completed",
      "batchId": "BATCH-NEEM-20241209-4009",
      "result": "pass",
      "txId": "tx-qc-1765279932251-Z4FM2Q",
      "timestamp": "2024-12-09T10:30:00.000Z"
    },
    {
      "type": "batch_created",
      "batchId": "BATCH-NEEM-20241209-4009",
      "species": "Neem",
      "txId": "tx-batch-1765279084621-1813o40tf",
      "timestamp": "2024-12-09T09:45:00.000Z"
    }
  ]
}
```

**Headers Required**:
```
Authorization: Bearer <token>
```

---

## Error Responses

All endpoints return standardized error responses:

**400 Bad Request**:
```json
{
  "success": false,
  "error": "Validation error: GPS coordinates are required"
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": "Internal server error",
  "details": "Blockchain network unavailable"
}
```

---

## Rate Limiting

All endpoints are rate-limited:
- **Anonymous**: 10 requests/minute
- **Authenticated**: 100 requests/minute
- **Admin**: 500 requests/minute

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702125600
```

---

## Pagination

List endpoints support pagination:

**Query Parameters**:
- `limit`: Results per page (max: 100, default: 50)
- `offset`: Starting position (default: 0)

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## SDK Example (Node.js)

```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login
const { data } = await client.post('/auth/login', {
  userId: 'farmer-001',
  password: 'secure123'
});

const token = data.data.token;

// Set token for future requests
client.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Create collection
const collection = await client.post('/collections', {
  species: 'Neem',
  quantity: 50,
  unit: 'kg',
  gpsCoordinates: {
    latitude: 30.3165,
    longitude: 78.0322
  }
});

console.log('Collection created:', collection.data.data.collectionId);
```

---

## Webhook Events (Future)

Planned webhook support for real-time notifications:

**Events**:
- `collection.created`
- `batch.created`
- `qc.test.completed`
- `product.created`

**Webhook Payload**:
```json
{
  "event": "product.created",
  "timestamp": "2024-12-09T12:10:00.000Z",
  "data": {
    "productId": "PROD-1765280057188-0734E53F",
    "qrCode": "QR-1765280057188-0734E53F"
  }
}
```

---

**For detailed blockchain architecture**: See [BLOCKCHAIN_ARCHITECTURE.md](./BLOCKCHAIN_ARCHITECTURE.md)

**For deployment instructions**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
