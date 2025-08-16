@echo off
echo Creating .env file with Gemini API key...

REM Check if .env file already exists
if exist .env (
    echo .env file already exists. Backing up to .env.backup
    copy .env .env.backup > nul
)

REM Create .env file with Gemini API key
echo # Gemini API Key > .env
echo VITE_GEMINI_API_KEY=AIzaSyDSapnVkg5I6U2JDjOme9cG4dkdfrxENh8 >> .env

echo .
echo ✅ .env file created successfully!
echo.
echo Next steps:
echo 1. Restart your development server (npm run dev)
echo 2. Check the console for "✅ Gemini API Key: 設定済み"
echo.
echo To get your own API key:
echo Visit: https://makersuite.google.com/app/apikey
echo.
pause
