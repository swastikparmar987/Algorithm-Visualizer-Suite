import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, MailWarning, Loader2 } from 'lucide-react';

const OTPVerification = ({ email, onVerifySuccess, onCancel }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = useRef([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.value !== '' && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fullOtp = otp.join('');
        if (fullOtp.length !== 6) {
            setError('Please enter the full 6-digit code.');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const result = await window.api.authVerifyOtp({ email, otp: fullOtp });
            if (result.success) {
                onVerifySuccess(result.userId, result.name, result.progressData);
            } else {
                setError(result.error || 'Verification failed.');
            }
        } catch (err) {
            setError('System error connecting to Auth servers.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 min-h-screen bg-bg-main/80 backdrop-blur-md text-text-main flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-md p-8 bg-bg-elevated border border-border-glass rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.1)]"
            >
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 text-primary">
                        <ShieldCheck size={32} />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Two-Factor Auth</h2>
                    <p className="text-text-muted text-sm flex items-center justify-center gap-2">
                        <MailWarning size={14} className="text-accent-blue" />
                        Code sent to: <span className="text-white">{email}</span>
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-6 text-center text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex justify-between gap-2">
                        {otp.map((data, index) => {
                            return (
                                <input
                                    className="w-12 h-14 bg-black/40 border border-border-glass rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                    type="text"
                                    name="otp"
                                    maxLength="1"
                                    key={index}
                                    value={data}
                                    ref={el => inputRefs.current[index] = el}
                                    onChange={e => handleChange(e.target, index)}
                                    onFocus={e => e.target.select()}
                                    onKeyDown={e => handleKeyDown(e, index)}
                                    disabled={isLoading}
                                />
                            );
                        })}
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="w-1/3 bg-black/40 border border-border-glass hover:bg-black/60 text-text-muted py-3 rounded-xl transition-colors font-medium text-sm"
                        >
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-2/3 bg-primary hover:bg-primary-hover text-white py-3 rounded-xl transition-colors font-semibold tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'VERIFY IDENTITY'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default OTPVerification;
