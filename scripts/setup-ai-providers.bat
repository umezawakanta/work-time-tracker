@echo off
setlocal EnableDelayedExpansion

echo ========================================
echo AI Provider Setup for Work Time Tracker
echo ========================================
echo.

:: Check if .env file exists
if exist ".env" (
    echo Existing .env file found. Backing up to .env.backup
    copy .env .env.backup >nul
) else (
    echo Creating new .env file...
    type nul > .env
)

echo.
echo Select AI Providers to configure:
echo 1. Gemini only (Recommended for free usage)
echo 2. Claude only
echo 3. OpenAI GPT-4 only
echo 4. Ollama (Local LLM) only
echo 5. All providers
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto :gemini
if "%choice%"=="2" goto :claude
if "%choice%"=="3" goto :openai
if "%choice%"=="4" goto :ollama
if "%choice%"=="5" goto :all
echo Invalid choice. Exiting...
exit /b 1

:gemini
echo.
echo Setting up Gemini API...
echo Please visit: https://makersuite.google.com/app/apikey
echo.
set /p gemini_key="Enter your Gemini API key: "
echo VITE_GEMINI_API_KEY=%gemini_key%>> .env
echo ✓ Gemini API key configured
goto :complete

:claude
echo.
echo Setting up Claude API...
echo Please visit: https://console.anthropic.com/
echo.
set /p claude_key="Enter your Claude API key: "
echo VITE_CLAUDE_API_KEY=%claude_key%>> .env
echo ✓ Claude API key configured
goto :complete

:openai
echo.
echo Setting up OpenAI API...
echo Please visit: https://platform.openai.com/api-keys
echo.
set /p openai_key="Enter your OpenAI API key: "
echo VITE_OPENAI_API_KEY=%openai_key%>> .env
echo ✓ OpenAI API key configured
goto :complete

:ollama
echo.
echo Setting up Ollama (Local LLM)...
echo.
echo Please ensure Ollama is installed and running.
echo Visit: https://ollama.com/download
echo.
echo Default model is llama3.2:3b. To use a different model:
set /p ollama_model="Enter model name (or press Enter for default): "
if not "%ollama_model%"=="" (
    echo VITE_OLLAMA_MODEL=%ollama_model%>> .env
    echo ✓ Ollama model configured: %ollama_model%
) else (
    echo ✓ Using default Ollama model: llama3.2:3b
)
echo.
echo To download the model, run: ollama pull llama3.2:3b
goto :complete

:all
echo.
echo Setting up Gemini API...
echo Please visit: https://makersuite.google.com/app/apikey
echo.
set /p gemini_key="Enter your Gemini API key: "
echo VITE_GEMINI_API_KEY=%gemini_key%>> .env
echo ✓ Gemini API key configured

echo.
echo Setting up Claude API...
echo Please visit: https://console.anthropic.com/
echo.
set /p claude_key="Enter your Claude API key: "
echo VITE_CLAUDE_API_KEY=%claude_key%>> .env
echo ✓ Claude API key configured

echo.
echo Setting up OpenAI API...
echo Please visit: https://platform.openai.com/api-keys
echo.
set /p openai_key="Enter your OpenAI API key: "
echo VITE_OPENAI_API_KEY=%openai_key%>> .env
echo ✓ OpenAI API key configured

echo.
echo Setting up Ollama (Local LLM)...
echo Default model is llama3.2:3b. To use a different model:
set /p ollama_model="Enter model name (or press Enter for default): "
if not "%ollama_model%"=="" (
    echo VITE_OLLAMA_MODEL=%ollama_model%>> .env
    echo ✓ Ollama model configured: %ollama_model%
) else (
    echo ✓ Using default Ollama model: llama3.2:3b
)
goto :complete

:complete
echo.
echo ========================================
echo ✅ AI Provider setup completed!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your development server (npm run dev)
echo 2. Open the Task Management Center
echo 3. Select your preferred AI provider from the dropdown
echo.
echo For more information, see: docs/ai-provider-setup.md
echo.
pause
