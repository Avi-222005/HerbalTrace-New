# HerbalTrace: Blockchain Technical Architecture

## System Overview

HerbalTrace is built on **Hyperledger Fabric 2.5**, a permissioned blockchain framework designed for enterprise use cases. This document provides a deep dive into the technical architecture, smart contract design, and integration patterns.

---

## Table of Contents

1. [Blockchain Network Architecture](#blockchain-network-architecture)
2. [Smart Contract (Chaincode) Design](#smart-contract-chaincode-design)
3. [Backend Integration](#backend-integration)
4. [Data Flow & Transaction Lifecycle](#data-flow--transaction-lifecycle)
5. [Security Architecture](#security-architecture)
6. [Performance Optimization](#performance-optimization)
7. [Deployment Guide](#deployment-guide)

---

## Blockchain Network Architecture

### Network Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                     Hyperledger Fabric Network                  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Orderer 1   │  │  Orderer 2   │  │  Orderer 3   │        │
│  │   (RAFT)     │  │   (RAFT)     │  │   (RAFT)     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│         │                  │                  │                │
│         └──────────────────┴──────────────────┘                │
│                            │                                    │
│              ┌─────────────┴─────────────┐                     │
│              │   herbaltrace-channel     │                     │
│              └─────────────┬─────────────┘                     │
│                            │                                    │
│    ┌───────────┬──────────┼──────────┬──────────┐            │
│    │           │           │          │          │            │
│  ┌─▼──┐     ┌─▼──┐     ┌─▼──┐    ┌─▼──┐    ┌──▼─┐          │
│  │Peer│     │Peer│     │Peer│    │Peer│    │Peer│          │
│  │ 0  │     │ 1  │     │ 2  │    │ 3  │    │ 4  │          │
│  └────┘     └────┘     └────┘    └────┘    └────┘          │
│    │          │          │         │         │               │
│  Farmer   Testing   Processing  Manufac  Manufac            │
│  sCoop      Labs     Facility    turer1   turer2            │
│                                                               │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐           │
│  │CouchDB │  │CouchDB │  │CouchDB │  │CouchDB │           │
│  │   0    │  │   1    │  │   2    │  │   3    │           │
│  └────────┘  └────────┘  └────────┘  └────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Organizations

**1. FarmersCoop (farmers.herbaltrace.com)**
- **Peer**: peer0.farmers.herbaltrace.com:7051
- **CA**: ca.farmers.herbaltrace.com:7054
- **Role**: Submits collection events, views batch assignments

**2. TestingLabs (testinglabs.herbaltrace.com)**
- **Peer**: peer0.testinglabs.herbaltrace.com:8051
- **CA**: ca.testinglabs.herbaltrace.com:8054
- **Role**: Submits quality test results, updates batch status

**3. ProcessingFacilities (processing.herbaltrace.com)**
- **Peer**: peer0.processing.herbaltrace.com:9051
- **CA**: ca.processing.herbaltrace.com:9054
- **Role**: Processes raw materials, maintains processing records

**4. Manufacturers (manufacturers.herbaltrace.com)**
- **Peer**: peer0.manufacturers.herbaltrace.com:10051
- **CA**: ca.manufacturers.herbaltrace.com:10054
- **Role**: Creates products, generates QR codes, consumes batches

### Channel Configuration

**Channel Name**: `herbaltrace-channel`

**Members**: All 4 organizations

**Endorsement Policy**: 
```
OR('FarmersCoop.peer', 'TestingLabs.peer', 'ProcessingFacilities.peer', 'Manufacturers.peer')
```
(Any organization can endorse transactions)

**Consensus**: RAFT (Crash Fault Tolerant)
- **Orderers**: 3 nodes
- **Leader**: Automatically elected
- **Tolerance**: Can survive 1 node failure

---

## Smart Contract (Chaincode) Design

### Chaincode Language: Go 1.21+

### Contract Structure

```go
package main

import (
    "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// HerbalTraceContract manages the supply chain traceability
type HerbalTraceContract struct {
    contractapi.Contract
}

// Collection represents a farm-level herb collection event
type Collection struct {
    CollectionID    string    `json:"collectionId"`
    FarmerID        string    `json:"farmerId"`
    FarmerName      string    `json:"farmerName"`
    Species         string    `json:"species"`
    Quantity        float64   `json:"quantity"`
    Unit            string    `json:"unit"`
    GPSLatitude     float64   `json:"gpsLatitude"`
    GPSLongitude    float64   `json:"gpsLongitude"`
    CollectionDate  string    `json:"collectionDate"`
    Photos          []string  `json:"photos"`
    Status          string    `json:"status"` // collected, batched, consumed
    CreatedAt       string    `json:"createdAt"`
    TxID            string    `json:"txId"`
}

// Batch represents aggregated collections
type Batch struct {
    BatchID         string    `json:"batchId"`
    BatchNumber     string    `json:"batchNumber"`
    Species         string    `json:"species"`
    TotalQuantity   float64   `json:"totalQuantity"`
    Unit            string    `json:"unit"`
    CollectionIDs   []string  `json:"collectionIds"` // Provenance bundle
    Status          string    `json:"status"` // pending_quality_test, quality_tested, rejected, consumed
    QCTestID        string    `json:"qcTestId,omitempty"`
    CreatedBy       string    `json:"createdBy"`
    CreatedAt       string    `json:"createdAt"`
    TxID            string    `json:"txId"`
}

// QCTest represents lab quality test results
type QCTest struct {
    TestID              string    `json:"testId"`
    BatchID             string    `json:"batchId"`
    LabID               string    `json:"labId"`
    LabName             string    `json:"labName"`
    MoistureContent     float64   `json:"moistureContent"` // Percentage
    PesticideLevel      float64   `json:"pesticideLevel"`  // ppm
    HeavyMetalLevel     float64   `json:"heavyMetalLevel"` // ppm
    DNAAuthentication   bool      `json:"dnaAuthentication"`
    TestResult          string    `json:"testResult"` // pass, fail
    TestDate            string    `json:"testDate"`
    CertificateURL      string    `json:"certificateUrl,omitempty"`
    TxID                string    `json:"txId"`
}

// Product represents final manufactured product
type Product struct {
    ProductID       string    `json:"productId"`
    ProductName     string    `json:"productName"`
    QRCode          string    `json:"qrCode"`
    BatchIDs        []string  `json:"batchIds"` // Multiple batches can be used
    Quantity        float64   `json:"quantity"`
    Unit            string    `json:"unit"`
    ManufactureDate string    `json:"manufactureDate"`
    ExpiryDate      string    `json:"expiryDate"`
    ManufacturerID  string    `json:"manufacturerId"`
    VerificationURL string    `json:"verificationUrl"`
    CreatedAt       string    `json:"createdAt"`
    TxID            string    `json:"txId"`
}
```

### Key Functions

#### 1. CreateCollection

**Purpose**: Records a farm-level herb collection event

**Inputs**:
- `collectionId`: Unique identifier (COL-{timestamp}-{uuid})
- `farmerId`: Farmer's blockchain identity
- `species`: Herb species name
- `quantity`: Collection quantity
- `gpsLatitude`, `gpsLongitude`: Farm coordinates

**Validation**:
- GPS coordinates within India (lat: 8-37°N, long: 68-97°E)
- Quantity > 0
- Farmer identity exists in CA

**Blockchain Operation**:
```go
func (c *HerbalTraceContract) CreateCollection(ctx contractapi.TransactionContextInterface, 
    collectionData string) error {
    
    // Parse input JSON
    var collection Collection
    err := json.Unmarshal([]byte(collectionData), &collection)
    if err != nil {
        return fmt.Errorf("failed to unmarshal collection: %v", err)
    }
    
    // Validate GPS
    if collection.GPSLatitude < 8 || collection.GPSLatitude > 37 {
        return fmt.Errorf("invalid GPS latitude")
    }
    
    // Store in ledger
    collectionJSON, _ := json.Marshal(collection)
    err = ctx.GetStub().PutState(collection.CollectionID, collectionJSON)
    if err != nil {
        return fmt.Errorf("failed to put collection: %v", err)
    }
    
    // Emit event
    ctx.GetStub().SetEvent("CollectionCreated", collectionJSON)
    
    return nil
}
```

#### 2. CreateBatch

**Purpose**: Aggregates multiple collections into a batch

**Inputs**:
- `batchId`: Unique identifier (BATCH-{species}-{date}-{random})
- `collectionIds`: Array of collection IDs to aggregate
- `createdBy`: Admin/processor identity

**Validation**:
- All collections exist and have same species
- Collections not already batched
- Total quantity = sum of collection quantities

**Blockchain Operation**:
```go
func (c *HerbalTraceContract) CreateBatch(ctx contractapi.TransactionContextInterface, 
    batchData string) error {
    
    var batch Batch
    json.Unmarshal([]byte(batchData), &batch)
    
    // Verify all collections exist
    totalQty := 0.0
    for _, colID := range batch.CollectionIDs {
        colBytes, err := ctx.GetStub().GetState(colID)
        if err != nil || colBytes == nil {
            return fmt.Errorf("collection %s not found", colID)
        }
        
        var col Collection
        json.Unmarshal(colBytes, &col)
        
        // Check not already batched
        if col.Status == "batched" {
            return fmt.Errorf("collection %s already batched", colID)
        }
        
        totalQty += col.Quantity
        
        // Mark collection as batched
        col.Status = "batched"
        colJSON, _ := json.Marshal(col)
        ctx.GetStub().PutState(colID, colJSON)
    }
    
    batch.TotalQuantity = totalQty
    batch.Status = "pending_quality_test"
    
    batchJSON, _ := json.Marshal(batch)
    ctx.GetStub().PutState(batch.BatchID, batchJSON)
    ctx.GetStub().SetEvent("BatchCreated", batchJSON)
    
    return nil
}
```

#### 3. SubmitQCTest

**Purpose**: Lab submits quality test results for a batch

**Inputs**:
- `testId`: Unique test identifier
- `batchId`: Batch being tested
- `testResults`: Moisture, pesticides, heavy metals, DNA auth

**Validation**:
- Batch exists and status = "pending_quality_test"
- Lab has authority (checked via MSP)
- Test values within NMPB limits

**NMPB Compliance Logic**:
```go
func validateNMPB(test QCTest) (string, error) {
    if test.MoistureContent > 10.0 {
        return "fail", fmt.Errorf("moisture content exceeds 10%%")
    }
    if test.PesticideLevel > 0.5 {
        return "fail", fmt.Errorf("pesticide level exceeds 0.5 ppm")
    }
    if test.HeavyMetalLevel > 10.0 {
        return "fail", fmt.Errorf("heavy metals exceed 10 ppm")
    }
    if !test.DNAAuthentication {
        return "fail", fmt.Errorf("DNA authentication failed")
    }
    return "pass", nil
}
```

**Blockchain Operation**:
```go
func (c *HerbalTraceContract) SubmitQCTest(ctx contractapi.TransactionContextInterface, 
    testData string) error {
    
    var test QCTest
    json.Unmarshal([]byte(testData), &test)
    
    // Validate NMPB compliance
    result, err := validateNMPB(test)
    test.TestResult = result
    
    // Update batch status
    batchBytes, _ := ctx.GetStub().GetState(test.BatchID)
    var batch Batch
    json.Unmarshal(batchBytes, &batch)
    
    if result == "pass" {
        batch.Status = "quality_tested"
    } else {
        batch.Status = "rejected"
    }
    batch.QCTestID = test.TestID
    
    // Store test and update batch
    testJSON, _ := json.Marshal(test)
    ctx.GetStub().PutState(test.TestID, testJSON)
    
    batchJSON, _ := json.Marshal(batch)
    ctx.GetStub().PutState(batch.BatchID, batchJSON)
    
    ctx.GetStub().SetEvent("QCTestCompleted", testJSON)
    
    return nil
}
```

#### 4. CreateProduct

**Purpose**: Manufacturer creates final product with QR code

**Inputs**:
- `productId`: Unique product identifier
- `batchIds`: Source batches used
- `qrCode`: Generated QR code identifier
- `productDetails`: Name, quantity, dates

**Validation**:
- All batches exist and status = "quality_tested"
- Batches not already consumed
- QR code unique (not already used)

**Blockchain Operation**:
```go
func (c *HerbalTraceContract) CreateProduct(ctx contractapi.TransactionContextInterface, 
    productData string) error {
    
    var product Product
    json.Unmarshal([]byte(productData), &product)
    
    // Verify all batches are quality tested
    for _, batchID := range product.BatchIDs {
        batchBytes, _ := ctx.GetStub().GetState(batchID)
        var batch Batch
        json.Unmarshal(batchBytes, &batch)
        
        if batch.Status != "quality_tested" {
            return fmt.Errorf("batch %s not quality tested", batchID)
        }
        
        // Mark batch as consumed
        batch.Status = "consumed"
        batchJSON, _ := json.Marshal(batch)
        ctx.GetStub().PutState(batchID, batchJSON)
    }
    
    // Store product
    productJSON, _ := json.Marshal(product)
    ctx.GetStub().PutState(product.ProductID, productJSON)
    
    // Also index by QR code for quick lookup
    ctx.GetStub().PutState("QR-"+product.QRCode, []byte(product.ProductID))
    
    ctx.GetStub().SetEvent("ProductCreated", productJSON)
    
    return nil
}
```

#### 5. GetProductByQR

**Purpose**: Consumer verification - retrieve product details by QR code

**Inputs**:
- `qrCode`: Scanned QR code value

**Returns**:
- Complete product details
- Source batch information
- Collection provenance
- Quality test certificates

**Blockchain Operation**:
```go
func (c *HerbalTraceContract) GetProductByQR(ctx contractapi.TransactionContextInterface, 
    qrCode string) (*ProductDetails, error) {
    
    // Lookup product ID by QR code
    productIDBytes, _ := ctx.GetStub().GetState("QR-" + qrCode)
    productID := string(productIDBytes)
    
    // Get product
    productBytes, _ := ctx.GetStub().GetState(productID)
    var product Product
    json.Unmarshal(productBytes, &product)
    
    // Build complete provenance
    var details ProductDetails
    details.Product = product
    
    // Get batches
    for _, batchID := range product.BatchIDs {
        batchBytes, _ := ctx.GetStub().GetState(batchID)
        var batch Batch
        json.Unmarshal(batchBytes, &batch)
        details.Batches = append(details.Batches, batch)
        
        // Get QC test
        testBytes, _ := ctx.GetStub().GetState(batch.QCTestID)
        var test QCTest
        json.Unmarshal(testBytes, &test)
        details.QCTests = append(details.QCTests, test)
        
        // Get collections
        for _, colID := range batch.CollectionIDs {
            colBytes, _ := ctx.GetStub().GetState(colID)
            var col Collection
            json.Unmarshal(colBytes, &col)
            details.Collections = append(details.Collections, col)
        }
    }
    
    return &details, nil
}
```

---

## Backend Integration

### Fabric SDK for Node.js

**Installation**:
```bash
npm install fabric-network fabric-ca-client
```

### Gateway Connection

```javascript
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

class FabricClient {
    constructor() {
        this.gateway = new Gateway();
        this.wallet = null;
        this.network = null;
        this.contract = null;
    }

    async connect(userId, orgName) {
        try {
            // Load connection profile
            const ccpPath = path.resolve(__dirname, `../network/organizations/peerOrganizations/${orgName}.herbaltrace.com/connection-${orgName}.json`);
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            // Load wallet
            const walletPath = path.join(process.cwd(), 'network/wallet');
            this.wallet = await Wallets.newFileSystemWallet(walletPath);

            // Check identity exists
            const identity = await this.wallet.get(userId);
            if (!identity) {
                throw new Error(`Identity ${userId} does not exist in wallet`);
            }

            // Connect to gateway
            await this.gateway.connect(ccp, {
                wallet: this.wallet,
                identity: userId,
                discovery: { enabled: true, asLocalhost: true }
            });

            // Get network and contract
            this.network = await this.gateway.getNetwork('herbaltrace-channel');
            this.contract = this.network.getContract('herbaltrace-chaincode');

            console.log(`✅ Connected to Fabric network as ${userId}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to connect: ${error.message}`);
            throw error;
        }
    }

    async submitTransaction(functionName, ...args) {
        try {
            const result = await this.contract.submitTransaction(functionName, ...args);
            return JSON.parse(result.toString());
        } catch (error) {
            console.error(`Transaction failed: ${error.message}`);
            throw error;
        }
    }

    async evaluateTransaction(functionName, ...args) {
        try {
            const result = await this.contract.evaluateTransaction(functionName, ...args);
            return JSON.parse(result.toString());
        } catch (error) {
            console.error(`Query failed: ${error.message}`);
            throw error;
        }
    }

    async disconnect() {
        await this.gateway.disconnect();
    }
}

module.exports = FabricClient;
```

### API Route Example: Create Collection

```javascript
router.post('/collections', authenticate, authorize(['Farmer']), async (req, res) => {
    try {
        const { species, quantity, unit, gpsCoordinates, photos } = req.body;
        
        // Generate collection ID
        const collectionId = `COL-${Date.now()}-${randomUUID()}`;
        
        // Prepare blockchain data
        const collectionData = {
            collectionId,
            farmerId: req.user.userId,
            farmerName: req.user.name,
            species,
            quantity,
            unit,
            gpsLatitude: gpsCoordinates.latitude,
            gpsLongitude: gpsCoordinates.longitude,
            collectionDate: new Date().toISOString(),
            photos,
            status: 'collected',
            createdAt: new Date().toISOString()
        };
        
        // Connect to Fabric
        const fabricClient = new FabricClient();
        await fabricClient.connect(req.user.userId, req.user.organization);
        
        // Submit transaction
        const result = await fabricClient.submitTransaction(
            'CreateCollection',
            JSON.stringify(collectionData)
        );
        
        // Get transaction ID
        const txId = await fabricClient.contract.getTransactionID();
        collectionData.txId = txId;
        
        // Store in database for quick access
        await db.collection.create(collectionData);
        
        await fabricClient.disconnect();
        
        res.status(201).json({
            success: true,
            data: collectionData,
            message: 'Collection recorded on blockchain'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
```

---

## Data Flow & Transaction Lifecycle

### Example: Complete Product Journey

**Step 1: Collection**
```
Farmer App → POST /api/v1/collections
    ↓
Backend validates GPS, species
    ↓
Fabric SDK → submitTransaction('CreateCollection', data)
    ↓
Peer endorses transaction
    ↓
Orderer sequences transaction
    ↓
All peers commit to ledger
    ↓
TxID: tx-col-1765278058044-3zle0o59g
```

**Step 2: Batch Creation**
```
Admin Portal → POST /api/v1/batches
    ↓
Backend aggregates collections
    ↓
Fabric SDK → submitTransaction('CreateBatch', data)
    ↓
Smart contract validates collections
    ↓
Updates collection status to 'batched'
    ↓
TxID: tx-batch-1765279084621-1813o40tf
```

**Step 3: Quality Testing**
```
Lab Portal → POST /api/v1/qc/submit-test-results
    ↓
Backend validates test parameters
    ↓
Fabric SDK → submitTransaction('SubmitQCTest', data)
    ↓
Smart contract checks NMPB compliance
    ↓
Updates batch status to 'quality_tested' or 'rejected'
    ↓
TxID: tx-qc-1765279932251-Z4FM2Q
```

**Step 4: Product Creation**
```
Manufacturer Portal → POST /api/v1/manufacturer/products
    ↓
Backend generates QR code
    ↓
Fabric SDK → submitTransaction('CreateProduct', data)
    ↓
Smart contract validates batches
    ↓
Marks batches as 'consumed'
    ↓
TxID: tx-prod-1765280057-4fa6
```

**Step 5: Consumer Verification**
```
Consumer scans QR code
    ↓
GET /api/v1/products/qr/{qrCode}
    ↓
Fabric SDK → evaluateTransaction('GetProductByQR', qrCode)
    ↓
Smart contract retrieves product + batches + collections + tests
    ↓
Verification Portal displays complete provenance
```

---

## Security Architecture

### Identity Management

**Fabric CA (Certificate Authority)**:
- Each organization has dedicated CA
- Issues X.509 certificates for users
- Certificate includes: User ID, Organization, Role, Public Key

**Enrollment Process**:
```javascript
const FabricCAServices = require('fabric-ca-client');

async function enrollUser(userId, secret, orgName) {
    // Load CA connection
    const caURL = `https://ca.${orgName}.herbaltrace.com:7054`;
    const ca = new FabricCAServices(caURL);
    
    // Enroll user
    const enrollment = await ca.enroll({
        enrollmentID: userId,
        enrollmentSecret: secret
    });
    
    // Create identity
    const identity = {
        credentials: {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes()
        },
        mspId: `${orgName}MSP`,
        type: 'X.509'
    };
    
    // Store in wallet
    await wallet.put(userId, identity);
}
```

### Access Control

**Attribute-Based Access Control (ABAC)**:

```go
// In chaincode
func (c *HerbalTraceContract) CreateProduct(ctx contractapi.TransactionContextInterface) error {
    // Get client identity
    cid := ctx.GetClientIdentity()
    
    // Check role attribute
    role, found, err := cid.GetAttributeValue("role")
    if err != nil || !found {
        return fmt.Errorf("role attribute not found")
    }
    
    if role != "Manufacturer" {
        return fmt.Errorf("only manufacturers can create products")
    }
    
    // Proceed with transaction...
}
```

### Data Encryption

**TLS Configuration**:
```yaml
# peer-config.yaml
peer:
  tls:
    enabled: true
    cert:
      file: tls/server.crt
    key:
      file: tls/server.key
    rootcert:
      file: tls/ca.crt
    clientAuthRequired: true
```

**Private Data Collections** (for sensitive info):
```json
{
  "name": "FarmerPrivateData",
  "policy": "OR('FarmersCoop.member')",
  "requiredPeerCount": 1,
  "maxPeerCount": 2,
  "blockToLive": 100,
  "memberOnlyRead": true
}
```

---

## Performance Optimization

### Caching Strategy

**Redis Cache**:
```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache product details
async function getProductByQR(qrCode) {
    // Check cache first
    const cached = await client.get(`product:${qrCode}`);
    if (cached) {
        return JSON.parse(cached);
    }
    
    // Query blockchain
    const product = await fabricClient.evaluateTransaction('GetProductByQR', qrCode);
    
    // Cache for 1 hour
    await client.setex(`product:${qrCode}`, 3600, JSON.stringify(product));
    
    return product;
}
```

### Query Optimization

**CouchDB Indexes**:
```json
{
  "index": {
    "fields": ["species", "status", "createdAt"]
  },
  "name": "collections-by-species-status",
  "type": "json"
}
```

**Rich Query Example**:
```javascript
async function getCollectionsBySpecies(species) {
    const query = {
        selector: {
            species: species,
            status: 'collected'
        },
        sort: [{ createdAt: 'desc' }],
        limit: 100
    };
    
    const result = await contract.evaluateTransaction(
        'GetQueryResult',
        JSON.stringify(query)
    );
    
    return JSON.parse(result.toString());
}
```

---

## Deployment Guide

### Prerequisites

1. **Docker & Docker Compose**
```bash
docker --version  # 24.0+
docker-compose --version  # 2.20+
```

2. **Fabric Binaries**
```bash
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.5.4 1.5.7
export PATH=$PWD/bin:$PATH
```

### Network Setup

**1. Generate Crypto Materials**
```bash
cd network
./scripts/generate-crypto.sh
```

**2. Start Network**
```bash
cd network/docker
docker-compose -f docker-compose-ca.yaml up -d
docker-compose -f docker-compose-herbaltrace.yaml up -d
```

**3. Create Channel**
```bash
./scripts/create-channel.sh
```

**4. Deploy Chaincode**
```bash
./scripts/deploy-chaincode.sh
```

### Backend Deployment

**1. Install Dependencies**
```bash
cd backend
npm install
```

**2. Configure Environment**
```bash
cp .env.example .env
# Edit .env with blockchain network details
```

**3. Start Server**
```bash
npm run build
npm start
```

### Monitoring

**Prometheus + Grafana**:
```bash
docker-compose -f monitoring/docker-compose.yaml up -d
```

Access Grafana: http://localhost:3001

---

## Troubleshooting

### Common Issues

**1. Endorsement Policy Failure**
```
Error: Endorsement policy failure
```
**Solution**: Ensure transaction is being endorsed by required organizations

**2. Identity Not Found**
```
Error: Identity does not exist in wallet
```
**Solution**: Re-enroll user with Fabric CA

**3. Ledger Mismatch**
```
Error: Ledger mismatch between peers
```
**Solution**: Restart peer containers, they will sync from orderer

---

## API Reference

Complete API documentation: [BACKEND_API_ENDPOINTS_NEW.md](./BACKEND_API_ENDPOINTS_NEW.md)

Blockchain explorer: Check transaction hashes on verification portal

---

**For technical support**: Contact blockchain team
**For partnership inquiries**: Reach out to business development
