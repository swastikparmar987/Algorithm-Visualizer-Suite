import React, { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Html, Line, Sphere, Sky, Environment } from '@react-three/drei'
import { Play, Pause, RotateCcw, Plus, Box, BoxSelect, Share2 } from 'lucide-react'
import * as THREE from 'three'
import { useAppStore } from '../store/useAppStore'
import { playClick, playSuccess, playStep } from '../utils/SoundEngine'
import { say } from './mascot/MascotAssistant'
import StitchVisualizerLayout from './common/StitchVisualizerLayout'
import { GRAPH_ALGO_DATA } from '../data/graphAlgorithms'

// Pre-defined layout for nodes to spawn in 3D space
const RANDOM_BOUNDS = 10;

function Node3D({ position, id, isActive, isVisited, onClick, scale = 1 }) {
    const mesh = useRef()

    // Animate active nodes
    useFrame((state) => {
        if (!mesh.current) return
        if (isActive) {
            const s = scale + Math.sin(state.clock.elapsedTime * 10) * 0.2
            mesh.current.scale.set(s, s, s)
        } else if (mesh.current.scale.x !== scale) {
            mesh.current.scale.set(scale, scale, scale)
        }
    })

    const color = isActive ? '#00f0ff' : isVisited ? '#7000ff' : '#4a4a6a'
    const emissive = isActive ? '#00f0ff' : isVisited ? '#7000ff' : '#2a2a4a'
    const emissiveIntensity = isActive ? 2 : isVisited ? 1 : 0.5

    return (
        <group position={position} onClick={(e) => { e.stopPropagation(); onClick(id); }}>
            <Sphere ref={mesh} args={[0.6, 32, 32]}>
                <meshStandardMaterial
                    color={color}
                    emissive={emissive}
                    emissiveIntensity={emissiveIntensity}
                    roughness={0.2}
                    metalness={0.8}
                />
            </Sphere>
            <Html position={[0, 1.2, 0]} center>
                <div style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textShadow: '0 0 4px #000, 0 0 4px #000',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    fontFamily: 'monospace'
                }}>
                    {id}
                </div>
            </Html>
        </group>
    )
}

function Edge3D({ start, end, isVisited }) {
    const color = isVisited ? '#00f0ff' : '#4a4a6a'
    const points = [
        new THREE.Vector3(...start),
        new THREE.Vector3(...end)
    ]
    return (
        <Line
            points={points}
            color={color}
            lineWidth={isVisited ? 4 : 2}
            dashed={!isVisited}
            dashScale={5}
            dashSize={1}
            dashOffset={0}
        />
    )
}

export default function GraphVisualizer3D({ onBack }) {
    const [nodes, setNodes] = useState([])
    const [edges, setEdges] = useState([])
    const [mode, setMode] = useState('add-node')
    const [algorithm, setAlgorithm] = useState('BFS')
    const [visitedNodes, setVisitedNodes] = useState([])
    const [activeNodes, setActiveNodes] = useState([])
    const [edgeStart, setEdgeStart] = useState(null)

    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [speed, setSpeed] = useState(500)

    const stopRef = useRef(false)
    const pauseRef = useRef(false)
    const speedRef = useRef(speed)

    const soundEnabled = useAppStore(s => s.soundEnabled)

    useEffect(() => { speedRef.current = speed }, [speed])

    const handleCanvasClick = (e) => {
        if (isRunning || mode !== 'add-node') return

        // Use a raycaster point in a real app, but for simplicity we'll just spawn at random 3D coords
        const x = (Math.random() - 0.5) * RANDOM_BOUNDS * 2
        const y = (Math.random() - 0.5) * RANDOM_BOUNDS * 2
        const z = (Math.random() - 0.5) * RANDOM_BOUNDS * 2

        const id = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 0
        setNodes([...nodes, { id, position: [x, y, z] }])
        if (soundEnabled) playClick()
    }

    const handleNodeClick = (nodeId) => {
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
        setEdgeStart(null)

        if (soundEnabled) playClick()
        say(`Routing ${algorithm} protocol through Cyberspace starting at Node ${nodes[0].id}`, 'thinking')

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
                if (await checkState()) return
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
        say(`${algorithm} traversal complete. Matrix synchronized.`, 'happy')
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
                <h3 className="text-xs font-black uppercase tracking-widest text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">Protocol</h3>
                <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    disabled={isRunning}
                    className="w-full bg-black/50 border border-[#00f0ff]/30 text-[#00f0ff] font-bold text-sm rounded-lg p-2.5 outline-none hover:border-[#00f0ff] transition-colors"
                >
                    {['BFS', 'DFS'].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#00f0ff]">Hacking Tools</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setMode('add-node')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase transition-all ${mode === 'add-node' ? 'bg-[#00f0ff] text-black shadow-[0_0_15px_#00f0ff]' : 'bg-black/40 text-[#00f0ff]/50 hover:bg-[#00f0ff]/10 hover:text-[#00f0ff]'}`}
                    >
                        <Plus size={14} /> Add System
                    </button>
                    <button
                        onClick={() => setMode('add-edge')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase transition-all ${mode === 'add-edge' ? 'bg-[#00f0ff] text-black shadow-[0_0_15px_#00f0ff]' : 'bg-black/40 text-[#00f0ff]/50 hover:bg-[#00f0ff]/10 hover:text-[#00f0ff]'}`}
                    >
                        <Share2 size={14} /> Link System
                    </button>
                </div>
                <div className="text-[10px] text-[#00f0ff]/60 text-center italic mt-1">
                    {mode === 'add-node' ? 'Click grid to inject node' : 'Click nodes to establish uplink'}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-[#00f0ff]">Clock Speed</label>
                    <span className="text-xs bg-[#00f0ff]/20 text-[#00f0ff] px-2 py-0.5 rounded font-mono">{(speed / 100).toFixed(1)} GHz</span>
                </div>
                <input
                    className="w-full h-1 bg-[#00f0ff]/20 rounded-lg appearance-none cursor-pointer accent-[#00f0ff]"
                    type="range" min="100" max="1000" step="100"
                    value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
                {!isRunning || isPaused ? (
                    <button onClick={runAlgorithm} className="col-span-2 bg-[#00f0ff] hover:bg-white text-black font-black py-4 rounded-lg flex items-center justify-center gap-2 uppercase tracking-tight shadow-[0_0_20px_#00f0ff] transition-all">
                        <Play size={18} fill="currentColor" />
                        {isPaused ? "Resume Uplink" : "Initialize"}
                    </button>
                ) : (
                    <button onClick={handlePause} className="col-span-2 bg-accent-orange hover:bg-white text-black font-black py-4 rounded-lg flex items-center justify-center gap-2 uppercase tracking-tight shadow-[0_0_20px_#ff9900] transition-all">
                        <Pause size={18} fill="currentColor" />
                        Abort
                    </button>
                )}
                <button onClick={resetGraph} className="col-span-2 bg-black border border-danger/50 hover:bg-danger/20 text-danger font-bold py-3 rounded-lg flex items-center justify-center gap-2 uppercase text-xs transition-colors">
                    <RotateCcw size={14} />
                    Wipe Matrix
                </button>
            </div>

            <div className="pt-4 border-t border-white/5">
                <button onClick={onBack} className="w-full bg-white/5 hover:bg-white/10 text-text-muted font-bold py-3 rounded-lg text-xs uppercase transition-colors">
                    Return to Navigation
                </button>
            </div>
        </>
    )

    const Metrics = (
        <>
            <div className="glass-panel p-4 rounded-xl border-l-4 border-[#00f0ff] bg-black/50 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff]/10 to-transparent pointer-events-none" />
                <p className="text-[10px] uppercase font-bold text-[#00f0ff]/70 relative z-10">Systems Online</p>
                <p className="text-3xl font-black text-[#00f0ff] tabular-nums tracking-tighter relative z-10">{nodes.length}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border-l-4 border-[#7000ff] bg-black/50 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#7000ff]/10 to-transparent pointer-events-none" />
                <p className="text-[10px] uppercase font-bold text-[#7000ff]/70 relative z-10">Uplinks Established</p>
                <p className="text-3xl font-black text-[#7000ff] tabular-nums tracking-tighter relative z-10">{edges.length}</p>
            </div>
        </>
    )

    const Logs = isRunning
        ? `Tracing ${algorithm} logic paths through the neural net...`
        : visitedNodes.length > 0
            ? `Exploration complete. Matrix synchronized with ${visitedNodes.length} nodes.`
            : "Cyberspace initialized. Awaiting user injection."

    return (
        <StitchVisualizerLayout
            title="Cyberspace 3D"
            algoName={algorithm}
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={Logs}
            pseudocode={algoData.code}
            isSorted={visitedNodes.length === nodes.length && nodes.length > 0 && !isRunning}
            isRunning={isRunning}
        >
            <div className="w-full h-full relative overflow-hidden bg-[#050508] rounded-xl border border-white/10 shadow-[inset_0_0_100px_rgba(0,240,255,0.05)]">
                {/* 3D Canvas */}
                <Canvas
                    camera={{ position: [0, 15, 20], fov: 45 }}
                    onPointerMissed={handleCanvasClick}
                >
                    <color attach="background" args={['#050508']} />
                    <fog attach="fog" args={['#050508', 10, 50]} />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} color="#00f0ff" />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7000ff" />

                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={1} />

                    <Suspense fallback={null}>
                        <group>
                            {/* Render Grid */}
                            <gridHelper args={[50, 50, '#00f0ff', '#222233']} position={[0, -5, 0]} rotation={[0, 0, 0]} />

                            {/* Render Edges */}
                            {edges.map((edge, i) => {
                                const fromNode = nodes.find(n => n.id === edge.from)
                                const toNode = nodes.find(n => n.id === edge.to)
                                const isVisited = visitedNodes.includes(edge.from) && visitedNodes.includes(edge.to)
                                if (fromNode && toNode) {
                                    return <Edge3D key={`e-${i}`} start={fromNode.position} end={toNode.position} isVisited={isVisited} />
                                }
                                return null
                            })}

                            {/* Render Nodes */}
                            {nodes.map(node => (
                                <Node3D
                                    key={node.id}
                                    id={node.id}
                                    position={node.position}
                                    isActive={activeNodes.includes(node.id)}
                                    isVisited={visitedNodes.includes(node.id)}
                                    onClick={handleNodeClick}
                                />
                            ))}
                        </group>
                    </Suspense>

                    <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
                </Canvas>

                {/* HUD Overlay */}
                <div className="absolute top-4 left-4 pointer-events-none">
                    <div className="text-[#00f0ff] font-mono text-xs font-black tracking-widest opacity-50 drop-shadow-[0_0_2px_#00f0ff]">
                        &gt; SYSTEM.CYBERSPACE_3D.ONLINE
                    </div>
                    {mode === 'add-edge' && edgeStart !== null && (
                        <div className="text-accent-pink font-mono text-xs font-black tracking-widest mt-1 animate-pulse">
                            &gt; AWAITING.UPLINK.TARGET
                        </div>
                    )}
                </div>

                <div className="absolute bottom-4 right-4 pointer-events-none text-right">
                    <div className="text-white/20 font-mono text-[10px] flex items-center justify-end gap-2">
                        <BoxSelect size={12} /> Left Click + Drag to Rotate
                    </div>
                </div>
            </div>
        </StitchVisualizerLayout>
    )
}
