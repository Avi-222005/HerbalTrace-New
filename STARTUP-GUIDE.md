# HerbalTrace - Complete Startup Guide

## ⚡ FASTEST METHOD - One-Click Setup

### Option A: Complete Automated Setup (Git Bash)
Double-click: **`RUN-COMPLETE-SETUP.bat`**

This opens Git Bash and runs everything automatically:
- Cleans Docker
- Installs dependencies  
- Starts blockchain
- Creates channel
- Starts backend
- Creates admin

### Option B: Windows-Native Setup (Partial Automation)
Double-click: **`COMPLETE-SETUP-WINDOWS.bat`**

This runs most steps, then you manually run channel creation in Git Bash.

---

## 🚀 Quick Start (Run Scripts in Order)

I've created 6 batch scripts to automate the entire setup process. Run them in this order:

### Prerequisites Check
First, run manually in Command Prompt:
```cmd
cd D:\Graph\HerbalTrace
check-prereqs.bat
```

Verify you have:
- ✅ Docker Desktop (running)
- ✅ Node.js 20.x
- ✅ npm
- ✅ Git Bash

---

## Step-by-Step Execution

### Step 1: Clean Docker
```cmd
1-cleanup-docker.bat
```
This removes all old containers, volumes, and networks.

### Step 2: Install Backend Dependencies
```cmd
2-install-backend-deps.bat
```
This runs `npm install` in the backend directory.

### Step 3: Start Blockchain Network
```cmd
3-start-blockchain.bat
```
**IMPORTANT:** This opens Git Bash. In Git Bash, run:
```bash
cd network
./deploy-network.sh up -ca
./scripts/create-channel-v2.sh
```
Wait for both commands to complete successfully.

### Step 4: Start Backend Server
**Open a NEW Command Prompt window:**
```cmd
cd D:\Graph\HerbalTrace
4-start-backend.bat
```
Leave this window running (server will be active).

### Step 5: Create Admin User
**Open ANOTHER Command Prompt window:**
```cmd
cd D:\Graph\HerbalTrace
5-create-admin.bat
```

### Step 6: Run E2E Test
```cmd
6-run-e2e-test.bat
```

---

## Alternative: Manual Commands

If you prefer to run commands manually:

### 1. Check Prerequisites
```cmd
docker --version
docker ps
node --version
npm --version
```

### 2. Clean Docker
```cmd
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker volume prune -f
docker network prune -f
```

### 3. Install Backend Dependencies
```cmd
cd backend
npm install
cd ..
```

### 4. Start Blockchain (Git Bash)
```bash
cd network
./deploy-network.sh up -ca
./scripts/create-channel-v2.sh
```

### 5. Start Backend (new terminal)
```cmd
cd backend
npm run dev
```

### 6. Create Admin (new terminal)
```cmd
cd backend
node create-admin.js
```

### 7. Test Health
```cmd
curl http://localhost:3000/health
```

### 8. Run E2E Test
```cmd
cd backend
node tmp-full-registration-to-consumer-test.js
```

---

## Troubleshooting

### Docker not running
- Open Docker Desktop
- Wait for it to fully start
- Check system tray icon shows "Docker Desktop is running"

### Port already in use
```cmd
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

### Blockchain network issues
```bash
cd network
./deploy-network.sh down
./deploy-network.sh up -ca
```

### Backend crashes
- Check logs in the terminal
- Verify MongoDB/database connection
- Check `.env` file exists in backend folder

---

## Expected Results

### ✅ Step 3 Success (Blockchain):
- Containers running: peer0.org1, orderer, ca.org1, etc.
- Channel created successfully
- Chaincode deployed

### ✅ Step 4 Success (Backend):
```
Server running on port 3000
Connected to blockchain
Ready to accept requests
```

### ✅ Step 6 Success (E2E Test):
```
✓ Farmer registration
✓ Lab registration  
✓ Admin approval
✓ User login
✓ Collection created
✓ Test submitted
✓ Batch created
✓ QR code generated
✓ Consumer verification
```

---

## Next Steps After Success

1. **Access Backend API:** http://localhost:3000
2. **Health Check:** http://localhost:3000/health
3. **API Documentation:** Check `API_REFERENCE.md`
4. **Web Portal:** Check if `web-portal` has setup instructions
5. **View Logs:** Check backend terminal for activity

---

## Need Help?

- All scripts log their progress
- Check error messages for specific issues
- Blockchain logs: `docker logs <container_name>`
- Backend logs: In the terminal running step 4
