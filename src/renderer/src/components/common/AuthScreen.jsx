import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Lock, User, Mail, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { playClick, playNavigate } from '../../utils/SoundEngine'
import Logo from './Logo'

function AuthScreen() {
    const { login, soundEnabled } = useAppStore()
    const [isLogin, setIsLogin] = useState(true)
    const [step, setStep] = useState('email') // 'email' or 'otp'
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('') // Kept for UI aesthetic, but unused in OTP flow
    const [username, setUsername] = useState('')
    const [otp, setOtp] = useState('')
    const [serverOtp, setServerOtp] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const handleEmailSubmit = async (e) => {
        e.preventDefault()
        if (soundEnabled) playClick()
        setErrorMsg('')
        setIsLoading(true)

        try {
            // Trigger Electron IPC to send Nodemailer email
            const response = await window.api.sendOtp(email)
            if (response.success) {
                setServerOtp(response.otp)
                setIsLoading(false)
                setStep('otp')
                if (soundEnabled) playNavigate()
            } else {
                throw new Error(response.error)
            }
        } catch (err) {
            setIsLoading(false)
            setErrorMsg(err.message || 'Failed to dispatch communication sequence.')
            console.error(err)
        }
    }

    const handleOtpSubmit = (e) => {
        e.preventDefault()
        if (soundEnabled) playClick()
        setErrorMsg('')

        if (otp === serverOtp) {
            setIsLoading(true)
            setTimeout(() => {
                if (soundEnabled) playNavigate()
                // Generate a mock user profile upon successful OTP validation
                const mockUser = {
                    id: Math.random().toString(36).substr(2, 9),
                    email,
                    username: isLogin ? email.split('@')[0] : username,
                    joinedAt: Date.now()
                }
                login(mockUser)
            }, 800)
        } else {
            setErrorMsg('INVALID CLEARANCE CODE.')
        }
    }

    return (
        <div className="min-h-screen w-full bg-bg-dark flex items-center justify-center p-6 font-display relative overflow-hidden">

            {/* Ambient Background Grid */}
            <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none"></div>

            {/* Glowing Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan/20 blur-[120px] rounded-full pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-primary/10 p-3 rounded-2xl border border-primary/30 shadow-[0_0_30px_var(--primary-glow)] mb-4 overflow-hidden">
                        <Logo className="size-14 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase">ALGO_V1S</h1>
                    <p className="text-primary font-mono text-xs tracking-[0.2em] mt-2 font-bold uppercase">System Authentication</p>
                </div>

                {/* Form Container */}
                <div className="glass-panel p-8 rounded-[2rem] border border-border-glass shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent-cyan to-primary"></div>

                    {errorMsg && (
                        <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-xs font-bold text-center uppercase tracking-widest">
                            {errorMsg}
                        </div>
                    )}

                    {step === 'email' ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-5">
                            <AnimatePresence mode="wait">
                                {!isLogin && (
                                    <motion.div
                                        key="username"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-1"
                                    >
                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Ident</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User size={18} className="text-text-secondary group-focus-within:text-primary transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                required={!isLogin}
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full bg-black/40 border border-border-glass rounded-xl py-3 pl-11 pr-4 text-white placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
                                                placeholder="Choose a username"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Network Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail size={18} className="text-text-secondary group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/40 border border-border-glass rounded-xl py-3 pl-11 pr-4 text-white placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
                                        placeholder="agent@matrix.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-4 mt-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all duration-300
                                ${isLoading
                                        ? 'bg-bg-elevated text-text-muted border border-border-glass cursor-not-allowed'
                                        : 'bg-primary hover:bg-white text-bg-dark border border-transparent shadow-[0_0_20px_var(--primary-glow)] hover:shadow-[0_0_30px_white]'
                                    }`}
                            >
                                {isLoading ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                        <ShieldCheck size={20} />
                                    </motion.div>
                                ) : (
                                    <>
                                        {isLogin ? 'Request Access Link' : 'Initialize Agent'} <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleOtpSubmit} className="space-y-5">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-1"
                            >
                                <p className="text-xs text-text-secondary text-center mb-6">
                                    Transmission sent to <span className="text-primary">{email}</span>. Check terminal for preview trace.
                                </p>
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Security Clearance Code</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <KeyRound size={18} className="text-text-secondary group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="w-full bg-black/40 border border-border-glass rounded-xl py-4 pl-11 pr-4 text-white placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-2xl tracking-[0.5em] text-center"
                                        placeholder="000000"
                                    />
                                </div>
                            </motion.div>

                            <button
                                type="submit"
                                disabled={isLoading || otp.length !== 6}
                                className={`w-full py-4 mt-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all duration-300
                                ${isLoading || otp.length !== 6
                                        ? 'bg-bg-elevated text-text-muted border border-border-glass cursor-not-allowed'
                                        : 'bg-accent-cyan hover:bg-white text-bg-dark border border-transparent shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:shadow-[0_0_30px_white]'
                                    }`}
                            >
                                {isLoading ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                        <ShieldCheck size={20} />
                                    </motion.div>
                                ) : (
                                    <>
                                        Verify Clearance <ShieldCheck size={18} />
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setStep('email'); setOtp(''); }}
                                className="w-full py-2 text-text-muted hover:text-white text-xs font-bold transition-colors mt-2"
                            >
                                Cancel sequence
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin)
                                if (soundEnabled) playClick()
                            }}
                            className="text-text-secondary hover:text-white text-xs font-bold transition-colors"
                        >
                            {isLogin ? "No access clearance? Request agent status." : "Existing agent? Establish link."}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default AuthScreen
