@echo off
title AetherOS 1.0 LTS — Windows Double-Click Installer (No Pendrive)
color 0B

:: ============================================================================
:: AetherOS 1.0 LTS — Windows Double-Click Auto-UAC Launcher
:: Just double-click this .bat file on Windows 10/11!
:: Automatically requests Administrator (UAC) permission and launches
:: AetherOS-Windows-NoUSB-Installer.ps1 with ExecutionPolicy Bypass.
:: ============================================================================

:: 1. Check for Administrator privileges; if not elevated, trigger Windows UAC prompt
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Requesting Windows Administrator permission ^(UAC^)...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

cls
echo ============================================================================
echo   AetherOS 1.0 LTS — Direct Windows-to-Linux Installer ^(No USB Pendrive^)
echo ============================================================================
echo.

set "SCRIPT_DIR=%~dp0"
set "PS_ENGINE=%SCRIPT_DIR%AetherOS-Windows-NoUSB-Installer.ps1"

if not exist "%PS_ENGINE%" (
    echo [ERROR] Could not find AetherOS-Windows-NoUSB-Installer.ps1 in this folder:
    echo         %SCRIPT_DIR%
    echo.
    echo Please place both files in the same folder and double-click again:
    echo   1. Install-AetherOS-DoubleClick.bat
    echo   2. AetherOS-Windows-NoUSB-Installer.ps1
    echo.
    pause
    exit /b 1
)

echo Choose installation mode:
echo   [1] Dual-Boot Alongside Windows 10/11 ^(Recommended - Keeps Windows safe^)
echo   [2] Full Switch ^(Stage from C:\ without USB, replace Windows on reboot^)
echo.
set /p MODE_CHOICE="Enter 1 or 2 [default 1]: "
if "%MODE_CHOICE%"=="" set "MODE_CHOICE=1"

set "ALLOC_GB=120"
set /p ALLOC_INPUT="Space for AetherOS in GB [default 120]: "
if not "%ALLOC_INPUT%"=="" set "ALLOC_GB=%ALLOC_INPUT%"

set "REPLACE_FLAG="
if "%MODE_CHOICE%"=="2" set "REPLACE_FLAG=-ReplaceWindows"

echo.
echo Launching AetherOS UEFI No-Pendrive Stager ^(Admin Mode^)...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_ENGINE%" -AllocateGB %ALLOC_GB% %REPLACE_FLAG%

echo.
if %errorlevel% equ 0 (
    echo [DONE] AetherOS UEFI boot entry staged cleanly! Restart PC to boot into AetherOS.
) else (
    echo [WARN] Installer exited with code %errorlevel%. Review the message above.
)
pause
