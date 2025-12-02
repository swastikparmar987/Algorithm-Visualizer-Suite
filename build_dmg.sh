#!/bin/bash

# Build script for creating macOS DMG installer
# This script builds the app bundle and creates a DMG installer

set -e  # Exit on error

echo "🚀 Building Algorithm Visualizer for macOS..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PyInstaller is installed
if ! command -v pyinstaller &> /dev/null; then
    echo -e "${RED}❌ PyInstaller not found${NC}"
    echo "Installing PyInstaller..."
    pip install pyinstaller
fi

# Check if create-dmg is installed
if ! command -v create-dmg &> /dev/null; then
    echo -e "${BLUE}📦 Installing create-dmg...${NC}"
    brew install create-dmg || {
        echo -e "${RED}❌ Failed to install create-dmg${NC}"
        echo "Please install Homebrew first: https://brew.sh"
        exit 1
    }
fi

# Clean previous builds
echo -e "${BLUE}🧹 Cleaning previous builds...${NC}"
rm -rf build dist *.dmg

# Build the app with PyInstaller
echo -e "${BLUE}🔨 Building app bundle with PyInstaller...${NC}"
pyinstaller Algorithm_Visualizer.spec --clean --noconfirm

# Check if build was successful
if [ ! -d "dist/Algorithm Visualizer.app" ]; then
    echo -e "${RED}❌ Build failed - app bundle not created${NC}"
    exit 1
fi

echo -e "${GREEN}✅ App bundle created successfully${NC}"

# Create DMG
echo -e "${BLUE}📀 Creating DMG installer...${NC}"

DMG_NAME="Algorithm-Visualizer-Installer"
APP_NAME="Algorithm Visualizer"

# Create DMG with create-dmg
create-dmg \
  --volname "${APP_NAME}" \
  --volicon "icon.icns" \
  --window-pos 200 120 \
  --window-size 800 400 \
  --icon-size 100 \
  --icon "${APP_NAME}.app" 200 190 \
  --hide-extension "${APP_NAME}.app" \
  --app-drop-link 600 185 \
  --no-internet-enable \
  "${DMG_NAME}.dmg" \
  "dist/${APP_NAME}.app"

if [ -f "${DMG_NAME}.dmg" ]; then
    echo ""
    echo -e "${GREEN}✅ DMG created successfully!${NC}"
    echo ""
    echo -e "${GREEN}📦 Installer: ${DMG_NAME}.dmg${NC}"
    echo -e "${BLUE}📏 Size: $(du -h "${DMG_NAME}.dmg" | cut -f1)${NC}"
    echo ""
    echo "🎉 Build complete! You can now distribute ${DMG_NAME}.dmg"
else
    echo -e "${RED}❌ DMG creation failed${NC}"
    exit 1
fi
