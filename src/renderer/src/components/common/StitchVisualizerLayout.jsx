import React, { useRef } from 'react'
import { ArrowLeft, ChevronRight, Terminal, Code } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { playClick } from '../../utils/SoundEngine'
import { AnimatePresence, motion } from 'framer-motion'

const StitchVisualizerLayout = ({
    title,
    algoName,
    onBack,
    controls,
    metrics,
    logs,
    pseudocode,
    isSorted,
    isRunning,
    children
}) => {
    const soundEnabled = useAppStore(s => s.soundEnabled)
    console.log("StitchLayout Render:", title, algoName) // Debug log

    return (
        <div className="flex flex-col h-screen bg-bg-dark text-text-primary overflow-hidden font-display">
            {/* STITCH HEADER */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-border-glass glass-panel z-50 shrink-0 m-2 rounded-xl">
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className="flex items-center justify-center size-10 rounded-lg hover:bg-white/10 transition-colors">
                        <ArrowLeft className="text-primary" />
                    </button>
                    <nav className="flex items-center gap-2 text-sm font-medium tracking-wide">
                        <span className="text-text-muted">Algorithms</span>
                        <ChevronRight size={14} className="text-text-muted" />
                        <span className="text-text-muted">{title}</span>
                        <ChevronRight size={14} className="text-text-muted" />
                        <span className="text-primary font-bold">{algoName}</span>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-bg-dark/50 border border-border-glass rounded-full p-1">
                        <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary text-white">SYSTEM</button>
                        <button className="px-4 py-1.5 rounded-full text-xs font-bold text-text-muted hover:text-white transition-colors">NEON</button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden p-2 gap-2">
                {/* SIDEBAR */}
                <aside className="w-80 flex flex-col border border-border-glass glass-panel p-6 gap-8 overflow-y-auto rounded-xl">
                    {/* Controls & Metrics injected here */}
                    {controls}

                    <div className="flex flex-col gap-4 mt-auto">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary">Live Metrics</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {metrics}
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <div className="flex flex-col flex-1 gap-2 overflow-hidden">
                    {/* CANVAS */}
                    <main className="flex-1 relative cyber-grid p-8 flex items-center justify-center gap-1 overflow-hidden rounded-xl border border-border-glass bg-bg-dark/50">
                        {children}
                    </main>

                    {/* FOOTER LOGS */}
                    <footer className="h-48 glass-panel border border-border-glass rounded-xl flex overflow-hidden shrink-0">
                        {/* PSEUDOCODE */}
                        <div className="w-1/2 border-r border-border-glass p-6 overflow-y-auto bg-black/20 font-mono text-xs">
                            <h4 className="text-[10px] font-black uppercase text-text-muted mb-4 flex items-center gap-2">
                                <Code size={12} /> Algorithm Source
                            </h4>
                            <pre className="text-text-secondary whitespace-pre-wrap">{pseudocode || "// Select an algorithm"}</pre>
                        </div>

                        {/* STEP LOGIC */}
                        <div className="w-1/2 p-6 flex flex-col justify-center gap-4 bg-bg-dark/40">
                            <div className="flex items-center gap-3">
                                <div className={`size-2 rounded-full ${isSorted ? 'bg-accent-green' : 'bg-accent-orange'} animate-pulse`}></div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight">System Status</h4>
                            </div>
                            <p className="text-text-secondary text-sm leading-relaxed font-mono">
                                {logs || (isSorted ? "System verification complete. All data points processed." : isRunning ? `Processing ${algoName} sequence...` : "System Standby. Awaiting execution command.")}
                            </p>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    )
}

export default StitchVisualizerLayout
