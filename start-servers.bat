@echo off
echo Starting BIZNest Backend and Frontend...
echo.

start "BIZNest Backend" cmd /k "cd /d "%~dp0backend" && node server.js"
start "BIZNest Frontend" cmd /k "cd /d "%~dp0frontend" && node node_modules/vite/bin/vite.js"

echo.
echo Backend running on: http://localhost:5000
echo Frontend running on: http://localhost:5173
echo.
echo Press any key to close this window (servers will keep running in separate windows)
pause
