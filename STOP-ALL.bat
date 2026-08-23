@echo off
REM ==========================================
REM STOP ALL SERVICES
REM ==========================================
REM Stops backend, frontend, but keeps network running
REM ==========================================

echo.
echo ========================================
echo STOPPING HERBALTRACE SERVICES
echo ========================================
echo.

REM Kill Node.js processes (backend and frontend)
echo Stopping Backend and Frontend...
taskkill /F /IM node.exe 2>nul
if errorlevel 1 (
    echo No Node.js processes found
) else (
    echo Node.js processes stopped
)

REM Optional: Stop Docker containers (uncomment if you want to stop network too)
REM echo.
REM echo Stopping Hyperledger Fabric network...
REM cd network
REM bash -c "./deploy-network.sh down"
REM cd ..

echo.
echo ========================================
echo ✓ SERVICES STOPPED
echo ========================================
echo.
echo Network containers are still running (use docker ps to verify)
echo To stop the network: cd network ^&^& bash -c "./deploy-network.sh down"
echo.
pause
