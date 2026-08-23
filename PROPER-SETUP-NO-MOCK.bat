@echo off
REM 🌿 HerbalTrace - Proper Setup WITHOUT Mock Mode
REM This script implements the official deployment WITHOUT blockchain mocking

echo.
echo ========================================
echo HerbalTrace - Proper Setup (Real Blockchain)
echo ========================================
echo.
echo This will set up HerbalTrace with REAL blockchain - NO MOCKING
echo.
echo Prerequisites:
echo   - Docker Desktop MUST BE RUNNING
echo   - Node.js 20.x installed
echo   - Git Bash installed
echo.
echo Press any key if Docker Desktop is running...
pause > nul

setlocal enabledelayedexpansion
set PROJECT_ROOT=%~dp0
cd /d "%PROJECT_ROOT%"

echo.
echo Step 1: Checking Docker...
docker ps > nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker daemon is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo ✓ Docker is running

echo.
echo Step 2: Cleaning Docker containers...
docker stop $(docker ps -aq) 2>nul
docker rm $(docker ps -aq) 2>nul
docker volume prune -f 2>nul
docker network prune -f 2>nul
echo ✓ Docker cleaned

echo.
echo Step 3: Installing Backend Dependencies...
cd /d "%PROJECT_ROOT%backend"
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo Step 4: Starting Blockchain Network...
echo Opening Git Bash for network setup...
cd /d "%PROJECT_ROOT%network"
echo In Git Bash, run these commands:
echo   ./deploy-network.sh up -ca
echo   ./scripts/create-channel-v2.sh
echo.
echo Press Enter after you've run those commands in Git Bash...
start "" "C:\Program Files\Git\git-bash.exe" --cd="%PROJECT_ROOT%network."
pause

echo.
echo Step 5: Killing old backend processes...
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak

echo.
echo Step 6: Starting Backend WITHOUT Mock Mode...
cd /d "%PROJECT_ROOT%backend"
echo Backend will start on port 3000
echo Remove BLOCKCHAIN_MOCK environment variable...

REM Make sure mock mode is OFF
set BLOCKCHAIN_MOCK=
npm run dev

echo.
pause
