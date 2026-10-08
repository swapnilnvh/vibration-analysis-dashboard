@echo off
title Push NVH Dashboard to GitHub
color 0B
echo ======================================================================
echo    PUSH NVH VIBRATION DASHBOARD TO GITHUB (FOR RENDER & VERCEL)
echo ======================================================================
echo.
echo Please enter your GitHub repository URL:
echo (e.g., https://github.com/your-username/vibration-analysis-dashboard.git)
echo.
set /p REPO_URL="Repository URL: "

if "%REPO_URL%"=="" (
    echo No URL provided. Aborting.
    pause
    exit /b
)

git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main
echo.
echo Pushing to GitHub...
git push -u origin main

if %errorlevel% == 0 (
    echo.
    echo ======================================================================
    echo    SUCCESS! Code pushed to GitHub.
    echo ======================================================================
    echo.
    echo Next steps:
    echo 1. Render: Go to https://dashboard.render.com -> New -> Web Service
    echo    Connect this repo. Render will auto-detect render.yaml!
    echo 2. Vercel: Go to https://vercel.com/new -> Import this repo
    echo    Set Environment Variable: VITE_API_URL=https://^<your-render-name^>.onrender.com
    echo.
) else (
    echo.
    echo Push failed. Please check your GitHub repository URL and authentication.
)
pause
