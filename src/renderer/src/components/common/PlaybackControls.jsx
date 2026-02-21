import React from 'react'
import { Play, Pause, RotateCcw, SkipBack, SkipForward, FastForward } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

const PlaybackControls = ({
    onPlay,
    onPause,
    onReset,
    onStepForward,
    onStepBackward,
    speed,
    setSpeed,
    isRunning,
    isPaused
}) => {
    return (
        <div className="glass-panel" style={{
            position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
            padding: '10px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', zIndex: 100
        }}>
            {/* Step Back */}
            <button
                onClick={onStepBackward}
                disabled={!isPaused && isRunning}
                className="neu-button icon-btn"
                title="Step Backward"
            >
                <SkipBack size={20} />
            </button>

            {/* Play/Pause */}
            <button
                onClick={isRunning && !isPaused ? onPause : onPlay}
                className="neu-button primary-btn"
                style={{ width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title={isRunning && !isPaused ? "Pause" : "Play"}
            >
                {isRunning && !isPaused ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
            </button>

            {/* Step Forward */}
            <button
                onClick={onStepForward}
                disabled={!isPaused && isRunning}
                className="neu-button icon-btn"
                title="Step Forward"
            >
                <SkipForward size={20} />
            </button>

            {/* Reset */}
            <div style={{ width: '1px', height: '24px', background: 'var(--border-glass)' }}></div>

            <button
                onClick={onReset}
                className="neu-button icon-btn"
                title="Reset"
            >
                <RotateCcw size={18} />
            </button>

            {/* Speed Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FastForward size={16} color="var(--text-muted)" />
                <input
                    type="range"
                    min="50" max="1000" step="50"
                    value={1050 - speed} // Invert so right is faster
                    onChange={(e) => setSpeed(1050 - Number(e.target.value))}
                    style={{ width: '80px', cursor: 'pointer' }}
                />
            </div>

            <style jsx>{`
                .neu-button {
                    background: var(--bg-elevated);
                    border: 1px solid var(--border-glass);
                    color: white;
                    border-radius: 8px;
                    padding: 8px;
                    cursor: pointer;
                    transition: all 0.1s;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .neu-button:active {
                    transform: translateY(2px);
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                }
                .neu-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }
                .primary-btn {
                    background: var(--primary);
                    box-shadow: 0 4px 15px var(--primary-shadow);
                    border: none;
                }
                .primary-btn:active {
                    box-shadow: 0 2px 8px var(--primary-shadow);
                }
                .icon-btn {
                    width: 36px; height: 36px;
                    display: flex; alignItems: 'center; justifyContent: center;
                }
            `}</style>
        </div>
    )
}

export default PlaybackControls
