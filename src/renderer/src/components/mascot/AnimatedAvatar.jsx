import React from 'react';
import { motion } from 'framer-motion';

const AnimatedAvatar = ({ mood = 'neutral', isSpeaking = false, size = 60 }) => {

    // Animation variants based on mood
    const getEyeVariants = () => {
        switch (mood) {
            case 'happy':
            case 'excited':
                return {
                    initial: { scaleY: 1 },
                    animate: { scaleY: [1, 0.1, 1], transition: { repeat: Infinity, duration: 3, times: [0, 0.1, 1] } }
                };
            case 'thinking':
                return {
                    initial: { scaleY: 1 },
                    animate: { scaleY: 0.5, y: -2 }
                };
            case 'surprised':
                return {
                    initial: { scaleY: 1, scaleX: 1 },
                    animate: { scaleY: 1.3, scaleX: 1.3 }
                };
            default: // neutral
                return {
                    initial: { scaleY: 1 },
                    animate: { scaleY: [1, 0.1, 1], transition: { repeat: Infinity, duration: 4, times: [0, 0.05, 1], repeatDelay: 1 } }
                };
        }
    };

    const getMouthVariants = () => {
        if (isSpeaking) {
            return {
                initial: { scaleY: 1 },
                animate: { scaleY: [1, 2, 0.5, 1.5, 1], transition: { repeat: Infinity, duration: 0.3 } }
            };
        }

        // Not speaking
        switch (mood) {
            case 'happy': return { initial: { scaleY: 1, borderRadius: '0 0 10px 10px' }, animate: {} };
            case 'surprised': return { initial: { scaleY: 2, scaleX: 0.5, borderRadius: '50%' }, animate: {} };
            case 'thinking': return { initial: { scaleX: 0.5, x: 5 }, animate: { x: [5, -5, 5], transition: { repeat: Infinity, duration: 2 } } };
            default: return { initial: { scaleY: 1, borderRadius: '4px' }, animate: {} }; // Neutral straight line
        }
    };

    return (
        <div style={{ width: size, height: size }} className="relative">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
                {/* Robot Head / Base */}
                <rect x="15" y="20" width="70" height="60" rx="16" fill="url(#botGradient)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

                {/* Antenna */}
                <path d="M50 20 L50 10" stroke="#a855f7" strokeWidth="4" strokeLinecap="round" />
                <circle cx="50" cy="8" r="4" fill="#6366f1">
                    {isSpeaking && <animate attributeName="opacity" values="1;0.2;1" dur="0.5s" repeatCount="indefinite" />}
                </circle>

                {/* Face Plate */}
                <rect x="25" y="32" width="50" height="35" rx="8" fill="#1f2937" stroke="#374151" strokeWidth="2" />

                {/* Left Eye */}
                <motion.rect
                    x="35" y="40" width="8" height="8" rx="4" fill="#00f0ff"
                    variants={getEyeVariants()}
                    initial="initial"
                    animate="animate"
                    style={{ originX: 0.5, originY: 0.5, transformOrigin: '39px 44px' }}
                />

                {/* Right Eye */}
                <motion.rect
                    x="57" y="40" width="8" height="8" rx="4" fill="#00f0ff"
                    variants={getEyeVariants()}
                    initial="initial"
                    animate="animate"
                    style={{ originX: 0.5, originY: 0.5, transformOrigin: '61px 44px' }}
                />

                {/* Mouth */}
                <motion.rect
                    x="42" y="55" width="16" height="4" rx="2" fill="#a855f7"
                    variants={getMouthVariants()}
                    initial="initial"
                    animate="animate"
                    style={{ originX: 0.5, originY: 0.5, transformOrigin: '50px 57px' }}
                />

                <defs>
                    <linearGradient id="botGradient" x1="15" y1="20" x2="85" y2="80" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#4f46e5" />
                        <stop offset="1" stopColor="#9333ea" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default AnimatedAvatar;
