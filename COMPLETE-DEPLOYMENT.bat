@echo off
REM ==========================================
REM Complete Network Restart & Deployment
REM Run this from Command Prompt (not PowerShell)
REM ==========================================

echo.
echo ==========================================
echo   Complete HerbalTrace Deployment
echo ==========================================
echo.

cd /d d:\Graph\HerbalTrace\network

echo [1/5] Stopping network...
bash -c "./deploy-network.sh down"
timeout /t 5 /nobreak

echo.
echo [2/5] Starting network...
bash -c "./deploy-network.sh up -ca"
timeout /t 15 /nobreak

echo.
echo [3/5] Creating channel...
bash -c "./deploy-network.sh createChannel"
timeout /t 5 /nobreak

echo.
echo [4/5] Copying chaincode to CLI container...
docker cp ../chaincode/herbaltrace cli:/opt/gopath/src/github.com/chaincode/herbaltrace
timeout /t 3 /nobreak

echo.
echo [5/5] Deploying chaincode (this will take 2-3 minutes)...
bash -c "./deploy-network.sh deployChaincode"

echo.
echo ==========================================
echo   ✅ DEPLOYMENT COMPLETE!
echo ==========================================
echo.
echo Now you can:
echo 1. Try creating a collection event again
echo 2. It should sync to blockchain successfully
echo.
pause
