import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Plus, Trash2, Hash } from 'lucide-react'
import StitchVisualizerLayout from './common/StitchVisualizerLayout'
import { useAppStore } from '../store/useAppStore'
import { playTone, playSuccess, playClick, playStep, playError } from '../utils/SoundEngine'

function HashingVisualizer({ onBack }) {
    const theme = useAppStore(s => s.theme)
    const soundEnabled = useAppStore(s => s.soundEnabled)

    const [tableSize, setTableSize] = useState(11)
    const [method, setMethod] = useState('chaining')
    const [table, setTable] = useState(() => Array(11).fill(null).map(() => []))

    // Input state
    const [inputVal, setInputVal] = useState('')
    const [insertQueue, setInsertQueue] = useState([])

    // Animation/Simulation States
    const [activeIndex, setActiveIndex] = useState(-1)
    const [activeValue, setActiveValue] = useState(null)
    const [probingIndices, setProbingIndices] = useState([])

    // Metrics
    const [stats, setStats] = useState({ insertions: 0, collisions: 0 })

    // Control States
    const [speed, setSpeed] = useState(400)
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [logs, setLogs] = useState("Ready. Select hashing method and insert values.")

    const speedRef = useRef(speed)
    const isPausedRef = useRef(isPaused)
    const isRunningRef = useRef(isRunning)

    useEffect(() => { speedRef.current = speed }, [speed])
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])
    useEffect(() => { isRunningRef.current = isRunning }, [isRunning])
    useEffect(() => {
        // Reset table if size changes
        setTable(Array(tableSize).fill(null).map(() => []))
        setStats({ insertions: 0, collisions: 0 })
        setActiveIndex(-1)
        setActiveValue(null)
        setProbingIndices([])
        setInsertQueue([])
    }, [tableSize, method])

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
        setTable(Array(tableSize).fill(null).map(() => []))
        setStats({ insertions: 0, collisions: 0 })
        setActiveIndex(-1)
        setActiveValue(null)
        setProbingIndices([])
        setInsertQueue([])
        say("Hash table reset. Ready.")
        if (soundEnabled) playClick()
    }

    const hash = (key, size) => key % size

    const addToQueue = () => {
        if (isRunning) return

        let newVals = []
        if (inputVal.trim() !== '') {
            const val = parseInt(inputVal)
            if (!isNaN(val)) newVals = [val]
            setInputVal('')
        } else {
            // Generate random
            newVals = [Math.floor(Math.random() * 900) + 100]
        }

        setInsertQueue([...insertQueue, ...newVals])
        if (soundEnabled) playClick()
    }

    const insertBatch = async () => {
        if (insertQueue.length === 0) return

        setIsRunning(true)
        setIsPaused(false)
        isRunningRef.current = true
        isPausedRef.current = false

        let currentQueue = [...insertQueue]
        let currentTable = table.map(b => [...b])
        let currentStats = { ...stats }

        while (currentQueue.length > 0) {
            if (await checkState()) return

            const val = currentQueue.shift()
            setInsertQueue([...currentQueue])
            setActiveValue(val)

            const idx = hash(val, tableSize)
            say(`Hashing: ${val} % ${tableSize} = ${idx}`)
            if (soundEnabled) playTone(val, 100)

            // Visual pause for hash computation
            setActiveIndex(idx)
            setProbingIndices([idx])
            await new Promise(r => setTimeout(r, speedRef.current))

            if (await checkState()) return

            if (method === 'chaining') {
                const hadCollision = currentTable[idx].length > 0

                if (hadCollision) {
                    say(`Collision at index ${idx}! Resolving via chaining.`)
                    currentStats.collisions++
                    setStats({ ...currentStats })
                    if (soundEnabled) playTone(150, 100, 'sawtooth')
                    await new Promise(r => setTimeout(r, speedRef.current))
                } else {
                    say(`Inserting ${val} at index ${idx}.`)
                }

                currentTable[idx].push(val)
                currentStats.insertions++

            } else {
                // Open addressing (linear probing)
                let i = idx
                let probes = 0

                while (currentTable[i].length > 0 && probes < tableSize) {
                    say(`Collision at ${i}! Linear probing to next slot...`)
                    if (soundEnabled) playStep()
                    probes++
                    i = (i + 1) % tableSize

                    setProbingIndices(prev => [...prev, i])
                    setActiveIndex(i)

                    await new Promise(r => setTimeout(r, speedRef.current))
                    if (await checkState()) return
                }

                if (probes > 0) {
                    currentStats.collisions += probes
                    setStats({ ...currentStats })
                }

                if (probes < tableSize) {
                    say(`Found empty slot at ${i}. Inserting ${val}.`)
                    currentTable[i] = [val]
                    currentStats.insertions++
                } else {
                    say(`Table is full! Could not insert ${val}.`)
                    if (soundEnabled) playError()
                    await new Promise(r => setTimeout(r, speedRef.current))
                }
            }

            setTable(currentTable.map(b => [...b]))
            setStats({ ...currentStats })

            if (soundEnabled) playSuccess()

            await new Promise(r => setTimeout(r, speedRef.current))

            // Cleanup visually before next item
            setActiveIndex(-1)
            setProbingIndices([])
            setActiveValue(null)
        }

        setIsRunning(false)
        isRunningRef.current = false
        say("Batch insertion complete.")
    }

    // --- SUB-COMPONENTS ---

    const Controls = (
        <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Configuration</h3>

            <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Collision Method</label>
                <div className="grid grid-cols-2 gap-2">
                    {['chaining', 'open-addressing'].map(m => (
                        <button
                            key={m}
                            disabled={isRunning}
                            onClick={() => { setMethod(m); if (soundEnabled) playClick(); }}
                            className={`py-2 px-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap overflow-hidden text-ellipsis
                                ${method === m
                                    ? 'bg-primary text-black shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                                    : 'bg-bg-elevated border border-border-glass text-text-muted hover:text-white disabled:opacity-50'}`}
                        >
                            {m.replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2 mt-2">
                <label className="text-xs font-bold text-text-muted uppercase flex justify-between">
                    <span>Table Size</span>
                    <span className="text-primary">{tableSize}</span>
                </label>
                <input
                    type="range" min="5" max="31" step="1"
                    value={tableSize}
                    onChange={(e) => setTableSize(parseInt(e.target.value))}
                    disabled={isRunning}
                    className="w-full accent-primary disabled:opacity-50"
                />
            </div>

            <div className="h-px w-full bg-border-glass my-4"></div>

            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Data Queue</h3>
            <div className="flex gap-2">
                <input
                    type="number"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addToQueue()}
                    disabled={isRunning}
                    placeholder="Random if empty"
                    className="flex-1 bg-bg-elevated border border-border-glass rounded-lg px-3 py-2 text-sm text-white placeholder:text-text-muted/50 focus:outline-none focus:border-primary disabled:opacity-50"
                />
                <button
                    onClick={addToQueue}
                    disabled={isRunning}
                    className="bg-bg-elevated border border-border-glass hover:bg-white/10 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                >
                    <Plus size={18} />
                </button>
            </div>

            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto mt-2 p-2 bg-bg-elevated/30 rounded-lg border border-border-glass/30">
                {insertQueue.length === 0 ? (
                    <p className="text-xs text-text-muted italic w-full text-center">Queue empty</p>
                ) : (
                    insertQueue.map((val, idx) => (
                        <span key={idx} className="bg-bg-card border border-border-glass text-xs font-mono px-2 py-1 rounded text-white">
                            {val}
                        </span>
                    ))
                )}
            </div>

            <div className="flex gap-2 mt-4">
                {isRunning ? (
                    <button onClick={() => setIsPaused(!isPaused)} className="flex-1 bg-accent-orange text-black font-black py-3 rounded-lg flex items-center justify-center gap-2 uppercase shadow-[0_0_15px_rgba(251,146,60,0.3)]">
                        <Pause size={16} fill="currentColor" /> {isPaused ? "Resume" : "Pause"}
                    </button>
                ) : (
                    <button onClick={insertBatch} disabled={insertQueue.length === 0} className="flex-1 bg-primary text-black font-black py-3 rounded-lg flex items-center justify-center gap-2 uppercase shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:bg-white transition-colors disabled:opacity-50 disabled:hover:bg-primary disabled:shadow-none">
                        <Play size={16} fill="currentColor" /> Insert Batch
                    </button>
                )}
                <button onClick={resetVis} className="p-3 rounded-lg bg-bg-elevated border border-border-glass hover:bg-white/10 transition-colors text-white">
                    <RotateCcw size={16} />
                </button>
            </div>

            <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase">
                    <span>Animation Speed</span>
                </div>
                <input
                    type="range" min="100" max="1000" step="50"
                    value={1100 - speed}
                    onChange={(e) => setSpeed(1100 - parseInt(e.target.value))}
                    className="w-full accent-primary"
                />
            </div>
        </div>
    )

    const Metrics = (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass flex flex-col justify-center items-center text-center">
                <p className="flex items-center gap-2 text-[10px] font-black tracking-widest text-text-muted uppercase mb-1">
                    Insertions
                </p>
                <p className="text-2xl font-black text-white font-mono">{stats.insertions}</p>
            </div>

            <div className={`bg-bg-elevated rounded-xl p-4 border border-border-glass flex flex-col justify-center items-center text-center transition-colors ${stats.collisions > 0 ? 'border-danger/50 shadow-inner' : ''}`}>
                <p className="text-[10px] font-black tracking-widest text-text-muted uppercase mb-1">Collisions</p>
                <p className={`text-2xl font-black font-mono ${stats.collisions > 0 ? 'text-danger' : 'text-success'}`}>{stats.collisions}</p>
            </div>

            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass col-span-2 flex justify-between items-center">
                <div>
                    <p className="text-[10px] font-black tracking-widest text-text-muted uppercase">Load Factor</p>
                    <p className="text-sm font-black mt-1 text-white uppercase tracking-widest">{(stats.insertions / tableSize).toFixed(2)}</p>
                </div>
                <div className="w-1/2 bg-bg-card h-2 rounded-full overflow-hidden border border-border-glass">
                    <motion.div
                        className={`h-full ${(stats.insertions / tableSize) > 0.75 ? 'bg-danger' : 'bg-primary'}`}
                        animate={{ width: `${Math.min(100, (stats.insertions / tableSize) * 100)}%` }}
                    />
                </div>
            </div>
        </div>
    )

    return (
        <StitchVisualizerLayout
            title="Hash Tables"
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={logs}
        >
            <div className="relative w-full h-full flex flex-col p-8 bg-[#0A0A0F] gap-6 overflow-hidden">
                <div className="flex-1 bg-bg-elevated border border-border-glass rounded-2xl p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-4 relative z-10 w-full justify-between">
                        <div className="flex items-center gap-2">
                            <Hash className="text-primary" size={24} />
                            <h4 className="text-lg font-black tracking-widest text-white uppercase">Memory Structure</h4>
                        </div>

                        {/* Active Computation Display */}
                        <AnimatePresence>
                            {activeValue !== null && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="px-4 py-2 rounded-xl bg-bg-card border border-primary/50 flex items-center gap-3 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                                >
                                    <span className="text-xs font-black uppercase tracking-widest text-text-muted">h(k) = </span>
                                    <span className="font-mono text-white bg-bg-elevated px-2 py-1 rounded border border-border-glass">
                                        <span className="text-accent-pink">{activeValue}</span> % {tableSize}
                                    </span>
                                    <span className="font-black text-white">=</span>
                                    <span className="font-mono font-black text-primary text-lg">
                                        {hash(activeValue, tableSize)}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Hash Table Visual */}
                    <div className="w-full flex-1 relative mt-4 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-border-glass scrollbar-track-transparent">
                        <div className="flex flex-col gap-2 pb-10">
                            {table.map((bucket, i) => {
                                const isActiveRoot = activeIndex === i
                                const isProbingTarget = probingIndices.includes(i)

                                return (
                                    <motion.div
                                        key={i}
                                        className={`flex items-stretch min-h-[50px] rounded-xl border transition-colors overflow-hidden
                                            ${isActiveRoot
                                                ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                                : isProbingTarget
                                                    ? 'bg-warning/10 border-warning shadow-[0_0_10px_rgba(251,191,36,0.1)]'
                                                    : 'bg-bg-card border-border-glass'}`}
                                        animate={isActiveRoot ? { x: [0, 5, -5, 0] } : {}}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className={`w-12 shrink-0 flex items-center justify-center border-r font-mono text-sm font-black
                                            ${isActiveRoot ? 'bg-primary text-black border-primary'
                                                : isProbingTarget ? 'bg-warning text-black border-warning'
                                                    : 'bg-bg-elevated text-text-secondary border-border-glass'}`}
                                        >
                                            {i}
                                        </div>

                                        <div className="flex-1 p-3 flex items-center gap-2 flex-wrap">
                                            {bucket.length === 0 ? (
                                                <span className={`text-xs uppercase tracking-widest font-black ${isActiveRoot || isProbingTarget ? 'text-white' : 'text-text-muted/30'}`}>
                                                    (Empty)
                                                </span>
                                            ) : (
                                                <AnimatePresence>
                                                    {bucket.map((val, j) => (
                                                        <motion.div
                                                            key={`${i}-${j}-${val}`}
                                                            initial={{ scale: 0.5, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <div className="px-3 py-1.5 rounded-lg bg-bg-elevated border border-primary text-white font-mono text-sm shadow-md">
                                                                {val}
                                                            </div>
                                                            {j < bucket.length - 1 && method === 'chaining' && (
                                                                <div className="text-primary font-black">→</div>
                                                            )}
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            )}
                                        </div>

                                        {bucket.length > 1 && method === 'chaining' && (
                                            <div className="shrink-0 flex items-center px-4 bg-bg-elevated/50 border-l border-border-glass">
                                                <span className="text-[10px] font-black text-warning uppercase tracking-widest">
                                                    Chain: {bucket.length}
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </StitchVisualizerLayout>
    )
}

export default HashingVisualizer
