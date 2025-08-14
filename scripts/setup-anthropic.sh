#!/bin/bash

# Anthropic API Setup Script
echo "🤖 Anthropic AI Setup Helper"
echo "=============================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    echo ""
    echo "Please enter your Anthropic API key:"
    echo "(Get it from: https://console.anthropic.com/api-keys)"
    read -p "API Key: " api_key
    
    if [ -z "$api_key" ]; then
        echo "❌ API key cannot be empty!"
        exit 1
    fi
    
    echo "ANTHROPIC_API_KEY=$api_key" > .env.local
    echo "✅ .env.local created successfully!"
else
    echo "✅ .env.local already exists"
    
    # Check if API key is configured
    if grep -q "ANTHROPIC_API_KEY=sk-ant" .env.local; then
        echo "✅ API key appears to be configured"
    else
        echo "⚠️  API key might not be configured properly"
        echo "   Please check your .env.local file"
    fi
fi

echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🚀 Starting development servers..."
echo ""
echo "Choose how to run the development server:"
echo "1) With local proxy (recommended for development)"
echo "2) With Vercel CLI (requires vercel CLI installed)"
echo ""
read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        echo ""
        echo "Starting with local proxy server..."
        echo "The app will be available at: http://localhost:3000"
        echo ""
        pnpm dev
        ;;
    2)
        # Check if vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo ""
            echo "⚠️  Vercel CLI not found. Installing..."
            npm i -g vercel
        fi
        
        echo ""
        echo "Starting with Vercel CLI..."
        echo "The app will be available at the URL shown by Vercel"
        echo ""
        pnpm dev:vercel
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac
