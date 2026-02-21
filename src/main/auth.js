import crypto from 'crypto';

// Bypass esbuild/Vite static analysis so Electron native runtime handles these heavy CJS modules
const _require = eval('require');
const mongoose = _require('mongoose');
const nodemailer = _require('nodemailer');
const bcrypt = _require('bcryptjs');

// User Schema Definition
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, default: 'Dev' },
    passwordHash: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    progressData: { type: Object, default: {} } // Store the user's xp, level, streak, etc.
});

const User = mongoose.model('User', userSchema);

export const setupAuth = (ipcMain) => {
    // 1. Connect to MongoDB
    // Note: In development, using process.env loaded by dotenv in index.js
    const mongoUri = process.env.VITE_MONGO_URI || process.env.MONGO_URI;

    if (mongoUri) {
        mongoose.connect(mongoUri)
            .then(() => console.log('[AUTH] Connected to MongoDB securely.'))
            .catch(err => console.error('[AUTH] MongoDB connection error:', err));
    } else {
        console.warn('[AUTH] Missing VITE_MONGO_URI in .env - Authentication will fail.');
    }

    // 2. Setup NodeMailer Transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Or replace with your SMTP host
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    // Unify SMTP environment check
    const smtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;
    console.log("[AUTH] SMTP Environment Check:", smtpConfigured ? "LOADED" : "MISSING");

    const sendOTP = async (email, otp) => {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { background-color: #0d1117; color: #e6edf3; font-family: sans-serif; margin: 0; padding: 0; }
                    .container { max-width: 500px; margin: 40px auto; background: #161b22; border: 2px solid #a855f7; border-radius: 20px; padding: 40px; text-align: center; box-shadow: 0 0 30px rgba(168, 85, 247, 0.2); }
                    .header { font-size: 24px; font-weight: 800; color: #ffffff; text-transform: uppercase; margin-bottom: 5px; }
                    .subtitle { color: #a855f7; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 30px; }
                    .otp-container { background: #000000; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid rgba(168, 85, 247, 0.3); }
                    .otp-code { font-size: 42px; font-weight: 800; color: #a855f7; letter-spacing: 8px; font-family: monospace; }
                    .footer { font-size: 11px; color: #8b949e; line-height: 1.6; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">Security Clearance</div>
                    <div class="subtitle">ALGO_V1S Network Node</div>
                    <p style="font-size: 14px; color: #8b949e;">Your decryption vector for system access is:</p>
                    <div class="otp-container">
                        <div class="otp-code">${otp}</div>
                    </div>
                    <div class="footer">
                        This code expires in <b>10 minutes</b>.<br>
                        If you did not authorize this, secure your terminal.
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: `"ALGO_V1S Security" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'ALGO_V1S // SECURITY CLEARANCE CODE',
            html: htmlContent
        };
        await transporter.sendMail(mailOptions);
    };

    const getNameFromEmail = (email) => {
        const prefix = email.split('@')[0];
        return prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase();
    };

    // 3. IPC Handlers
    ipcMain.handle('auth:signup', async (event, { email, password, name }) => {
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser.isVerified) {
                return { success: false, error: 'Email already registered.' };
            }

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // Generate 6-digit OTP
            const otp = crypto.randomInt(100000, 999999).toString();
            const otpExpiry = new Date(Date.now() + 10 * 60000); // 10 minutes

            if (existingUser) {
                // User exists but unverified, update their details
                if (name) existingUser.name = name;
                existingUser.passwordHash = passwordHash;
                existingUser.otp = otp;
                existingUser.otpExpiry = otpExpiry;
                await existingUser.save();
            } else {
                // New user
                const newUser = new User({ email, name: name || 'Dev', passwordHash, otp, otpExpiry });
                await newUser.save();
            }

            // Send Email
            if (process.env.SMTP_USER && process.env.SMTP_PASS) {
                await sendOTP(email, otp);
            } else {
                console.warn(`[AUTH] Simulated OTP for ${email}: ${otp} (SMTP credentials missing)`);
            }

            return { success: true, message: 'OTP sent to email.' };
        } catch (error) {
            console.error('[AUTH] Signup Error:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('auth:verify-otp', async (event, { email, otp }) => {
        try {
            const user = await User.findOne({ email });
            if (!user) return { success: false, error: 'User not found.' };

            if (user.otp !== otp || user.otpExpiry < new Date()) {
                return { success: false, error: 'Invalid or expired OTP.' };
            }

            user.isVerified = true;
            user.otp = undefined;
            user.otpExpiry = undefined;

            // If they don't have progress data yet, set defaults
            if (!user.progressData || Object.keys(user.progressData).length === 0) {
                user.progressData = {
                    xp: 0,
                    level: 1,
                    dailyStreak: 0,
                    visitedVisualizers: [],
                    unlockedAchievements: []
                };
            }

            await user.save();

            return {
                success: true,
                userId: user._id.toString(),
                name: user.name || getNameFromEmail(email),
                progressData: user.progressData
            };
        } catch (error) {
            console.error('[AUTH] Verify OTP Error:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('auth:login', async (event, { email, password }) => {
        try {
            const user = await User.findOne({ email });
            if (!user) return { success: false, error: 'Invalid credentials.' };

            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (!isMatch) return { success: false, error: 'Invalid credentials.' };

            // If login is successful, generate a new OTP for 2FA
            const otp = crypto.randomInt(100000, 999999).toString();
            const otpExpiry = new Date(Date.now() + 10 * 60000); // 10 minutes

            user.otp = otp;
            user.otpExpiry = otpExpiry;
            await user.save();

            // Send 2FA Email
            if (smtpConfigured) {
                await sendOTP(email, otp);
            } else {
                console.warn(`[AUTH] 2FA OTP for ${email}: ${otp} (SMTP missing)`);
            }

            // Return success with requiresOTP flag
            return {
                success: true,
                requiresOTP: true,
                message: '2FA verification required.'
            };
        } catch (error) {
            console.error('[AUTH] Login Error:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('auth:sync-progress', async (event, { userId, progressData }) => {
        try {
            await User.findByIdAndUpdate(userId, { progressData });
            return { success: true };
        } catch (error) {
            console.error('[AUTH] Sync Progress Error:', error);
            return { success: false, error: error.message };
        }
    });
};
