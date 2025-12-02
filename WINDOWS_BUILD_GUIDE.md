# Windows .exe Build Guide

This guide explains how to create a Windows executable (.exe) file for the Algorithm Visualizer application.

## 🎯 Quick Start (On Windows)

If you have access to a Windows machine:

1. **Copy the project** to your Windows machine
2. **Double-click** `build_windows.bat`
3. **Wait** for the build to complete
4. **Find your .exe** in the `dist` folder

That's it! The executable will be at `dist\AlgorithmVisualizer.exe`

---

## 📋 Prerequisites

### On Windows Machine

- **Python 3.8+** installed ([Download here](https://www.python.org/downloads/))
- **pip** (comes with Python)
- **Internet connection** (for downloading dependencies)

### On macOS (Cross-compilation - Advanced)

> ⚠️ **Warning**: Cross-compiling from macOS to Windows is complex and may not work reliably. Using a Windows machine is strongly recommended.

---

## 🔨 Build Methods

### Method 1: Using Windows Machine (Recommended)

This is the **easiest and most reliable** method.

#### Step-by-Step:

1. **Transfer files** to Windows machine:
   - Copy the entire project folder to a Windows computer
   - Or use cloud storage (Google Drive, Dropbox, etc.)
   - Or use a USB drive

2. **Open Command Prompt**:
   - Press `Win + R`
   - Type `cmd` and press Enter
   - Navigate to project folder: `cd path\to\visalizer`

3. **Run the build script**:
   ```batch
   build_windows.bat
   ```

4. **Wait for completion**:
   - The script will install dependencies
   - Build the executable
   - Show success message

5. **Get your .exe**:
   - Located at: `dist\AlgorithmVisualizer.exe`
   - Size: ~50-100 MB (includes all dependencies)

#### Manual Build (Alternative):

If you prefer manual control:

```batch
# Install dependencies
pip install -r requirements.txt
pip install pyinstaller

# Build the executable
pyinstaller --clean Algorithm_Visualizer_Windows.spec

# Your .exe will be in dist folder
```

---

### Method 2: Using Windows VM on macOS

If you don't have a Windows machine, you can use a virtual machine:

#### Option A: VirtualBox (Free)

1. **Download VirtualBox**: https://www.virtualbox.org/
2. **Download Windows 10 ISO**: https://www.microsoft.com/software-download/windows10
3. **Create VM** with at least:
   - 4 GB RAM
   - 50 GB storage
   - 2 CPU cores
4. **Install Windows** in the VM
5. **Share folder** with macOS to transfer project
6. **Follow Method 1** inside the VM

#### Option B: Parallels Desktop (Paid, easier)

1. **Buy Parallels**: https://www.parallels.com/
2. **Install Windows** (guided setup)
3. **Share folder** automatically works
4. **Follow Method 1** inside Windows

---

### Method 3: Using Wine on macOS (Not Recommended)

> ⚠️ **Warning**: This method is unreliable and may produce non-functional executables.

```bash
# Install Wine
brew install wine-stable

# Install Python in Wine
# ... (complex setup)

# This often fails or produces broken executables
```

**We do not recommend this method.** Use Method 1 or 2 instead.

---

### Method 4: Cloud Build Services

#### GitHub Actions (Free, Automated)

Create `.github/workflows/build-windows.yml`:

```yaml
name: Build Windows EXE

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: windows-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install pyinstaller
    
    - name: Build executable
      run: |
        pyinstaller --clean Algorithm_Visualizer_Windows.spec
    
    - name: Upload artifact
      uses: actions/upload-artifact@v3
      with:
        name: AlgorithmVisualizer-Windows
        path: dist/AlgorithmVisualizer.exe
```

Then:
1. Push to GitHub
2. Go to Actions tab
3. Download the built .exe

---

## 📦 What Gets Built

The build process creates:

- **Single executable file**: `AlgorithmVisualizer.exe`
- **Size**: ~50-100 MB (includes Python + all libraries)
- **No installation needed**: Just double-click to run
- **Portable**: Can be copied to any Windows machine
- **No Python required**: Runs on machines without Python installed

### Included in the .exe:

- Python interpreter
- CustomTkinter library
- Pillow (image processing)
- All visualizer modules
- Documentation files
- Icon

---

## 🧪 Testing Your .exe

After building:

1. **Test on build machine**:
   ```batch
   cd dist
   AlgorithmVisualizer.exe
   ```

2. **Test on clean Windows machine**:
   - Copy .exe to a computer without Python
   - Double-click to run
   - Test all visualizers

3. **Check for errors**:
   - If it crashes, run from Command Prompt to see errors:
     ```batch
     AlgorithmVisualizer.exe
     ```

---

## 🐛 Troubleshooting

### Build Fails: "Python not found"

**Solution**: Install Python from https://www.python.org/
- ✅ Check "Add Python to PATH" during installation

### Build Fails: "Module not found"

**Solution**: Install missing dependencies:
```batch
pip install -r requirements.txt
pip install pyinstaller
```

### .exe is too large (>200 MB)

**Solution**: This is normal. The .exe includes:
- Python interpreter (~30 MB)
- Libraries (~20-50 MB)
- Your code

To reduce size, use the `--onedir` option instead (creates a folder).

### .exe doesn't run: "Missing DLL"

**Solution**: Rebuild with:
```batch
pyinstaller --clean --onefile Algorithm_Visualizer_Windows.spec
```

### .exe runs but crashes immediately

**Solution**: 
1. Run from Command Prompt to see error messages
2. Check if all data files are included in the spec file
3. Ensure icon.png exists

### Antivirus blocks the .exe

**Solution**: This is common with PyInstaller executables:
- Add exception in antivirus
- Or sign the executable (requires code signing certificate)

### .exe works on build machine but not others

**Solution**: 
- Ensure you're building on the same Windows version as target
- Include Visual C++ redistributables
- Use `--onedir` mode for better compatibility

---

## 🎨 Customizing the Build

### Change Icon

1. Replace `icon.png` with your own image
2. Or use `.ico` format and update the spec file:
   ```python
   icon='myicon.ico'
   ```

### Change Executable Name

Edit `Algorithm_Visualizer_Windows.spec`:
```python
name='MyCustomName',  # Change this line
```

### Add More Files

Edit `Algorithm_Visualizer_Windows.spec`:
```python
datas=[
    ('utils.py', '.'),
    ('my_new_file.py', '.'),  # Add this
    # ...
],
```

### Create Folder Instead of Single File

Change in spec file:
```python
exe = EXE(
    pyz,
    a.scripts,
    # Remove these lines:
    # a.binaries,
    # a.zipfiles,
    # a.datas,
    # []
    exclude_binaries=True,  # Add this
    # ...
)

# Add this at the end:
coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    name='AlgorithmVisualizer'
)
```

---

## 📊 Build Size Comparison

| Build Type | Size | Startup Speed | Portability |
|------------|------|---------------|-------------|
| Single .exe | ~80 MB | Medium | ⭐⭐⭐⭐⭐ |
| Folder (--onedir) | ~120 MB | Fast | ⭐⭐⭐ |
| Python script | ~1 MB | Slow | ⭐ (needs Python) |

---

## 🚀 Distribution

Once you have your .exe:

### Option 1: Direct Distribution
- Upload to Google Drive / Dropbox
- Share download link
- Users just download and run

### Option 2: Create Installer
Use Inno Setup (free):
1. Download: https://jrsoftware.org/isinfo.php
2. Create installer script
3. Build installer.exe
4. More professional, but more complex

### Option 3: Microsoft Store
- Requires developer account ($19)
- More visibility
- Automatic updates

---

## 💡 Tips

- **Build on oldest Windows version** you want to support (e.g., Windows 10)
- **Test on multiple machines** before distributing
- **Include README** with your .exe
- **Version your builds**: `AlgorithmVisualizer_v1.0.exe`
- **Keep source code** - you'll need it for updates

---

## 📝 Summary

**Best approach for most users:**

1. ✅ Use a Windows machine (or VM)
2. ✅ Run `build_windows.bat`
3. ✅ Get your .exe from `dist` folder
4. ✅ Test and distribute

**Estimated time:** 10-15 minutes (first time)

---

## 🆘 Still Having Issues?

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| No Windows machine | Use VirtualBox (free) or GitHub Actions |
| Build takes forever | Normal for first build (5-10 min) |
| .exe won't run | Run from cmd.exe to see errors |
| Antivirus blocks it | Add exception or sign the executable |

---

## 📚 Additional Resources

- [PyInstaller Documentation](https://pyinstaller.org/)
- [CustomTkinter Packaging Guide](https://github.com/TomSchimansky/CustomTkinter/wiki/Packaging)
- [Windows Code Signing](https://docs.microsoft.com/en-us/windows/win32/seccrypto/cryptography-tools)

---

**Need help?** Check the error messages carefully - they usually tell you exactly what's wrong!
