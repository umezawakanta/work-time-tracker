#!/bin/bash

echo "Creating .env file with Gemini API key..."

# Check if .env file already exists
if [ -f .env ]; then
    echo ".env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Create .env file with Gemini API key
cat > .env << EOF
# Gemini API Key
VITE_GEMINI_API_KEY=AIzaSyDSapnVkg5I6U2JDjOme9cG4dkdfrxENh8
EOF

echo ""
echo "✅ .env file created successfully!"
echo ""
echo "Next steps:"
echo "1. Restart your development server (npm run dev)"
echo "2. Check the console for '✅ Gemini API Key: 設定済み'"
echo ""
echo "To get your own API key:"
echo "Visit: https://makersuite.google.com/app/apikey"
echo ""
