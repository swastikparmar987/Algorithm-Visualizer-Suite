import React from 'react'
import { motion } from 'framer-motion'

// Animated Fire Icon — replaces 🔥
export function FireIcon({ size = 20 }) {
    return (
        <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            animate={{ scale: [1, 1.1, 1], y: [0, -1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}>
            <defs>
                <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="50%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
            </defs>
            <motion.path
                d="M12 2C9 7 4 9 4 14a8 8 0 0016 0c0-5-5-7-8-12z"
                fill="url(#fireGrad)"
                animate={{ opacity: [0.85, 1, 0.85] }}
                transition={{ duration: 0.6, repeat: Infinity }}
            />
            <motion.path
                d="M12 9c-1.5 2.5-3 3.5-3 6a3 3 0 006 0c0-2.5-1.5-3.5-3-6z"
                fill="#fbbf24"
                animate={{ opacity: [0.7, 1, 0.7], scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                style={{ transformOrigin: 'center bottom' }}
            />
        </motion.svg>
    )
}

// Animated Target Icon — replaces 🎯
export function TargetIcon({ size = 20 }) {
    return (
        <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
            <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" fill="none" />
            <circle cx="12" cy="12" r="6" stroke="#f97316" strokeWidth="2" fill="none" />
            <motion.circle cx="12" cy="12" r="2.5" fill="#ef4444"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
            />
        </motion.svg>
    )
}

// Animated Trophy Icon — replaces 🏆
export function TrophyIcon({ size = 20 }) {
    return (
        <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
            <defs>
                <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
            </defs>
            <path d="M6 2h12v6a6 6 0 01-12 0V2z" fill="url(#trophyGrad)" />
            <path d="M6 4H3a1 1 0 00-1 1v1a4 4 0 004 4" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
            <path d="M18 4h3a1 1 0 011 1v1a4 4 0 01-4 4" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
            <rect x="10" y="14" width="4" height="4" rx="1" fill="#d97706" />
            <rect x="7" y="18" width="10" height="3" rx="1.5" fill="#f59e0b" />
            <motion.circle cx="12" cy="6" r="1.5" fill="#fef3c7"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
            />
        </motion.svg>
    )
}

// Animated Lightning Icon — replaces ⚡
export function LightningIcon({ size = 20 }) {
    return (
        <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            animate={{ opacity: [0.8, 1, 0.8], scale: [1, 1.05, 1] }}
            transition={{ duration: 0.4, repeat: Infinity }}>
            <defs>
                <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
            </defs>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#boltGrad)" />
        </motion.svg>
    )
}

// Animated Star Icon — replaces ⭐
export function StarIcon({ size = 20, color = '#fbbf24' }) {
    return (
        <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"
                fill={color} />
        </motion.svg>
    )
}

// Animated Swords Icon — replaces ⚔️
export function SwordsIcon({ size = 20 }) {
    return (
        <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
            <defs>
                <linearGradient id="swordGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
            </defs>
            <line x1="4" y1="20" x2="18" y2="4" stroke="url(#swordGrad)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="20" y1="20" x2="6" y2="4" stroke="url(#swordGrad)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="11" cy="12" r="2" fill="#f59e0b" />
        </motion.svg>
    )
}

// Animated Crown Icon — replaces 👑
export function CrownIcon({ size = 20 }) {
    return (
        <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            animate={{ y: [0, -1.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <defs>
                <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
            </defs>
            <path d="M2 18L5 8l4 4 3-7 3 7 4-4 3 10H2z" fill="url(#crownGrad)" />
            <motion.circle cx="12" cy="5" r="1.2" fill="#fef3c7"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }} />
        </motion.svg>
    )
}

// Animated Puzzle Icon — replaces 🧩
export function PuzzleIcon({ size = 20 }) {
    return (
        <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <defs>
                <linearGradient id="puzzleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
            </defs>
            <path d="M4 6h4a2 2 0 014 0h4a2 2 0 012 2v4a2 2 0 010 4v4a2 2 0 01-2 2h-4a2 2 0 010-4H8a2 2 0 010 4H4a2 2 0 01-2-2v-4a2 2 0 010-4V8a2 2 0 012-2z"
                fill="url(#puzzleGrad)" />
        </motion.svg>
    )
}

// Animated Compass Icon — replaces 🧭
export function CompassIcon({ size = 20 }) {
    return (
        <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#06b6d4" strokeWidth="2" fill="rgba(6,182,212,0.1)" />
            <motion.g animate={{ rotate: [0, 360] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: 'center' }}>
                <polygon points="12,4 14,12 12,14 10,12" fill="#ef4444" />
                <polygon points="12,20 10,12 12,10 14,12" fill="#94a3b8" />
            </motion.g>
        </motion.svg>
    )
}

// Animated Map/Explorer Icon — replaces 🗺️
export function ExplorerIcon({ size = 20 }) {
    return (
        <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <defs>
                <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
            </defs>
            <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" fill="url(#mapGrad)" opacity="0.3" stroke="#10b981" strokeWidth="1.5" />
            <line x1="9" y1="3" x2="9" y2="18" stroke="#10b981" strokeWidth="1" opacity="0.5" />
            <line x1="15" y1="6" x2="15" y2="21" stroke="#06b6d4" strokeWidth="1" opacity="0.5" />
        </motion.svg>
    )
}

// Animated Lock Icon — replaces 🔒
export function LockIcon({ size = 20 }) {
    return (
        <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            animate={{ y: [0, -1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}>
            <rect x="5" y="11" width="14" height="10" rx="2" fill="#64748b" />
            <path d="M8 11V8a4 4 0 018 0v3" stroke="#94a3b8" strokeWidth="2" fill="none" />
            <motion.circle cx="12" cy="16" r="1.5" fill="#fbbf24"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }} />
        </motion.svg>
    )
}

// Animated Owl Icon — replaces 🦉
export function OwlIcon({ size = 20 }) {
    return (
        <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <ellipse cx="12" cy="14" rx="8" ry="8" fill="#78716c" />
            <circle cx="9" cy="12" r="3" fill="#fef3c7" />
            <circle cx="15" cy="12" r="3" fill="#fef3c7" />
            <motion.circle cx="9" cy="12" r="1.5" fill="#1e293b"
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                style={{ transformOrigin: 'center' }} />
            <motion.circle cx="15" cy="12" r="1.5" fill="#1e293b"
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                style={{ transformOrigin: 'center' }} />
            <path d="M11 16l1 1.5 1-1.5" fill="#f59e0b" />
        </motion.svg>
    )
}

// Animated Chart Icon — replaces 📊
export function ChartIcon({ size = 20 }) {
    return (
        <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <motion.rect x="3" y="14" width="4" height="8" rx="1" fill="#6366f1"
                animate={{ scaleY: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                style={{ transformOrigin: 'bottom' }} />
            <motion.rect x="10" y="8" width="4" height="14" rx="1" fill="#22d3ee"
                animate={{ scaleY: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                style={{ transformOrigin: 'bottom' }} />
            <motion.rect x="17" y="4" width="4" height="18" rx="1" fill="#10b981"
                animate={{ scaleY: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                style={{ transformOrigin: 'bottom' }} />
        </motion.svg>
    )
}

// Animated Brain Icon — replaces 🧠
export function BrainIcon({ size = 20 }) {
    return (
        <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}>
            <defs>
                <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
            </defs>
            <path d="M12 2C8 2 5 5 5 8c0 1.5.5 3 1.5 4C5.5 13 5 14.5 5 16c0 3 3 6 7 6s7-3 7-6c0-1.5-.5-3-1.5-4 1-1 1.5-2.5 1.5-4 0-3-3-6-7-6z"
                fill="url(#brainGrad)" opacity="0.9" />
            <motion.path d="M12 6v12M9 9c2 1 4 1 6 0M9 15c2-1 4-1 6 0"
                stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none"
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity }} />
        </motion.svg>
    )
}
