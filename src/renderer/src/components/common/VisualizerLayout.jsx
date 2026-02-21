import React from 'react'
import { ArrowLeft, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useAppStore } from '../../store/useAppStore'

const VisualizerLayout = ({ title, onBack, onReset, onRun, isRunning, children, controls }) => {
    const soundEnabled = useAppStore(s => s.soundEnabled)
    const toggleSound = useAppStore(s => s.toggleSound)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={onBack} className="back-btn"><ArrowLeft size={18} /> Back</button>
                    <h2 style={{ margin: 0 }}>{title}</h2>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={toggleSound} style={{ padding: '8px', borderRadius: '50%', background: soundEnabled ? 'var(--primary)' : 'var(--bg-card)', color: 'white', border: '1px solid var(--border-glass)', cursor: 'pointer' }}>
                        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>
                    <ThemeToggle />
                </div>
            </div>

            <div className="glass-panel" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {children}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', paddingBottom: '20px' }}>
                {onRun && (
                    <button onClick={onRun} disabled={isRunning} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Play size={18} /> Run
                    </button>
                )}
                {onReset && (
                    <button onClick={onReset} disabled={isRunning} className="glass-panel" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'white', cursor: 'pointer' }}>
                        <RotateCcw size={18} /> Reset
                    </button>
                )}
                {controls}
            </div>
        </div>
    )
}

export default VisualizerLayout
