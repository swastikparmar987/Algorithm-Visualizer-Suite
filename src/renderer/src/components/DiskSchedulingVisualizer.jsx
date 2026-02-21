import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, HardDrive, Plus, Map } from 'lucide-react'
import StitchVisualizerLayout from './common/StitchVisualizerLayout'
import { playTone, playSuccess, playClick, playStep } from '../utils/SoundEngine'
import { useAppStore } from '../store/useAppStore'

function DiskSchedulingVisualizer({ onBack }) {
    const theme = useAppStore(s => s.theme)
    const soundEnabled = useAppStore(s => s.soundEnabled)

    const initialRequests = [98, 183, 37, 122, 14, 124, 65, 67]
    const maxTrack = 199

    const [requests, setRequests] = useState(initialRequests)
    const [algorithm, setAlgorithm] = useState('fcfs')
    const [headStart, setHeadStart] = useState(53)

    // Simulation state
    const [currentHead, setCurrentHead] = useState(53)
    const [pathPoints, setPathPoints] = useState([]) // Array of {track, id}
    const [visitOrder, setVisitOrder] = useState([]) // Order of track visits
    const [totalSeek, setTotalSeek] = useState(0)

    // Animation States
    const [activeTarget, setActiveTarget] = useState(-1)

    // Control States
    const [speed, setSpeed] = useState(200)
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [logs, setLogs] = useState("Ready. Select disk scheduling algorithm and run.")

    const speedRef = useRef(speed)
    const isPausedRef = useRef(isPaused)
    const isRunningRef = useRef(isRunning)
    const totalSeekRef = useRef(0)

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
        setCurrentHead(headStart)
        setPathPoints([])
        setVisitOrder([])
        setTotalSeek(0)
        totalSeekRef.current = 0
        setActiveTarget(-1)
        say("Disk scheduler reset. Ready.")
    }

    const addRequest = () => {
        if (isRunning) return
        const newTrack = Math.floor(Math.random() * (maxTrack + 1))
        setRequests([...requests, newTrack])
        if (soundEnabled) playClick()
    }

    const removeRequest = (idx) => {
        if (isRunning) return
        setRequests(requests.filter((_, i) => i !== idx))
        if (soundEnabled) playClick()
    }

    const moveHead = async (from, to) => {
        const seek = Math.abs(to - from)
        say(`Moving head: ${from} → ${to} (seek: ${seek})`)

        const steps = 15
        for (let s = 1; s <= steps; s++) {
            if (await checkState()) return false
            const pos = from + (to - from) * (s / steps)
            setCurrentHead(pos)

            // Audio mapping: Pitch goes up as track numbers go up
            if (s % 3 === 0 && soundEnabled) {
                playTone(200 + (pos / maxTrack) * 600, 15, 'sine')
            }

            await new Promise(r => setTimeout(r, Math.max(10, (600 - speedRef.current) / steps)))
        }

        totalSeekRef.current += seek
        setTotalSeek(totalSeekRef.current)
        setCurrentHead(to)

        if (soundEnabled) playStep()
        return true
    }

    const getSequence = () => {
        let sequence = []
        let currentPos = headStart

        // Use a shallow copy to safely mutate
        const reqs = [...requests]

        if (algorithm === 'fcfs') {
            sequence = [...reqs]
        }
        else if (algorithm === 'sstf') {
            let pending = [...reqs]
            while (pending.length > 0) {
                let closestIdx = 0
                let minDiff = Math.abs(pending[0] - currentPos)
                for (let i = 1; i < pending.length; i++) {
                    const diff = Math.abs(pending[i] - currentPos)
                    if (diff < minDiff) {
                        minDiff = diff
                        closestIdx = i
                    }
                }
                sequence.push(pending[closestIdx])
                currentPos = pending[closestIdx]
                pending.splice(closestIdx, 1)
            }
        }
        else if (algorithm === 'scan') {
            const sorted = [...new Set([...reqs])].sort((a, b) => a - b)
            const right = sorted.filter(r => r >= currentPos)
            const left = sorted.filter(r => r < currentPos).reverse()

            sequence = [...right]
            if (right[right.length - 1] !== maxTrack && left.length > 0) {
                sequence.push(maxTrack) // head touches the end
            }
            sequence = [...sequence, ...left]
        }
        else if (algorithm === 'c-scan') {
            const sorted = [...new Set([...reqs])].sort((a, b) => a - b)
            const right = sorted.filter(r => r >= currentPos)
            const left = sorted.filter(r => r < currentPos)

            sequence = [...right]
            if (right[right.length - 1] !== maxTrack && left.length > 0) {
                sequence.push(maxTrack) // head touches the end
                sequence.push(0) // jump to 0
            }
            sequence = [...sequence, ...left]
        }
        else if (algorithm === 'look') {
            const sorted = [...new Set([...reqs])].sort((a, b) => a - b)
            const right = sorted.filter(r => r >= currentPos)
            const left = sorted.filter(r => r < currentPos).reverse()
            sequence = [...right, ...left]
        }
        else if (algorithm === 'c-look') {
            const sorted = [...new Set([...reqs])].sort((a, b) => a - b)
            const right = sorted.filter(r => r >= currentPos)
            const left = sorted.filter(r => r < currentPos)
            sequence = [...right, ...left]
        }
        return sequence
    }

    const processStart = async () => {
        if (requests.length === 0) {
            say("No requests in queue. Please add requests.")
            return
        }
        setIsRunning(true)
        setIsPaused(false)
        setCurrentHead(headStart)
        totalSeekRef.current = 0
        setTotalSeek(0)

        if (soundEnabled) playClick()
        await new Promise(r => setTimeout(r, 50))

        const sequence = getSequence()
        say(`Generated sequence for ${algorithm.toUpperCase()}: [${sequence.join(', ')}]`)

        let paths = [{ track: headStart, id: 'start' }]
        setPathPoints(paths)
        setVisitOrder([])

        let pos = headStart

        for (let i = 0; i < sequence.length; i++) {
            if (await checkState()) return

            const target = sequence[i]
            setActiveTarget(target)

            const success = await moveHead(pos, target)
            if (!success) return

            paths.push({ track: target, id: `p${i}` })
            setPathPoints([...paths])

            // Only add to visit order if it was an actual request (not just hitting end bounds for SCAN)
            if (requests.includes(target) || (algorithm.includes('scan') && (target === 0 || target === maxTrack))) {
                setVisitOrder(prev => [...prev, target])
            }

            pos = target
            await new Promise(r => setTimeout(r, Math.max(50, 600 - speedRef.current)))
        }

        if (await checkState()) return
        setActiveTarget(-1)
        say(`Scheduling complete. Total seek time: ${totalSeekRef.current}`)
        if (soundEnabled) playSuccess()

        setIsRunning(false)
        isRunningRef.current = false
    }

    // --- RENDERING ---

    const Controls = (
        <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Algorithm Configuration</h3>

            <div className="grid grid-cols-2 gap-2">
                {['fcfs', 'sstf', 'scan', 'c-scan', 'look', 'c-look'].map(alg => (
                    <button
                        key={alg}
                        disabled={isRunning}
                        onClick={() => { setAlgorithm(alg); if (soundEnabled) playClick(); }}
                        className={`py-2 px-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap overflow-hidden text-ellipsis
                            ${algorithm === alg
                                ? 'bg-primary text-black shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                                : 'bg-bg-elevated border border-border-glass text-text-muted hover:text-white disabled:opacity-50'}`}
                    >
                        {alg.replace('-', ' ')}
                    </button>
                ))}
            </div>

            <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center text-[10px] font-black text-text-muted uppercase tracking-widest">
                    <span>Initial Head Pos</span>
                    <span className="font-mono text-white">{headStart}</span>
                </div>
                <input
                    type="range" min="0" max={maxTrack} step="1"
                    value={headStart}
                    onChange={(e) => {
                        const val = parseInt(e.target.value)
                        setHeadStart(val)
                        if (!isRunning) setCurrentHead(val)
                    }}
                    disabled={isRunning}
                    className="w-full accent-primary"
                />
            </div>

            <div className="h-px w-full bg-border-glass my-4"></div>

            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Track Requests</h3>

            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                    {requests.map((r, i) => (
                        <motion.div
                            key={`req-${i}-${r}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                borderColor: visitOrder.includes(r) ? 'var(--accent-cyan)' : r === activeTarget ? 'var(--accent-orange)' : 'var(--border-glass)',
                                backgroundColor: visitOrder.includes(r) ? 'rgba(6, 182, 212, 0.2)' : r === activeTarget ? 'rgba(251, 146, 60, 0.2)' : 'var(--bg-elevated)'
                            }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="px-3 py-1 bg-bg-elevated/50 rounded flex items-center gap-2 border transition-colors group cursor-pointer"
                            onClick={() => removeRequest(i)}
                        >
                            <span className="font-mono text-white text-xs">{r}</span>
                            <span className="text-danger opacity-0 group-hover:opacity-100 transition-opacity"><RotateCcw size={10} className="rotate-45" /></span>
                        </motion.div>
                    ))}
                    {requests.length === 0 && (
                        <div className="text-xs text-text-muted italic w-full text-center py-2">Queue is empty</div>
                    )}
                </AnimatePresence>
            </div>

            <button
                onClick={addRequest}
                disabled={isRunning}
                className="w-full py-2 bg-bg-elevated border border-border-glass border-dashed hover:border-primary/50 text-text-muted hover:text-white rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50 mt-2"
            >
                <Plus size={14} /> <span className="text-[10px] font-black tracking-widest uppercase">Random Track</span>
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

    const Metrics = (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass col-span-2 flex justify-between items-center">
                <div>
                    <p className="flex items-center gap-2 text-[10px] font-black tracking-widest text-text-muted uppercase">
                        <Map size={12} className="text-accent-cyan" /> Total Seek Time
                    </p>
                    <p className="text-2xl font-mono text-accent-cyan font-black mt-1">
                        {totalSeek} <span className="text-sm text-text-muted">cylinders</span>
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black tracking-widest text-text-muted uppercase">Pending</p>
                    <p className="text-xl font-mono font-black mt-1 text-white">{requests.length - visitOrder.filter(v => requests.includes(v)).length}</p>
                </div>
            </div>
        </div>
    )

    return (
        <StitchVisualizerLayout
            title="Disk Scheduling"
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={logs}
        >
            <div className="relative w-full h-full flex flex-col p-8 bg-[#0A0A0F] gap-6 overflow-hidden">

                {/* 2D Path Visualization */}
                <div className="flex-1 bg-bg-elevated border border-border-glass rounded-2xl p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-4 relative z-10">
                        <HardDrive className="text-primary" size={24} />
                        <h4 className="text-lg font-black tracking-widest text-white uppercase">Disk Platter Trace</h4>
                    </div>

                    <div className="w-full flex-1 relative mt-4">
                        {/* Track Ruler */}
                        <div className="absolute top-0 left-0 right-0 h-8 flex justify-between items-center px-4 font-mono text-[10px] text-text-muted select-none border-b border-border-glass">
                            <span>0</span>
                            <span>{Math.floor(maxTrack / 2)}</span>
                            <span>{maxTrack}</span>
                        </div>

                        {/* Rendering the Seek Path Graph in SVG */}
                        <div className="absolute top-8 left-4 right-4 bottom-4 mt-4">
                            <svg width="100%" height="100%" preserveAspectRatio="none" className="overflow-visible">
                                <defs>
                                    <linearGradient id="pathGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
                                        <stop offset="100%" stopColor="var(--accent-orange)" stopOpacity="0.8" />
                                    </linearGradient>
                                </defs>

                                {/* Vertical Track Guides */}
                                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
                                    <line key={`guide-${i}`} x1={`${pct * 100}%`} y1="0" x2={`${pct * 100}%`} y2="100%" stroke="var(--border-glass)" strokeWidth="1" strokeDasharray="4 4" />
                                ))}

                                {/* Requests Points (Vertical Lines/Dots) */}
                                {requests.map((r, i) => (
                                    <line key={`req-v-${i}`} x1={`${(r / maxTrack) * 100}%`} y1="0" x2={`${(r / maxTrack) * 100}%`} y2="100%" stroke="var(--border-glass)" strokeWidth="1" strokeOpacity="0.5" />
                                ))}

                                {/* Active Target Line */}
                                {activeTarget !== -1 && (
                                    <line x1={`${(activeTarget / maxTrack) * 100}%`} y1="0" x2={`${(activeTarget / maxTrack) * 100}%`} y2="100%" stroke="var(--accent-orange)" strokeWidth="2" strokeDasharray="4 4" className="opacity-50" />
                                )}

                                {/* Computed Path Traversal */}
                                {pathPoints.length > 0 && (
                                    <polyline
                                        points={pathPoints.map((p, i) => {
                                            const y = (i / Math.max(1, pathPoints.length - 1)) * 100;
                                            return `${(p.track / maxTrack) * 100},${y}`
                                        }).join(' ')}
                                        fill="none"
                                        stroke="url(#pathGradient)"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                )}

                                {/* Nodes on Path */}
                                {pathPoints.map((p, i) => {
                                    const y = (i / Math.max(1, pathPoints.length - 1)) * 100;
                                    return (
                                        <g key={`node-${i}`}>
                                            <circle cx={`${(p.track / maxTrack) * 100}%`} cy={`${y}%`} r="6" fill="var(--bg-elevated)" stroke="var(--primary)" strokeWidth="2" />
                                            {i > 0 && (
                                                <text x={`${(p.track / maxTrack) * 100}%`} y={`${y}%`} dx="12" dy="4" fill="var(--text-muted)" fontSize="10" fontFamily="monospace" className="select-none">
                                                    {p.track}
                                                </text>
                                            )}
                                        </g>
                                    )
                                })}

                                {/* Current Head Position Marker */}
                                <motion.circle
                                    animate={{
                                        cx: `${(currentHead / maxTrack) * 100}%`,
                                        cy: pathPoints.length > 0 ? '100%' : '50%'
                                    }}
                                    r="8"
                                    transition={{ duration: 0.1 }}
                                    fill="var(--accent-cyan)"
                                    style={{ filter: 'drop-shadow(0 0 10px var(--accent-cyan))' }}
                                />

                            </svg>
                        </div>
                    </div>
                </div>

            </div>
        </StitchVisualizerLayout>
    )
}

export default DiskSchedulingVisualizer
