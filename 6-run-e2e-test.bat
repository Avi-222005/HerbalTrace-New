@echo off
echo ========================================
echo Running End-to-End Validation Test
echo ========================================
echo.

cd backend

echo Running complete workflow test...
node tmp-full-registration-to-consumer-test.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo E2E Test Completed Successfully!
    echo ========================================
) else (
    echo.
    echo ERROR: Test failed. Check output above.
)

cd ..
pause
