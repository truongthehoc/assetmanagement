@echo off
title Asset Management - Backend Auto Update (D:\Apps\Assetmanagement)
cls

echo ======================================================================
echo    CAP NHAT BACKEND API TU GITHUB (PATH: D:\Apps\Assetmanagement)
echo ======================================================================
echo.

if exist "D:\Apps\Assetmanagement" (
    cd /d "D:\Apps\Assetmanagement"
    git pull origin main
    cd /d "D:\Apps\Assetmanagement\backend"
) else (
    cd /d "%~dp0"
    git pull origin main
    cd /d "%~dp0backend"
)

echo.
echo  [2/3] CAI DAT DEPENDENCIES BACKEND...
call npm install --production=false

echo.
echo  [3/3] RESTART DICH VU BACKEND TREN PM2 (PORT 3001)...
call pm2 reload asset-backend || call pm2 start src/server.js --name "asset-backend" --env PORT=3001

echo.
echo ======================================================================
echo  CAP NHAT BACKEND THANH CONG!
echo  - API Health Check: http://10.30.11.152:3001/api/health
echo ======================================================================
echo.
pause
