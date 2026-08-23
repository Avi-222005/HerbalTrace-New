@echo off
REM ==========================================
REM RESTART HYPERLEDGER FABRIC NETWORK
REM ==========================================
REM Use if network containers are stopped
REM Chaincode remains deployed
REM ==========================================

echo.
echo ========================================
echo RESTARTING HYPERLEDGER FABRIC NETWORK
echo ========================================
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo Restarting network containers...
start /wait "Restart Network" "C:\Program Files\Git\bin\bash.exe" -c "cd network && ./deploy-network.sh restart && echo 'Network restarted!' && sleep 3"

echo.
echo Waiting for network stabilization...
timeout /t 15 /nobreak

echo.
echo ========================================
echo ✓ NETWORK RESTARTED
echo ========================================
echo.
echo Verify with: docker ps
echo.
pause
