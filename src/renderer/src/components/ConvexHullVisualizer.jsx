import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Hexagon, Activity, Share2 } from 'lucide-react'
import StitchVisualizerLayout from './common/StitchVisualizerLayout'
import { useAppStore } from '../store/useAppStore'
import { playTone, playSuccess, playClick, playStep } from '../utils/SoundEngine'

function ConvexHullVisualizer({ onBack }) {
    const theme = useAppStore(s => s.theme)
    const soundEnabled = useAppStore(s => s.soundEnabled)

    const [points, setPoints] = useState(() => generatePoints(30))
    const [hull, setHull] = useState([])
    const [activeIdx, setActiveIdx] = useState(-1)
    const [scanLine, setScanLine] = useState([]) // [p1, p2]

    // Control States
    const [algo, setAlgo] = useState('graham')
    const [speed, setSpeed] = useState(150)
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [logs, setLogs] = useState("Ready. Select an algorithm and click Start Vis.")

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
        setHull([])
        setActiveIdx(-1)
        setScanLine([])
        stepsRef.current = 0
        say("Canvas reset. Ready.")
    }

    const regeneratePoints = () => {
        resetVis()
        setPoints(generatePoints(30))
        say("New points generated.")
    }

    function generatePoints(n) {
        return Array.from({ length: n }, () => ({
            id: Math.random().toString(36).substring(2, 9),
            x: Math.random() * 600 + 100,
            y: Math.random() * 300 + 50
        }))
    }

    const crossProduct = (O, A, B) => (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x)

    // --- ALGORITHMS ---

    const grahamScan = async () => {
        say("Sorting points radially...")
        // Find bottom-most point
        let startPoint = points[0]
        for (let i = 1; i < points.length; i++) {
            if (points[i].y > startPoint.y || (points[i].y === startPoint.y && points[i].x < startPoint.x)) {
                startPoint = points[i]
            }
        }

        // Sort relative to startPoint
        const pts = [...points].sort((a, b) => {
            if (a === startPoint) return -1
            if (b === startPoint) return 1
            const cp = crossProduct(startPoint, a, b)
            if (cp === 0) {
                const distA = Math.hypot(a.x - startPoint.x, a.y - startPoint.y)
                const distB = Math.hypot(b.x - startPoint.x, b.y - startPoint.y)
                return distA - distB
            }
            return cp > 0 ? -1 : 1
        })

        if (await checkState()) return

        const stack = [pts[0], pts[1]]
        setHull([...stack])

        say("Beginning Graham Scan construction...")
        for (let i = 2; i < pts.length; i++) {
            if (await checkState()) return
            let p = pts[i]
            setActiveIdx(points.findIndex(pt => pt.id === p.id))

            while (stack.length > 1) {
                if (await checkState()) return;
                const top = stack[stack.length - 1]
                const nextToTop = stack[stack.length - 2]

                setScanLine([nextToTop, top, p]) // Visualize angle check

                if (soundEnabled) playTone(400, 50, 'sine')
                await new Promise(r => setTimeout(r, Math.max(50, (600 - speedRef.current) / 2)))
                stepsRef.current++

                if (crossProduct(nextToTop, top, p) <= 0) {
                    say("Right turn detected. Removing point from hull.")
                    stack.pop()
                    setHull([...stack])
                    if (soundEnabled) playTone(200, 100, 'square')
                    await new Promise(r => setTimeout(r, 600 - speedRef.current))
                } else {
                    say("Left turn detected. Keeping point.")
                    break
                }
            }

            stack.push(p)
            setHull([...stack])
            if (soundEnabled) playStep()
            await new Promise(r => setTimeout(r, 600 - speedRef.current))
        }

        if (await checkState()) return
        stack.push(pts[0]) // Close hull
        setHull([...stack])
        setScanLine([])
        setActiveIdx(-1)
        say(`Graham Scan complete. Convex Hull has ${stack.length - 1} vertices.`)
        if (soundEnabled) playSuccess()
    }

    const jarvisMarch = async () => {
        say("Finding leftmost point...")
        let leftmost = 0
        for (let i = 1; i < points.length; i++) {
            if (points[i].x < points[leftmost].x) leftmost = i
        }

        const result = []
        let p = leftmost
        let q;

        do {
            if (await checkState()) return
            result.push(points[p])
            setHull([...result])
            setActiveIdx(p)

            say(`Added point to hull. Searching for next point...`)
            if (soundEnabled) playStep()

            q = (p + 1) % points.length

            for (let i = 0; i < points.length; i++) {
                if (await checkState()) return

                setScanLine([points[p], points[i]])
                stepsRef.current++

                if (soundEnabled) playTone(300 + (i * 10), 30, 'sine')
                await new Promise(r => setTimeout(r, Math.max(20, (600 - speedRef.current) / 4)))

                if (crossProduct(points[p], points[i], points[q]) < 0) {
                    q = i
                }
            }

            p = q
        } while (p !== leftmost)

        if (await checkState()) return
        result.push(points[p]) // Close hull
        setHull(result)
        setScanLine([])
        setActiveIdx(-1)
        say(`Jarvis March complete. Convex Hull has ${result.length - 1} vertices.`)
        if (soundEnabled) playSuccess()
    }

    const processStart = async () => {
        setIsRunning(true)
        setIsPaused(false)
        setHull([])
        setActiveIdx(-1)
        setScanLine([])
        stepsRef.current = 0
        if (soundEnabled) playClick()

        await new Promise(r => setTimeout(r, 50))

        if (algo === 'graham') await grahamScan()
        else await jarvisMarch()

        setIsRunning(false)
        isRunningRef.current = false
    }

    // --- RENDERING ---

    const Controls = (
        <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Algorithm Target</h3>
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => !isRunning && setAlgo('graham')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-center ${algo === 'graham' ? 'bg-primary/20 text-primary border border-primary/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-bg-elevated text-text-muted border border-border-glass hover:bg-white/5'}`}
                >
                    Graham Scan
                </button>
                <button
                    onClick={() => !isRunning && setAlgo('jarvis')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-center ${algo === 'jarvis' ? 'bg-primary/20 text-primary border border-primary/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-bg-elevated text-text-muted border border-border-glass hover:bg-white/5'}`}
                >
                    Jarvis March
                </button>
            </div>

            <div className="h-px w-full bg-border-glass my-4"></div>

            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Execution</h3>
            <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-text-muted uppercase">
                    <span>Speed</span>
                    <span className="font-mono bg-bg-elevated px-2 py-1 rounded text-primary">{speed}ms</span>
                </div>
                <input
                    type="range" min="10" max="600" step="10"
                    value={610 - speed}
                    onChange={(e) => setSpeed(610 - parseInt(e.target.value))}
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
                        <Play size={16} fill="currentColor" /> Start Vis
                    </button>
                )}
                <button onClick={regeneratePoints} disabled={isRunning} className="p-3 rounded-lg bg-bg-elevated border border-border-glass hover:bg-white/10 transition-colors text-white" title="Regenerate Points">
                    <RotateCcw size={16} />
                </button>
            </div>
        </div>
    )

    const Metrics = (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                <p className="flex items-center gap-2 text-[10px] font-black tracking-widest text-text-muted uppercase relative z-10">
                    <Hexagon size={12} className="text-accent-pink" /> Vertices
                </p>
                <p className="text-3xl font-mono text-accent-pink font-black mt-1 relative z-10">{Math.max(0, hull.length - 1)}</p>
            </div>
            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass">
                <p className="text-[10px] font-black tracking-widest text-text-muted uppercase">Comparisons</p>
                <p className="text-xl font-mono text-white mt-1 uppercase tracking-tighter">{stepsRef.current}</p>
            </div>
        </div>
    )

    return (
        <StitchVisualizerLayout
            title="Convex Hull"
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={logs}
        >
            <div className="relative w-full h-full flex flex-col items-center justify-center p-8 overflow-hidden bg-[#0A0A0F]">
                <svg width="800" height="400" viewBox="0 0 800 400" style={{ overflow: 'visible' }}>

                    {/* Fill Hull Polygon */}
                    <AnimatePresence>
                        {hull.length > 2 && (
                            <motion.polygon
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                points={hull.map(p => `${p.x},${p.y}`).join(' ')}
                                fill="rgba(236, 72, 153, 0.1)" // accent-pink with opacity
                                stroke="var(--accent-pink)"
                                strokeWidth="2"
                                strokeLinejoin="round"
                            />
                        )}
                        {hull.length === 2 && (
                            <motion.line
                                x1={hull[0].x} y1={hull[0].y} x2={hull[1].x} y2={hull[1].y}
                                stroke="var(--accent-pink)" strokeWidth="2"
                            />
                        )}
                    </AnimatePresence>

                    {/* Scan Line */}
                    {scanLine.length >= 2 && (
                        <motion.path
                            d={`M ${scanLine[0].x} ${scanLine[0].y} L ${scanLine[1].x} ${scanLine[1].y} ${scanLine.length > 2 ? `L ${scanLine[2].x} ${scanLine[2].y}` : ''}`}
                            stroke="var(--accent-cyan)"
                            strokeWidth="2"
                            strokeDasharray="6 6"
                            fill="none"
                        />
                    )}

                    {/* Points */}
                    {points.map((p, i) => {
                        const inHull = hull.some(hp => hp.id === p.id)
                        const isActive = activeIdx === i
                        return (
                            <motion.circle
                                key={p.id}
                                cx={p.x}
                                cy={p.y}
                                r={isActive ? 8 : inHull ? 6 : 4}
                                fill={isActive ? 'var(--accent-cyan)' : inHull ? 'var(--accent-pink)' : 'var(--text-muted)'}
                                stroke={isActive || inHull ? '#fff' : 'none'}
                                strokeWidth={isActive ? 3 : inHull ? 2 : 0}
                                animate={{
                                    r: isActive ? 8 : inHull ? 6 : 4,
                                    fill: isActive ? '#22d3ee' : inHull ? '#ec4899' : '#8b8b9e'
                                }}
                                transition={{ duration: 0.2 }}
                            />
                        )
                    })}
                </svg>
            </div>
        </StitchVisualizerLayout>
    )
}

export default ConvexHullVisualizer
