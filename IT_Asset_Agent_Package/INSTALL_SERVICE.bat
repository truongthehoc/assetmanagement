@echo off
title Install IT Asset Agent Windows Service
cls
color 0A
echo ======================================================================
echo   IT ASSET MANAGEMENT - AGENT WINDOWS SERVICE INSTALLER
echo ======================================================================
echo.

:: Check Administrator Privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] CHU Y: Vui long nhap chuot phai vao file nay va chon "Run as Administrator"!
    echo.
    pause
    exit /b
)

set SERVER_URL=http://10.30.11.152:3001
echo Machine IP Server mac dinh: %SERVER_URL%
set /p USER_INPUT="Nhap diachi Server (Nhan Enter de dung mac dinh %SERVER_URL%): "
if not "%USER_INPUT%"=="" set SERVER_URL=%USER_INPUT%

set TASK_NAME=ITAssetManagementAgent
set AGENT_SCRIPT=%~dp0IT_Asset_Agent.ps1

echo.
echo [1/2] Dang dang ky Dich vu Windows Service ngam '%TASK_NAME%'...

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$u='%SERVER_URL%'; if (-not $u.StartsWith('http://') -and -not $u.StartsWith('https://')) { $u = 'http://' + $u }; schtasks /create /tn '%TASK_NAME%' /tr ('powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File \"' + '%AGENT_SCRIPT%' + '\" -ServerUrl \"' + $u + '\" -IntervalMinutes 10') /sc ONSTART /ru 'SYSTEM' /rl HIGHEST /f"

if %errorlevel% equ 0 (
    echo.
    echo [2/2] Gui bao cao telemetry khoi tao ve Server...
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%AGENT_SCRIPT%" -ServerUrl "%SERVER_URL%" -RunOnce
    schtasks /run /tn "%TASK_NAME%" >nul 2>&1
    echo.
    echo ======================================================================
    echo  [THANH CONG] Da cai dat Agent thanh cong tren may tram!
    echo  Agent se tu dong chay ngam 24/7 va quet thong so moi 10 phut.
    echo ======================================================================
) else (
    color 0C
    echo.
    echo [THAT BAI] Khong the dang ky dich vu. Vui long kiem tra quyen Administrator.
)

echo.
pause
