@echo off
title IT Asset Management Agent Collector
cls
echo ======================================================================
echo   IT ASSET MANAGEMENT - AGENT LAUNCHER FOR WINDOWS WORKSTATIONS
echo ======================================================================
echo.

:: Set your Server URL here (replace localhost with your server IP e.g. http://192.168.1.100:5000)
set SERVER_URL=http://localhost:5000

echo Starting Agent scanner process connecting to %SERVER_URL%...
echo Press Ctrl+C to close.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0IT_Asset_Agent.ps1" -ServerUrl "%SERVER_URL%" -IntervalMinutes 10

pause
