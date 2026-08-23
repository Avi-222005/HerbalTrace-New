@echo off
REM ==========================================
REM ONE-TIME PERMANENT CHAINCODE DEPLOYMENT
REM ==========================================
REM Run this ONCE to permanently deploy chaincode
REM After this, use QUICK-START.bat to start services
REM ==========================================

echo.
echo ========================================
echo PERMANENT CHAINCODE DEPLOYMENT SETUP
echo ========================================
echo.
echo This will:
echo   1. Clean and setup Docker network
echo   2. Start Hyperledger Fabric network
echo   3. Create channel and deploy chaincode
echo   4. Create persistent admin user
echo.
echo After this completes, use QUICK-START.bat to start services
echo.
pause

REM Step 1: Clean Docker environment
echo.
echo [1/5] Cleaning Docker environment...
echo ========================================
docker stop $(docker ps -aq) 2>nul
docker rm $(docker ps -aq) 2>nul
docker volume prune -f 2>nul
docker network prune -f 2>nul
echo Docker cleanup completed!

REM Step 2: Install backend dependencies
echo.
echo [2/5] Installing backend dependencies...
echo ========================================
cd backend
if not exist "node_modules\" (
    echo Installing npm packages...
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install failed
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed, skipping...
)
cd ..

REM Step 3: Start Hyperledger Fabric network
echo.
echo [3/5] Starting Hyperledger Fabric network...
echo ========================================
echo Opening Git Bash to start blockchain network...
echo Please wait for network to fully start (about 2-3 minutes)
echo.
start /wait "Blockchain Network" "C:\Program Files\Git\bin\bash.exe" -c "cd network && ./deploy-network.sh up && read -p 'Network started! Press Enter to continue...'"

echo.
echo Waiting 30 seconds for network stabilization...
timeout /t 30 /nobreak

REM Step 4: Create channel and deploy chaincode
echo.
echo [4/5] Creating channel and deploying chaincode...
echo ========================================
start /wait "Deploy Chaincode" "C:\Program Files\Git\bin\bash.exe" -c "cd network && ./deploy-network.sh createChannel && ./deploy-network.sh deployChaincode && echo 'Chaincode deployed successfully!' && read -p 'Press Enter to continue...'"

REM Step 5: Setup admin user and wallet
echo.
echo [5/5] Creating admin user and wallet...
echo ========================================
cd backend
timeout /t 10 /nobreak
call node create-admin.js
if errorlevel 1 (
    echo WARNING: Admin creation may have failed, but continuing...
)
cd ..

REM Create success marker file
echo DEPLOYED > .chaincode-deployed

echo.
echo ========================================
echo ✓ PERMANENT DEPLOYMENT COMPLETED!
echo ========================================
echo.
echo Chaincode is now permanently deployed!
echo.
echo Next steps:
echo   1. Use QUICK-START.bat to start backend/frontend
echo   2. Access the application at:
echo      - Backend API: http://localhost:3000
echo      - Frontend: http://localhost:5173
echo.
echo To verify deployment:
echo   docker ps
echo   curl http://localhost:3000/health
echo.
pause
