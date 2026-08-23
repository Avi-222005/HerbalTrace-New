@echo off
REM HerbalTrace - Complete Windows Setup
REM This script runs everything needed on Windows without Git Bash

setlocal enabledelayedexpansion

echo ========================================
echo HerbalTrace Complete Windows Setup
echo ========================================
echo.

cd /d "%~dp0"
set PROJECT_ROOT=%CD%

echo Project Root: %PROJECT_ROOT%
echo.

REM Step 1: Docker Cleanup
echo [1/8] Cleaning Docker...
docker stop $(docker ps -aq) 2>nul
docker rm $(docker ps -aq) 2>nul
docker volume prune -f
docker network prune -f
echo Done: Docker cleaned
echo.

REM Step 2: Install Backend Dependencies
echo [2/8] Installing Backend Dependencies...
cd "%PROJECT_ROOT%\backend"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
echo Done: Backend dependencies installed
echo.

REM Step 3: Start Blockchain with Docker Compose
echo [3/8] Starting Blockchain Network...
cd "%PROJECT_ROOT%\network\docker"

echo Stopping any existing network...
docker-compose -f docker-compose-herbaltrace.yaml down 2>nul
docker-compose -f docker-compose-ca.yaml down 2>nul

echo Starting CA services...
docker-compose -f docker-compose-ca.yaml up -d
timeout /t 10 /nobreak

echo Starting main network...
docker-compose -f docker-compose-herbaltrace.yaml up -d
echo Done: Blockchain network started
echo.

echo Waiting for network to stabilize (20 seconds)...
timeout /t 20 /nobreak
echo.

REM Step 4: Note about channel creation
echo [4/8] Channel Creation...
echo NOTE: Channel creation requires Git Bash
echo After this script completes, run in Git Bash:
echo   cd network
echo   ./scripts/create-channel-v2.sh
echo.
echo Press any key to continue (skip channel for now)...
pause > nul
echo.

REM Step 5: Check Docker containers
echo [5/8] Verifying Blockchain Containers...
docker ps --format "table {{.Names}}\t{{.Status}}"
echo.

REM Step 6: Start Backend
echo [6/8] Starting Backend Server...
cd "%PROJECT_ROOT%\backend"

echo Killing any existing node processes...
taskkill /F /IM node.exe 2>nul

echo Starting backend in new window...
start "HerbalTrace Backend" cmd /k "npm run dev"
echo Done: Backend started in new window
echo.

echo Waiting for backend to initialize (15 seconds)...
timeout /t 15 /nobreak
echo.

REM Step 7: Create Admin
echo [7/8] Creating Admin User...
node create-admin.js
echo Done: Admin created (username: admin, password: admin123)
echo.

REM Step 8: Health Check
echo [8/8] Testing Backend Health...
timeout /t 3 /nobreak
curl -s http://localhost:3000/health 2>nul || echo Waiting for backend...
echo.
echo.

echo ========================================
echo Setup Complete (Partial)
echo ========================================
echo.
echo What's Running:
echo   - Docker Containers: Check with 'docker ps'
echo   - Backend Server: Running in separate window
echo.
echo NEXT STEP REQUIRED:
echo   Open Git Bash and run:
echo     cd %PROJECT_ROOT%\network
echo     ./scripts/create-channel-v2.sh
echo.
echo After channel is created:
echo   - Test API: http://localhost:3000/health
echo   - Run E2E: cd backend ^&^& node tmp-full-registration-to-consumer-test.js
echo.
echo To stop:
echo   - Backend: Close the backend window or Ctrl+C
echo   - Blockchain: cd network\docker ^&^& docker-compose -f docker-compose-herbaltrace.yaml down
echo.
pause
