@echo off
title AgriChain - Production Startup
color 0A

echo.
echo ========================================
echo    AGRICHAIN - BLOCKCHAIN TRACEABILITY
echo ========================================
echo.
echo Starting production servers...
echo.

echo [1/2] Starting Backend Server (Port 8080)...
start "AgriChain Backend" cmd /k "cd backend && echo Backend Server Starting... && node server.js"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo [2/2] Starting Frontend Server (Port 5173)...
start "AgriChain Frontend" cmd /k "cd agrichain-ui && echo Frontend Server Starting... && npm run dev"

echo.
echo ========================================
echo    AGRICHAIN SERVERS STARTED
echo ========================================
echo.
echo Backend API: http://localhost:8080
echo Frontend UI: http://localhost:5173
echo.
echo Features Available:
echo - Farmer Registration & Produce Management
echo - Consumer Authentication & Marketplace  
echo - Blockchain QR Code Generation
echo - Produce Traceability & Verification
echo.
echo Ready for production use!
echo.
pause