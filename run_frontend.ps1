Write-Host "Starting NVH Vibration Analysis Frontend (React + Vite) on http://localhost:5173 ..." -ForegroundColor Cyan
$env:Path = "C:\Users\Plantad&nvh\AppData\Local\Programs\nodejs;$env:Path"
Set-Location "$PSScriptRoot\frontend"
node "./node_modules/vite/bin/vite.js" --host
