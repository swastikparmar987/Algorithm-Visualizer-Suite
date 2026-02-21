import React from 'react'
import { Play, RotateCcw, Pause } from 'lucide-react'

function ControlPanel({
    algorithms = [],
    selectedAlgo,
    onSelectAlgo,
    onStart,
    onReset,
    isRunning,
    isPaused,
    onPause,
    speed,
    onSpeedChange,
    children
}) {
    return (
        <div className="control-panel">
            {algorithms.length > 0 && (
                <div className="control-group">
                    <label className="control-label">Algorithm</label>
                    <div className="algo-grid">
                        {algorithms.map((algo) => (
                            <button
                                key={algo.id || algo}
                                onClick={() => onSelectAlgo(algo.id || algo)}
                                disabled={isRunning}
                                className={`algo-btn ${selectedAlgo === (algo.id || algo) ? 'active' : ''}`}
                            >
                                {algo.label || algo}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="control-group">
                <div className="speed-header">
                    <label className="control-label">Speed</label>
                    <span className="speed-value">{speed}ms</span>
                </div>
                <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={speed}
                    onChange={(e) => onSpeedChange(Number(e.target.value))}
                    className="speed-slider"
                />
            </div>

            {children}

            <div className="control-actions">
                <button onClick={onStart} disabled={isRunning} className="action-btn primary-btn">
                    <Play size={16} /> Run
                </button>
                {onPause && (
                    <button onClick={onPause} disabled={!isRunning} className="action-btn pause-btn">
                        <Pause size={16} /> {isPaused ? 'Resume' : 'Pause'}
                    </button>
                )}
                <button onClick={onReset} className="action-btn reset-btn">
                    <RotateCcw size={16} /> Reset
                </button>
            </div>
        </div>
    )
}

export default ControlPanel
