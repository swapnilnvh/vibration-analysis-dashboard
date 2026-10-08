Write-Host "Starting NVH Vibration Analysis Backend (FastAPI) on http://localhost:8000 ..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
