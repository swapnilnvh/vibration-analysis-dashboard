@echo off
title Start NVH Vibration Analysis System
echo Launching FastAPI Backend and React Frontend...
start "NVH Backend (FastAPI)" cmd /c "%~dp0run_backend.bat"
start "NVH Frontend (React + Vite)" cmd /c "%~dp0run_frontend.bat"
echo.
echo ==============================================================
echo  NVH Vibration Analysis Dashboard is launching!
echo  Backend API Docs: http://localhost:8000/docs
echo  Frontend UI:      http://localhost:5173
echo ==============================================================
echo.
timeout /t 5
start http://localhost:5173
