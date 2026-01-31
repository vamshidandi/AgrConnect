@echo off
echo Starting Agri-AI Backend in Production Mode...
cd /d "%~dp0"

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install production requirements
echo Installing production dependencies...
pip install -r requirements_production.txt

REM Start the server in production mode
echo Starting FastAPI server in production mode...
uvicorn main_auth:app --host 0.0.0.0 --port 8000 --workers 4 --access-log

pause