#!/bin/bash

echo "========================================"
echo "AI Provider Setup for Work Time Tracker"
echo "========================================"
echo

# Check if .env file exists
if [ -f ".env" ]; then
    echo "Existing .env file found. Backing up to .env.backup"
    cp .env .env.backup
else
    echo "Creating new .env file..."
    touch .env
fi

echo
echo "Select AI Providers to configure:"
echo "1. Gemini only (Recommended for free usage)"
echo "2. Claude only"
echo "3. Both Gemini and Claude"
echo
read -p "Enter your choice (1-3): " choice

setup_gemini() {
    echo
    echo "Setting up Gemini API..."
    echo "Please visit: https://makersuite.google.com/app/apikey"
    echo
    read -p "Enter your Gemini API key: " gemini_key
    echo "VITE_GEMINI_API_KEY=$gemini_key" >> .env
    echo "✓ Gemini API key configured"
}

setup_claude() {
    echo
    echo "Setting up Claude API..."
    echo "Please visit: https://console.anthropic.com/"
    echo
    read -p "Enter your Claude API key: " claude_key
    echo "VITE_CLAUDE_API_KEY=$claude_key" >> .env
    echo "✓ Claude API key configured"
}

case $choice in
    1)
        setup_gemini
        ;;
    2)
        setup_claude
        ;;
    3)
        setup_gemini
        setup_claude
        ;;
    *)
        echo "Invalid choice. Exiting..."
        exit 1
        ;;
esac

echo
echo "========================================"
echo "✅ AI Provider setup completed!"
echo "========================================"
echo
echo "Next steps:"
echo "1. Restart your development server (npm run dev)"
echo "2. Open the Task Management Center"
echo "3. Select your preferred AI provider from the dropdown"
echo
echo "For more information, see: docs/ai-provider-setup.md"
echo
