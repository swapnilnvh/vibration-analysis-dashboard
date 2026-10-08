@echo off
title NVH Vibration Analysis Backend (FastAPI)
echo Starting FastAPI Backend on http://localhost:8000 ...
cd /d "%~dp0backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
