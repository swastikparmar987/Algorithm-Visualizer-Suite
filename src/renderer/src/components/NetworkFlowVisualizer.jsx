import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Activity, Droplets } from 'lucide-react'
import StitchVisualizerLayout from './common/StitchVisualizerLayout'
import { playStep, playSuccess, playClick, playTone } from '../utils/SoundEngine'
import { useAppStore } from '../store/useAppStore'

const NODES = [
    { id: 'S', x: 100, y: 200, label: 'Source (S)' },
    { id: 'A', x: 300, y: 100, label: 'A' },
    { id: 'B', x: 300, y: 300, label: 'B' },
    { id: 'C', x: 500, y: 100, label: 'C' },
    { id: 'D', x: 500, y: 300, label: 'D' },
    { id: 'T', x: 700, y: 200, label: 'Sink (T)' }
]

const INITIAL_EDGES = [
    { from: 'S', to: 'A', cap: 10, flow: 0 },
    { from: 'S', to: 'B', cap: 10, flow: 0 },
    { from: 'A', to: 'C', cap: 4, flow: 0 },
    { from: 'A', to: 'D', cap: 8, flow: 0 },
    { from: 'A', to: 'B', cap: 2, flow: 0 },
    { from: 'B', to: 'D', cap: 9, flow: 0 },
    { from: 'C', to: 'T', cap: 10, flow: 0 },
    { from: 'D', to: 'C', cap: 6, flow: 0 },
    { from: 'D', to: 'T', cap: 10, flow: 0 }
]

function NetworkFlowVisualizer({ onBack }) {
    const theme = useAppStore(s => s.theme)
    const soundEnabled = useAppStore(s => s.soundEnabled)

    const [edges, setEdges] = useState(INITIAL_EDGES)
    const [maxFlow, setMaxFlow] = useState(0)
    const [activeNode, setActiveNode] = useState(null)
    const [activeEdges, setActiveEdges] = useState([]) // Edges in the current augmenting path
    const [bottleneck, setBottleneck] = useState(null)

    // Control States
    const [speed, setSpeed] = useState(250)
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [logs, setLogs] = useState("Ready. Click Start Vis to run Edmonds-Karp.")

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
        setEdges(INITIAL_EDGES.map(e => ({ ...e, flow: 0 })))
        setMaxFlow(0)
        setActiveNode(null)
        setActiveEdges([])
        setBottleneck(null)
        stepsRef.current = 0
        say("Graph reset. Ready.")
    }

    // --- ALGORITHMS ---

    const runEdmondsKarp = async () => {
        let currentEdges = JSON.parse(JSON.stringify(INITIAL_EDGES))
        let totalFlow = 0

        // Build adjacency matrix for residual capacities
        const buildResidualGraph = (edges) => {
            const graph = {}
            NODES.forEach(n => graph[n.id] = {})
            edges.forEach(e => {
                graph[e.from][e.to] = e.cap - e.flow
                graph[e.to][e.from] = e.flow // Backwards edge has capacity equal to current flow
            })
            return graph
        }

        const bfs = async (residualGraph, source, sink) => {
            const visited = new Set([source])
            const queue = [[source]]

            while (queue.length > 0) {
                if (await checkState()) return null
                const path = queue.shift()
                const u = path[path.length - 1]

                setActiveNode(u)
                if (soundEnabled) playTone(300 + path.length * 50, 50, 'sine')
                await new Promise(r => setTimeout(r, Math.max(50, (1050 - speedRef.current) / 4)))

                if (u === sink) {
                    return path
                }

                for (const v in residualGraph[u]) {
                    if (!visited.has(v) && residualGraph[u][v] > 0) {
                        visited.add(v)
                        queue.push([...path, v])
                    }
                }
            }
            return null
        }

        while (true) {
            if (await checkState()) return
            say(`Searching for an augmenting path using BFS...`)

            const residualGraph = buildResidualGraph(currentEdges)
            const path = await bfs(residualGraph, 'S', 'T')

            if (await checkState()) return

            if (!path) {
                say(`No augmenting path found. Max Flow is ${totalFlow}.`)
                setActiveNode(null)
                setActiveEdges([])
                setBottleneck(null)
                if (soundEnabled) playSuccess()
                break
            }

            // Find bottleneck
            stepsRef.current++
            let pathBottleneck = Infinity
            const pathEdges = []

            for (let i = 0; i < path.length - 1; i++) {
                const u = path[i], v = path[i + 1]
                pathBottleneck = Math.min(pathBottleneck, residualGraph[u][v])

                // Track edge for visualization (could be forward or backward)
                const isForward = currentEdges.find(e => e.from === u && e.to === v)
                if (isForward) {
                    pathEdges.push({ from: u, to: v, forward: true })
                } else {
                    pathEdges.push({ from: v, to: u, forward: false })
                }
            }

            setBottleneck(pathBottleneck)
            setActiveEdges(pathEdges)

            say(`Found augmenting path: ${path.join(' -> ')} with bottleneck capacity ${pathBottleneck}`)
            if (soundEnabled) playTone(600, 200, 'square')
            await new Promise(r => setTimeout(r, 1050 - speedRef.current))

            if (await checkState()) return

            // Augment flow
            say(`Pushing ${pathBottleneck} units of flow...`)
            for (let i = 0; i < path.length - 1; i++) {
                const u = path[i], v = path[i + 1]

                const forwardEdge = currentEdges.find(e => e.from === u && e.to === v)
                if (forwardEdge) {
                    forwardEdge.flow += pathBottleneck
                } else {
                    const backwardEdge = currentEdges.find(e => e.from === v && e.to === u)
                    backwardEdge.flow -= pathBottleneck
                }
            }

            totalFlow += pathBottleneck
            setEdges([...currentEdges])
            setMaxFlow(totalFlow)

            if (soundEnabled) playStep()
            await new Promise(r => setTimeout(r, 1050 - speedRef.current))

            setActiveEdges([])
            setBottleneck(null)
        }
    }

    const processStart = async () => {
        setIsRunning(true)
        setIsPaused(false)
        setEdges(INITIAL_EDGES.map(e => ({ ...e, flow: 0 })))
        setMaxFlow(0)
        setActiveNode(null)
        setActiveEdges([])
        setBottleneck(null)
        stepsRef.current = 0
        if (soundEnabled) playClick()

        await new Promise(r => setTimeout(r, 50))
        await runEdmondsKarp()

        setIsRunning(false)
        isRunningRef.current = false
    }

    // --- RENDERING ---

    const Controls = (
        <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Algorithm Target</h3>
            <div className="grid grid-cols-1 gap-2">
                <button
                    className="py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left flex items-center justify-between group bg-primary/20 text-primary border border-primary/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                >
                    <span>Edmonds-Karp</span>
                    <Activity size={14} className="animate-pulse" />
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
                    type="range" min="50" max="1000" step="50"
                    value={1050 - speed}
                    onChange={(e) => setSpeed(1050 - parseInt(e.target.value))}
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
                <button onClick={resetVis} className="p-3 rounded-lg bg-bg-elevated border border-border-glass hover:bg-white/10 transition-colors text-white">
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
                    <Droplets size={12} className="text-accent-cyan" /> Max Flow
                </p>
                <p className="text-3xl font-mono text-accent-cyan font-black mt-1 relative z-10">{maxFlow}</p>
            </div>
            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass">
                <p className="text-[10px] font-black tracking-widest text-text-muted uppercase">Augmenting Paths</p>
                <p className="text-xl font-mono text-white mt-1 uppercase tracking-tighter">{stepsRef.current}</p>
            </div>
        </div>
    )

    // Helper to draw SVG arrows
    const renderEdge = (edge, idx) => {
        const u = NODES.find(n => n.id === edge.from)
        const v = NODES.find(n => n.id === edge.to)
        if (!u || !v) return null

        // Calculate line angle and distance for positioning the label
        const dx = v.x - u.x
        const dy = v.y - u.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Offset start/end to not overlap nodes
        const nodeRadius = 25
        const startX = u.x + (dx / distance) * nodeRadius
        const startY = u.y + (dy / distance) * nodeRadius
        const endX = v.x - (dx / distance) * nodeRadius
        const endY = v.y - (dy / distance) * nodeRadius

        const midX = (startX + endX) / 2
        const midY = (startY + endY) / 2

        const isActive = activeEdges.some(ae => ae.from === edge.from && ae.to === edge.to)
        const isSaturated = edge.flow === edge.cap
        const pathData = `M ${startX} ${startY} L ${endX} ${endY}`

        let strokeColor = 'var(--border-glass)'
        if (isActive) strokeColor = 'var(--accent-orange)'
        else if (isSaturated) strokeColor = 'var(--accent-cyan)'
        else if (edge.flow > 0) strokeColor = 'var(--primary)'

        return (
            <g key={`edge-${idx}`}>
                {/* Invisible thicker line for better hover/click if needed, or just visual base */}
                <path d={pathData} stroke={strokeColor} strokeWidth="4" fill="none" className="transition-all duration-300" opacity={isActive ? 1 : 0.6} />

                {/* Animated dash array if flow is active */}
                {edge.flow > 0 && !isSaturated && !isActive && (
                    <motion.path
                        d={pathData}
                        stroke="var(--primary)"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="10 10"
                        animate={{ strokeDashoffset: -20 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                )}

                {/* Arrowhead marker definition is assumed in SVG defs, but we can draw a small triangle here */}
                <polygon
                    points="0,-5 10,0 0,5"
                    fill={strokeColor}
                    transform={`translate(${endX}, ${endY}) rotate(${Math.atan2(dy, dx) * 180 / Math.PI})`}
                    className="transition-colors duration-300"
                />

                {/* Flow / Capacity Label */}
                <g transform={`translate(${midX}, ${midY})`}>
                    <rect x="-24" y="-12" width="48" height="24" rx="4" fill="#1e1e24" stroke={strokeColor} strokeWidth="2" />
                    <text x="0" y="4" textAnchor="middle" fill={isSaturated ? '#22d3ee' : '#fff'} fontSize="11" fontWeight="900" fontFamily="monospace">
                        {edge.flow}/{edge.cap}
                    </text>
                </g>
            </g>
        )
    }

    return (
        <StitchVisualizerLayout
            title="Network Flow"
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={logs}
        >
            <div className="relative w-full h-full flex flex-col items-center justify-center p-8 overflow-hidden bg-[#0A0A0F]">

                <svg width="800" height="400" viewBox="0 0 800 400" style={{ overflow: 'visible' }}>
                    {/* Edges Layer */}
                    {edges.map((e, i) => renderEdge(e, i))}

                    {/* Nodes Layer */}
                    {NODES.map(node => (
                        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                            <circle
                                r="25"
                                fill={activeNode === node.id ? '#a855f7' : (node.id === 'S' || node.id === 'T') ? '#fb923c' : '#2A2A35'}
                                stroke={activeNode === node.id ? '#fff' : '#fff'}
                                strokeWidth="3"
                                className="transition-all duration-300"
                            />
                            <text
                                x="0" y="6"
                                textAnchor="middle"
                                fill={activeNode === node.id || node.id === 'S' || node.id === 'T' ? '#000' : '#fff'}
                                fontSize="16" fontWeight="bold" fontFamily="system-ui"
                            >
                                {node.id}
                            </text>
                        </g>
                    ))}
                </svg>

                {/* Legend Context */}
                {bottleneck && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-bg-elevated border border-accent-orange/50 px-6 py-3 rounded-full text-accent-orange font-black italic shadow-[0_0_20px_rgba(251,146,60,0.2)]"
                    >
                        Pushing Bottleneck Flow +{bottleneck}
                    </motion.div>
                )}
            </div>
        </StitchVisualizerLayout>
    )
}

export default NetworkFlowVisualizer
