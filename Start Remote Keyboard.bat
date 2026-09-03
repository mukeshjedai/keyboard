@echo off
title Remote Keyboard
cd /d "%~dp0"
if exist "Remote Keyboard 60.exe" (
  "Remote Keyboard 60.exe"
  goto :done
)
if exist "Remote Keyboard.exe" (
  "Remote Keyboard.exe"
  goto :done
)
where py >nul 2>nul
if not errorlevel 1 (
  py -3 receiver.py
  goto :done
)
where python >nul 2>nul
if not errorlevel 1 (
  python receiver.py
  goto :done
)
echo.
echo Python 3 is required. Install it from python.org, then run this file again.
pause
:done
