# Agri-AI Production Deployment Guide

## Quick Start (Recommended)
1. Double-click `start_production.bat` in the root directory
2. Wait for both servers to start
3. Access the application at http://localhost:5173

## Manual Setup

### Backend Production Setup
1. Navigate to Backend folder
2. Run `start_production.bat` or manually:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements_production.txt
   set ENVIRONMENT=production
   uvicorn main_auth:app --host 0.0.0.0 --port 8000 --workers 4
   ```

### Frontend Production Setup
1. Navigate to Frontend folder
2. Run `start_production.bat` or manually:
   ```bash
   npm install
   npm run build:prod
   npm run serve:prod
   ```

## Production Features
- ✅ Optimized backend with multiple workers
- ✅ Minified and compressed frontend build
- ✅ Production logging configuration
- ✅ Disabled API documentation in production
- ✅ Environment-based configuration
- ✅ CORS configured for production domains

## Configuration
- Backend: Edit `.env.production` in Backend folder
- Frontend: Edit `.env.production` in Frontend folder
- Update CORS origins in main_auth.py for your domain

## Performance Optimizations
- Backend runs with 4 worker processes
- Frontend serves optimized static files
- Reduced logging in production
- Compressed assets and code splitting

## Security Notes
- Change SECRET_KEY in production environment
- Update CORS origins for your domain
- API docs are disabled in production mode
- Use HTTPS in actual production deployment

## Monitoring
- Backend logs are reduced to WARNING level
- Access logs are enabled for monitoring
- Both servers run in separate command windows for easy monitoring

## Stopping the Application
- Close both command windows (Backend and Frontend)
- Or press Ctrl+C in each window