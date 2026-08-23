@echo off
echo ========================================
echo Starting Backend API Server
echo ========================================
echo.

cd backend

echo Starting server with npm run dev...
echo Server will run on http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
