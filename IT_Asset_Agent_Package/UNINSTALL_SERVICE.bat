@echo off
title Uninstall IT Asset Agent Windows Service
cls
color 0C
echo ======================================================================
echo   GO BO DICH VU IT ASSET AGENT KHOI MAY TRAM
echo ======================================================================
echo.

:: Check Administrator Privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Vui long nhap chuot phai vao file nay va chon "Run as Administrator"!
    echo.
    pause
    exit /b
)

set TASK_NAME=ITAssetManagementAgent

echo Dang dung va xoa dich vu '%TASK_NAME%'...
schtasks /end /tn "%TASK_NAME%" >nul 2>&1
schtasks /delete /tn "%TASK_NAME%" /f

if %errorlevel% equ 0 (
    echo.
    echo [THANH CONG] Da go bo dich vu Agent khoi may tram!
) else (
    echo.
    echo [THONG BAO] Dich vu chua duoc cai dat hoac da bi xoa truoc do.
)

echo.
pause
