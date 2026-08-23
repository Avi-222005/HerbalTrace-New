@echo off
echo ========================================
echo HerbalTrace - Complete Docker Cleanup
echo ========================================
echo.

echo [Step 1] Stopping all running containers...
FOR /f "tokens=*" %%i IN ('docker ps -q') DO docker stop %%i
echo.

echo [Step 2] Removing all containers...
FOR /f "tokens=*" %%i IN ('docker ps -aq') DO docker rm %%i
echo.

echo [Step 3] Removing all volumes...
docker volume prune -f
echo.

echo [Step 4] Removing all networks...
docker network prune -f
echo.

echo [Step 5] Removing all images (optional, commented out)
REM docker image prune -a -f
echo.

echo ========================================
echo Docker Cleanup Complete!
echo ========================================
pause
