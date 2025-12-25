@echo off
echo ========================================
echo  AgriChain Admin Dashboard
echo  Starting Development Server...
echo ========================================
echo.

cd /d "%~dp0"

echo Checking if node_modules exists...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting development server...
echo Dashboard will be available at: http://localhost:5174
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
