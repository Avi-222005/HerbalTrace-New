@echo off
echo ========================================
echo Creating Admin User
echo ========================================
echo.

cd backend

echo Running admin creation script...
node create-admin.js

echo.
echo ========================================
echo Admin user created/verified
echo Default credentials:
echo   Username: admin
echo   Password: admin123
echo ========================================

cd ..
pause
