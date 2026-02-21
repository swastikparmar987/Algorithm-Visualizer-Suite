import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const SHORTCUTS = [
    { keys: ['Esc'], description: 'Return to Dashboard' },
    { keys: ['Space'], description: 'Start / Pause visualization' },
    { keys: ['R'], description: 'Reset / Randomize' },
    { keys: ['?'], description: 'Show this help' },
    { keys: ['S'], description: 'Toggle sound' },
    { keys: ['T'], description: 'Toggle theme' },
]

function KeyboardShortcuts({ isOpen, onClose }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                            zIndex: 1000
                        }}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{
                            position: 'fixed', top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '420px', maxHeight: '80vh',
                            background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                            borderRadius: '16px', zIndex: 1001, padding: '24px',
                            display: 'flex', flexDirection: 'column', gap: '16px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Keyboard Shortcuts</h2>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {SHORTCUTS.map((shortcut, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: '8px'
                                }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{shortcut.description}</span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {shortcut.keys.map(key => (
                                            <span key={key} style={{
                                                padding: '3px 10px', background: 'var(--bg-card)',
                                                border: '1px solid var(--border-glass)', borderRadius: '6px',
                                                fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace'
                                            }}>
                                                {key}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default KeyboardShortcuts
