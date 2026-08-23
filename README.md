# 🌿 HerbalTrace - Blockchain-Powered Herbal Supply Chain Traceability Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hyperledger Fabric](https://img.shields.io/badge/Blockchain-Hyperledger%20Fabric%202.5-blue)](https://www.hyperledger.org/use/fabric)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B)](https://flutter.dev/)

## 📖 Overview

**HerbalTrace** is an enterprise-grade, blockchain-powered supply chain traceability platform specifically designed for the herbal and medicinal plant industry. It provides end-to-end tracking from farm to consumer, ensuring authenticity, quality, and compliance through immutable blockchain records.

The platform addresses critical challenges in the herbal supply chain:
- **Authenticity Verification**: Combat counterfeit products with cryptographic proof
- **Quality Assurance**: Track lab test results and quality certifications
- **Regulatory Compliance**: Maintain immutable audit trails for regulators
- **Consumer Trust**: Enable end-customers to verify product origin and journey
- **Supply Chain Efficiency**: Streamline operations with real-time visibility

---

## ✨ Key Features

### 🔐 Blockchain-Backed Traceability
- **Immutable Records**: All supply chain events stored on Hyperledger Fabric
- **Multi-Party Consensus**: Transactions validated by farmer cooperatives, testing labs, processors, and manufacturers
- **Cryptographic Verification**: Each batch digitally signed by responsible parties
- **Tamper-Proof Audit Trail**: Complete history from harvest to retail

### 👥 Multi-Role Stakeholder Management
- **Farmer Cooperatives**: Record harvest collections with location, quantity, and farmer details
- **Testing Laboratories**: Upload quality test results with certifications
- **Processing Facilities**: Document extraction and processing steps
- **Manufacturers**: Track product formulation and batch creation
- **Distributors & Retailers**: Manage inventory and distribution
- **Consumers**: Scan QR codes to view complete product history

### 📱 Mobile-First Design
- **Flutter Mobile App**: Native Android/iOS apps for field workers and farmers
- **Offline Capability**: Record collections without internet, sync when connected
- **GPS Integration**: Automatic location tagging for harvest collections
- **Camera Integration**: Capture photos of products at each stage
- **QR Code Scanning**: Instant batch verification and tracking

### 📊 Real-Time Analytics & Dashboards
- **Role-Based Dashboards**: Customized views for each stakeholder type
- **Supply Chain Visualization**: Interactive flow diagrams showing batch journey
- **Quality Metrics**: Statistical analysis of test results and rejection rates
- **Performance Tracking**: KPIs for collection volumes, processing times, and efficiency
- **Alert System**: Automated notifications for quality failures, pending approvals, and deadlines

### 🔍 QR Code-Based Consumer Verification
- **Unique QR Codes**: Each product gets a unique, unforgeable QR code
- **Public Verification Portal**: Consumers scan to view complete product history
- **No-Login Access**: Instant verification without authentication
- **Detailed Journey**: See farmer details, test results, processing steps, and certifications
- **Multimedia Evidence**: View photos and documents from each supply chain stage

### 🧪 Integrated Quality Management
- **Lab Test Workflow**: Structured process for sample submission, testing, and result approval
- **Multiple Test Types**: Support for purity tests, contamination checks, potency analysis, etc.
- **Digital Certificates**: PDF generation for quality certificates
- **Pass/Fail Tracking**: Automatic batch status updates based on test results
- **Compliance Reporting**: Generate regulatory compliance reports

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Flutter Mobile App  │  React Web Portal  │  Admin Dashboard    │
└──────────┬───────────┴──────────┬─────────┴─────────────────────┘
           │                      │
           │   REST API (HTTPS)   │
           │                      │
┌──────────▼──────────────────────▼──────────────────────────────┐
│                    Express.js Backend                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │   Auth     │  │  Collection│  │   Quality  │               │
│  │  Service   │  │   Service  │  │  Service   │               │
│  └────────────┘  └────────────┘  └────────────┘               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │   Batch    │  │  Blockchain│  │   Export   │               │
│  │  Service   │  │   Gateway  │  │  Service   │               │
│  └────────────┘  └────────────┘  └────────────┘               │
└───────────┬─────────────────────────┬──────────────────────────┘
            │                         │
            │                         │ Fabric SDK
┌───────────▼────────┐   ┌────────────▼──────────────────────────┐
│  MongoDB Database  │   │  Hyperledger Fabric Network           │
│                    │   │  ┌──────────┐  ┌──────────┐           │
│  - User Data       │   │  │ Orderers │  │  Peers   │           │
│  - Collections     │   │  │  (RAFT)  │  │(CouchDB) │           │
│  - Test Results    │   │  └──────────┘  └──────────┘           │
│  - Batch Metadata  │   │  Smart Contract: herbalTrace.js       │
└────────────────────┘   └───────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 20.x with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Blockchain**: Hyperledger Fabric 2.5
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI
- **File Storage**: Local filesystem / AWS S3
- **QR Code**: QRCode.js library
- **PDF Generation**: PDFKit

### Mobile App
- **Framework**: Flutter 3.x
- **Language**: Dart
- **State Management**: Provider / Riverpod
- **HTTP Client**: Dio
- **Local Storage**: SQLite / Hive
- **QR Scanning**: mobile_scanner package

### Web Portal
- **Framework**: React 18.x
- **Language**: TypeScript
- **UI Library**: Material-UI / Ant Design
- **State Management**: Redux Toolkit / React Query
- **Routing**: React Router
- **Charts**: Recharts / Chart.js

### Blockchain
- **Platform**: Hyperledger Fabric 2.5
- **Consensus**: RAFT (for orderers)
- **Chaincode**: Node.js (JavaScript)
- **State Database**: CouchDB (for rich queries)
- **SDK**: Fabric Node SDK 2.x

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Cloud Hosting**: AWS / Railway / Digital Ocean
- **Monitoring**: PM2, Winston logging
- **Version Control**: Git & GitHub

---

## 📁 Project Structure

```
HerbalTrace/
├── backend/                          # Express.js backend server
│   ├── src/
│   │   ├── controllers/             # Request handlers
│   │   ├── models/                  # MongoDB schemas
│   │   ├── routes/                  # API routes
│   │   ├── middleware/              # Auth, validation, error handling
│   │   ├── services/                # Business logic
│   │   │   ├── blockchain/          # Fabric SDK integration
│   │   │   ├── qrcode/             # QR code generation
│   │   │   └── pdf/                # PDF certificate generation
│   │   └── utils/                   # Helper functions
│   ├── uploads/                     # File storage
│   └── package.json
│
├── chaincode/                        # Hyperledger Fabric smart contracts
│   └── herbalTrace/
│       ├── lib/                     # Chaincode implementation
│       │   ├── herbaltrace.js      # Main contract logic
│       │   ├── collection.js       # Collection transactions
│       │   ├── batch.js            # Batch transactions
│       │   └── quality.js          # Quality test transactions
│       └── package.json
│
├── network/                          # Fabric network configuration
│   ├── organizations/               # MSP configs for orgs
│   ├── docker/                      # Docker compose files
│   ├── configtx/                    # Channel configuration
│   └── scripts/                     # Network setup scripts
│
├── mobile-app/                       # Flutter mobile application
│   ├── lib/
│   │   ├── screens/                # UI screens
│   │   ├── widgets/                # Reusable components
│   │   ├── services/               # API clients
│   │   ├── models/                 # Data models
│   │   └── main.dart
│   └── pubspec.yaml
│
├── web-portal/                       # React web dashboard
│   ├── src/
│   │   ├── components/             # React components
│   │   ├── pages/                  # Page components
│   │   ├── services/               # API integration
│   │   ├── store/                  # State management
│   │   └── App.tsx
│   └── package.json
│
├── scripts/                          # Utility scripts
│   ├── start-blockchain-network.ps1
│   ├── deploy-windows.ps1
│   └── create-demo-users.ps1
│
├── docs/                            # Additional documentation
├── BACKEND_ARCHITECTURE.md          # Detailed backend docs
├── BLOCKCHAIN_ARCHITECTURE.md       # Detailed blockchain docs
├── DEPLOYMENT_GUIDE.md              # Deployment instructions
├── API_REFERENCE.md                 # API endpoint documentation
├── INNOVATIONS.md                   # Unique features & differentiators
└── README.md                        # This file
```

---

## 🚀 Quick Start

### One-Command Startup (Recommended)

From `HerbalTrace/` on Windows PowerShell:

```powershell
.\run-herbaltrace.ps1 -Mode full
```

Options:

```powershell
# Start app only (no Fabric network/channel operations)
.\run-herbaltrace.ps1 -Mode app-only

# Start full stack and run the end-to-end validation script
.\run-herbaltrace.ps1 -Mode full -RunE2E
```

## 💻 Run On A Different Laptop (Windows, Fresh Setup)

This is the fastest validated path to run the full platform on a new Windows laptop.

### 1. Install Prerequisites

- Git
- Node.js 20.x (LTS)
- Docker Desktop (Linux containers mode)
- PowerShell 7+ (recommended)

### 2. Clone And Open

```powershell
git clone https://github.com/kunaldubey10/Graph.git
cd Graph/HerbalTrace
```

### 3. Install Backend Dependencies

```powershell
cd backend
npm install
cd ..
```

### 4. Start Blockchain Network

Use Git Bash (or WSL bash) from `HerbalTrace/network`:

```bash
cd network
./deploy-network.sh up -ca
./scripts/create-channel-v2.sh
```

Or use the automation script from project root:

```powershell
.\run-herbaltrace.ps1 -Mode full
```

Notes:
- Docker Desktop must be fully running first.
- If channel already exists, you can skip recreate and continue.

### 5. Start Backend API

In PowerShell from `HerbalTrace/backend`:

```powershell
npm run dev
```

Health check:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/health -Method GET
```

### 6. Seed Or Login Admin

If admin does not exist:

```powershell
node .\create-admin.js
```

Default admin used in current flows:
- username: `admin`
- password: `admin123`

### 7. Run Full End-To-End Validation Flow

From `HerbalTrace/backend`:

```powershell
node .\tmp-full-registration-to-consumer-test.js
```

This script validates:
- new Farmer registration request
- new Lab registration request
- admin approval + issued credentials
- new-user login
- farmer collection creation + blockchain sync
- admin batch creation
- lab test + certificate on blockchain
- manufacturer product + QR generation
- consumer QR verification

### 8. Consumer Verification (Google Lens)

Use the `verificationUrl` returned by product creation / test output.
Google Lens opens the QR URL, and the backend verification endpoint returns product provenance details.

### Current Runtime Notes

- Backend persistence is SQLite (`backend/data/herbaltrace.db`) in this setup.
- Some old docs mention MongoDB; treat those as legacy unless you intentionally switch storage.
- If you hit `daily harvest limit exceeded` for a species, use a compliant species or reduce quantity according to configured validation rules.

### Prerequisites

- **Node.js** 20.x or higher
- **Docker** & **Docker Compose**
- **MongoDB** 6.x or higher
- **Git**
- **curl** or **Postman** (for API testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HerbalTrace
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # If using Docker:
   docker run -d -p 27017:27017 --name mongodb mongo:6
   ```

5. **Start the Blockchain Network**
   ```bash
   # On Windows:
   .\start-blockchain-network.ps1
   
   # On Linux/Mac:
   ./network/scripts/start-network.sh
   ```

6. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

7. **Access the Application**
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api-docs
   - Web Portal: http://localhost:3001 (if started)

### Creating Your First Admin User

```bash
node backend/src/scripts/create-admin.js
```

---

## 📚 Documentation

- **[Backend Architecture](BACKEND_ARCHITECTURE.md)** - Detailed backend design and implementation
- **[Blockchain Architecture](BLOCKCHAIN_ARCHITECTURE.md)** - Hyperledger Fabric network and smart contracts
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[API Reference](API_REFERENCE.md)** - Complete API endpoint documentation
- **[Innovations](INNOVATIONS.md)** - Unique features and market differentiators

---

## 🔑 Key Workflows

### 1. Farmer Collection Workflow
```
Farmer Harvests → Mobile App Records Collection → GPS Tagged
→ Upload to Backend → Store in MongoDB → Submit to Blockchain
→ Generate QR Code → Collection Approved
```

### 2. Quality Testing Workflow
```
Lab Receives Sample → Create Test Request → Perform Tests
→ Upload Results & Certificates → Lab Manager Approves
→ Results Stored on Blockchain → Batch Status Updated
→ Notification to Manufacturer
```

### 3. Batch Creation Workflow
```
Manufacturer Groups Collections → Create Batch → Link Quality Tests
→ Record Processing Details → Submit to Blockchain
→ Generate Product QR Code → Ready for Distribution
```

### 4. Consumer Verification Workflow
```
Consumer Scans QR Code → Public API Fetches Blockchain Data
→ Display Complete Journey → Show Farmer Details, Test Results,
Processing Steps → Build Consumer Trust
```

---

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control (RBAC)**: Granular permissions per user role
- **Blockchain Immutability**: Cryptographically secured transaction history
- **API Rate Limiting**: Protection against DDoS attacks
- **Input Validation**: Comprehensive request validation with Joi
- **Password Hashing**: bcrypt with salt rounds
- **HTTPS Enforcement**: SSL/TLS encryption in production
- **Environment Variables**: Sensitive data stored securely
- **Audit Logging**: Complete activity logs for compliance

---

## 📊 API Endpoints (Summary)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Collections
- `POST /api/collections` - Create new collection
- `GET /api/collections` - List collections
- `GET /api/collections/:id` - Get collection details
- `PUT /api/collections/:id` - Update collection
- `POST /api/collections/:id/blockchain` - Submit to blockchain

### Batches
- `POST /api/batches` - Create batch from collections
- `GET /api/batches` - List batches
- `GET /api/batches/:id` - Get batch details
- `GET /api/batches/:id/history` - Get blockchain history

### Quality Tests
- `POST /api/quality-tests` - Create quality test
- `GET /api/quality-tests` - List quality tests
- `PUT /api/quality-tests/:id` - Update test results
- `POST /api/quality-tests/:id/approve` - Approve test results

### QR Code & Verification
- `GET /api/verify/:batchId` - Public verification (no auth required)
- `GET /api/qr/:batchId` - Generate QR code

*See [API_REFERENCE.md](API_REFERENCE.md) for complete API documentation.*

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Integration Tests
```bash
npm run test:integration
```

### Test Blockchain Connection
```bash
node backend/src/scripts/test-blockchain.js
```

### Test API Endpoints
```bash
# Use the included PowerShell scripts:
.\test-phase5.ps1   # Test collection APIs
.\test-phase6.ps1   # Test batch APIs
.\test-phase7.ps1   # Test quality APIs
.\test-phase8-blockchain.ps1   # Test blockchain integration
```

---

## 🌍 Deployment

### Development Deployment
```bash
npm run dev   # Backend with hot-reload
```

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy using Docker**
   ```bash
   docker-compose up -d
   ```

3. **Configure environment**
   - Set production MongoDB URI
   - Configure Fabric network endpoints
   - Set JWT secret keys
   - Configure file storage (S3/local)

4. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js
   ```

*See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.*

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write unit tests for new features
- Update documentation for API changes
- Follow conventional commit messages
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team & Support

### Core Team
HerbalTrace is developed by a team of blockchain and supply chain experts dedicated to transforming the herbal medicine industry.

### Support
- **Email**: support@herbaltrace.com
- **Documentation**: Refer to included documentation files
- **Technical Support**: Contact through official channels

---

## 🎯 Roadmap

### Completed ✅
- ✅ Multi-role authentication system
- ✅ Collection management with GPS tagging
- ✅ Batch creation and grouping
- ✅ Quality test workflow
- ✅ Hyperledger Fabric integration
- ✅ QR code generation and verification
- ✅ Role-based dashboards
- ✅ Mobile app (Flutter)

### In Progress 🚧
- 🚧 Advanced analytics and reporting
- 🚧 Multi-language support
- 🚧 Export/import functionality
- 🚧 Real-time notifications (WebSocket)

### Planned 📅
- 📅 IoT sensor integration
- 📅 AI-powered quality prediction
- 📅 Regulatory compliance modules (FDA, EU, etc.)
- 📅 Marketplace integration
- 📅 Carbon footprint tracking
- 📅 Smart contract automation (NFTs for premium products)

---

## 🏆 Achievements

- **Hackathon Ready**: Full demo-ready system
- **Production Grade**: Enterprise-level architecture
- **Scalable**: Designed for 10,000+ concurrent users
- **Secure**: Bank-level security standards
- **Innovative**: Unique features not available in competing solutions

---

## 📈 Use Cases

1. **Ayurvedic Medicine Industry**: Track herbs from farm to pharmacy
2. **Organic Certification**: Verify organic farming practices
3. **Export Compliance**: Meet international quality standards
4. **Consumer Brands**: Build trust with transparency
5. **Research Institutions**: Track samples and research batches
6. **Government Programs**: Monitor subsidized herbal farming schemes

---

## 🙏 Acknowledgments

- Hyperledger Fabric community for excellent blockchain framework
- MongoDB team for robust database solutions
- Flutter team for amazing cross-platform framework
- Open-source contributors worldwide

---

## 📞 Contact

For inquiries, partnerships, or support:
- **Website**: https://herbaltrace.com
- **Email**: contact@herbaltrace.com
- **Project Repository**: Available through official channels

---

<div align="center">

**Built with ❤️ for the Herbal Industry**

[⬆ back to top](#-herbaltrace---blockchain-powered-herbal-supply-chain-traceability-platform)

</div>
