import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Moon, Sun, Volume2, VolumeX, RotateCcw } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

function SettingsPanel({ isOpen, onClose }) {
    const theme = useAppStore(s => s.theme)
    const setTheme = useAppStore(s => s.setTheme)
    const soundEnabled = useAppStore(s => s.soundEnabled)
    const toggleSound = useAppStore(s => s.toggleSound)
    const resetProgress = useAppStore(s => s.resetProgress)

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
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            position: 'fixed', top: 0, right: 0, width: '340px', height: '100vh',
                            background: 'var(--bg-card)', borderLeft: '1px solid var(--border-glass)',
                            zIndex: 1001, padding: '24px', display: 'flex', flexDirection: 'column',
                            gap: '24px', overflowY: 'auto'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Settings</h2>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Theme */}
                        <div className="glass-panel" style={{ padding: '16px' }}>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Aesthetics</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <button
                                    onClick={() => setTheme('cyberpunk')}
                                    style={{
                                        padding: '10px', borderRadius: '8px',
                                        background: theme === 'cyberpunk' ? 'var(--primary)' : 'var(--bg-elevated)', border: 'none', color: 'white',
                                        cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold'
                                    }}
                                >
                                    Cyberpunk
                                </button>
                                <button
                                    onClick={() => setTheme('solar-flare')}
                                    style={{
                                        padding: '10px', borderRadius: '8px',
                                        background: theme === 'solar-flare' ? 'var(--primary)' : 'var(--bg-elevated)', border: 'none', color: 'white',
                                        cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold'
                                    }}
                                >
                                    Solar Flare
                                </button>
                                <button
                                    onClick={() => setTheme('synthwave')}
                                    style={{
                                        padding: '10px', borderRadius: '8px',
                                        background: theme === 'synthwave' ? 'var(--primary)' : 'var(--bg-elevated)', border: 'none', color: 'white',
                                        cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold'
                                    }}
                                >
                                    Synthwave
                                </button>
                                <button
                                    onClick={() => setTheme('terminal')}
                                    style={{
                                        padding: '10px', borderRadius: '8px',
                                        background: theme === 'terminal' ? 'var(--primary)' : 'var(--bg-elevated)', border: 'none', color: 'white',
                                        cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold'
                                    }}
                                >
                                    Terminal
                                </button>
                            </div>
                        </div>

                        {/* Sound */}
                        <div className="glass-panel" style={{ padding: '16px' }}>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Audio</h3>
                            <button
                                onClick={toggleSound}
                                style={{
                                    width: '100%', padding: '10px', borderRadius: '8px',
                                    background: soundEnabled ? 'var(--primary)' : 'var(--bg-elevated)',
                                    border: 'none', color: 'white', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '10px'
                                }}
                            >
                                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                                {soundEnabled ? 'Sound On' : 'Sound Off'}
                            </button>
                        </div>

                        {/* Reset */}
                        <div className="glass-panel" style={{ padding: '16px' }}>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Data</h3>
                            {resetProgress ? (
                                <button
                                    onClick={resetProgress}
                                    style={{
                                        width: '100%', padding: '10px', borderRadius: '8px',
                                        background: 'var(--bg-elevated)', border: '1px solid var(--danger)',
                                        color: 'var(--danger)', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '10px'
                                    }}
                                >
                                    <RotateCcw size={16} /> Reset All Progress
                                </button>
                            ) : (
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No reset option available.</p>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default SettingsPanel
