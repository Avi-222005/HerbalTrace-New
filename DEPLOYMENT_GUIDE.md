# HerbalTrace: Deployment & Setup Guide

## Quick Start

This guide provides step-by-step instructions to deploy HerbalTrace on your local machine or production server.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [Blockchain Network Setup](#blockchain-network-setup)
4. [Backend API Setup](#backend-api-setup)
5. [Web Portal Setup](#web-portal-setup)
6. [Production Deployment](#production-deployment)
7. [Docker Commands Reference](#docker-commands-reference)
8. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Hardware

- **CPU**: 4 cores
- **RAM**: 8 GB
- **Storage**: 50 GB SSD
- **OS**: Ubuntu 20.04+ / macOS 11+ / Windows 10+ (with WSL2)

### Software Dependencies

- **Node.js**: 18.x or 20.x
- **Docker**: 24.0+
- **Docker Compose**: 2.20+
- **Git**: 2.30+
- **Go**: 1.21+ (for chaincode development)

---

## Installation

### 1. Install Node.js

**Ubuntu/Debian**:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Should show v20.x
```

**macOS**:
```bash
brew install node@20
node --version
```

**Windows**:
Download from [nodejs.org](https://nodejs.org/) and install the 20.x LTS version.

### 2. Install Docker

**Ubuntu**:
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
# Log out and log back in for group changes to take effect
```

**macOS**:
Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)

**Windows**:
Install Docker Desktop with WSL2 backend from [docker.com](https://www.docker.com/products/docker-desktop)

### 3. Install Hyperledger Fabric Binaries

```bash
cd ~
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.5.4 1.5.7
export PATH=$HOME/fabric-samples/bin:$PATH
echo 'export PATH=$HOME/fabric-samples/bin:$PATH' >> ~/.bashrc

# Verify installation
peer version
orderer version
```

### 4. Clone Repository

```bash
git clone https://github.com/your-org/HerbalTrace.git
cd HerbalTrace
```

---

## Blockchain Network Setup

### Step 1: Generate Cryptographic Materials

```bash
cd network
./scripts/generate-crypto.sh
```

**What this does**:
- Generates certificates for all organizations (FarmersCoop, TestingLabs, ProcessingFacilities, Manufacturers)
- Creates orderer certificates
- Generates MSP (Membership Service Provider) files
- Creates TLS certificates for secure communication

**Expected Output**:
```
✓ Generated crypto materials for FarmersCoop
✓ Generated crypto materials for TestingLabs
✓ Generated crypto materials for ProcessingFacilities
✓ Generated crypto materials for Manufacturers
✓ Generated orderer certificates
```

### Step 2: Start Certificate Authorities

```bash
cd docker
docker-compose -f docker-compose-ca.yaml up -d
```

**What this does**:
- Starts 4 Fabric CA containers (one per organization)
- CAs listen on ports 7054, 8054, 9054, 10054

**Verify CAs are running**:
```bash
docker ps | grep ca
```

### Step 3: Start Network Components

```bash
docker-compose -f docker-compose-herbaltrace.yaml up -d
```

**What this does**:
- Starts orderer nodes (RAFT consensus)
- Starts peer nodes for each organization
- Starts CouchDB containers (world state database)

**Verify network is running**:
```bash
docker ps
```

You should see:
- 3 orderer containers
- 4 peer containers
- 4 CouchDB containers
- 4 CA containers

### Step 4: Create Channel

```bash
cd ../scripts
./create-channel.sh
```

**What this does**:
- Creates `herbaltrace-channel`
- Joins all peers to the channel
- Updates anchor peers for each organization

**Expected Output**:
```
✓ Channel 'herbaltrace-channel' created
✓ peer0.farmers joined channel
✓ peer0.testinglabs joined channel
✓ peer0.processing joined channel
✓ peer0.manufacturers joined channel
✓ Anchor peers updated
```

### Step 5: Deploy Chaincode

```bash
./deploy-chaincode.sh
```

**What this does**:
- Packages chaincode (Go smart contract)
- Installs chaincode on all peers
- Approves chaincode for each organization
- Commits chaincode to channel

**Expected Output**:
```
✓ Chaincode packaged: herbaltrace-chaincode.tar.gz
✓ Chaincode installed on all peers
✓ Chaincode approved by all organizations
✓ Chaincode committed to channel
✓ Chaincode initialized
```

**Verify chaincode is ready**:
```bash
peer lifecycle chaincode querycommitted -C herbaltrace-channel
```

---

## Backend API Setup

### Step 1: Install Dependencies

```bash
cd ../../backend
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` file:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_PATH=./data/herbaltrace.db

# JWT Authentication
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Blockchain Configuration
FABRIC_NETWORK_PATH=../network
CHANNEL_NAME=herbaltrace-channel
CHAINCODE_NAME=herbaltrace-chaincode
WALLET_PATH=./wallet

# Vercel URL (for QR codes)
VERCEL_URL=https://herbaltrace165343.vercel.app

# File Upload
MAX_FILE_SIZE=10485760  # 10 MB
UPLOAD_PATH=./uploads
```

### Step 3: Build TypeScript

```bash
npm run build
```

**What this does**:
- Compiles TypeScript to JavaScript in `dist/` folder
- Type-checks all files

### Step 4: Initialize Database

```bash
npm run db:init
```

**What this does**:
- Creates SQLite database at `data/herbaltrace.db`
- Creates tables: users, collections, batches, qc_tests, products
- Seeds default admin account

**Default Admin Credentials**:
- **User ID**: `admin-001`
- **Password**: `admin123`

### Step 5: Enroll Admin in Blockchain Network

```bash
node scripts/enroll-admin.js
```

**What this does**:
- Enrolls `admin-001` with Fabric CA
- Creates X.509 certificate
- Stores identity in wallet

### Step 6: Start Backend Server

```bash
npm start
```

**Expected Output**:
```
[INFO] Server starting...
[INFO] Database connected: herbaltrace.db
[INFO] Blockchain network: ONLINE
[INFO] Channel: herbaltrace-channel
[INFO] Chaincode: herbaltrace-chaincode
[INFO] Server running on http://localhost:3000
```

**Test API**:
```bash
curl http://localhost:3000/api/v1/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-09T10:30:00.000Z",
  "blockchain": {
    "status": "connected",
    "channel": "herbaltrace-channel"
  }
}
```

---

## Web Portal Setup

### Step 1: Install Dependencies

```bash
cd ../web-portal-cloned
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_MAPBOX_TOKEN=your-mapbox-token  # Optional for maps
```

### Step 3: Start Development Server

```bash
npm run dev
```

**Expected Output**:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 4: Access Web Portal

Open browser: http://localhost:5173

**Login with**:
- **User ID**: `admin-001`
- **Password**: `admin123`

---

## Production Deployment

### Backend (Node.js)

**1. Build Production Bundle**:
```bash
cd backend
npm run build
```

**2. Use PM2 for Process Management**:
```bash
npm install -g pm2
pm2 start dist/server.js --name herbaltrace-backend
pm2 save
pm2 startup  # Enable auto-start on boot
```

**3. Nginx Reverse Proxy**:
```nginx
server {
    listen 80;
    server_name api.herbaltrace.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Web Portal (Vercel)

**Deploy to Vercel**:
```bash
cd web-portal-cloned
npm install -g vercel
vercel login
vercel --prod
```

**Configure Environment Variables** on Vercel dashboard:
- `VITE_API_BASE_URL`: `https://api.herbaltrace.com/api/v1`

### Blockchain Network (Production)

**Use Docker Swarm or Kubernetes**:
```bash
# Docker Swarm
docker swarm init
docker stack deploy -c docker-compose-production.yaml herbaltrace-network

# Kubernetes
kubectl apply -f k8s/fabric-network.yaml
```

---

## Docker Commands Reference

### Network Management

**Start all services**:
```bash
cd network/docker
docker-compose -f docker-compose-ca.yaml -f docker-compose-herbaltrace.yaml up -d
```

**Stop all services**:
```bash
docker-compose -f docker-compose-ca.yaml -f docker-compose-herbaltrace.yaml down
```

**Restart specific service**:
```bash
docker-compose restart peer0.farmers.herbaltrace.com
```

**View logs**:
```bash
docker logs peer0.farmers.herbaltrace.com -f  # Follow logs
docker logs orderer.herbaltrace.com --tail 100  # Last 100 lines
```

**Clean up everything** (CAUTION: Deletes all data):
```bash
docker-compose down -v  # Remove volumes
docker system prune -a  # Remove all unused containers/images
rm -rf organizations/  # Remove crypto materials
```

### Container Status

**Check running containers**:
```bash
docker ps
```

**Check all containers (including stopped)**:
```bash
docker ps -a
```

**Inspect container**:
```bash
docker inspect peer0.farmers.herbaltrace.com
```

**Execute command inside container**:
```bash
docker exec -it peer0.farmers.herbaltrace.com bash
```

---

## Troubleshooting

### Backend Won't Start

**Error**: `Cannot find module 'fabric-network'`

**Solution**:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

### Blockchain Connection Failed

**Error**: `Failed to connect to blockchain network`

**Solution**:
1. Check Docker containers are running:
```bash
docker ps | grep peer
```

2. Verify chaincode is deployed:
```bash
peer lifecycle chaincode queryinstalled
```

3. Check wallet has admin identity:
```bash
ls backend/wallet/
```

4. Re-enroll admin:
```bash
cd backend
node scripts/enroll-admin.js
```

---

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

---

### Chaincode Invocation Failed

**Error**: `Chaincode invocation failed: timeout`

**Solution**:
1. Check peer logs:
```bash
docker logs peer0.farmers.herbaltrace.com --tail 50
```

2. Verify chaincode container is running:
```bash
docker ps | grep herbaltrace-chaincode
```

3. Restart peer:
```bash
docker restart peer0.farmers.herbaltrace.com
```

---

### Database Locked

**Error**: `SQLITE_BUSY: database is locked`

**Solution**:
```bash
# Stop backend
pm2 stop herbaltrace-backend

# Remove lock
rm backend/data/herbaltrace.db-shm
rm backend/data/herbaltrace.db-wal

# Restart backend
pm2 start herbaltrace-backend
```

---

### Web Portal Can't Connect to Backend

**Error**: `Network Error` in browser console

**Solution**:
1. Check backend is running:
```bash
curl http://localhost:3000/api/v1/health
```

2. Verify CORS is configured in backend:
```javascript
// backend/src/server.ts
app.use(cors({
  origin: 'http://localhost:5173',  // Vite dev server
  credentials: true
}));
```

3. Check `.env` file in web portal:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## Testing Deployment

### 1. Health Check

```bash
curl http://localhost:3000/api/v1/health
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "admin-001",
    "password": "admin123"
  }'
```

### 3. Create Collection

```bash
TOKEN="your-jwt-token-from-login"

curl -X POST http://localhost:3000/api/v1/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "species": "Neem",
    "quantity": 50,
    "unit": "kg",
    "gpsCoordinates": {
      "latitude": 30.3165,
      "longitude": 78.0322
    }
  }'
```

### 4. Verify QR Code

```bash
curl http://localhost:3000/api/v1/products/qr/QR-1234567890
```

---

## Next Steps

1. **Register Users**: Create farmer, lab, manufacturer accounts
2. **Test Workflow**: Go through complete collection → batch → QC → product flow
3. **Enable Monitoring**: Set up Prometheus + Grafana dashboards
4. **Configure Backups**: Schedule database and blockchain state backups
5. **Security Hardening**: Change default passwords, enable firewall rules

---

## Support

**Documentation**: See [README.md](./README.md) and [BLOCKCHAIN_ARCHITECTURE.md](./BLOCKCHAIN_ARCHITECTURE.md)

**Logs Location**:
- Backend: `backend/logs/`
- Docker: `docker logs <container-name>`
- Network: `network/logs/`

**For technical support**: Contact the development team
