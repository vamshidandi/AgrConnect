@echo off
echo Building Agri-AI Frontend for Production...
cd /d "%~dp0"

REM Install dependencies
echo Installing dependencies...
npm install

REM Build for production
echo Building for production...
npm run build

REM Serve the production build
echo Starting production server...
npm run preview -- --host 0.0.0.0 --port 5173

pause