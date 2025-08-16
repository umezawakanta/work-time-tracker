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
echo "3. OpenAI GPT-4 only"
echo "4. Ollama (Local LLM) only"
echo "5. All providers"
echo
read -p "Enter your choice (1-5): " choice

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

setup_openai() {
    echo
    echo "Setting up OpenAI API..."
    echo "Please visit: https://platform.openai.com/api-keys"
    echo
    read -p "Enter your OpenAI API key: " openai_key
    echo "VITE_OPENAI_API_KEY=$openai_key" >> .env
    echo "✓ OpenAI API key configured"
}

setup_ollama() {
    echo
    echo "Setting up Ollama (Local LLM)..."
    echo
    echo "Please ensure Ollama is installed and running."
    echo "Visit: https://ollama.com/download"
    echo
    echo "Default model is llama3.2:3b. To use a different model:"
    read -p "Enter model name (or press Enter for default): " ollama_model
    if [ ! -z "$ollama_model" ]; then
        echo "VITE_OLLAMA_MODEL=$ollama_model" >> .env
        echo "✓ Ollama model configured: $ollama_model"
    else
        echo "✓ Using default Ollama model: llama3.2:3b"
    fi
    echo
    echo "To download the model, run: ollama pull llama3.2:3b"
}

case $choice in
    1)
        setup_gemini
        ;;
    2)
        setup_claude
        ;;
    3)
        setup_openai
        ;;
    4)
        setup_ollama
        ;;
    5)
        setup_gemini
        setup_claude
        setup_openai
        setup_ollama
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
