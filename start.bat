@echo off
cd /d "%~dp0"

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)

timeout /t 1 /nobreak >nul

start "" http://localhost:8000/
py -m http.server 8000

if errorlevel 1 python -m http.server 8000