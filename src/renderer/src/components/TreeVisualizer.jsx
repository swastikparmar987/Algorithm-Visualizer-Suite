import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Shuffle, Plus, Settings, Network } from 'lucide-react'
import StitchVisualizerLayout from './common/StitchVisualizerLayout'
import { playStep, playSuccess, playClick, playTone } from '../utils/SoundEngine'
import { useAppStore } from '../store/useAppStore'

class TreeNode {
    constructor(value, id) {
        this.value = value
        this.id = id || Math.random().toString(36).substr(2, 9)
        this.left = null
        this.right = null
        this.x = 0
        this.y = 0
    }
}

function TreeVisualizer({ onBack }) {
    const theme = useAppStore(s => s.theme)
    const soundEnabled = useAppStore(s => s.soundEnabled)

    const [root, setRoot] = useState(null)
    const [inputValue, setInputValue] = useState('')
    const [speed, setSpeed] = useState(500)
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [activeNodeIds, setActiveNodeIds] = useState([])
    const [foundNodeId, setFoundNodeId] = useState(null)
    const [logs, setLogs] = useState("Tree initialized. Ready for operations.")

    // Internal refs for async control
    const speedRef = useRef(speed)
    const isPausedRef = useRef(isPaused)
    const isRunningRef = useRef(isRunning)
    const nodesRef = useRef(root)

    useEffect(() => { speedRef.current = speed }, [speed])
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])
    useEffect(() => { isRunningRef.current = isRunning }, [isRunning])
    useEffect(() => { nodesRef.current = root }, [root])

    const say = (msg) => setLogs(msg)

    // Layout Algorithm
    const calculateLayout = (node, depth = 0, x = 400, offset = 150) => {
        if (!node) return
        node.x = x
        node.y = 80 + (depth * 80)
        if (node.left) calculateLayout(node.left, depth + 1, x - offset, offset * 0.5)
        if (node.right) calculateLayout(node.right, depth + 1, x + offset, offset * 0.5)
    }

    const updateTreeLayout = (newRoot) => {
        if (newRoot) calculateLayout(newRoot, 0, 400, 200)
        setRoot(newRoot ? Object.assign(Object.create(Object.getPrototypeOf(newRoot)), newRoot) : null) // Force re-render
    }

    const checkState = async () => {
        while (isPausedRef.current) {
            await new Promise(r => setTimeout(r, 100))
        }
        return !isRunningRef.current
    }

    const insertHelper = async (node, value) => {
        if (!node) {
            return new TreeNode(value)
        }

        setActiveNodeIds([node.id])
        if (soundEnabled) playClick()
        say(`Comparing ${value} with ${node.value}...`)
        await new Promise(r => setTimeout(r, 1050 - speedRef.current))
        if (await checkState()) return node

        if (value < node.value) {
            node.left = await insertHelper(node.left, value)
        } else if (value > node.value) {
            node.right = await insertHelper(node.right, value)
        } else {
            say(`${value} already exists in the tree!`)
            if (soundEnabled) playTone(200, 400, 'sawtooth')
            return node
        }
        return node
    }

    const handleInsert = async () => {
        const val = parseInt(inputValue)
        if (isNaN(val)) return
        setIsRunning(true); setIsPaused(false)
        setFoundNodeId(null)

        let currRoot = nodesRef.current ? JSON.parse(JSON.stringify(nodesRef.current)) : null // Deep copy for immutability during anim

        // Re-establish prototypes
        const restoreProto = (n) => {
            if (!n) return null
            const nn = new TreeNode(n.value, n.id)
            nn.left = restoreProto(n.left)
            nn.right = restoreProto(n.right)
            return nn
        }
        currRoot = restoreProto(currRoot)

        if (!currRoot) {
            currRoot = new TreeNode(val)
            say(`Inserted root node: ${val}`)
            if (soundEnabled) playSuccess()
        } else {
            currRoot = await insertHelper(currRoot, val)
            if (!isRunningRef.current) return
            say(`Inserted node: ${val}`)
            if (soundEnabled) playSuccess()
        }

        updateTreeLayout(currRoot)
        setActiveNodeIds([])
        setInputValue('')
        setIsRunning(false)
    }

    const searchHelper = async (node, value) => {
        if (!node) {
            say(`Value ${value} not found.`)
            if (soundEnabled) playTone(150, 400, 'sawtooth')
            return null
        }

        setActiveNodeIds([node.id])
        if (soundEnabled) playClick()
        say(`Comparing ${value} with ${node.value}...`)
        await new Promise(r => setTimeout(r, 1050 - speedRef.current))
        if (await checkState()) return null

        if (value === node.value) {
            say(`Found value ${value}!`)
            if (soundEnabled) playSuccess()
            setFoundNodeId(node.id)
            return node
        } else if (value < node.value) {
            return await searchHelper(node.left, value)
        } else {
            return await searchHelper(node.right, value)
        }
    }

    const handleSearch = async () => {
        const val = parseInt(inputValue)
        if (isNaN(val) || !root) return
        setIsRunning(true); setIsPaused(false)
        setFoundNodeId(null)
        await searchHelper(root, val)
        setIsRunning(false)
        setActiveNodeIds([])
    }

    const deleteHelper = async (node, value) => {
        if (!node) return null

        setActiveNodeIds([node.id])
        if (soundEnabled) playClick()
        say(`Visiting ${node.value} for deletion...`)
        await new Promise(r => setTimeout(r, 1050 - speedRef.current))
        if (await checkState()) return node

        if (value < node.value) {
            node.left = await deleteHelper(node.left, value)
        } else if (value > node.value) {
            node.right = await deleteHelper(node.right, value)
        } else {
            say(`Found node ${value} to delete.`)
            if (soundEnabled) playTone(400, 200, 'sawtooth')

            // Case 1: Leaf
            if (!node.left && !node.right) return null
            // Case 2: One child
            if (!node.left) return node.right
            if (!node.right) return node.left

            // Case 3: Two children (in-order successor)
            let minNode = node.right
            while (minNode.left) minNode = minNode.left

            node.value = minNode.value // Copy value
            node.right = await deleteHelper(node.right, minNode.value) // Delete duplicate
        }
        return node
    }

    const handleDelete = async () => {
        const val = parseInt(inputValue)
        if (isNaN(val) || !root) return
        setIsRunning(true); setIsPaused(false)
        setFoundNodeId(null)

        const restoreProto = (n) => {
            if (!n) return null
            const nn = new TreeNode(n.value, n.id)
            nn.left = restoreProto(n.left)
            nn.right = restoreProto(n.right)
            return nn
        }
        let currRoot = restoreProto(nodesRef.current ? JSON.parse(JSON.stringify(nodesRef.current)) : null)

        currRoot = await deleteHelper(currRoot, val)

        if (isRunningRef.current) {
            updateTreeLayout(currRoot)
            say(`Deletion execution finished.`)
        }

        setActiveNodeIds([])
        setInputValue('')
        setIsRunning(false)
    }

    const generateRandomBST = () => {
        if (isRunning) return
        const count = 10
        let currRoot = null

        const insertSilently = (node, val) => {
            if (!node) return new TreeNode(val)
            if (val < node.value) node.left = insertSilently(node.left, val)
            else if (val > node.value) node.right = insertSilently(node.right, val)
            return node
        }

        for (let i = 0; i < count; i++) {
            currRoot = insertSilently(currRoot, Math.floor(Math.random() * 100) + 1)
        }
        updateTreeLayout(currRoot)
        say("Random BST generated.")
    }

    const inorder = async (node, visited) => {
        if (!node) return
        await inorder(node.left, visited)
        if (await checkState()) return
        setActiveNodeIds(prev => [...prev, node.id])
        visited.push(node.value)
        if (soundEnabled) playStep(visited.length, 10)
        say(`Inoder Traversal: ${visited.join(', ')}`)
        await new Promise(r => setTimeout(r, 1050 - speedRef.current))
        await inorder(node.right, visited)
    }

    const runInorder = async () => {
        if (!root || isRunning) return
        setIsRunning(true); setIsPaused(false); setFoundNodeId(null)
        setActiveNodeIds([])
        await inorder(root, [])
        setIsRunning(false)
        if (soundEnabled) playSuccess()
    }

    // Subcomponents
    const Controls = (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Node Operations</h3>
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="Value (e.g. 42)"
                        className="flex-1 bg-bg-elevated text-white text-sm rounded-lg p-2 border border-border-glass focus:border-primary font-mono"
                        disabled={isRunning}
                    />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                    <button onClick={handleInsert} disabled={isRunning || !inputValue} className="bg-primary hover:bg-primary/90 text-white font-bold py-2 rounded-lg text-xs uppercase disabled:opacity-50">Insert</button>
                    <button onClick={handleSearch} disabled={isRunning || !inputValue} className="bg-accent-cyan hover:bg-accent-cyan/90 text-black font-bold py-2 rounded-lg text-xs uppercase disabled:opacity-50">Search</button>
                    <button onClick={handleDelete} disabled={isRunning || !inputValue} className="bg-accent-orange hover:bg-accent-orange/90 text-black font-bold py-2 rounded-lg text-xs uppercase disabled:opacity-50">Delete</button>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Traversals</h3>
                <div className="grid grid-cols-1 gap-2">
                    <button onClick={runInorder} disabled={isRunning || !root} className="bg-bg-elevated hover:bg-white/10 text-white font-bold py-2 rounded-lg text-xs border border-border-glass">In-order (Sorted)</button>
                </div>
            </div>

            <div className="h-px bg-border-glass my-2" />

            <div className="space-y-4">
                <div className="flex justify-between">
                    <button onClick={generateRandomBST} disabled={isRunning} className="flex-1 mr-2 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase">
                        <Shuffle size={14} /> Random
                    </button>
                    <button onClick={() => { setRoot(null); setLogs("Tree Cleared.") }} disabled={isRunning} className="px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase transition-colors hover:text-danger hover:border-danger/50">
                        <RotateCcw size={14} /> Clear
                    </button>
                </div>

                <div className="flex gap-2 mt-4">
                    {isRunning ? (
                        <button onClick={() => { setIsPaused(!isPaused); isPausedRef.current = !isPaused; }} className="flex-1 bg-accent-orange text-black font-black py-3 rounded-lg flex items-center justify-center gap-2 uppercase shadow-[0_0_15px_rgba(251,146,60,0.3)]">
                            <Pause size={16} fill="currentColor" /> {isPaused ? "Resume" : "Pause"}
                        </button>
                    ) : (
                        <button disabled={true} className="flex-1 bg-bg-dark text-text-muted font-black py-3 rounded-lg flex items-center justify-center gap-2 uppercase border border-border-glass">
                            <Play size={16} fill="currentColor" /> Idle
                        </button>
                    )}
                    <button onClick={() => setIsRunning(false)} disabled={!isRunning} className="px-4 bg-danger/20 hover:bg-danger/40 text-danger border border-danger/30 rounded-lg disabled:opacity-50 transition-colors">
                        Stop
                    </button>
                </div>

                <input
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                    type="range" min="100" max="1000" step="100"
                    value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                />
            </div>
        </div>
    )

    // Render nodes BFS for layout rendering
    const renderNodes = () => {
        if (!root) return null
        const nodes = []
        const edges = []

        const traverse = (node) => {
            if (!node) return
            nodes.push(node)
            if (node.left) {
                edges.push({ from: node, to: node.left })
                traverse(node.left)
            }
            if (node.right) {
                edges.push({ from: node, to: node.right })
                traverse(node.right)
            }
        }
        traverse(root)

        return (
            <>
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {edges.map((edge, i) => (
                        <line
                            key={i}
                            x1={edge.from.x}
                            y1={edge.from.y}
                            x2={edge.to.x}
                            y2={edge.to.y}
                            stroke="var(--border-glass)"
                            strokeWidth="3"
                        />
                    ))}
                </svg>

                <AnimatePresence>
                    {nodes.map(node => {
                        const isActive = activeNodeIds.includes(node.id)
                        const isFound = foundNodeId === node.id
                        return (
                            <motion.div
                                key={node.id}
                                layout
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: 1,
                                    opacity: 1,
                                    borderColor: isFound ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--border-glass)',
                                    boxShadow: isFound ? '0 0 20px var(--success)' : isActive ? '0 0 20px var(--primary)' : '0 0 10px rgba(0,0,0,0.5)',
                                    backgroundColor: isFound ? 'var(--success)' : isActive ? 'rgba(var(--primary-rgb), 0.2)' : 'var(--bg-elevated)'
                                }}
                                exit={{ scale: 0, opacity: 0 }}
                                className={`absolute size-[50px] rounded-full border-[3px] flex items-center justify-center font-bold z-10 transition-colors duration-300`}
                                style={{
                                    left: node.x - 25,
                                    top: node.y - 25,
                                }}
                            >
                                <span className={isFound ? 'text-bg-dark font-black' : 'text-white'}>{node.value}</span>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </>
        )
    }

    const countNodes = (n) => n ? 1 + countNodes(n.left) + countNodes(n.right) : 0
    const treeHeight = (n) => n ? 1 + Math.max(treeHeight(n.left), treeHeight(n.right)) : 0

    const Metrics = (
        <div className="grid grid-cols-2 gap-3 h-full">
            <div className="glass-panel p-3 rounded-xl border-l-4 border-primary bg-bg-dark/30 flex flex-col justify-center">
                <p className="text-[10px] uppercase font-bold text-text-muted">Total Nodes</p>
                <p className="text-xl font-black text-white">{countNodes(root)}</p>
            </div>
            <div className="glass-panel p-3 rounded-xl border-l-4 border-accent-orange bg-bg-dark/30 flex flex-col justify-center">
                <p className="text-[10px] uppercase font-bold text-text-muted">Max Height</p>
                <p className="text-xl font-black text-white">{treeHeight(root)}</p>
            </div>
        </div>
    )

    return (
        <StitchVisualizerLayout
            title="Tree Architect"
            algoName="Binary Search Tree"
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={logs}
            pseudocode="node = new TreeNode(value)\nif val < root: root.left = insert(root.left)\nelse: root.right = insert(root.right)"
            isRunning={isRunning}
        >
            <div className="relative w-full h-full bg-cyber-grid overflow-hidden">
                {renderNodes()}
                {!root && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted opacity-50 pointer-events-none">
                        <Network size={64} className="mb-4" />
                        <h3 className="text-xl font-bold uppercase tracking-widest text-white">Empty Tree</h3>
                        <p>Insert nodes to begin construction</p>
                    </div>
                )}
            </div>
        </StitchVisualizerLayout>
    )
}

export default TreeVisualizer
