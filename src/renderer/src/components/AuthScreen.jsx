import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import Logo from './common/Logo';

const AuthScreen = ({ onLoginSuccess, onRequireOtp }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                const result = await window.api.authLogin({ email, password });
                if (result.success) {
                    if (result.requiresOTP) {
                        onRequireOtp(email);
                    } else {
                        onLoginSuccess(result.userId, result.name, result.progressData);
                    }
                } else {
                    setError(result.error || 'Login failed.');
                }
            } else {
                const result = await window.api.authSignup({ email, password, name });
                if (result.success) {
                    onRequireOtp(email);
                } else {
                    setError(result.error || 'Signup failed.');
                }
            }
        } catch (err) {
            setError('System error connecting to Auth servers.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 min-h-screen bg-bg-main text-text-main flex items-center justify-center overflow-hidden z-50">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-blue/20 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-30" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md p-8 bg-bg-elevated/40 backdrop-blur-2xl border border-border-glass rounded-3xl shadow-2xl"
            >
                <div className="flex justify-center mb-8">
                    <Logo className="size-24" />
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent-blue bg-clip-text text-transparent">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-text-muted text-sm mt-2">
                        {isLogin ? 'Enter your credentials to access your algorithms.' : 'Join the visualizer suite and track your progress.'}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-6 flex items-center gap-3 text-sm"
                        >
                            <AlertCircle size={16} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence>
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                className="space-y-1 overflow-hidden"
                            >
                                <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">Agent Name</label>
                                <div className="relative">
                                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-black/40 border border-border-glass rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="Cipher"
                                        required={!isLogin}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">Email Data-Link</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-border-glass rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                                placeholder="developer@node.js"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">Secure Passkey</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-border-glass rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full relative overflow-hidden group bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary py-3 rounded-xl transition-all mt-4 flex items-center justify-center gap-2"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        {isLoading ? (
                            <span className="animate-pulse">Authenticating...</span>
                        ) : (
                            <>
                                <span className="font-semibold tracking-wide">{isLogin ? 'INITIALIZE SESSION' : 'REGISTER PROFILE'}</span>
                                {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-text-muted hover:text-white text-sm transition-colors flex items-center justify-center gap-2 w-full"
                    >
                        {isLogin ? "Don't have a profile yet? Register" : "Already registered? Initialize"}
                        <ArrowRight size={14} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthScreen;
