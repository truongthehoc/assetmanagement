@echo off
title Asset Management - Full Server Update Script (10.30.11.152)
cls

echo ======================================================================
echo    CAP NHAT TOAN BO DU AN TU GITHUB (SERVER 10.30.11.152)
echo    Backend Path : D:\Apps\Assetmanagement
echo    Frontend Path: D:\Webs\Assetmanagement
echo ======================================================================
echo.

if exist "D:\Apps\Assetmanagement" (
    echo  [1/4] CAP NHAT BACKEND CODE TAI D:\Apps\Assetmanagement...
    cd /d "D:\Apps\Assetmanagement"
    git pull origin main
    cd /d "D:\Apps\Assetmanagement\backend"
    call npm install --production=false
    call pm2 reload asset-backend || call pm2 start src/server.js --name "asset-backend" --env PORT=3001
) else (
    echo  [1/4] Dang dung thu muc hien tai lam Backend...
    git pull origin main
    cd /d "%~dp0backend"
    call npm install --production=false
    call pm2 reload asset-backend || call pm2 start src/server.js --name "asset-backend" --env PORT=3001
)

echo.
if exist "D:\Webs\Assetmanagement" (
    echo  [2/4] CAP NHAT FRONTEND CODE TAI D:\Webs\Assetmanagement...
    cd /d "D:\Webs\Assetmanagement"
    git pull origin main
    cd /d "D:\Webs\Assetmanagement\frontend"
    call npm install
    call npm run build
) else (
    echo  [2/4] Build Frontend tai thu muc hien tai...
    cd /d "%~dp0frontend"
    call npm install
    call npm run build
)

echo.
echo  [3/4] DAM BAO DICH VU IIS DANG CHAY & LAM MOI CACHE...
call net start w3svc >nul 2>&1
call iisreset /start >nul 2>&1
if exist "%windir%\system32\inetsrv\appcmd.exe" (
    call "%windir%\system32\inetsrv\appcmd.exe" recycle apppool >nul 2>&1
)

echo.
echo ======================================================================
echo  CAP NHAT DU AN THANH CONG!
echo  - IIS Website UI : http://10.30.11.152
echo  - PM2 Backend API: http://10.30.11.152:3001/api/health
echo ======================================================================
echo.
pause
