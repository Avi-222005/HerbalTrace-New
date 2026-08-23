# Complete Deployment Guide - Manual Steps

## 🚨 Your Collection Event Failed Because Chaincode Is Not Deployed

**Error Details:**
- Collection ID: COL-1775109385170-dc750ab6
- Species: Giloy (15 kg)
- Status: **FAILED**
- Blockchain Tx ID: **null** (no blockchain transaction)

---

## ✅ SOLUTION: Complete Chaincode Deployment

### Method 1: Automated Script (Recommended)

**Open Command Prompt** (not PowerShell) and run:

```cmd
cd d:\Graph\HerbalTrace
COMPLETE-DEPLOYMENT.bat
```

This will:
1. ✅ Stop network cleanly
2. ✅ Start fresh network with proper DNS
3. ✅ Create channel
4. ✅ Copy chaincode
5. ✅ Deploy and commit chaincode

**Time:** ~5-7 minutes

---

### Method 2: Manual Commands (If script fails)

**Open Git Bash** and run these commands **one by one**:

```bash
cd /d/Graph/HerbalTrace/network

# 1. Clean stop
./deploy-network.sh down
sleep 5

# 2. Start network
./deploy-network.sh up -ca
sleep 15

# 3. Create channel
./deploy-network.sh createChannel
sleep 5

# 4. Copy chaincode
docker cp ../chaincode/herbaltrace cli:/opt/gopath/src/github.com/chaincode/herbaltrace

# 5. Deploy chaincode (wait for this to complete - takes 2-3 minutes)
./deploy-network.sh deployChaincode
```

---

### Method 3: Step-by-Step Verification

If the above methods don't work, do this:

1. **Open Git Bash**

2. **Stop everything:**
   ```bash
   cd /d/Graph/HerbalTrace/network
   ./deploy-network.sh down
   ```
   Wait for: "Network stopped and cleaned"

3. **Start network:**
   ```bash
   ./deploy-network.sh up -ca
   ```
   Wait for: "Network started successfully"

4. **Create channel:**
   ```bash
   ./deploy-network.sh createChannel
   ```
   Wait for: "Channel herbaltrace-channel created successfully"

5. **Check if chaincode directory exists in CLI:**
   ```bash
   docker exec cli ls /opt/gopath/src/github.com/chaincode/
   ```
   
   If empty, copy it:
   ```bash
   docker cp ../chaincode/herbaltrace cli:/opt/gopath/src/github.com/chaincode/herbaltrace
   ```

6. **Deploy chaincode:**
   ```bash
   ./deploy-network.sh deployChaincode
   ```
   
   **This step takes 2-3 minutes. Wait for:**
   - "Installing chaincode..."
   - "Approving chaincode..."
   - "Committing chaincode..."
   - "Chaincode deployed successfully"

---

## ✅ How to Verify Deployment Worked

After deployment completes:

### 1. Check Chaincode Status

In Git Bash:
```bash
cd /d/Graph/HerbalTrace/network
docker exec cli peer lifecycle chaincode querycommitted --channelID herbaltrace-channel --name herbaltrace
```

**Expected output:**
```
Committed chaincode definition for chaincode 'herbaltrace' on channel 'herbaltrace-channel':
Version: 1.0, Sequence: 1
```

### 2. Try Creating Collection Event Again

1. Go back to your web application
2. Create a new collection event
3. Submit it
4. **Check if blockchain Tx ID is NOT null**
5. **Status should be "synced" or "success"**

---

## 🐛 Common Issues & Solutions

### Issue 1: "Docker API 500 error"
**Solution:** Use Git Bash instead of PowerShell/CMD for Docker commands

### Issue 2: "Cannot resolve peer hostnames"
**Solution:** Do a complete network restart (Method 1 script does this)

### Issue 3: Deployment script hangs
**Solution:** 
1. Stop it (Ctrl+C)
2. Check: `docker ps | grep peer`
3. If peers are running, try Method 2 or 3

### Issue 4: "Chaincode already installed" error
**Solution:** This is OK! It means install worked. Script will continue to approval/commit.

---

## 📞 Quick Status Check

**Are your backend/frontend still running?**
- Backend: http://localhost:3000/health
- Frontend: http://localhost:5173

If they stopped, restart them:
```cmd
cd d:\Graph\HerbalTrace
QUICK-START.bat
```

---

## ⏱️ Expected Timeline

| Step | Time | What's Happening |
|------|------|------------------|
| Stop network | 30s | Cleaning up containers |
| Start network | 2min | Starting all peers, orderers, databases |
| Create channel | 30s | Creating blockchain channel |
| Deploy chaincode | 2-3min | Installing, approving, committing chaincode |
| **Total** | **5-7min** | Full deployment |

---

## ✅ Success Indicators

You'll know it worked when:
1. ✅ No error messages during deployment
2. ✅ `querycommitted` shows chaincode version 1.0
3. ✅ New collection events get a blockchain Tx ID
4. ✅ Collection event status = "synced" or "success"

---

**Once deployment is complete, retry creating your Giloy collection and it should sync to blockchain successfully!**
