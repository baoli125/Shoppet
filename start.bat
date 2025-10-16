@echo off
echo ========================================
echo    Shoppet Docker Startup Script
echo ========================================
echo.
echo Creating necessary directories...
if not exist "data" mkdir data
if not exist "backups" mkdir backups

echo.
echo Building and starting Shoppet with Docker...
echo.

docker-compose down
docker-compose up --build

echo.
echo If successful, open: http://localhost:3000
echo Database file: data/shoppet.db
echo.
echo If you see any errors above, please check:
echo 1. Docker Desktop is running
echo 2. No other service is using port 3000
echo 3. You have internet connection
echo.
pause

