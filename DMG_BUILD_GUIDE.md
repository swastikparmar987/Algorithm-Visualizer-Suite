# Building macOS DMG Installer

This guide explains how to create a distributable DMG installer for the Algorithm Visualizer app.

## Prerequisites

1. **macOS** (required for building .app bundles)
2. **Homebrew** (for installing create-dmg)
3. **Python 3.8+** with all dependencies installed

## Quick Build

```bash
# Install build dependencies
pip install pyinstaller
brew install create-dmg

# Build the DMG
./build_dmg.sh
```

That's it! The script will create `Algorithm-Visualizer-Installer.dmg`.

## What the Build Script Does

1. **Installs PyInstaller** (if not already installed)
2. **Installs create-dmg** (if not already installed)
3. **Cleans previous builds**
4. **Bundles the app** with PyInstaller
5. **Creates DMG installer** with drag-to-Applications interface

## Custom Icon (Optional)

To add a custom app icon:

1. Create or download a 1024x1024 PNG icon
2. Convert to .icns format:
   ```bash
   # Create iconset directory
   mkdir icon.iconset
   
   # Generate different sizes (use your icon.png)
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
   
   # Convert to .icns
   iconutil -c icns icon.iconset
   
   # Clean up
   rm -rf icon.iconset
   ```

3. Place `icon.icns` in the project directory
4. Run `./build_dmg.sh` again

## Manual Build Steps

If you prefer to build manually:

### Step 1: Build the App Bundle

```bash
pyinstaller Algorithm_Visualizer.spec --clean --noconfirm
```

This creates `dist/Algorithm Visualizer.app`

### Step 2: Create DMG

```bash
create-dmg \
  --volname "Algorithm Visualizer" \
  --window-pos 200 120 \
  --window-size 800 400 \
  --icon-size 100 \
  --icon "Algorithm Visualizer.app" 200 190 \
  --app-drop-link 600 185 \
  "Algorithm-Visualizer-Installer.dmg" \
  "dist/Algorithm Visualizer.app"
```

## Distributing the DMG

Once built, you can distribute `Algorithm-Visualizer-Installer.dmg`:

1. **Upload to GitHub Releases**
2. **Share via Google Drive / Dropbox**
3. **Host on your website**

Users simply:
1. Download the DMG
2. Open it
3. Drag the app to Applications folder
4. Launch from Applications

## Troubleshooting

### PyInstaller Issues

**Problem**: "Module not found" errors

**Solution**: Add missing modules to `hiddenimports` in `Algorithm_Visualizer.spec`

### DMG Creation Issues

**Problem**: create-dmg not found

**Solution**: 
```bash
brew install create-dmg
```

### App Won't Launch

**Problem**: "App is damaged" or security warning

**Solution**: Users need to:
1. Right-click the app
2. Select "Open"
3. Click "Open" in the dialog

Or disable Gatekeeper temporarily:
```bash
sudo spctl --master-disable
```

### Large DMG Size

**Problem**: DMG is too large (>100MB)

**Solution**: The app bundles Python and all dependencies. This is normal for Python apps. To reduce size:
- Remove unused dependencies from requirements.txt
- Use `--onefile` mode in PyInstaller (slower startup)

## App Bundle Structure

```
Algorithm Visualizer.app/
├── Contents/
│   ├── Info.plist          # App metadata
│   ├── MacOS/
│   │   └── Algorithm Visualizer  # Executable
│   ├── Resources/
│   │   ├── icon.icns       # App icon
│   │   └── ...             # Python files, dependencies
│   └── Frameworks/         # Python runtime
```

## Updating the App

To release a new version:

1. Update version in `Algorithm_Visualizer.spec`:
   ```python
   'CFBundleVersion': '1.1.0',
   'CFBundleShortVersionString': '1.1.0',
   ```

2. Rebuild:
   ```bash
   ./build_dmg.sh
   ```

3. Rename DMG to include version:
   ```bash
   mv Algorithm-Visualizer-Installer.dmg Algorithm-Visualizer-v1.1.0.dmg
   ```

## Code Signing (Optional)

For distribution outside the Mac App Store, you should sign your app:

```bash
# Sign the app
codesign --deep --force --sign "Developer ID Application: Your Name" \
  "dist/Algorithm Visualizer.app"

# Verify signature
codesign --verify --verbose "dist/Algorithm Visualizer.app"

# Notarize with Apple (requires Apple Developer account)
xcrun notarytool submit Algorithm-Visualizer-Installer.dmg \
  --apple-id your@email.com \
  --team-id TEAMID \
  --password app-specific-password
```

## File Sizes

Expected sizes:
- **App Bundle**: ~150-200 MB (includes Python runtime)
- **DMG**: ~100-150 MB (compressed)

## Notes

- The app includes the `.env` file with your API key
- Users will need to configure their own API key after installation
- Consider creating a setup wizard for first launch
- The app is self-contained and doesn't require Python installation

---

**Need Help?** Check the main README.md or open an issue on GitHub.
