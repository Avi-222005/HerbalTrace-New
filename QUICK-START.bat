@echo off
REM ==========================================
REM QUICK START - Start All Services
REM ==========================================
REM Use this to quickly start backend and frontend
REM Assumes chaincode is already deployed
REM ==========================================

echo.
echo ========================================
echo HERBALTRACE QUICK START
echo ========================================
echo.

REM Check if chaincode is deployed
if not exist ".chaincode-deployed" (
    echo WARNING: Chaincode may not be deployed yet!
    echo Please run SETUP-PERMANENT-DEPLOYMENT.bat first
    echo.
    choice /C YN /M "Continue anyway?"
    if errorlevel 2 exit /b
)

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Check if network containers are running
echo Checking Hyperledger Fabric network...
docker ps | findstr "peer0.farmers" >nul 2>&1
if errorlevel 1 (
    echo Network containers not running. Starting network...
    echo.
    start /wait "Start Network" "C:\Program Files\Git\bin\bash.exe" -c "cd network && ./deploy-network.sh up && echo 'Network started!' && sleep 3"
    timeout /t 15 /nobreak
) else (
    echo Network is already running!
)

REM Start Backend
echo.
echo [1/2] Starting Backend API Server...
echo ========================================
cd backend
start "HerbalTrace Backend" cmd /k "npm run dev"
echo Backend starting on http://localhost:3000
timeout /t 5 /nobreak
cd ..

REM Start Frontend
echo.
echo [2/2] Starting Frontend Web Portal...
echo ========================================
cd web-portal
start "HerbalTrace Frontend" cmd /k "npm run dev"
echo Frontend starting on http://localhost:5173
cd ..

echo.
echo ========================================
echo ✓ ALL SERVICES STARTED!
echo ========================================
echo.
echo Services:
echo   ✓ Blockchain Network: Running
echo   ✓ Backend API: http://localhost:3000
echo   ✓ Frontend: http://localhost:5173
echo.
echo To verify:
echo   docker ps
echo   curl http://localhost:3000/health
echo.
echo Press Ctrl+C in the respective windows to stop services
echo.
pause
