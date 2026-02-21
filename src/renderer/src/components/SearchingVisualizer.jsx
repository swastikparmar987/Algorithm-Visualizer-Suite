import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Search } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { playTone, playSuccess, playClick, playStep } from '../utils/SoundEngine'
import { say } from './mascot/MascotAssistant'
import StitchVisualizerLayout from './common/StitchVisualizerLayout'
import { SEARCHING_ALGO_DATA } from '../data/searchingAlgorithms'

const ALGORITHMS = ['Linear Search', 'Binary Search', 'Jump Search']

function SearchingVisualizer({ onBack }) {
    const [array, setArray] = useState([])
    const [arraySize, setArraySize] = useState(30)
    const [target, setTarget] = useState(42)
    const [algo, setAlgo] = useState('Binary Search')

    // Viz State
    const [activeIdx, setActiveIdx] = useState(-1)
    const [foundIdx, setFoundIdx] = useState(-1)
    const [visited, setVisited] = useState([])
    const [lowHigh, setLowHigh] = useState({ low: -1, high: -1 })

    // Metrics
    const [comparisons, setComparisons] = useState(0)
    const [steps, setSteps] = useState(0)

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
    useEffect(() => { resetArray() }, [arraySize])

    const generateArray = () => {
        const newArr = Array.from({ length: arraySize }, (_, i) => i * 3 + Math.floor(Math.random() * 3)).sort((a, b) => a - b)
        setArray(newArr)
        if (Math.random() > 0.3) {
            setTarget(newArr[Math.floor(Math.random() * newArr.length)])
        } else {
            setTarget(Math.floor(Math.random() * 100))
        }
    }

    const resetArray = () => {
        stopRef.current = true
        setIsRunning(false)
        setIsPaused(false)
        setActiveIdx(-1)
        setFoundIdx(-1)
        setVisited([])
        setLowHigh({ low: -1, high: -1 })
        setComparisons(0)
        setSteps(0)
        generateArray()
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

    const delay = () => new Promise(r => setTimeout(r, 1050 - speedRef.current))

    const linearSearch = async () => {
        for (let i = 0; i < array.length; i++) {
            if (await checkState()) return
            setActiveIdx(i)
            setVisited(prev => [...prev, i])
            setComparisons(c => c + 1)
            setSteps(s => s + 1)
            if (soundEnabled) playStep(array[i], 100)
            await delay()

            if (array[i] === target) {
                setFoundIdx(i)
                if (soundEnabled) playSuccess()
                say("Found it! Target located at index " + i, "happy")
                return
            }
        }
        say("Target not found in the array.", "sad")
    }

    const binarySearch = async () => {
        let l = 0, r = array.length - 1
        while (l <= r) {
            if (await checkState()) return
            setLowHigh({ low: l, high: r })
            const mid = Math.floor((l + r) / 2)
            setActiveIdx(mid)
            setVisited(prev => [...prev, mid])
            setComparisons(c => c + 1)
            setSteps(s => s + 1)
            if (soundEnabled) playStep(array[mid], 100)
            await delay()

            if (array[mid] === target) {
                setFoundIdx(mid)
                if (soundEnabled) playSuccess()
                say("Found it! Binary Search is fast!", "happy")
                return
            } else if (array[mid] < target) {
                l = mid + 1
            } else {
                r = mid - 1
            }
        }
        say("Target not found.", "sad")
        setLowHigh({ low: -1, high: -1 })
    }

    const jumpSearch = async () => {
        const n = array.length
        const step = Math.floor(Math.sqrt(n))
        let prev = 0

        while (array[Math.min(step, n) - 1] < target) {
            if (await checkState()) return
            setVisited(v => [...v, Math.min(step, n) - 1])
            setActiveIdx(Math.min(step, n) - 1)
            setComparisons(c => c + 1)
            setSteps(s => s + 1)
            if (soundEnabled) playStep(array[Math.min(step, n) - 1], 100)
            await delay()
            prev = step
            if (prev >= n) break
        }

        while (array[prev] < target) {
            if (await checkState()) return
            setVisited(v => [...v, prev])
            setActiveIdx(prev)
            setComparisons(c => c + 1)
            setSteps(s => s + 1)
            if (soundEnabled) playStep(array[prev], 100)
            await delay()
            prev++
            if (prev === Math.min(step, n)) break
        }

        if (prev < n && array[prev] === target) {
            setFoundIdx(prev)
            if (soundEnabled) playSuccess()
            say("Found it using Jump Search!", "happy")
            return
        }

        say("Target not found.", "sad")
    }

    const handleSearch = async () => {
        if (isRunning && isPaused) {
            setIsPaused(false)
            pauseRef.current = false
            return
        }

        stopRef.current = false
        pauseRef.current = false
        setIsRunning(true)
        setIsPaused(false)
        setFoundIdx(-1)
        setVisited([])
        setLowHigh({ low: -1, high: -1 })
        setComparisons(0)
        setSteps(0)

        if (soundEnabled) playClick()
        say(`Searching for ${target} using ${algo}...`, "neutral")

        if (algo === 'Linear Search') await linearSearch()
        else if (algo === 'Binary Search') await binarySearch()
        else if (algo === 'Jump Search') await jumpSearch()

        setIsRunning(false)
        setActiveIdx(-1)
    }

    const handlePause = () => {
        setIsPaused(true)
        pauseRef.current = true
    }

    const algoData = SEARCHING_ALGO_DATA[algo] || { code: '', explanation: '', complexity: {} }

    // RENDER PROPS
    const Controls = (
        <>
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Protocol</h3>
                <select
                    value={algo}
                    onChange={(e) => { setAlgo(e.target.value); resetArray(); }}
                    disabled={isRunning}
                    className="w-full bg-bg-elevated border border-border-glass text-white text-sm rounded-lg p-2.5 focus:ring-primary focus:border-primary block"
                >
                    {ALGORITHMS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
            </div>

            <div className="flex flex-col gap-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Parameters</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-slate-300">Target Value</label>
                        <input
                            type="number"
                            value={target}
                            onChange={e => setTarget(Number(e.target.value))}
                            disabled={isRunning}
                            className="w-20 bg-bg-elevated border border-border-glass text-white text-sm rounded px-2 py-1 text-right focus:ring-primary"
                        />
                    </div>
                </div>
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
                    <button onClick={handleSearch} className="lego-button col-span-2 bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-lg flex items-center justify-center gap-2 uppercase tracking-tighter shadow-lg shadow-primary/20">
                        <Play size={18} fill="currentColor" />
                        {isPaused ? "Resume" : "Find Target"}
                    </button>
                ) : (
                    <button onClick={handlePause} className="lego-button col-span-2 bg-accent-orange hover:bg-accent-orange/90 text-black font-black py-4 rounded-lg flex items-center justify-center gap-2 uppercase tracking-tighter">
                        <Pause size={18} fill="currentColor" />
                        Pause
                    </button>
                )}
                <button onClick={resetArray} className="lego-button col-span-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 uppercase text-xs">
                    <RotateCcw size={14} />
                    Reset
                </button>
            </div>
        </>
    )

    const Metrics = (
        <>
            <div className="glass-panel p-4 rounded-xl border-l-4 border-accent-cyan bg-bg-dark/30">
                <p className="text-[10px] uppercase font-bold text-text-muted">Steps</p>
                <p className="text-2xl font-black text-white tabular-nums">{steps}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border-l-4 border-primary bg-bg-dark/30">
                <p className="text-[10px] uppercase font-bold text-text-muted">Comparisons</p>
                <p className="text-2xl font-black text-white tabular-nums">{comparisons}</p>
            </div>
        </>
    )

    const Logs = isRunning
        ? `Scanning array for target value ${target}... Comparing index ${activeIdx}.`
        : foundIdx !== -1
            ? `Target ${target} successfully located at index ${foundIdx}.`
            : "System Ready. Input target and initiate search protocol."

    return (
        <StitchVisualizerLayout
            title="Searching"
            algoName={algo}
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={Logs}
            pseudocode={algoData.code}
            isSorted={foundIdx !== -1}
            isRunning={isRunning}
        >
            <div className="flex flex-wrap content-center justify-center gap-3 max-w-full max-h-full overflow-auto p-4">
                <AnimatePresence>
                    {array.map((val, i) => {
                        let borderColor = 'var(--border-glass)'
                        let bg = 'var(--bg-elevated)'
                        let glow = 'none'
                        let scale = 1

                        if (foundIdx === i) {
                            borderColor = 'var(--accent-green)'
                            bg = 'rgba(57, 255, 20, 0.2)'
                            glow = '0 0 20px var(--accent-green)'
                            scale = 1.2
                        } else if (activeIdx === i) {
                            borderColor = 'var(--accent-cyan)'
                            bg = 'rgba(0, 243, 255, 0.2)'
                            glow = '0 0 15px var(--accent-cyan)'
                            scale = 1.1
                        } else if (visited.includes(i)) {
                            borderColor = 'var(--text-muted)'
                            bg = 'rgba(255,255,255,0.02)'
                        } else if (lowHigh.low <= i && i <= lowHigh.high && lowHigh.low !== -1) {
                            borderColor = 'var(--primary)'
                            bg = 'rgba(123, 37, 244, 0.1)'
                        }

                        return (
                            <motion.div
                                key={i}
                                layout
                                initial={{ scale: 0 }}
                                animate={{ scale, borderColor, backgroundColor: bg, boxShadow: glow }}
                                exit={{ scale: 0 }}
                                className="size-12 md:size-14 rounded-xl border-2 flex items-center justify-center text-lg font-black text-white relative"
                            >
                                {val}
                                {/* Index label */}
                                <span className="absolute -bottom-5 text-[8px] text-text-muted font-mono">{i}</span>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>
        </StitchVisualizerLayout>
    )
}

export default SearchingVisualizer
