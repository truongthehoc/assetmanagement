@echo off
title Install IT Asset Agent Startup Task
cls
echo ======================================================================
echo   INSTALLING IT ASSET AGENT AS AUTOMATIC WINDOWS STARTUP TASK
echo ======================================================================
echo.

:: Check for Administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Please right-click this file and select "Run as Administrator"!
    echo.
    pause
    exit /b
)

set TASK_NAME=ITAssetManagementAgent
set AGENT_SCRIPT=%~dp0IT_Asset_Agent.ps1
set SERVER_URL=http://localhost:5000

echo Registering Scheduled Task '%TASK_NAME%'...

schtasks /create /tn "%TASK_NAME%" /tr "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File \"%AGENT_SCRIPT%\" -ServerUrl \"%SERVER_URL%\" -IntervalMinutes 10" /sc ONSTART /ru "SYSTEM" /rl HIGHEST /f

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Agent Task successfully registered!
    echo The Agent will now run automatically on Windows startup every 10 minutes.
    echo.
    echo Triggering initial scan task now...
    schtasks /run /tn "%TASK_NAME%"
) else (
    echo.
    echo [FAILED] Could not register task. Check Administrator rights.
)

echo.
pause
