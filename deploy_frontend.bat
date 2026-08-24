@echo off
title Asset Management - Frontend Auto Update (D:\Webs\Assetmanagement)
cls

echo ======================================================================
echo    CAP NHAT FRONTEND WEB TU GITHUB (PATH: D:\Webs\Assetmanagement)
echo ======================================================================
echo.

cd /d "D:\Webs\Assetmanagement"

echo  [1/3] KEO CODE FRONTEND MOI NHAT TU GITHUB...
git pull origin main

echo.
echo  [2/3] CAI DAT DEPENDENCIES & BUILD STATIC ASSETS CHO IIS...
cd /d "D:\Webs\Assetmanagement\frontend"
call npm install
call npm run build

echo.
echo  [3/3] RESTART IIS WEB SERVER CACHE...
call iisreset /noforce >nul 2>&1

echo.
echo ======================================================================
echo  CAP NHAT FRONTEND THANH CONG!
echo  - IIS Website UI: http://10.30.11.152
echo  - IIS Physical Path: D:\Webs\Assetmanagement\frontend\dist
echo ======================================================================
echo.
pause
