@echo off
title NVH Vibration Analysis Dashboard - Cloud Launcher
color 0A
echo ======================================================================
echo    NVH Vibration Data Analysis Dashboard - Cloud Launcher
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking if FastAPI backend is running...
netstat -ano | findstr :8000 | findstr LISTENING >nul
if %errorlevel% == 0 (
    echo       FastAPI backend is already active on http://127.0.0.1:8000.
) else (
    echo       Starting FastAPI production backend server...
    start "FastAPI NVH Backend" /min cmd /c "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"
    timeout /t 3 >nul
)

echo.
echo [2/3] Starting Cloudflare Edge Tunnel...
echo       (Connecting local server to secure public HTTPS URL...)
echo.

if exist tunnel.log del tunnel.log

start "Cloudflare Tunnel" /min cmd /c "cloudflared.exe tunnel --url http://127.0.0.1:8000 2> tunnel.log"

echo [3/3] Waiting for public HTTPS URL...
timeout /t 5 >nul

powershell -Command "$found = $false; for ($i=0; $i -lt 10; $i++) { if (Test-Path tunnel.log) { $m = Select-String -Path tunnel.log -Pattern 'https://[a-zA-Z0-9-]+\.trycloudflare\.com'; if ($m) { Write-Host ''; Write-Host '======================================================================' -ForegroundColor Green; Write-Host '   SUCCESS! YOUR PUBLIC CLOUD DASHBOARD IS LIVE AT:' -ForegroundColor Green; Write-Host ('   ' + $m.Matches[0].Value) -ForegroundColor Yellow; Write-Host '======================================================================' -ForegroundColor Green; Write-Host ''; $found = $true; break } }; Start-Sleep -Seconds 1 }; if (-not $found) { Write-Host 'Please check tunnel.log for your URL.' -ForegroundColor Cyan }"

echo Keep this window or the background tunnel running to keep the link online.
echo Press any key to exit this launcher window (tunnel stays running in background).
pause >nul
