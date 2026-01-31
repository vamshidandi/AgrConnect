@echo off
echo ========================================
echo    Starting Agri-AI in Production Mode
echo ========================================

REM Set environment variable
set ENVIRONMENT=production

echo.
echo [1/4] Starting Backend Server...
cd /d "%~dp0\Backend"
start "Agri-AI Backend" cmd /k "start_production.bat"

echo.
echo [2/4] Waiting for backend to start...
timeout /t 10 /nobreak > nul

echo.
echo [3/4] Starting Frontend Server...
cd /d "%~dp0\Frontend"
start "Agri-AI Frontend" cmd /k "start_production.bat"

echo.
echo [4/4] Production servers are starting...
echo.
echo Backend will be available at: http://localhost:8000
echo Frontend will be available at: http://localhost:5173
echo.
echo Press any key to open the application in your browser...
pause > nul

REM Open the application in default browser
start http://localhost:5173

echo.
echo Production mode started successfully!
echo Close this window to stop monitoring.
pause