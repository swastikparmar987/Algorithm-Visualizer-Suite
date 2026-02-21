import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Activity, Cpu, Server, Plus } from 'lucide-react'
import StitchVisualizerLayout from './common/StitchVisualizerLayout'
import { playTone, playSuccess, playClick, playStep, playError } from '../utils/SoundEngine'
import { useAppStore } from '../store/useAppStore'

function MemoryVisualizer({ onBack }) {
    const theme = useAppStore(s => s.theme)
    const soundEnabled = useAppStore(s => s.soundEnabled)

    // A block structure: { id, size, allocated: boolean, processId: string | null }
    // We start with some free blocks of various sizes
    const initialMemory = [
        { id: 'b1', size: 100, allocated: false, processId: null },
        { id: 'b2', size: 500, allocated: false, processId: null },
        { id: 'b3', size: 200, allocated: false, processId: null },
        { id: 'b4', size: 300, allocated: false, processId: null },
        { id: 'b5', size: 600, allocated: false, processId: null }
    ]

    const initialProcesses = [
        { id: 'p1', size: 212 },
        { id: 'p2', size: 417 },
        { id: 'p3', size: 112 },
        { id: 'p4', size: 426 },
        { id: 'p5', size: 90 }
    ]

    const [memory, setMemory] = useState(initialMemory)
    const [processQueue, setProcessQueue] = useState(initialProcesses)
    const [completedProcesses, setCompletedProcesses] = useState([])
    const [failedProcesses, setFailedProcesses] = useState([])
    const [algorithm, setAlgorithm] = useState('first-fit')

    // Animation States
    const [activeBlockIdx, setActiveBlockIdx] = useState(-1)
    const [activeProcessIdx, setActiveProcessIdx] = useState(-1)

    // Control States
    const [speed, setSpeed] = useState(200)
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [logs, setLogs] = useState("Ready. Select allocation algorithm and run.")

    const speedRef = useRef(speed)
    const isPausedRef = useRef(isPaused)
    const isRunningRef = useRef(isRunning)
    const stepsRef = useRef(0)

    useEffect(() => { speedRef.current = speed }, [speed])
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])
    useEffect(() => { isRunningRef.current = isRunning }, [isRunning])

    const say = (msg) => setLogs(msg)

    const checkState = async () => {
        while (isPausedRef.current) {
            await new Promise(r => setTimeout(r, 100))
        }
        return !isRunningRef.current
    }

    const resetVis = () => {
        setIsRunning(false)
        setIsPaused(false)
        isRunningRef.current = false
        isPausedRef.current = false
        setMemory(initialMemory)
        setProcessQueue([...initialProcesses, ...completedProcesses, ...failedProcesses].sort((a, b) => a.id.localeCompare(b.id)).slice(0, 5))
        setCompletedProcesses([])
        setFailedProcesses([])
        setActiveBlockIdx(-1)
        setActiveProcessIdx(-1)
        stepsRef.current = 0
        say("Memory reset. Ready.")
    }

    // Process Manipulation
    const addProcess = () => {
        if (isRunning) return
        const newSize = Math.floor(Math.random() * 400) + 50
        const newId = `p${processQueue.length + completedProcesses.length + failedProcesses.length + 1}`
        setProcessQueue([...processQueue, { id: newId, size: newSize }])
        if (soundEnabled) playClick()
    }

    const removeProcess = (id) => {
        if (isRunning) return
        setProcessQueue(processQueue.filter(p => p.id !== id))
        if (soundEnabled) playClick()
    }

    // --- ALGORITHMS ---

    const allocateMemory = async () => {
        let currentMemory = [...memory]
        let queue = [...processQueue]
        let currentCompleted = [...completedProcesses]
        let currentFailed = [...failedProcesses]

        while (queue.length > 0) {
            if (await checkState()) return

            const process = queue[0]
            setActiveProcessIdx(0)
            say(`Attempting to allocate ${process.id} (${process.size} KB) using ${algorithm.replace('-', ' ')}...`)

            let targetBlockIdx = -1

            if (algorithm === 'first-fit') {
                for (let i = 0; i < currentMemory.length; i++) {
                    if (await checkState()) return
                    setActiveBlockIdx(i)
                    stepsRef.current++
                    if (soundEnabled) playTone(400 + i * 20, 20, 'square')
                    await new Promise(r => setTimeout(r, Math.max(20, (600 - speedRef.current) / 2)))

                    if (!currentMemory[i].allocated && currentMemory[i].size >= process.size) {
                        targetBlockIdx = i
                        break
                    }
                }
            } else if (algorithm === 'best-fit') {
                let bestDiff = Infinity
                for (let i = 0; i < currentMemory.length; i++) {
                    if (await checkState()) return
                    setActiveBlockIdx(i)
                    stepsRef.current++
                    if (soundEnabled) playTone(400 + i * 20, 20, 'square')
                    await new Promise(r => setTimeout(r, Math.max(20, (600 - speedRef.current) / 2)))

                    if (!currentMemory[i].allocated && currentMemory[i].size >= process.size) {
                        const diff = currentMemory[i].size - process.size
                        if (diff < bestDiff) {
                            bestDiff = diff
                            targetBlockIdx = i
                        }
                    }
                }
            } else if (algorithm === 'worst-fit') {
                let worstDiff = -1
                for (let i = 0; i < currentMemory.length; i++) {
                    if (await checkState()) return
                    setActiveBlockIdx(i)
                    stepsRef.current++
                    if (soundEnabled) playTone(400 + i * 20, 20, 'square')
                    await new Promise(r => setTimeout(r, Math.max(20, (600 - speedRef.current) / 2)))

                    if (!currentMemory[i].allocated && currentMemory[i].size >= process.size) {
                        const diff = currentMemory[i].size - process.size
                        if (diff > worstDiff) {
                            worstDiff = diff
                            targetBlockIdx = i
                        }
                    }
                }
            }

            if (await checkState()) return

            if (targetBlockIdx !== -1) {
                // Success Allocation
                const targetBlock = currentMemory[targetBlockIdx]
                setActiveBlockIdx(targetBlockIdx)
                say(`Allocated ${process.id} to Block ${targetBlockIdx + 1}. Fragmentation: ${targetBlock.size - process.size} KB`)

                // Split the block if there is remaining space
                if (targetBlock.size > process.size) {
                    const allocatedBlock = { id: `${targetBlock.id}-a`, size: process.size, allocated: true, processId: process.id }
                    const freeBlock = { id: `${targetBlock.id}-f`, size: targetBlock.size - process.size, allocated: false, processId: null }
                    currentMemory.splice(targetBlockIdx, 1, allocatedBlock, freeBlock)
                } else {
                    currentMemory[targetBlockIdx] = { ...targetBlock, allocated: true, processId: process.id }
                }

                currentCompleted.push(process)
                queue.shift()

                setMemory([...currentMemory])
                setProcessQueue([...queue])
                setCompletedProcesses([...currentCompleted])

                if (soundEnabled) playSuccess()
            } else {
                // Failed Allocation
                say(`Failed to allocate ${process.id} (${process.size} KB). Not enough space.`)
                currentFailed.push(process)
                queue.shift()
                setProcessQueue([...queue])
                setFailedProcesses([...currentFailed])

                if (soundEnabled) playError()
            }

            await new Promise(r => setTimeout(r, Math.max(50, 600 - speedRef.current)))
            setActiveBlockIdx(-1)
            setActiveProcessIdx(-1)
        }

        if (await checkState()) return

        setActiveBlockIdx(-1)
        setActiveProcessIdx(-1)
        say(`Simulation complete. All processes evaluated.`)
    }

    const processStart = async () => {
        if (processQueue.length === 0) {
            say("No processes in queue. Please reset or add processes.")
            return
        }
        setIsRunning(true)
        setIsPaused(false)
        setActiveBlockIdx(-1)
        setActiveProcessIdx(-1)
        if (soundEnabled) playClick()

        await new Promise(r => setTimeout(r, 50))
        await allocateMemory()

        setIsRunning(false)
        isRunningRef.current = false
    }

    // --- RENDERING ---

    const Controls = (
        <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Algorithm</h3>

            <div className="grid grid-cols-1 gap-2">
                {['first-fit', 'best-fit', 'worst-fit'].map(alg => (
                    <button
                        key={alg}
                        disabled={isRunning}
                        onClick={() => { setAlgorithm(alg); if (soundEnabled) playClick(); }}
                        className={`py-3 px-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap overflow-hidden text-ellipsis
                            ${algorithm === alg
                                ? 'bg-primary text-black shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                                : 'bg-bg-elevated border border-border-glass text-text-muted hover:text-white disabled:opacity-50'}`}
                    >
                        {alg.replace('-', ' ')}
                    </button>
                ))}
            </div>

            <div className="h-px w-full bg-border-glass my-4"></div>

            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Process Queue</h3>

            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                    {processQueue.map((p, i) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                borderColor: i === activeProcessIdx ? 'var(--accent-orange)' : 'var(--border-glass)',
                                backgroundColor: i === activeProcessIdx ? 'rgba(251, 146, 60, 0.1)' : 'var(--bg-elevated)'
                            }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-bg-elevated/50 p-3 rounded-xl border flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-text-muted text-xs font-bold">{p.id.toUpperCase()}</span>
                                <span className="font-mono text-white text-sm">{p.size} KB</span>
                            </div>
                            <button
                                onClick={() => removeProcess(p.id)}
                                disabled={isRunning}
                                className="text-text-muted hover:text-danger disabled:opacity-50 transition-colors"
                            >
                                <RotateCcw size={14} className="rotate-45" />
                            </button>
                        </motion.div>
                    ))}
                    {processQueue.length === 0 && (
                        <div className="text-xs text-text-muted italic text-center py-2">Queue is empty</div>
                    )}
                </AnimatePresence>
            </div>

            <button
                onClick={addProcess}
                disabled={isRunning}
                className="w-full py-2 bg-bg-elevated border border-border-glass border-dashed hover:border-primary/50 text-text-muted hover:text-white rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
            >
                <Plus size={14} /> <span className="text-[10px] font-black tracking-widest uppercase">Random Process</span>
            </button>

            <div className="h-px w-full bg-border-glass my-4"></div>

            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Execution</h3>
            <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-text-muted uppercase">
                    <span>Speed</span>
                    <span className="font-mono bg-bg-elevated px-2 py-1 rounded text-primary">{speed}ms</span>
                </div>
                <input
                    type="range" min="20" max="600" step="20"
                    value={620 - speed}
                    onChange={(e) => setSpeed(620 - parseInt(e.target.value))}
                    className="w-full accent-primary"
                />
            </div>

            <div className="flex gap-2 mt-4">
                {isRunning ? (
                    <button onClick={() => setIsPaused(!isPaused)} className="flex-1 bg-accent-orange text-black font-black py-3 rounded-lg flex items-center justify-center gap-2 uppercase shadow-[0_0_15px_rgba(251,146,60,0.3)]">
                        <Pause size={16} fill="currentColor" /> {isPaused ? "Resume" : "Pause"}
                    </button>
                ) : (
                    <button onClick={processStart} className="flex-1 bg-primary text-black font-black py-3 rounded-lg flex items-center justify-center gap-2 uppercase shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:bg-white transition-colors">
                        <Play size={16} fill="currentColor" /> Run Auto
                    </button>
                )}
                <button onClick={resetVis} className="p-3 rounded-lg bg-bg-elevated border border-border-glass hover:bg-white/10 transition-colors text-white">
                    <RotateCcw size={16} />
                </button>
            </div>
        </div>
    )

    const totalMem = memory.reduce((sum, b) => sum + b.size, 0)
    const usedMem = memory.filter(b => b.allocated).reduce((sum, b) => sum + b.size, 0)
    const freeMem = totalMem - usedMem

    const Metrics = (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass">
                <p className="flex items-center gap-2 text-[10px] font-black tracking-widest text-text-muted uppercase">
                    <Server size={12} className="text-accent-cyan" /> Free Mem
                </p>
                <p className="text-xl font-mono text-accent-cyan font-black mt-1">
                    {freeMem} KB
                </p>
            </div>
            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass">
                <p className="flex items-center gap-2 text-[10px] font-black tracking-widest text-text-muted uppercase">
                    <Cpu size={12} className="text-accent-green" /> Used Mem
                </p>
                <p className="text-xl font-mono text-accent-green mt-1">
                    {usedMem} KB
                </p>
            </div>
            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass">
                <p className="text-[10px] font-black tracking-widest text-text-muted uppercase">Failed</p>
                <p className={`text-xl font-mono font-black mt-1 ${failedProcesses.length > 0 ? 'text-danger' : 'text-white'}`}>{failedProcesses.length}</p>
            </div>
            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass">
                <p className="text-[10px] font-black tracking-widest text-text-muted uppercase">Steps</p>
                <p className="text-xl font-mono text-white mt-1 uppercase tracking-tighter">{stepsRef.current}</p>
            </div>
        </div>
    )

    return (
        <StitchVisualizerLayout
            title="Memory Management"
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={logs}
        >
            <div className="relative w-full h-full flex flex-col p-8 bg-[#0A0A0F] gap-6 overflow-hidden">

                {/* Visual Memory Representation */}
                <div className="flex-1 bg-bg-elevated border border-border-glass rounded-2xl p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <Server className="text-primary" size={24} />
                            <h4 className="text-lg font-black tracking-widest text-white uppercase">Physical Memory (RAM)</h4>
                        </div>
                        <div className="flex gap-4 text-xs font-mono">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 block bg-bg-card border border-border-glass rounded-sm"></span> Free
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 block bg-primary/20 border border-primary/50 rounded-sm"></span> Allocated
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full flex flex-col gap-2 relative">
                        <AnimatePresence>
                            {memory.map((block, i) => {
                                const isActive = i === activeBlockIdx
                                const isAllocated = block.allocated

                                let bgClass = "bg-bg-card"
                                let borderClass = "border-border-glass"
                                let textClass = "text-text-muted"

                                if (isAllocated) {
                                    bgClass = "bg-primary/20"
                                    borderClass = "border-primary/50"
                                    textClass = "text-primary"
                                }

                                if (isActive) {
                                    if (isAllocated) {
                                        borderClass = "border-danger"
                                        bgClass = "bg-danger/20"
                                    } else {
                                        borderClass = "border-accent-cyan"
                                        bgClass = "bg-accent-cyan/20"
                                    }
                                }

                                return (
                                    <motion.div
                                        key={block.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                                        className={`w-full rounded-lg border-2 flex items-center justify-between px-6 transition-colors overflow-hidden relative ${bgClass} ${borderClass}`}
                                        style={{ height: `${Math.max(40, (block.size / totalMem) * 400)}px` }}
                                    >
                                        {isActive && (
                                            <div className={`absolute inset-0 opacity-20 ${isAllocated ? 'bg-danger' : 'bg-accent-cyan'}`}></div>
                                        )}

                                        <div className="flex items-center gap-4 relative z-10">
                                            <span className={`font-mono font-bold ${textClass}`}>
                                                {block.size} KB
                                            </span>
                                            {isAllocated && (
                                                <span className="text-xs font-black tracking-widest uppercase bg-primary text-black px-2 py-1 rounded">
                                                    {block.processId}
                                                </span>
                                            )}
                                        </div>

                                        <div className="relative z-10 text-[10px] font-black tracking-widest uppercase text-text-muted/50">
                                            {isAllocated ? 'In Use' : 'Free'}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </StitchVisualizerLayout>
    )
}

export default MemoryVisualizer
