import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Plus, MousePointer2, Share2, Trash2 } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { playClick, playSuccess, playStep } from '../utils/SoundEngine'
import { say } from './mascot/MascotAssistant'
import StitchVisualizerLayout from './common/StitchVisualizerLayout'
import { GRAPH_ALGO_DATA } from '../data/graphAlgorithms'

function GraphVisualizer({ onBack, onNavigate }) {
    const [nodes, setNodes] = useState([])
    const [edges, setEdges] = useState([])
    const [mode, setMode] = useState('add-node') // add-node, add-edge, run
    const [algorithm, setAlgorithm] = useState('BFS')
    const [visitedNodes, setVisitedNodes] = useState([])
    const [activeNodes, setActiveNodes] = useState([])
    const [edgeStart, setEdgeStart] = useState(null)

    // Playback State
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [speed, setSpeed] = useState(500)

    // Refs
    const stopRef = useRef(false)
    const pauseRef = useRef(false)
    const speedRef = useRef(speed)
    const containerRef = useRef(null)

    const soundEnabled = useAppStore(s => s.soundEnabled)

    useEffect(() => { speedRef.current = speed }, [speed])

    const handleCanvasClick = (e) => {
        if (isRunning || !containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        if (mode === 'add-node') {
            const id = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 0
            setNodes([...nodes, { id, x, y }])
            if (soundEnabled) playClick()
        }
    }

    const handleNodeClick = (e, nodeId) => {
        e.stopPropagation()
        if (isRunning) return

        if (mode === 'add-edge') {
            if (edgeStart === null) {
                setEdgeStart(nodeId)
            } else if (edgeStart !== nodeId) {
                const exists = edges.some(edge =>
                    (edge.from === edgeStart && edge.to === nodeId) ||
                    (edge.from === nodeId && edge.to === edgeStart)
                )
                if (!exists) {
                    setEdges([...edges, { from: edgeStart, to: nodeId }])
                    if (soundEnabled) playClick()
                }
                setEdgeStart(null)
            }
        }
    }

    const checkState = async () => {
        if (stopRef.current) return true
        while (pauseRef.current) {
            await new Promise(r => setTimeout(r, 100))
            if (stopRef.current) return true
        }
        return false
    }

    const runAlgorithm = async () => {
        if (nodes.length === 0) return

        if (isRunning && isPaused) {
            setIsPaused(false)
            pauseRef.current = false
            return
        }

        stopRef.current = false
        pauseRef.current = false
        setIsRunning(true)
        setIsPaused(false)
        setVisitedNodes([])
        setActiveNodes([])

        if (soundEnabled) playClick()
        say(`Starting ${algorithm} from node ${nodes[0].id}`, 'thinking')

        const adj = {}
        nodes.forEach(n => adj[n.id] = [])
        edges.forEach(e => {
            adj[e.from].push(e.to)
            adj[e.to].push(e.from)
        })

        const startNode = nodes[0].id
        const order = []
        const visited = new Set()

        if (algorithm === 'BFS') {
            const queue = [startNode]
            visited.add(startNode)
            while (queue.length > 0) {
                if (await checkState()) return // Check eagerly
                const node = queue.shift()
                order.push(node)
                for (const neighbor of adj[node]) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor)
                        queue.push(neighbor)
                    }
                }
            }
        } else {
            // DFS
            const stack = [startNode]
            // Note: Standard DFS might visit differently depending on stack vs recursion order
            // This iterative stack DFS simulates standard recursion if neighbors pushed reverse order, but simplified here.
            const stackVisited = new Set()
            while (stack.length > 0) {
                if (await checkState()) return
                const node = stack.pop()
                if (!stackVisited.has(node)) {
                    stackVisited.add(node)
                    order.push(node)
                    for (const neighbor of adj[node]) {
                        if (!stackVisited.has(neighbor)) {
                            stack.push(neighbor)
                        }
                    }
                }
            }
        }

        // Animate
        for (let i = 0; i < order.length; i++) {
            if (await checkState()) return
            const nodeId = order[i]
            setActiveNodes([nodeId])
            setVisitedNodes(prev => [...prev, nodeId])
            if (soundEnabled) playStep(i, order.length)
            await new Promise(r => setTimeout(r, 1050 - speedRef.current))
        }

        setActiveNodes([])
        say(`${algorithm} completed! All reachable nodes visited.`, 'happy')
        if (soundEnabled) playSuccess()
        setIsRunning(false)
    }

    const handlePause = () => {
        setIsPaused(true)
        pauseRef.current = true
    }

    const resetGraph = () => {
        stopRef.current = true
        setNodes([])
        setEdges([])
        setVisitedNodes([])
        setActiveNodes([])
        setEdgeStart(null)
        setIsRunning(false)
        setIsPaused(false)
        if (soundEnabled) playClick()
    }

    const algoData = GRAPH_ALGO_DATA[algorithm] || { code: '', explanation: '', complexity: {} }

    // CONTROLS
    const Controls = (
        <>
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Protocol</h3>
                <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    disabled={isRunning}
                    className="w-full bg-bg-elevated border border-border-glass text-white text-sm rounded-lg p-2.5 focus:ring-primary focus:border-primary block"
                >
                    {['BFS', 'DFS'].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Tools</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setMode('add-node')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase transition-all ${mode === 'add-node' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-bg-elevated text-text-muted hover:bg-bg-elevated/80'}`}
                    >
                        <Plus size={14} /> Add Node
                    </button>
                    <button
                        onClick={() => setMode('add-edge')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase transition-all ${mode === 'add-edge' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-bg-elevated text-text-muted hover:bg-bg-elevated/80'}`}
                    >
                        <Share2 size={14} /> Add Edge
                    </button>
                </div>
                <div className="text-[10px] text-text-muted text-center italic mt-1">
                    {mode === 'add-node' ? 'Click canvas to place nodes' : 'Click start & end nodes to connect'}
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

            <div className="grid grid-cols-2 gap-3 mt-4">
                {!isRunning || isPaused ? (
                    <button onClick={runAlgorithm} className="lego-button col-span-2 bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-lg flex items-center justify-center gap-2 uppercase tracking-tighter shadow-lg shadow-primary/20">
                        <Play size={18} fill="currentColor" />
                        {isPaused ? "Resume" : "Traverse"}
                    </button>
                ) : (
                    <button onClick={handlePause} className="lego-button col-span-2 bg-accent-orange hover:bg-accent-orange/90 text-black font-black py-4 rounded-lg flex items-center justify-center gap-2 uppercase tracking-tighter">
                        <Pause size={18} fill="currentColor" />
                        Pause
                    </button>
                )}
                <button onClick={resetGraph} className="lego-button col-span-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 uppercase text-xs">
                    <RotateCcw size={14} />
                    Reset Graph
                </button>
                {onNavigate && (
                    <button onClick={() => onNavigate('graph3d')} className="lego-button col-span-2 mt-4 bg-[#00f0ff]/10 border border-[#00f0ff]/30 hover:bg-[#00f0ff]/20 text-[#00f0ff] font-bold py-3 rounded-lg flex items-center justify-center gap-2 uppercase text-xs transition-colors">
                        <Box size={14} />
                        Enter 3D Cyberspace
                    </button>
                )}
            </div>
        </>
    )

    const Metrics = (
        <>
            <div className="glass-panel p-4 rounded-xl border-l-4 border-accent-cyan bg-bg-dark/30">
                <p className="text-[10px] uppercase font-bold text-text-muted">Nodes</p>
                <p className="text-2xl font-black text-white tabular-nums">{nodes.length}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border-l-4 border-primary bg-bg-dark/30">
                <p className="text-[10px] uppercase font-bold text-text-muted">Edges</p>
                <p className="text-2xl font-black text-white tabular-nums">{edges.length}</p>
            </div>
        </>
    )

    const Logs = isRunning
        ? `Exploring graph using ${algorithm} traversal...`
        : visitedNodes.length > 0
            ? `Traversal complete. Visited ${visitedNodes.length} nodes.`
            : "Graph Environment Ready. Construct graph topology."

    return (
        <StitchVisualizerLayout
            title="Graph Theory"
            algoName={algorithm}
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={Logs}
            pseudocode={algoData.code}
            isSorted={visitedNodes.length === nodes.length && nodes.length > 0 && !isRunning}
            isRunning={isRunning}
        >
            <div
                ref={containerRef}
                onClick={handleCanvasClick}
                className="w-full h-full relative cursor-crosshair overflow-hidden"
            >
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {edges.map((edge, i) => {
                        const from = nodes.find(n => n.id === edge.from)
                        const to = nodes.find(n => n.id === edge.to)
                        return (
                            <line
                                key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                                stroke={visitedNodes.includes(edge.from) && visitedNodes.includes(edge.to) ? 'var(--primary)' : 'var(--border-glass)'}
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        )
                    })}
                    {/* Ghost line for active edge creation */}
                    {mode === 'add-edge' && edgeStart !== null && (
                        <line x1="0" y1="0" x2="0" y2="0" stroke="var(--accent-cyan)" strokeWidth="2" strokeDasharray="5,5" className="opacity-50" />
                    )}
                </svg>

                <AnimatePresence>
                    {nodes.map(node => (
                        <motion.div
                            key={node.id}
                            onClick={(e) => handleNodeClick(e, node.id)}
                            initial={{ scale: 0 }}
                            animate={{
                                scale: 1,
                                background: activeNodes.includes(node.id) ? 'var(--accent-orange)' :
                                    visitedNodes.includes(node.id) ? 'var(--primary)' : 'var(--bg-elevated)',
                                borderColor: edgeStart === node.id ? 'var(--accent-cyan)' :
                                    visitedNodes.includes(node.id) ? 'var(--primary)' : 'var(--border-glass)',
                                color: visitedNodes.includes(node.id) ? 'white' : 'var(--text-muted)',
                                boxShadow: activeNodes.includes(node.id) ? '0 0 20px var(--accent-orange)' : 'none'
                            }}
                            className="absolute size-10 rounded-full border-2 flex items-center justify-center font-bold cursor-pointer hover:scale-110 transition-transform z-10 select-none shadow-lg"
                            style={{
                                left: node.x - 20,
                                top: node.y - 20,
                            }}
                        >
                            {node.id}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {nodes.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-50">
                        <MousePointer2 size={48} className="text-text-muted mb-4" />
                        <h3 className="text-xl font-bold text-text-muted">Empty Canvas</h3>
                        <p className="text-text-muted">Click to add nodes</p>
                    </div>
                )}
            </div>
        </StitchVisualizerLayout>
    )
}

export default GraphVisualizer
