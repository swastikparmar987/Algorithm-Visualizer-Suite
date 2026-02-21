import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, Box, Cpu, Database } from 'lucide-react'
import StitchVisualizerLayout from '../common/StitchVisualizerLayout'
import { useAppStore } from '../../store/useAppStore'
import { playClick } from '../../utils/SoundEngine'

function SpaceComplexityVisualizer({ onBack }) {
    const [mode, setMode] = useState('iterative') // iterative vs recursive
    const soundEnabled = useAppStore(s => s.soundEnabled)

    const stackFrames = mode === 'recursive'
        ? [
            { name: 'fib(5)', vars: 'n=5', active: false },
            { name: 'fib(4)', vars: 'n=4', active: false },
            { name: 'fib(3)', vars: 'n=3', active: true },
        ]
        : [{ name: 'main()', vars: 'i=5, sum=15', active: true }]

    const heapObjects = mode === 'recursive'
        ? []
        : [
            { id: 'Ref1', type: 'Array(100)', size: '400 bytes' },
            { id: 'Ref2', type: 'Object', size: '64 bytes' }
        ]

    const handleModeChange = (newMode) => {
        if (soundEnabled) playClick()
        setMode(newMode)
    }

    const Controls = (
        <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Execution Model</h3>
            <div className="grid grid-cols-1 gap-2">
                <button
                    onClick={() => handleModeChange('iterative')}
                    className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center transition-all bg-bg-elevated text-xs font-bold
                    ${mode === 'iterative' ? 'border-primary bg-primary/20 text-white' : 'border-border-glass text-text-muted hover:bg-white/5'}
                    `}
                >
                    <span className="flex items-center gap-2"><Cpu size={14} className={mode === 'iterative' ? 'text-primary' : ''} /> Iterative (Loop)</span>
                </button>
                <button
                    onClick={() => handleModeChange('recursive')}
                    className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center transition-all bg-bg-elevated text-xs font-bold
                    ${mode === 'recursive' ? 'border-accent-pink bg-accent-pink/20 text-white' : 'border-border-glass text-text-muted hover:bg-white/5'}
                    `}
                >
                    <span className="flex items-center gap-2"><Layers size={14} className={mode === 'recursive' ? 'text-accent-pink' : ''} /> Recursive (Call Stack)</span>
                </button>
            </div>
        </div>
    )

    const Metrics = (
        <div className="space-y-4">
            <div className={`p-4 rounded-xl border ${mode === 'recursive' ? 'border-accent-pink/30 bg-accent-pink/10' : 'border-primary/30 bg-primary/10'}`}>
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-text-muted mb-1">
                    <span>Stack Depth</span>
                </div>
                <div className={`text-2xl font-black font-mono ${mode === 'recursive' ? 'text-accent-pink' : 'text-primary'}`}>
                    {mode === 'recursive' ? 'O(N)' : 'O(1)'}
                </div>
            </div>

            <div className="p-4 rounded-xl border border-secondary/30 bg-secondary/10">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-text-muted mb-1">
                    <span>Heap Allocation</span>
                </div>
                <div className="text-2xl font-black font-mono text-secondary">
                    {mode === 'recursive' ? 'Minimal' : 'Variable'}
                </div>
            </div>
        </div>
    )

    return (
        <StitchVisualizerLayout
            title="Space Complexity"
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={"Compare the memory footprint and architectural requirements of different execution strategies."}
        >
            <div className="w-full h-full flex flex-col p-8 bg-[#0A0A0F] gap-6 overflow-hidden">
                <div className="flex-1 flex gap-6">
                    {/* Stack Visualization */}
                    <div className="flex-1 bg-bg-elevated border border-border-glass rounded-2xl p-6 flex flex-col relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-4 relative z-10 border-b border-border-glass pb-4">
                            <Layers className="text-accent-orange" size={24} />
                            <h4 className="text-lg font-black tracking-widest text-white uppercase">Call Stack Frame Monitor</h4>
                        </div>

                        <div className="flex-1 relative flex flex-col-reverse gap-3 overflow-y-auto custom-scrollbar p-2">
                            <AnimatePresence>
                                {stackFrames.map((frame, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center shadow-lg transition-colors
                                            ${frame.active
                                                ? 'bg-accent-orange/20 border-accent-orange/50 text-white shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                                                : 'bg-bg-dark border-border-glass text-text-secondary'}
                                        `}
                                    >
                                        <div className="font-black text-lg mb-1 font-mono">{frame.name}</div>
                                        <div className="text-xs font-bold font-mono opacity-80 uppercase tracking-widest text-accent-cyan">{frame.vars}</div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {mode === 'iterative' && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted opacity-50 text-center pointer-events-none p-4">
                                    <Layers size={48} className="mb-4" />
                                    <p className="font-display font-medium text-sm">Iterative functions typically stabilize with a single active stack frame.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Heap Visualization */}
                    <div className="flex-[1.5] bg-bg-elevated border border-border-glass rounded-2xl p-6 flex flex-col relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-4 relative z-10 border-b border-border-glass pb-4">
                            <Database className="text-secondary" size={24} />
                            <h4 className="text-lg font-black tracking-widest text-white uppercase">Heap Memory Allocation</h4>
                        </div>

                        <div className="flex-1 relative overflow-y-auto custom-scrollbar p-2 grid grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                            <AnimatePresence>
                                {heapObjects.length > 0 ? heapObjects.map((obj, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        style={{ transitionDelay: `${i * 0.1}s` }}
                                        className="p-4 rounded-xl bg-bg-dark border border-secondary/30 flex flex-col items-center gap-2 shadow-inner group hover:border-secondary/60 transition-colors"
                                    >
                                        <Box size={24} className="text-secondary mb-1 opacity-70 group-hover:opacity-100 transition-opacity" />
                                        <div className="font-black text-sm text-white font-mono">{obj.id}</div>
                                        <div className="flex flex-col items-center border-t border-border-glass/50 mt-1 pt-2 w-full">
                                            <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{obj.type}</div>
                                            <div className="text-xs font-mono text-accent-cyan mt-1">{obj.size}</div>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="col-span-full h-full flex flex-col items-center justify-center text-text-muted opacity-50 p-6 min-h-[200px]">
                                        <Database size={48} className="mb-4 text-secondary opacity-30" />
                                        <p className="font-display font-medium text-sm text-center">No persistent heap allocations identified for recursive primitive ops.</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </StitchVisualizerLayout>
    )
}

export default SpaceComplexityVisualizer
