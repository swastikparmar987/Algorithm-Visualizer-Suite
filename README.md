# 🛡️ Algorithm Visualizer Suite

![ALGO_V1S Logo](docs/assets/logo.png)

A high-fidelity, industry-grade algorithm visualization suite built with **Electron**, **React**, and **Three.js**. Designed for students, developers, and algorithm enthusiasts who demand a premium, interactive learning experience.

---

## 🚀 Experience the Visualizers

### ✨ Core Features
- **Unified Control Sidebar**: Collaspible, sleek controls for every algorithm sector.
- **Cyberpunk Aesthetics**: Deep void themes with neon highlights and glassmorphism.
- **Buttery Smooth Performance**: Forced GPU acceleration and sub-pixel antialiasing for a 60fps experience.
- **Interactive Practice Engine**: LeetCode-style problem interface with a built-in Monaco editor and real-time test runner.
- **AlgoBot Gemini AI**: A context-aware mascot powered by **Gemini 2.5 Flash** to provide strategic hints and explanations.
- **Secure 2FA Gateway**: Mandatory Two-Factor Authentication (OTP via Email) for every sign-in.

---

## 📸 Screenshots

### **Cyber-Industrial Dashboard**
The main gateway to your algorithmic training. Track your XP, Level, and Streak with a real-time gamification engine.
![Dashboard](docs/assets/dashboard.png)

### **Interactive Practice Engine**
Solve complex problems in a professional development environment with integrated test cases.
![Practice Engine](docs/assets/practice.webp)

### **Secure Auth Gateway**
Hardened authentication with OTP-based 2FA for maximum account security.
![Auth Gateway](docs/assets/auth.png)

---

## 🛠️ Technology Stack
- **Frontend**: [React 18](https://reactjs.org/), [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/)
- **Desktop Core**: [Electron](https://www.electronjs.org/), [Vite](https://vitejs.dev/)
- **Visuals**: [Three.js](https://threejs.org/), [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- **Intelligence**: [Google Gemini SDK](https://ai.google.dev/)
- **Backend & Auth**: [MongoDB (Mongoose)](https://mongoosejs.com/), [Nodemailer](https://nodemailer.com/), [BcryptJS](https://www.npmjs.com/package/bcryptjs)
- **DevOps**: [GitHub Actions](https://github.com/features/actions), [Electron Builder](https://www.electron.build/)

---

## 🚢 Installation & Setup

### **Downloads**
Grab the latest stable release for your platform from the [GitHub Releases](https://github.com/swastikparmar987/Algorithm-Visualizer-Suite/releases) page.
- **macOS**: `.dmg` or `.zip` (Universal)
- **Windows**: `.exe` or Portable `.nsis`

### **Local Development**
1. **Clone the repository**:
   ```bash
   git clone https://github.com/swastikparmar987/Algorithm-Visualizer-Suite.git
   cd Algorithm-Visualizer-Suite
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   Create a `.env` file in the root based on `.env.example`:
   ```bash
   MONGODB_URI=your_mongodb_connection_string
   SMTP_USER=your_gmail_address
   SMTP_PASS=your_app_password
   GEMINI_API_KEY=your_google_ai_key
   ```
4. **Run the app**:
   ```bash
   npm run dev
   ```

---

## ⚖️ License
Distributed under the MIT License. See `LICENSE` for more information.

Made with ❤️ by [Antigravity](https://github.com/swastikparmar987)
