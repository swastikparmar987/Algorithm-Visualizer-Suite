# Quick Start: Building Windows .exe

## 🎯 I'm on Windows

1. **Double-click** `build_windows.bat`
2. **Wait** for build to complete
3. **Find your .exe** at `dist\AlgorithmVisualizer.exe`

Done! 🎉

---

## 🍎 I'm on macOS/Linux

You have 3 options:

### Option 1: Use GitHub Actions (Easiest)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Go to GitHub** → Your repo → **Actions** tab

3. **Download** the built .exe from artifacts

### Option 2: Use a Windows VM

1. **Install VirtualBox** (free): https://www.virtualbox.org/
2. **Download Windows 10**: https://www.microsoft.com/software-download/windows10
3. **Create VM** and install Windows
4. **Transfer project** to VM
5. **Run** `build_windows.bat` inside VM

### Option 3: Ask a Friend with Windows

1. **Send them** this project folder
2. **They run** `build_windows.bat`
3. **They send back** the .exe from `dist` folder

---

## 📖 Need More Details?

See **[WINDOWS_BUILD_GUIDE.md](WINDOWS_BUILD_GUIDE.md)** for:
- Detailed instructions
- Troubleshooting
- Customization options
- Distribution tips

---

## ⚡ Super Quick Reference

| What | Command |
|------|---------|
| Build on Windows | `build_windows.bat` |
| Build manually | `pyinstaller Algorithm_Visualizer_Windows.spec` |
| Output location | `dist\AlgorithmVisualizer.exe` |
| File size | ~50-100 MB |

---

## 🐛 Something Wrong?

1. **Check** you have Python installed
2. **Run** from Command Prompt to see errors
3. **Read** [WINDOWS_BUILD_GUIDE.md](WINDOWS_BUILD_GUIDE.md) troubleshooting section

---

**That's it!** Building a Windows .exe is now as simple as running one command. 🚀
