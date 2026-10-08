@echo off
title NVH Vibration Analysis Frontend (React + Vite)
echo Starting React Frontend on http://localhost:5173 ...
set "PATH=C:\Users\Plantad&nvh\AppData\Local\Programs\nodejs;%PATH%"
cd /d "%~dp0frontend"
node "./node_modules/vite/bin/vite.js" --host
pause
