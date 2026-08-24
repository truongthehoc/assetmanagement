@echo off
title Asset Management - Server Auto Update Script
cls

echo ======================================================================
echo    CAP NHAT CODE TU GITHUB VA UPDATE DU AN (SERVER 10.30.11.152)
echo ======================================================================
echo.

echo  [1/4] KEO CODE MOI NHAT TU GITHUB...
git pull origin main

echo.
echo  [2/4] CAP NHAT DEPENDENCIES BACKEND & RESTART PM2...
cd /d "%~dp0backend"
call npm install --production=false
cd /d "%~dp0"
call pm2 reload asset-backend || call pm2 start ecosystem.config.js

echo.
echo  [3/4] BUILD FRONTEND STATIC ASSETS CHO IIS...
cd /d "%~dp0frontend"
call npm install
call npm run build

echo.
echo  [4/4] LAM MOI CACHE IIS WEB SERVER...
call iisreset /noforce >nul 2>&1

echo.
echo ======================================================================
echo  CAP NHAT DU AN THANH CONG!
echo  - Website IIS UI : http://10.30.11.152
echo  - PM2 Backend API: http://10.30.11.152:3001/api/health
echo ======================================================================
echo.
pause
