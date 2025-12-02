# 🚀 Push to GitHub - Quick Guide

Your repository is ready! Follow these steps to push to GitHub and trigger the automated Windows build.

## Step 1: Create GitHub Repository

1. **Go to GitHub**: https://github.com/new
2. **Repository name**: `algorithm-visualizer` (or any name you prefer)
3. **Description**: "Interactive visualizer for sorting, searching, graph, tree, and maze algorithms"
4. **Visibility**: Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. **Click**: "Create repository"

## Step 2: Push Your Code

After creating the repository, GitHub will show you commands. Use these:

```bash
cd /Users/swastikparmar/Downloads/visalizer

# Add your GitHub repository as remote (replace YOUR_USERNAME and YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

**Example** (replace with your actual username/repo):
```bash
git remote add origin https://github.com/swastikparmar/algorithm-visualizer.git
git push -u origin main
```

## Step 3: Watch the Build

1. **Go to your GitHub repository**
2. **Click the "Actions" tab** at the top
3. **You'll see**: "Build Windows Executable" workflow running
4. **Wait**: ~5-10 minutes for the build to complete
5. **Green checkmark** = Build successful! ✅

## Step 4: Download Your .exe

Once the build is complete:

1. **Click on the workflow run** (the one that just completed)
2. **Scroll down** to "Artifacts" section
3. **Click**: `AlgorithmVisualizer-Windows-XXXXXX` to download
4. **Unzip** the downloaded file
5. **You'll find**: `AlgorithmVisualizer.exe` inside!

---

## 🎯 Quick Copy-Paste Commands

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub username and repository name:

```bash
# Navigate to project
cd /Users/swastikparmar/Downloads/visalizer

# Add remote (EDIT THIS LINE!)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

---

## 🔄 Future Updates

After the initial push, whenever you make changes:

```bash
# Stage changes
git add .

# Commit changes
git commit -m "Description of your changes"

# Push to GitHub (triggers new build automatically!)
git push
```

Each push will automatically trigger a new Windows build! 🎉

---

## 🐛 Troubleshooting

### "Permission denied (publickey)"

You need to authenticate with GitHub. Options:

**Option 1: Use HTTPS with Personal Access Token**
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Give it `repo` permissions
4. Use token as password when pushing

**Option 2: Set up SSH**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: https://github.com/settings/keys
```

Then use SSH URL instead:
```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
```

### "Repository not found"

- Check the URL is correct
- Make sure you created the repository on GitHub
- Verify you have access to the repository

### Build fails on GitHub Actions

- Check the Actions tab for error messages
- Most common: missing dependencies (already handled in our setup)
- Check the workflow logs for details

---

## ✨ What Happens Next?

1. ✅ Code pushed to GitHub
2. ✅ GitHub Actions automatically starts
3. ✅ Windows environment is set up
4. ✅ Dependencies are installed
5. ✅ PyInstaller builds the .exe
6. ✅ Executable is uploaded as artifact
7. ✅ You download and use it!

**Total time**: ~5-10 minutes per build

---

## 🎁 Bonus: Create Releases

Want to create official releases? After pushing:

```bash
# Tag your version
git tag -a v1.0.0 -m "First release"

# Push the tag
git push origin v1.0.0
```

This will:
- Trigger a build
- Create a GitHub Release
- Attach the .exe to the release
- Make it easy for others to download!

---

## 📝 Summary

1. Create repo on GitHub
2. Run: `git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git`
3. Run: `git push -u origin main`
4. Go to Actions tab and wait
5. Download your .exe from Artifacts!

**That's it!** 🚀

---

Need help? Check the error messages in the Actions tab or the troubleshooting section above.
