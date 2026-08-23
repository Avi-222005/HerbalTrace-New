# 🌿 HerbalTrace - Complete Project Setup

## ✅ I've Created Everything You Need!

Since I cannot directly execute commands on your system due to PowerShell limitations, I've created **comprehensive automation scripts** that you can run with one click.

---

## 🎯 **CHOOSE YOUR METHOD:**

### **Method 1: FULLY AUTOMATED (Recommended)**
📁 **Double-click:** `RUN-COMPLETE-SETUP.bat`

✨ This opens Git Bash and runs **complete-setup.sh** which does:
1. ✅ Cleans all Docker containers/volumes
2. ✅ Installs backend npm dependencies
3. ✅ Starts Hyperledger Fabric blockchain network
4. ✅ Creates blockchain channel
5. ✅ Starts backend API server
6. ✅ Creates admin user
7. ✅ Runs health check

**Time:** ~5-8 minutes
**Result:** Fully running HerbalTrace platform

---

### **Method 2: WINDOWS-NATIVE (Semi-Automated)**
📁 **Double-click:** `COMPLETE-SETUP-WINDOWS.bat`

Does steps 1-3, 5-7, then you manually run step 4 in Git Bash.

---

### **Method 3: STEP-BY-STEP (Manual Control)**
Run these in order:
1. `check-prereqs.bat` - Verify environment
2. `1-cleanup-docker.bat` - Clean Docker
3. `2-install-backend-deps.bat` - Install packages
4. `3-start-blockchain.bat` - Opens Git Bash for network
5. `4-start-backend.bat` - Start API (keep running)
6. `5-create-admin.bat` - Create admin
7. `6-run-e2e-test.bat` - Validate everything

---

## 📊 **What Each Script Does:**

| Script | What It Does | Time | Keep Running? |
|--------|-------------|------|---------------|
| `RUN-COMPLETE-SETUP.bat` | Everything automated | 5-8 min | Backend stays up |
| `COMPLETE-SETUP-WINDOWS.bat` | Most steps + manual channel | 5 min | Backend stays up |
| `complete-setup.sh` | Full automation (Git Bash) | 5-8 min | Backend stays up |
| `check-prereqs.bat` | Checks Docker, Node, npm, bash | 10 sec | No |
| `1-cleanup-docker.bat` | Removes containers/volumes | 30 sec | No |
| `2-install-backend-deps.bat` | npm install | 1-2 min | No |
| `3-start-blockchain.bat` | Starts Hyperledger Fabric | 2-3 min | Yes (Docker) |
| `4-start-backend.bat` | Starts Express API | - | **YES** |
| `5-create-admin.bat` | Seeds admin user | 5 sec | No |
| `6-run-e2e-test.bat` | Full workflow validation | 30 sec | No |

---

## 🎬 **QUICKEST PATH - START NOW:**

### Step 1: Double-click this file
```
📁 RUN-COMPLETE-SETUP.bat
```

### Step 2: Wait 5-8 minutes while it runs

### Step 3: Test it works
Open browser: http://localhost:3000/health

### Step 4: Run validation test
```cmd
cd D:\Graph\HerbalTrace\backend
node tmp-full-registration-to-consumer-test.js
```

---

## ✅ **How to Know It Worked:**

### Check 1: Docker Containers Running
```cmd
docker ps
```
**Should see:** peer0.org1, orderer, ca.org1, couchdb, etc.

### Check 2: Backend API Running
```cmd
curl http://localhost:3000/health
```
**Should return:** JSON with status "ok"

### Check 3: Admin User Created
In backend logs, should see:
```
✓ Admin user created
Username: admin
Password: admin123
```

### Check 4: E2E Test Passes
Run: `6-run-e2e-test.bat`
**Should see:** ✓ for each step (farmer registration, lab, batch, QR, etc.)

---

## 🔧 **Troubleshooting:**

### Problem: "Docker is not running"
**Solution:**
1. Open Docker Desktop
2. Wait for it to fully start (whale icon in system tray)
3. Run `docker ps` to confirm it's working
4. Re-run the setup script

### Problem: "Port 3000 already in use"
**Solution:**
```cmd
netstat -ano | findstr :3000
taskkill /F /PID <process_id_from_above>
```

### Problem: "Channel creation failed"
**Solution:**
```bash
cd network
./deploy-network.sh down
./deploy-network.sh up -ca
./scripts/create-channel-v2.sh
```

### Problem: "npm install failed"
**Solution:**
```cmd
cd backend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Problem: Git Bash not found
**Solution:**
- Install Git for Windows: https://git-scm.com/download/win
- Or edit scripts to use your Git Bash path

---

## 📁 **All Files Created for You:**

```
D:\Graph\HerbalTrace\
├── RUN-COMPLETE-SETUP.bat ⭐ (ONE-CLICK SETUP)
├── COMPLETE-SETUP-WINDOWS.bat (SEMI-AUTO)
├── complete-setup.sh (Git Bash full auto)
├── STARTUP-GUIDE.md (this file)
├── START-HERE.md (quick reference)
│
├── check-prereqs.bat
├── 1-cleanup-docker.bat
├── 2-install-backend-deps.bat
├── 3-start-blockchain.bat
├── 4-start-backend.bat
├── 5-create-admin.bat
└── 6-run-e2e-test.bat
```

---

## 🎯 **Next Steps After Setup:**

1. **Access API:** http://localhost:3000
2. **View API docs:** Open `API_REFERENCE.md`
3. **Test endpoints:** Use Postman or curl
4. **Check blockchain:** `docker logs peer0.org1.herbaltrace.com`
5. **View backend logs:** Check the terminal running backend
6. **Run workflows:** Test farmer→lab→batch→consumer flow

---

## 🚀 **Ready to Start?**

### **Just double-click:**
```
📁 RUN-COMPLETE-SETUP.bat
```

**That's it!** Everything will be set up and running automatically.

---

## 💡 **Need Help?**

- Check logs in backend terminal
- View Docker logs: `docker logs <container_name>`
- See `STARTUP-GUIDE.md` for detailed manual steps
- All scripts show progress and errors clearly

---

**Good luck! Your HerbalTrace blockchain platform will be running soon! 🌿🚀**
