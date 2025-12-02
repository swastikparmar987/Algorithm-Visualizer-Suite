#!/bin/bash

# AI Visualizer Setup Script
# This script helps you set up the AI-powered algorithm visualizer

echo "🎯 AI-Powered Algorithm Visualizer Setup"
echo "=========================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: You need to add your Gemini API key to the .env file"
    echo ""
    echo "Steps to get your API key:"
    echo "1. Go to https://makersuite.google.com/app/apikey"
    echo "2. Click 'Create API Key'"
    echo "3. Copy your API key"
    echo "4. Edit .env file and replace 'your_api_key_here' with your actual key"
    echo ""
    read -p "Press Enter when you've added your API key to .env..."
else
    echo "✅ .env file already exists"
fi

echo ""

# Test AI service
echo "🧪 Testing AI service..."
python3 -c "from ai_service import get_ai_service; service = get_ai_service(); print('✅ AI service initialized successfully' if service.enabled else '⚠️  AI service not enabled - check your API key')"

echo ""
echo "=========================================="
echo "🎉 Setup complete!"
echo ""
echo "To run the visualizer:"
echo "  python3 run.py"
echo ""
echo "Or run the main menu directly:"
echo "  python3 main_menu.py"
echo ""
echo "For help, see AI_SETUP_GUIDE.md"
echo "=========================================="
