@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Anthropic AI Setup Helper
echo ========================================
echo.

REM Check if .env.local exists
if not exist ".env.local" (
    echo Creating .env.local file...
    echo.
    echo Please enter your Anthropic API key:
    echo Get it from: https://console.anthropic.com/api-keys
    set /p api_key="API Key: "
    
    if "!api_key!"=="" (
        echo ERROR: API key cannot be empty!
        pause
        exit /b 1
    )
    
    echo ANTHROPIC_API_KEY=!api_key!> .env.local
    echo .env.local created successfully!
) else (
    echo .env.local already exists
    
    REM Check if API key is configured
    findstr /C:"ANTHROPIC_API_KEY=sk-ant" .env.local >nul
    if !errorlevel! equ 0 (
        echo API key appears to be configured
    ) else (
        echo WARNING: API key might not be configured properly
        echo          Please check your .env.local file
    )
)

echo.
echo Installing dependencies...
call pnpm install

echo.
echo ========================================
echo Choose how to run the development server:
echo 1) With local proxy - recommended for development
echo 2) With Vercel CLI - requires vercel CLI installed
echo ========================================
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo Starting with local proxy server...
    echo The app will be available at: http://localhost:3000
    echo.
    call pnpm dev
) else if "%choice%"=="2" (
    REM Check if vercel CLI is installed
    where vercel >nul 2>nul
    if !errorlevel! neq 0 (
        echo.
        echo Vercel CLI not found. Installing...
        call npm i -g vercel
    )
    
    echo.
    echo Starting with Vercel CLI...
    echo The app will be available at the URL shown by Vercel
    echo.
    call pnpm dev:vercel
) else (
    echo Invalid choice. Please run the script again.
    pause
    exit /b 1
)

endlocal
