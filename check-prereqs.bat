@echo off
echo ========================================
echo Checking Prerequisites
echo ========================================
echo.

echo [Docker Version]
docker --version
echo.

echo [Docker Status]
docker ps
echo.

echo [Node.js Version]
node --version
echo.

echo [npm Version]
npm --version
echo.

echo [Git Bash Version]
bash --version
echo.

echo ========================================
echo Check Complete
echo ========================================
