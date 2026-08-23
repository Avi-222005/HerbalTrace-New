@echo off
echo ========================================
echo Installing Backend Dependencies
echo ========================================
echo.

cd backend

echo Installing npm packages...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Backend dependencies installed successfully!
    echo ========================================
) else (
    echo.
    echo ERROR: Failed to install dependencies
    echo Please check the error messages above
)

cd ..
pause
