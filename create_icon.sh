#!/bin/bash

# Simple icon creator for Algorithm Visualizer
# Creates a basic icon using ImageMagick or Python PIL

echo "🎨 Creating app icon..."

# Check if ImageMagick is available
if command -v convert &> /dev/null; then
    echo "Using ImageMagick to create icon..."
    
    # Create a simple gradient icon with text
    convert -size 1024x1024 \
        gradient:'#667eea'-'#764ba2' \
        -gravity center \
        -pointsize 200 \
        -fill white \
        -annotate +0+0 "📊" \
        icon.png
    
    echo "✅ Created icon.png"
    
    # Convert to .icns
    if [ -f "icon.png" ]; then
        mkdir -p icon.iconset
        sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png
        sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png
        sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png
        sips -z 64 64     icon.png --out icon.iconset/icon_32x32@2x.png
        sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png
        sips -z 256 256   icon.png --out icon.iconset/icon_128x128@2x.png
        sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png
        sips -z 512 512   icon.png --out icon.iconset/icon_256x256@2x.png
        sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png
        sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png
        iconutil -c icns icon.iconset
        rm -rf icon.iconset
        echo "✅ Created icon.icns"
    fi
else
    # Fallback: Create with Python PIL
    echo "ImageMagick not found, using Python PIL..."
    python3 << 'EOF'
from PIL import Image, ImageDraw, ImageFont
import os

# Create a 1024x1024 image with gradient
size = 1024
img = Image.new('RGB', (size, size))
draw = ImageDraw.Draw(img)

# Create gradient background
for y in range(size):
    r = int(102 + (118 - 102) * y / size)
    g = int(126 + (75 - 126) * y / size)
    b = int(234 + (162 - 234) * y / size)
    draw.line([(0, y), (size, y)], fill=(r, g, b))

# Add emoji/symbol
try:
    font = ImageFont.truetype("/System/Library/Fonts/Apple Color Emoji.ttc", 400)
    draw.text((size//2, size//2), "📊", font=font, anchor="mm", fill='white')
except:
    # Fallback to simple text
    draw.text((size//2, size//2), "AV", font=None, anchor="mm", fill='white')

img.save('icon.png')
print("✅ Created icon.png")
EOF

    # Convert to .icns using sips
    if [ -f "icon.png" ]; then
        mkdir -p icon.iconset
        sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png 2>/dev/null
        sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png 2>/dev/null
        sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png 2>/dev/null
        sips -z 64 64     icon.png --out icon.iconset/icon_32x32@2x.png 2>/dev/null
        sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png 2>/dev/null
        sips -z 256 256   icon.png --out icon.iconset/icon_128x128@2x.png 2>/dev/null
        sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png 2>/dev/null
        sips -z 512 512   icon.png --out icon.iconset/icon_256x256@2x.png 2>/dev/null
        sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png 2>/dev/null
        sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png 2>/dev/null
        iconutil -c icns icon.iconset 2>/dev/null
        rm -rf icon.iconset
        echo "✅ Created icon.icns"
    fi
fi

echo "🎉 Icon creation complete!"
