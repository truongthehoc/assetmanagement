@echo off
title IT Asset Management System - Local Server Launcher (10.30.11.152)
cls

echo ======================================================================
echo          HE THONG QUAN LY TAI SAN IT (IT ASSET MANAGEMENT)
echo          Local Server: 10.30.11.152 | Backend Port: 3001
echo ======================================================================
echo.
echo  [1/3] Dang khoi dong Backend API (Node.js/Express - Port 3001)...
start "IT Asset Backend API (Port 3001)" cmd /k "cd /d "%~dp0backend" && set PORT=3001 && npm run dev"

echo  [2/3] Dang khoi dong Frontend Web (React/Vite - Port 3000)...
start "IT Asset Frontend Web (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo  [3/3] Dang cho 5 giay de cac dich vu khoi tao hoan tat...
timeout /t 5 /nobreak >nul

echo.
echo  [+] Mo giao dien Web: http://10.30.11.152:3000
start http://10.30.11.152:3000

echo.
echo ======================================================================
echo  CAC DICH VU DA DUOC KHOI DONG THANH CONG!
echo  - Backend API : http://10.30.11.152:3001/api/health
echo  - Frontend Web: http://10.30.11.152:3000
echo ======================================================================
echo.

:MENU
echo [Tuy chon:]
echo  1. Chay thu Agent Collector Scan (quet thong tin may tinh)
echo  2. Mo lai trang Web Frontend (http://10.30.11.152:3000)
echo  3. Mo API Health Check (http://10.30.11.152:3001/api/health)
echo  4. Thoat cua so launcher (Cac service backend/frontend van dang chay)
echo.
set /p CHOICE="Nhap lua chon (1-4): "

if "%CHOICE%"=="1" (
    echo.
    echo Chay Agent Scanner...
    start "IT Asset Agent Collector" cmd /k "cd /d "%~dp0IT_Asset_Agent_Package" && run_agent.bat"
    goto MENU
)
if "%CHOICE%"=="2" (
    start http://10.30.11.152:3000
    goto MENU
)
if "%CHOICE%"=="3" (
    start http://10.30.11.152:3001/api/health
    goto MENU
)
if "%CHOICE%"=="4" (
    echo.
    echo Da thoat script launcher. Backend va Frontend van dang chay o cac cua so rieng!
    exit /b
)

echo Lua chon khong hop le, vui long nhap tu 1 den 4.
echo.
goto MENU
