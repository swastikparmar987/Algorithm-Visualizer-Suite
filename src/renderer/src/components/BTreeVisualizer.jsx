import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Plus, TreePine, GitMerge } from 'lucide-react'
import StitchVisualizerLayout from './common/StitchVisualizerLayout'
import { useAppStore } from '../store/useAppStore'
import { playTone, playSuccess, playClick, playStep, playError } from '../utils/SoundEngine'

// --- B-Tree Logic Helpers ---
class BTreeNode {
    constructor(t, leaf = true) {
        this.keys = []
        this.children = []
        this.leaf = leaf
        this.t = t
        this.id = Math.random().toString(36).substr(2, 9) // Unique id for animation tracking
    }
}

// Immutable-friendly clone for React state
function cloneTree(node) {
    if (!node) return null
    const n = new BTreeNode(node.t, node.leaf)
    n.id = node.id
    n.keys = [...node.keys]
    n.children = node.children.map(cloneTree)
    return n
}

function BTreeVisualizer({ onBack }) {
    const theme = useAppStore(s => s.theme)
    const soundEnabled = useAppStore(s => s.soundEnabled)

    const [t, setT] = useState(2) // minimum degree
    const [root, setRoot] = useState(null)
    const [insertedKeys, setInsertedKeys] = useState([])

    // Input state
    const [inputVal, setInputVal] = useState('')
    const [insertQueue, setInsertQueue] = useState([])

    // Animation/Simulation States
    const [activeNodeId, setActiveNodeId] = useState(null)
    const [splittingNodeId, setSplittingNodeId] = useState(null)
    const [activeKey, setActiveKey] = useState(null)

    // Control States
    const [speed, setSpeed] = useState(400)
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [logs, setLogs] = useState("Ready. Adjust degree 't' and insert keys.")

    const speedRef = useRef(speed)
    const isPausedRef = useRef(isPaused)
    const isRunningRef = useRef(isRunning)

    useEffect(() => { speedRef.current = speed }, [speed])
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])
    useEffect(() => { isRunningRef.current = isRunning }, [isRunning])

    // Reset when T changes
    useEffect(() => {
        if (root) resetVis()
    }, [t])

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
        setRoot(null)
        setInsertedKeys([])
        setInsertQueue([])
        setActiveNodeId(null)
        setSplittingNodeId(null)
        setActiveKey(null)
        say(`B-Tree reset. Minimum degree t=${t}. Max keys/node=${2 * t - 1}.`)
        if (soundEnabled) playClick()
    }

    const addToQueue = () => {
        if (isRunning) return

        let newVals = []
        if (inputVal.trim() !== '') {
            const val = parseInt(inputVal)
            if (!isNaN(val)) newVals = [val]
            setInputVal('')
        } else {
            // Generate random
            newVals = [Math.floor(Math.random() * 90) + 10]
        }

        setInsertQueue([...insertQueue, ...newVals])
        if (soundEnabled) playClick()
    }

    // --- BTREE ALGORITHM WITH ANIMATION YIELDS ---

    const insertBatch = async () => {
        if (insertQueue.length === 0) return

        setIsRunning(true)
        setIsPaused(false)
        isRunningRef.current = true
        isPausedRef.current = false

        let currentQueue = [...insertQueue]
        let currentRoot = root ? cloneTree(root) : null
        let currentInserted = [...insertedKeys]

        const yieldState = async () => {
            setRoot(cloneTree(currentRoot))
            await new Promise(r => setTimeout(r, speedRef.current))
            if (await checkState()) throw new Error('stopped')
        }

        const splitChild = async (parent, i) => {
            const y = parent.children[i]
            const z = new BTreeNode(t, y.leaf)

            say(`Node full. Splitting child at index ${i}...`)
            setSplittingNodeId(y.id)
            if (soundEnabled) playTone(150, 100, 'sawtooth')
            await yieldState()

            z.keys = y.keys.splice(t)
            const mid = y.keys.pop()

            if (!y.leaf) {
                z.children = y.children.splice(t)
            }

            parent.children.splice(i + 1, 0, z)
            parent.keys.splice(i, 0, mid)

            setSplittingNodeId(null)
            setActiveNodeId(parent.id)
            say(`Promoted middle key ${mid} to parent.`)
            if (soundEnabled) playTone(400, 100, 'square')
            await yieldState()
        }

        const insertNonFull = async (node, k) => {
            setActiveNodeId(node.id)
            if (soundEnabled) playStep()
            await yieldState()

            let i = node.keys.length - 1
            if (node.leaf) {
                while (i >= 0 && k < node.keys[i]) i--
                node.keys.splice(i + 1, 0, k)
                say(`Inserted ${k} into leaf node.`)
                await yieldState()
            } else {
                while (i >= 0 && k < node.keys[i]) i--
                i++

                setActiveNodeId(node.children[i].id)
                say(`Traversing to child ${i} for key ${k}...`)
                await yieldState()

                if (node.children[i].keys.length === 2 * t - 1) {
                    await splitChild(node, i)
                    if (k > node.keys[i]) i++
                }
                await insertNonFull(node.children[i], k)
            }
        }

        try {
            while (currentQueue.length > 0) {
                const k = currentQueue.shift()
                setInsertQueue([...currentQueue])
                setActiveKey(k)
                say(`Inserting key ${k}...`)

                if (!currentRoot) {
                    currentRoot = new BTreeNode(t)
                    currentRoot.keys = [k]
                    say(`Tree empty. Created new root with ${k}.`)
                    if (soundEnabled) playTone(300, 100)
                    await yieldState()
                } else {
                    if (currentRoot.keys.length === 2 * t - 1) {
                        say(`Root is full. Splitting root...`)
                        const s = new BTreeNode(t, false)
                        s.children.push(currentRoot)
                        currentRoot = s
                        await splitChild(s, 0)
                        await insertNonFull(s, k)
                    } else {
                        await insertNonFull(currentRoot, k)
                    }
                }

                currentInserted.push(k)
                setInsertedKeys([...currentInserted])

                if (soundEnabled) playSuccess()
                setActiveNodeId(null)
                setActiveKey(null)
                await new Promise(r => setTimeout(r, speedRef.current))
            }
        } catch (e) {
            if (e.message !== 'stopped') console.error(e)
        }

        setIsRunning(false)
        isRunningRef.current = false
        setActiveNodeId(null)
        setActiveKey(null)
        setSplittingNodeId(null)
        say("Insertion queue processed.")
    }

    // --- RENDERING VIEWS ---

    // Calculate node widths to center them properly
    const getNodeWidth = (node) => {
        if (!node) return 0
        return Math.max(60, node.keys.length * 30 + 20)
    }

    const calculateTreeLayout = (node, depth = 0, xOffset = 0) => {
        if (!node) return null

        const layout = {
            id: node.id,
            keys: node.keys,
            depth,
            x: 0,
            y: depth * 100 + 40,
            width: getNodeWidth(node),
            children: []
        }

        if (node.leaf || node.children.length === 0) {
            layout.subtreeWidth = layout.width + 20
        } else {
            let totalChildWidth = 0
            layout.children = node.children.map(child => {
                const childLayout = calculateTreeLayout(child, depth + 1, 0)
                totalChildWidth += childLayout.subtreeWidth
                return childLayout
            })
            layout.subtreeWidth = Math.max(layout.width + 20, totalChildWidth)
        }

        return layout
    }

    const assignCoordinates = (layout, startX) => {
        if (!layout) return

        let currentX = startX
        if (layout.children.length === 0) {
            layout.x = startX + layout.subtreeWidth / 2
        } else {
            layout.children.forEach(child => {
                assignCoordinates(child, currentX)
                currentX += child.subtreeWidth
            })
            // Center parent over children
            layout.x = (layout.children[0].x + layout.children[layout.children.length - 1].x) / 2
        }
    }

    const renderTreeNodes = (layout, nodes = [], edges = []) => {
        if (!layout) return { nodes, edges }

        const isActive = activeNodeId === layout.id
        const isSplitting = splittingNodeId === layout.id

        nodes.push(
            <motion.g
                key={layout.id}
                initial={{ opacity: 0, scale: 0.8, y: layout.y - 20 }}
                animate={{
                    opacity: 1,
                    scale: isActive ? 1.1 : 1,
                    y: layout.y,
                    x: layout.x,
                    filter: isSplitting ? 'drop-shadow(0 0 10px var(--danger))' : isActive ? 'drop-shadow(0 0 10px var(--primary))' : 'none'
                }}
                transition={{ duration: 0.3 }}
            >
                {/* Node Box */}
                <rect
                    x={-layout.width / 2}
                    y={-15}
                    width={layout.width}
                    height={30}
                    rx={6}
                    fill={isSplitting ? 'var(--danger-dark, #450a0a)' : isActive ? 'var(--primary-dark, #3b0764)' : 'var(--bg-elevated)'}
                    stroke={isSplitting ? 'var(--danger)' : isActive ? 'var(--primary)' : 'var(--border-glass)'}
                    strokeWidth={isActive || isSplitting ? 2 : 1}
                />

                {/* Key Separators */}
                {layout.keys.map((_, i) => i > 0 && (
                    <line
                        key={`sep-${i}`}
                        x1={-layout.width / 2 + (i / layout.keys.length) * layout.width}
                        y1={-15}
                        x2={-layout.width / 2 + (i / layout.keys.length) * layout.width}
                        y2={15}
                        stroke={isActive ? 'var(--primary)' : 'var(--border-glass)'}
                        strokeWidth={1}
                        opacity={0.5}
                    />
                ))}

                {/* Keys */}
                {layout.keys.map((k, i) => {
                    const cellWidth = layout.width / layout.keys.length
                    const kx = -layout.width / 2 + cellWidth * i + cellWidth / 2
                    return (
                        <text
                            key={`k-${i}`}
                            x={kx}
                            y={5}
                            fill={isActive ? 'white' : 'var(--text-primary)'}
                            fontSize="14"
                            fontWeight="800"
                            fontFamily="monospace"
                            textAnchor="middle"
                        >
                            {k}
                        </text>
                    )
                })}
            </motion.g>
        )

        layout.children.forEach(child => {
            edges.push(
                <motion.line
                    key={`e-${layout.id}-${child.id}`}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1, x1: layout.x, y1: layout.y + 15, x2: child.x, y2: child.y - 15 }}
                    stroke="var(--border-glass)"
                    strokeWidth={1.5}
                />
            )
            renderTreeNodes(child, nodes, edges)
        })

        return { nodes, edges }
    }

    const getTreeVisuals = () => {
        if (!root) return null
        const layout = calculateTreeLayout(root)
        // Center the whole tree by placing the root's calculated x over the center of the SVG
        const svgWidth = Math.max(800, layout.subtreeWidth) // Minimum 800 width
        assignCoordinates(layout, (svgWidth - layout.subtreeWidth) / 2)

        const { nodes, edges } = renderTreeNodes(layout)

        return (
            <svg width={svgWidth} height={Math.max(500, (layout.depth + 1) * 100 + 100)} className="overflow-visible min-h-full">
                <g>{edges}</g>
                <g>{nodes}</g>
            </svg>
        )
    }

    // --- SUB-COMPONENTS ---

    const Controls = (
        <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Configuration</h3>

            <div className="space-y-2 mt-2">
                <label className="text-xs font-bold text-text-muted uppercase flex justify-between">
                    <span>Minimum Degree (t)</span>
                    <span className="text-primary">{t}</span>
                </label>
                <input
                    type="range" min="2" max="5" step="1"
                    value={t}
                    onChange={(e) => setT(parseInt(e.target.value))}
                    disabled={isRunning || root !== null}
                    className="w-full accent-primary disabled:opacity-50"
                />
                <p className="text-[10px] text-text-muted mt-1 leading-tight">
                    Min keys: {t - 1} | Max keys: {2 * t - 1} <br />
                    (Cannot change while tree is built)
                </p>
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
                    className="flex-1 w-0 bg-bg-elevated border border-border-glass rounded-lg px-3 py-2 text-sm text-white placeholder:text-text-muted/50 focus:outline-none focus:border-primary disabled:opacity-50"
                />
                <button
                    onClick={addToQueue}
                    disabled={isRunning}
                    className="bg-bg-elevated border border-border-glass hover:bg-white/10 text-white p-2 rounded-lg transition-colors disabled:opacity-50 shrink-0"
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
                    Nodes
                </p>
                <p className="text-2xl font-black text-white font-mono">
                    {(() => {
                        let c = 0; const count = n => { if (!n) return; c++; n.children.forEach(count) }; count(root); return c;
                    })()}
                </p>
            </div>

            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass flex flex-col justify-center items-center text-center">
                <p className="text-[10px] font-black tracking-widest text-text-muted uppercase mb-1">Total Keys</p>
                <p className="text-2xl font-black text-primary font-mono">{insertedKeys.length}</p>
            </div>

            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass col-span-2 flex justify-between items-center">
                <div>
                    <p className="text-[10px] font-black tracking-widest text-text-muted uppercase">Tree Depth</p>
                    <p className="text-sm font-black mt-1 text-white uppercase tracking-widest">
                        {(() => {
                            let d = 0; let curr = root; while (curr) { d++; curr = curr.children[0] }; return d;
                        })()}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black tracking-widest text-text-muted uppercase">Max Keys/Node</p>
                    <p className="text-sm font-black mt-1 text-white uppercase tracking-widest">{2 * t - 1}</p>
                </div>
            </div>
        </div>
    )

    return (
        <StitchVisualizerLayout
            title="B-Trees"
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={logs}
        >
            <div className="relative w-full h-full flex flex-col p-8 bg-[#0A0A0F] gap-6 overflow-hidden">
                <div className="flex-1 bg-bg-elevated border border-border-glass rounded-2xl p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-4 relative z-10 w-full justify-between">
                        <div className="flex items-center gap-2">
                            <TreePine className="text-primary" size={24} />
                            <h4 className="text-lg font-black tracking-widest text-white uppercase">Self-Balancing Structure</h4>
                        </div>

                        {/* Active Computation Display */}
                        <AnimatePresence>
                            {activeKey !== null && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="px-4 py-2 rounded-xl bg-bg-card border border-primary/50 flex items-center gap-3 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                                >
                                    <span className="text-xs font-black uppercase tracking-widest text-text-muted">Target Key: </span>
                                    <span className="font-mono font-black text-primary text-lg">
                                        {activeKey}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Tree Visual */}
                    <div className="w-full flex-1 relative mt-4 overflow-auto scrollbar-thin scrollbar-thumb-border-glass flex justify-center">
                        {root ? getTreeVisuals() : (
                            <div className="flex flex-col items-center justify-center h-full text-text-muted/50 gap-4">
                                <GitMerge size={64} className="opacity-20" />
                                <p className="font-black uppercase tracking-widest">Tree is Empty</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StitchVisualizerLayout>
    )
}

export default BTreeVisualizer
