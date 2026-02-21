import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, Pause, RotateCcw, ChevronRight, Star, Code, Terminal } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { playTone, playSuccess, playClick, playStep } from '../utils/SoundEngine'
import { say } from './mascot/MascotAssistant'
import { SORTING_ALGO_DATA } from '../data/sortingAlgorithms'

const ALGORITHMS = {
    'Bubble Sort': async (arr, update, delay, checkStop, playSound) => {
        const n = arr.length
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (await checkStop()) return
                update([...arr], [j, j + 1], [], [])
                if (playSound) playStep(arr[j], 100)
                await delay()
                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
                    update([...arr], [j, j + 1], [], [], true)
                    if (playSound) playStep(arr[j + 1], 100)
                    await delay()
                }
            }
        }
        update([...arr], [], [], [], false, true)
    },
    'Quick Sort': async (arr, update, delay, checkStop, playSound) => {
        const partition = async (low, high) => {
            const pivot = arr[high]
            let i = low - 1
            // Highlight pivot
            update([...arr], [], [high], [])

            for (let j = low; j < high; j++) {
                if (await checkStop()) return -1
                update([...arr], [j], [high], [])
                if (playSound) playStep(arr[j], 100)
                await delay()
                if (arr[j] < pivot) {
                    i++
                    [arr[i], arr[j]] = [arr[j], arr[i]]
                    update([...arr], [i, j], [high], [], true)
                    if (playSound) playStep(arr[i], 100)
                    await delay()
                }
            }
            [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
            update([...arr], [i + 1, high], [], [], true)
            if (playSound) playStep(arr[i + 1], 100)
            return i + 1
        }
        const sort = async (low, high) => {
            if (low < high) {
                if (await checkStop()) return
                const pi = await partition(low, high)
                if (pi === -1) return
                await sort(low, pi - 1)
                await sort(pi + 1, high)
            }
        }
        await sort(0, arr.length - 1)
        update([...arr], [], [], [], false, true)
    },
    'Merge Sort': async (arr, update, delay, checkStop, playSound) => {
        const merge = async (l, m, r) => {
            const n1 = m - l + 1
            const n2 = r - m
            const L = arr.slice(l, m + 1)
            const R = arr.slice(m + 1, r + 1)
            let i = 0, j = 0, k = l
            while (i < n1 && j < n2) {
                if (await checkStop()) return
                update([...arr], [k], [], [])
                if (playSound) playStep(arr[k], 100)
                await delay()
                if (L[i] <= R[j]) {
                    arr[k] = L[i]; i++
                } else {
                    arr[k] = R[j]; j++
                }
                k++
            }
            while (i < n1) {
                if (await checkStop()) return
                arr[k] = L[i]; i++; k++
                update([...arr], [k], [], [])
                if (playSound) playStep(arr[k], 100)
                await delay()
            }
            while (j < n2) {
                if (await checkStop()) return
                arr[k] = R[j]; j++; k++
                update([...arr], [k], [], [])
                if (playSound) playStep(arr[k], 100)
                await delay()
            }
        }
        const sort = async (l, r) => {
            if (l >= r) return
            if (await checkStop()) return
            const m = l + Math.floor((r - l) / 2)
            await sort(l, m)
            await sort(m + 1, r)
            await merge(l, m, r)
        }
        await sort(0, arr.length - 1)
        update([...arr], [], [], [], false, true)
    }
}

function SortingVisualizer({ onBack }) {
    const [array, setArray] = useState([])
    const [arraySize, setArraySize] = useState(50)
    const [algo, setAlgo] = useState('Bubble Sort')
    const [speed, setSpeed] = useState(500)
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)

    // State for visualizer colors
    const [activeIndices, setActiveIndices] = useState([])
    const [pivotIndices, setPivotIndices] = useState([])
    const [sortedIndices, setSortedIndices] = useState([])
    const [isSorted, setIsSorted] = useState(false)

    // Metrics
    const [comparisons, setComparisons] = useState(0)
    const [steps, setSteps] = useState(0)

    // Animation refs
    const stopRef = useRef(false)
    const pauseRef = useRef(false)
    const speedRef = useRef(speed)

    const soundEnabled = useAppStore(s => s.soundEnabled)

    const containerRef = useRef(null)

    useEffect(() => { speedRef.current = speed }, [speed])
    useEffect(() => { resetArray() }, [arraySize])

    const resetArray = () => {
        stopRef.current = true
        setIsRunning(false)
        setIsPaused(false)
        setActiveIndices([])
        setPivotIndices([])
        setSortedIndices([])
        setIsSorted(false)
        setComparisons(0)
        setSteps(0)

        const newArr = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 90) + 10)
        setArray(newArr)
        if (soundEnabled) playClick()
    }

    const checkState = async () => {
        if (stopRef.current) return true
        while (pauseRef.current) {
            await new Promise(r => setTimeout(r, 100))
            if (stopRef.current) return true
        }
        return false
    }

    const runSort = async () => {
        if (isRunning && isPaused) {
            setIsPaused(false)
            pauseRef.current = false
            return
        }

        stopRef.current = false
        pauseRef.current = false
        setIsRunning(true)
        setIsPaused(false)
        setIsSorted(false)
        setComparisons(0)
        setSteps(0)

        if (soundEnabled) playClick()
        say(`Initiating ${algo} protocol...`, "neutral")

        await ALGORITHMS[algo](
            [...array],
            (newArr, active, pivots, sorted, swapped, finished) => {
                setArray(newArr)
                setActiveIndices(active || [])
                setPivotIndices(pivots || [])
                if (sorted) setSortedIndices(prev => [...prev, ...sorted])

                setSteps(s => s + 1)
                if (active && active.length > 0) setComparisons(c => c + 1)

                if (finished) {
                    setIsRunning(false)
                    setIsSorted(true)
                    setActiveIndices([])
                    setPivotIndices([])
                    if (soundEnabled) playSuccess()
                    say("Sort complete. Optimization verified.", "happy")
                }
            },
            () => new Promise(r => setTimeout(r, 1050 - speedRef.current)),
            checkState,
            soundEnabled
        )
    }

    const handlePause = () => {
        setIsPaused(true)
        pauseRef.current = true
    }

    const maxVal = Math.max(...array, 100)
    const algoData = SORTING_ALGO_DATA[algo] || { code: '', explanation: '', complexity: {} }

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
                        <span className="text-text-muted">Sorting</span>
                        <ChevronRight size={14} className="text-text-muted" />
                        <span className="text-primary font-bold">{algo}</span>
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
                {/* SIDEBAR CONTROLS */}
                <aside className="w-80 flex flex-col border border-border-glass glass-panel p-6 gap-8 overflow-y-auto rounded-xl">

                    {/* Algorithm Selector (Added for usability) */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary">Protocol</h3>
                        <select
                            value={algo}
                            onChange={(e) => { setAlgo(e.target.value); resetArray(); }}
                            disabled={isRunning}
                            className="w-full bg-bg-elevated border border-border-glass text-white text-sm rounded-lg p-2.5 focus:ring-primary focus:border-primary block"
                        >
                            {Object.keys(ALGORITHMS).map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary">Parameters</h3>
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
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-300">Array Size</label>
                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">{arraySize}</span>
                            </div>
                            <input
                                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                                type="range" min="10" max="100"
                                value={arraySize} onChange={(e) => setArraySize(Number(e.target.value))}
                                disabled={isRunning}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {!isRunning || isPaused ? (
                            <button onClick={runSort} className="lego-button col-span-2 bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-lg flex items-center justify-center gap-2 uppercase tracking-tighter shadow-lg shadow-primary/20">
                                <Play size={18} fill="currentColor" />
                                {isPaused ? "Resume" : "Execute"}
                            </button>
                        ) : (
                            <button onClick={handlePause} className="lego-button col-span-2 bg-accent-orange hover:bg-accent-orange/90 text-black font-black py-4 rounded-lg flex items-center justify-center gap-2 uppercase tracking-tighter">
                                <Pause size={18} fill="currentColor" />
                                Pause
                            </button>
                        )}

                        <button onClick={resetArray} className="lego-button col-span-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 uppercase text-xs">
                            <RotateCcw size={14} />
                            Reset System
                        </button>
                    </div>

                    <div className="flex flex-col gap-4 mt-auto">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary">Live Metrics</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="glass-panel p-4 rounded-xl border-l-4 border-accent-cyan bg-bg-dark/30">
                                <p className="text-[10px] uppercase font-bold text-text-muted">Steps Taken</p>
                                <p className="text-2xl font-black text-white tabular-nums">{steps}</p>
                            </div>
                            <div className="glass-panel p-4 rounded-xl border-l-4 border-primary bg-bg-dark/30">
                                <p className="text-[10px] uppercase font-bold text-text-muted">Comparisons</p>
                                <p className="text-2xl font-black text-white tabular-nums">{comparisons}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* VISUALIZER & LOGS */}
                <div className="flex flex-col flex-1 gap-2 overflow-hidden">
                    {/* MAIN CANVAS */}
                    <main className="flex-1 relative cyber-grid p-12 flex items-end justify-center gap-1 overflow-hidden rounded-xl border border-border-glass bg-bg-dark/50">
                        {/* Pivot Marker (Only shows if there's a pivot) */}
                        <AnimatePresence>
                            {pivotIndices.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
                                >
                                    <Star className="text-accent-orange animate-bounce" fill="currentColor" size={24} />
                                    <span className="text-[10px] font-black bg-accent-orange text-black px-2 py-0.5 rounded uppercase">Pivot</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* BARS */}
                        {array.map((val, i) => {
                            const isPivot = pivotIndices.includes(i)
                            const isActive = activeIndices.includes(i)
                            const isSortedItem = isSorted || sortedIndices.includes(i)

                            let bgClass = "opacity-60"
                            let colorStyle = {} // fallback

                            if (isSortedItem) {
                                colorStyle = { background: 'var(--primary)', opacity: 1, boxShadow: '0 0 15px var(--primary-glow)' }
                            } else if (isPivot) {
                                colorStyle = { background: 'var(--accent-orange)', opacity: 1, boxShadow: '0 0 20px var(--accent-orange)' }
                            } else if (isActive) {
                                colorStyle = { background: 'var(--accent-cyan)', opacity: 1, boxShadow: '0 0 15px var(--accent-cyan)' }
                            } else {
                                // Default Gradient
                                colorStyle = { background: 'linear-gradient(180deg, var(--accent-cyan) 0%, var(--primary) 100%)', opacity: 0.5 }
                            }

                            return (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{
                                        height: `${val}%`,
                                        ...colorStyle
                                    }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    className="rounded-t-sm w-full max-w-[40px] relative group"
                                >
                                    {array.length < 30 && (
                                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-text-muted font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                            {val}
                                        </span>
                                    )}
                                </motion.div>
                            )
                        })}
                    </main>

                    {/* BOTTOM LOGS */}
                    <footer className="h-48 glass-panel border border-border-glass rounded-xl flex overflow-hidden shrink-0">
                        {/* PSEUDOCODE */}
                        <div className="w-1/2 border-r border-border-glass p-6 overflow-y-auto bg-black/20 font-mono text-xs">
                            <h4 className="text-[10px] font-black uppercase text-text-muted mb-4 flex items-center gap-2">
                                <Code size={12} /> Algorithm Source
                            </h4>
                            <pre className="text-text-secondary whitespace-pre-wrap">{algoData.code || "// Select an algorithm"}</pre>
                        </div>

                        {/* STEP LOGIC */}
                        <div className="w-1/2 p-6 flex flex-col justify-center gap-4 bg-bg-dark/40">
                            <div className="flex items-center gap-3">
                                <div className="size-2 rounded-full bg-accent-green animate-pulse"></div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight">System Status</h4>
                            </div>
                            <p className="text-text-secondary text-sm leading-relaxed font-mono">
                                {isSorted ? "System verification complete. All data points ordered successfully." : isRunning ? `Processing ${algo} sequence... Optimizing array arrangement.` : "System Standby. Awaiting execution command."}
                            </p>
                            <div className="mt-2 flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="size-3 rounded-sm bg-accent-orange"></div>
                                    <span className="text-[10px] uppercase font-bold text-text-muted">Pivot</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="size-3 rounded-sm bg-accent-cyan"></div>
                                    <span className="text-[10px] uppercase font-bold text-text-muted">Active</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="size-3 rounded-sm bg-primary"></div>
                                    <span className="text-[10px] uppercase font-bold text-text-muted">Sorted</span>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    )
}

export default SortingVisualizer
