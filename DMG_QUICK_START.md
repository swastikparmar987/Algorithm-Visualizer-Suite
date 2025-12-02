# Quick Start: Building macOS DMG

## One-Command Build

```bash
# Create icon and build DMG in one go
./create_icon.sh && ./build_dmg.sh
```

## What You Get

- **Algorithm-Visualizer-Installer.dmg** - Distributable installer
- Users drag app to Applications folder
- App runs standalone (no Python needed)

## Requirements

```bash
# Install build tools (one-time setup)
pip install pyinstaller
brew install create-dmg
```

## Build Steps

### 1. Create Icon (Optional)

```bash
./create_icon.sh
```

This creates `icon.icns` with a gradient background and chart emoji.

**Or** use your own icon:
- Place a 1024x1024 PNG as `icon.png`
- Run `./create_icon.sh` to convert to .icns

### 2. Build DMG

```bash
./build_dmg.sh
```

This will:
1. Bundle the app with PyInstaller (~2-3 minutes)
2. Create DMG installer (~30 seconds)
3. Output: `Algorithm-Visualizer-Installer.dmg`

## Distribute

Share the DMG file! Users:
1. Download and open DMG
2. Drag app to Applications
3. Launch from Applications

## File Sizes

- App Bundle: ~150-200 MB
- DMG: ~100-150 MB

## Troubleshooting

**Build fails?**
```bash
# Clean and retry
rm -rf build dist *.dmg
./build_dmg.sh
```

**Missing dependencies?**
```bash
pip install -r requirements.txt
pip install pyinstaller
brew install create-dmg
```

**Icon not showing?**
- Make sure `icon.icns` exists
- Run `./create_icon.sh` first

## Advanced

See `DMG_BUILD_GUIDE.md` for:
- Custom icons
- Code signing
- Notarization
- Manual build steps

---

**Ready to build?** Run: `./create_icon.sh && ./build_dmg.sh`
