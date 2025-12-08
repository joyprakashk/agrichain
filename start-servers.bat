@echo off
echo Starting AgriChain servers...

echo.
echo Starting Backend Server...
start "Backend" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo.
echo Starting Frontend Server...
start "Frontend" cmd /k "cd agrichain-ui && npm run dev"

echo.
echo ✅ Both servers starting...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
pause