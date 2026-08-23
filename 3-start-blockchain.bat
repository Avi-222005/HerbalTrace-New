@echo off
echo ========================================
echo Starting Blockchain Network
echo ========================================
echo.
echo IMPORTANT: This script will open Git Bash
echo You need to run the following commands in Git Bash:
echo.
echo   cd network
echo   ./deploy-network.sh up -ca
echo   ./scripts/create-channel-v2.sh
echo.
echo Press any key to open Git Bash...
pause

REM Open Git Bash in the network directory
start "" "C:\Program Files\Git\git-bash.exe" --cd="%~dp0network"

echo.
echo Git Bash opened. Please run the commands shown above.
echo After completing, proceed to step 4.
pause
