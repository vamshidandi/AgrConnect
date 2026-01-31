@echo off
echo ========================================
echo    Agri-AI Backend Setup & Launch
echo ========================================

echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Initializing database...
python -c "from main import init_database; init_database(); print('Database initialized successfully')"

echo.
echo Starting FastAPI server...
echo Backend will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.

uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause