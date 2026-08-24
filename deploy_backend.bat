@echo off
title Asset Management - Backend Auto Update (D:\Apps\Assetmanagement)
cls

echo ======================================================================
echo    CAP NHAT BACKEND API TU GITHUB (PATH: D:\Apps\Assetmanagement)
echo ======================================================================
echo.

cd /d "D:\Apps\Assetmanagement"

echo  [1/3] KEO CODE BACKEND MOI NHAT TU GITHUB...
git pull origin main

echo.
echo  [2/3] CAI DAT DEPENDENCIES BACKEND...
call npm install --production=false

echo.
echo  [3/3] RESTART DICH VU BACKEND TREN PM2 (PORT 3001)...
cd /d "D:\Apps\Assetmanagement\backend"
call pm2 reload asset-backend || call pm2 start src/server.js --name "asset-backend" --env PORT=3001

echo.
echo ======================================================================
echo  CAP NHAT BACKEND THANH CONG!
echo  - API Health Check: http://10.30.11.152:3001/api/health
echo ======================================================================
echo.
pause
