#!/bin/bash

# Motion Studio Universal Installer for Adobe Premiere Pro & After Effects
echo "🚀 Building Motion Studio extension for Premiere Pro..."
npm run build:uxp

echo "📦 Installing extension into Adobe directory..."

# macOS paths
CEP_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions/com.motionstudio.premiere"
UXP_DIR="$HOME/Library/Application Support/Adobe/UXP/Plugins/com.motionstudio.premiere"

# Create directories
mkdir -p "$CEP_DIR"
mkdir -p "$UXP_DIR"

# Copy dist files
cp -R dist/* "$CEP_DIR/"
cp -R dist/* "$UXP_DIR/"

# Enable PlayerDebugMode on Mac so Premiere Pro loads developer extensions
echo "⚙️ Enabling Developer / Debug mode for Adobe extensions..."
defaults write com.adobe.CSXS.9 PlayerDebugMode 1 2>/dev/null || true
defaults write com.adobe.CSXS.10 PlayerDebugMode 1 2>/dev/null || true
defaults write com.adobe.CSXS.11 PlayerDebugMode 1 2>/dev/null || true
defaults write com.adobe.CSXS.12 PlayerDebugMode 1 2>/dev/null || true
defaults write com.adobe.CSXS.13 PlayerDebugMode 1 2>/dev/null || true
defaults write com.adobe.CSXS.14 PlayerDebugMode 1 2>/dev/null || true
defaults write com.adobe.CSXS.15 PlayerDebugMode 1 2>/dev/null || true

echo ""
echo "✅ Motion Studio is successfully installed for Adobe Premiere Pro & After Effects!"
echo ""
echo "👉 To use it:"
echo "1. Open Adobe Premiere Pro."
echo "2. Go to the top menu: Window > Extensions > Motion Studio Graph Editor"
echo "3. The panel will open right inside your Premiere Pro workspace!"
