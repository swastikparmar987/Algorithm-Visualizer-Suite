import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Plus, Trash2, Cpu } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { playClick, playSuccess, playStep } from '../utils/SoundEngine'
import { say } from './mascot/MascotAssistant'
import StitchVisualizerLayout from './common/StitchVisualizerLayout'
import { CPU_SCHEDULING_DATA } from '../data/cpuSchedulingAlgorithms'

function CPUSchedulingVisualizer({ onBack }) {
    const [processes, setProcesses] = useState([
        { id: 1, arrival: 0, burst: 5, color: '#6366f1' },
        { id: 2, arrival: 1, burst: 3, color: '#10b981' },
        { id: 3, arrival: 2, burst: 8, color: '#f59e0b' },
        { id: 4, arrival: 3, burst: 6, color: '#ec4899' },
    ])
    const [algorithm, setAlgorithm] = useState('FCFS')
    const [timeQuantum, setTimeQuantum] = useState(2)
    const [results, setResults] = useState(null)
    const [currentStep, setCurrentStep] = useState(0)

    // Playback State
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [speed, setSpeed] = useState(500)

    // Refs
    const stopRef = useRef(false)
    const pauseRef = useRef(false)
    const speedRef = useRef(speed)

    const soundEnabled = useAppStore(s => s.soundEnabled)

    useEffect(() => { speedRef.current = speed }, [speed])

    const addProcess = () => {
        if (processes.length >= 8) return
        const id = processes.length > 0 ? Math.max(...processes.map(p => p.id)) + 1 : 1
        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316']
        setProcesses([...processes, {
            id,
            arrival: Math.floor(Math.random() * 5),
            burst: Math.floor(Math.random() * 10) + 1,
            color: colors[id % colors.length]
        }])
        if (soundEnabled) playClick()
    }

    const removeProcess = (id) => {
        setProcesses(processes.filter(p => p.id !== id))
        if (soundEnabled) playClick()
    }

    const updateProcess = (id, field, value) => {
        setProcesses(processes.map(p => p.id === id ? { ...p, [field]: parseInt(value) || 0 } : p))
    }

    const calculateSchedule = () => {
        let schedule = []
        let procCopy = processes.map(p => ({ ...p, remainingBurst: p.burst, finished: false }))
        let time = 0
        let completed = 0
        const n = processes.length

        if (algorithm === 'FCFS') {
            procCopy.sort((a, b) => a.arrival - b.arrival)
            for (let i = 0; i < n; i++) {
                if (time < procCopy[i].arrival) time = procCopy[i].arrival
                schedule.push({ id: procCopy[i].id, start: time, end: time + procCopy[i].burst, color: procCopy[i].color })
                time += procCopy[i].burst
            }
        } else if (algorithm === 'SJF') {
            while (completed < n) {
                let available = procCopy.filter(p => p.arrival <= time && !p.finished)
                if (available.length === 0) {
                    time++
                    continue
                }
                available.sort((a, b) => a.burst - b.burst)
                let p = available[0]
                schedule.push({ id: p.id, start: time, end: time + p.burst, color: p.color })
                time += p.burst
                p.finished = true
                completed++
            }
        } else if (algorithm === 'Round Robin') {
            let queue = []
            let visited = new Array(n).fill(false)
            procCopy.sort((a, b) => a.arrival - b.arrival)
            let currentTime = procCopy[0].arrival
            time = currentTime
            queue.push(procCopy[0])
            visited[processes.findIndex(p => p.id === procCopy[0].id)] = true

            while (queue.length > 0) {
                let p = queue.shift()
                let duration = Math.min(p.remainingBurst, timeQuantum)
                schedule.push({ id: p.id, start: time, end: time + duration, color: p.color })
                time += duration
                p.remainingBurst -= duration

                for (let i = 0; i < n; i++) {
                    let originalIdx = processes.findIndex(proc => proc.id === procCopy[i].id)
                    if (procCopy[i].arrival <= time && !visited[originalIdx] && procCopy[i].id !== p.id) {
                        queue.push(procCopy[i])
                        visited[originalIdx] = true
                    }
                }
                if (p.remainingBurst > 0) { queue.push(p) } else { completed++ }
                if (queue.length === 0 && completed < n) {
                    for (let i = 0; i < n; i++) {
                        let originalIdx = processes.findIndex(proc => proc.id === procCopy[i].id)
                        if (!visited[originalIdx]) {
                            time = procCopy[i].arrival
                            queue.push(procCopy[i])
                            visited[originalIdx] = true
                            break
                        }
                    }
                }
            }
        }
        return schedule
    }

    const checkState = async () => {
        if (stopRef.current) return true
        while (pauseRef.current) {
            await new Promise(r => setTimeout(r, 100))
            if (stopRef.current) return true
        }
        return false
    }

    const runSimulation = async () => {
        if (isRunning && isPaused) {
            setIsPaused(false)
            pauseRef.current = false
            return
        }

        stopRef.current = false
        pauseRef.current = false
        setIsRunning(true)
        setIsPaused(false)
        setResults([])
        setCurrentStep(0)

        if (soundEnabled) playClick()
        say(`Simulating ${algorithm}...`, "neutral")

        const fullSchedule = calculateSchedule()

        for (let i = 1; i <= fullSchedule.length; i++) {
            if (await checkState()) return
            setResults(fullSchedule.slice(0, i))
            setCurrentStep(i)
            if (soundEnabled) playStep(i, fullSchedule.length)
            await new Promise(r => setTimeout(r, 1050 - speedRef.current))
        }

        if (soundEnabled) playSuccess()
        say("Simulation complete!", "happy")
        setIsRunning(false)
    }

    const handlePause = () => {
        setIsPaused(true)
        pauseRef.current = true
    }

    const resetSimulation = () => {
        stopRef.current = true
        setIsRunning(false)
        setIsPaused(false)
        setResults(null)
        setCurrentStep(0)
        if (soundEnabled) playClick()
    }

    const algoData = CPU_SCHEDULING_DATA[algorithm] || { code: '', explanation: '', complexity: {} }

    // CONTROLS
    const Controls = (
        <>
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Protocol</h3>
                <select
                    value={algorithm}
                    onChange={(e) => { setAlgorithm(e.target.value); resetSimulation(); }}
                    disabled={isRunning}
                    className="w-full bg-bg-elevated border border-border-glass text-white text-sm rounded-lg p-2.5 focus:ring-primary focus:border-primary block"
                >
                    {['FCFS', 'SJF', 'Round Robin'].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
            </div>

            {algorithm === 'Round Robin' && (
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300">Time Quantum</label>
                    <input
                        type="number" min="1" max="10" value={timeQuantum}
                        onChange={e => setTimeQuantum(parseInt(e.target.value) || 1)}
                        className="w-full bg-bg-elevated border border-border-glass text-white text-sm rounded px-3 py-2 focus:ring-primary"
                        disabled={isRunning}
                    />
                </div>
            )}

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-300">Speed</label>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">{(speed / 100).toFixed(1)}x</span>
                </div>
                <input
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    type="range" min="100" max="1000" step="100"
                    value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
                {!isRunning || isPaused ? (
                    <button onClick={runSimulation} className="lego-button col-span-2 bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-lg flex items-center justify-center gap-2 uppercase tracking-tighter shadow-lg shadow-primary/20">
                        <Play size={18} fill="currentColor" />
                        {isPaused ? "Resume" : "Simulate"}
                    </button>
                ) : (
                    <button onClick={handlePause} className="lego-button col-span-2 bg-accent-orange hover:bg-accent-orange/90 text-black font-black py-4 rounded-lg flex items-center justify-center gap-2 uppercase tracking-tighter">
                        <Pause size={18} fill="currentColor" />
                        Pause
                    </button>
                )}
                <button onClick={resetSimulation} className="lego-button col-span-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 uppercase text-xs">
                    <RotateCcw size={14} />
                    Reset
                </button>
            </div>

            <button
                onClick={addProcess} disabled={isRunning || processes.length >= 8}
                className="mt-4 w-full border border-dashed border-text-muted/50 hover:border-primary text-text-muted hover:text-primary p-3 rounded-lg flex items-center justify-center gap-2 transition-colors uppercase text-xs font-bold"
            >
                <Plus size={14} /> Add Process
            </button>
        </>
    )

    const Metrics = (
        <>
            <div className="glass-panel p-4 rounded-xl border-l-4 border-success bg-bg-dark/30">
                <p className="text-[10px] uppercase font-bold text-text-muted">Completed</p>
                <p className="text-2xl font-black text-white tabular-nums">{results ? processes.length : 0}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border-l-4 border-accent-orange bg-bg-dark/30">
                <p className="text-[10px] uppercase font-bold text-text-muted">Total Time</p>
                <p className="text-2xl font-black text-white tabular-nums">{results && results.length > 0 ? results[results.length - 1].end : 0}ms</p>
            </div>
        </>
    )

    const Logs = isRunning
        ? `Processing schedule... Allocating CPU resources based on ${algorithm}.`
        : results
            ? `Simulation complete. All processes executed successfully.`
            : "Identify processes and configure bursts to begin simulation."

    return (
        <StitchVisualizerLayout
            title="OS Scheduling"
            algoName={algorithm}
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={Logs}
            pseudocode={algoData.code}
            isSorted={results !== null && !isRunning}
            isRunning={isRunning}
        >
            <div className="flex flex-col w-full h-full gap-6 p-4 overflow-hidden">
                {/* Process List */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                    <h3 className="text-sm font-black text-text-muted uppercase tracking-wider mb-2 sticky top-0 bg-bg-dark z-10 py-2">Process Queue</h3>
                    {processes.map(p => (
                        <div key={p.id} className="glass-panel p-3 flex items-center gap-4 border-l-4" style={{ borderLeftColor: p.color }}>
                            <div className="font-black text-white text-lg w-10">P{p.id}</div>
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-text-muted uppercase">Arrival</label>
                                    <input
                                        type="number" min="0" max="20" value={p.arrival}
                                        onChange={e => updateProcess(p.id, 'arrival', e.target.value)}
                                        className="w-full bg-bg-base/50 text-white rounded px-2 py-1 text-sm border-none focus:ring-1 focus:ring-primary"
                                        disabled={isRunning}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-text-muted uppercase">Burst</label>
                                    <input
                                        type="number" min="1" max="20" value={p.burst}
                                        onChange={e => updateProcess(p.id, 'burst', e.target.value)}
                                        className="w-full bg-bg-base/50 text-white rounded px-2 py-1 text-sm border-none focus:ring-1 focus:ring-primary"
                                        disabled={isRunning}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => removeProcess(p.id)} disabled={isRunning || processes.length <= 1}
                                className="text-danger hover:bg-danger/10 p-2 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Gantt Chart Area */}
                <div className="h-32 shrink-0 glass-panel p-4 flex flex-col justify-center relative bg-bg-dark/50 border border-border-glass rounded-xl">
                    <h3 className="absolute top-2 left-4 text-[10px] font-black uppercase text-text-muted">Gantt Chart Visualization</h3>
                    <div className="flex w-full h-12 bg-bg-elevated rounded-lg overflow-hidden relative mt-4">
                        <AnimatePresence>
                            {results && results.map((segment, i) => (
                                <motion.div
                                    key={`${segment.id}-${i}`}
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: `${(segment.end - segment.start) * 40}px`, opacity: 1 }}
                                    className="h-full flex items-center justify-center border-r border-black/20 relative shrink-0"
                                    style={{ background: segment.color, minWidth: '40px' }}
                                >
                                    <span className="font-black text-white text-xs drop-shadow-md">P{segment.id}</span>
                                    <span className="absolute bottom-1 left-1 text-[8px] text-white/70 font-mono">{segment.start}</span>
                                    {i === results.length - 1 && <span className="absolute bottom-1 right-1 text-[8px] text-white/70 font-mono">{segment.end}</span>}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {(!results || results.length === 0) && (
                            <div className="absolute inset-0 flex items-center justify-center text-text-muted text-xs italic">
                                Execute simulation to generate chart
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StitchVisualizerLayout>
    )
}

export default CPUSchedulingVisualizer
