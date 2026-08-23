@echo off
echo ========================================
echo HerbalTrace - Launch Complete Setup
echo ========================================
echo.
echo This will open Git Bash and run the complete setup.
echo.
echo The setup will:
echo   1. Clean Docker
echo   2. Install backend dependencies
echo   3. Start blockchain network
echo   4. Create channel
echo   5. Start backend server
echo   6. Create admin user
echo   7. Run health check
echo.
echo Press any key to start...
pause > nul

REM Open Git Bash and run the complete setup script
start "" "C:\Program Files\Git\git-bash.exe" --cd="%~dp0." -c "./complete-setup.sh; exec bash"

echo.
echo Git Bash opened with setup script running.
echo Monitor the Git Bash window for progress.
echo.
pause
