@echo off
REM AI Learning Companion - Standalone CMD Launcher
REM Double-click this to open the app in a new CMD window!

REM Get the directory where this .bat file is located
cd /d "%~dp0"

REM Open a NEW CMD window with custom settings
start "Aria" cmd /k "color 02 && mode con: cols=80 lines=30 && echo Starting AI Learning Companion... && timeout /t 1 /nobreak >nul && node app.js"
