@echo off
REM Windows Build Script for Algorithm Visualizer
REM Run this script on a Windows machine to create the .exe file

echo ========================================
echo Algorithm Visualizer - Windows Build
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo [1/4] Installing dependencies...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m pip install pyinstaller

echo.
echo [2/4] Cleaning previous builds...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist AlgorithmVisualizer.exe del /q AlgorithmVisualizer.exe

echo.
echo [3/4] Building executable with PyInstaller...
pyinstaller --clean Algorithm_Visualizer_Windows.spec

echo.
echo [4/4] Finalizing...
if exist "dist\AlgorithmVisualizer.exe" (
    echo.
    echo ========================================
    echo BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo Your executable is located at:
    echo dist\AlgorithmVisualizer.exe
    echo.
    echo You can now distribute this .exe file to other Windows users.
    echo No Python installation required to run it!
    echo.
) else (
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo.
)

pause
