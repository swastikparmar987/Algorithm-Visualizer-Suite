import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Plus, Trash2, Search, ArrowRight, ArrowDown, Layers } from 'lucide-react'
import StitchVisualizerLayout from './common/StitchVisualizerLayout'
import { playStep, playSuccess, playClick, playTone } from '../utils/SoundEngine'
import { useAppStore } from '../store/useAppStore'

function DataStructuresVisualizer({ onBack }) {
    const theme = useAppStore(s => s.theme)
    const soundEnabled = useAppStore(s => s.soundEnabled)

    const [mode, setMode] = useState('stack') // 'stack', 'queue', 'linked-list'
    const [items, setItems] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [speed, setSpeed] = useState(500)
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const [foundIndex, setFoundIndex] = useState(-1)
    const [logs, setLogs] = useState("Data structure initialized.")

    const speedRef = useRef(speed)
    const isPausedRef = useRef(isPaused)
    const isRunningRef = useRef(isRunning)

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

    // --- STACK OPERATIONS ---
    const handlePush = async () => {
        if (!inputValue) return
        setIsRunning(true); setIsPaused(false)
        const newItem = { id: Math.random().toString(), val: inputValue }
        setItems(prev => [...prev, newItem])
        say(`Pushed ${inputValue} to Stack.`)
        if (soundEnabled) playClick()
        setInputValue('')
        await new Promise(r => setTimeout(r, 1050 - speedRef.current))
        setIsRunning(false)
    }

    const handlePop = async () => {
        if (items.length === 0) {
            say("Stack Underflow!"); if (soundEnabled) playTone(150, 400, 'sawtooth'); return
        }
        setIsRunning(true); setIsPaused(false)
        setActiveIndex(items.length - 1)
        say(`Popping ${items[items.length - 1].val}...`)
        if (soundEnabled) playTone(400, 200, 'sawtooth')
        await new Promise(r => setTimeout(r, 1050 - speedRef.current))
        if (await checkState()) return

        setItems(prev => prev.slice(0, -1))
        setActiveIndex(-1)
        say("Popped from stack.")
        setIsRunning(false)
    }

    // --- QUEUE OPERATIONS ---
    const handleEnqueue = async () => {
        if (!inputValue) return
        setIsRunning(true); setIsPaused(false)
        const newItem = { id: Math.random().toString(), val: inputValue }
        setItems(prev => [...prev, newItem])
        say(`Enqueued ${inputValue}.`)
        if (soundEnabled) playClick()
        setInputValue('')
        await new Promise(r => setTimeout(r, 1050 - speedRef.current))
        setIsRunning(false)
    }

    const handleDequeue = async () => {
        if (items.length === 0) {
            say("Queue is empty!"); if (soundEnabled) playTone(150, 400, 'sawtooth'); return
        }
        setIsRunning(true); setIsPaused(false)
        setActiveIndex(0)
        say(`Dequeuing ${items[0].val}...`)
        if (soundEnabled) playTone(400, 200, 'sawtooth')
        await new Promise(r => setTimeout(r, 1050 - speedRef.current))
        if (await checkState()) return

        setItems(prev => prev.slice(1))
        setActiveIndex(-1)
        say("Dequeued item.")
        setIsRunning(false)
    }

    // --- LINKED LIST OPERATIONS ---
    const handleAppend = async () => {
        if (!inputValue) return
        setIsRunning(true); setIsPaused(false)
        const newItem = { id: Math.random().toString(), val: inputValue }

        if (items.length > 0) {
            for (let i = 0; i < items.length; i++) {
                setActiveIndex(i)
                say(`Traversing to node ${i}...`)
                if (soundEnabled) playStep(i, items.length)
                await new Promise(r => setTimeout(r, 1050 - speedRef.current))
                if (await checkState()) return
            }
        }

        setItems(prev => [...prev, newItem])
        setActiveIndex(items.length)
        say(`Appended ${inputValue} to List.`)
        if (soundEnabled) playSuccess()
        setInputValue('')
        await new Promise(r => setTimeout(r, 500))
        setActiveIndex(-1)
        setIsRunning(false)
    }

    const handlePrepend = async () => {
        if (!inputValue) return
        setIsRunning(true); setIsPaused(false)
        const newItem = { id: Math.random().toString(), val: inputValue }
        setItems(prev => [newItem, ...prev])
        setActiveIndex(0)
        say(`Prepended ${inputValue} to List.`)
        if (soundEnabled) playSuccess()
        setInputValue('')
        await new Promise(r => setTimeout(r, 500))
        setActiveIndex(-1)
        setIsRunning(false)
    }

    const handleLLDelete = async () => {
        if (items.length === 0) return
        setIsRunning(true); setIsPaused(false)
        // Just delete head for simplicity if no specific index
        setActiveIndex(0)
        say(`Deleting Head node ${items[0].val}...`)
        if (soundEnabled) playTone(400, 200, 'sawtooth')
        await new Promise(r => setTimeout(r, 1050 - speedRef.current))
        if (await checkState()) return

        setItems(prev => prev.slice(1))
        setActiveIndex(-1)
        say("Deleted Node.")
        setIsRunning(false)
    }

    const handleLLSearch = async () => {
        if (!inputValue || items.length === 0) return
        setIsRunning(true); setIsPaused(false); setFoundIndex(-1)

        for (let i = 0; i < items.length; i++) {
            setActiveIndex(i)
            say(`Checking node ${i} for value ${inputValue}...`)
            if (soundEnabled) playStep(i, items.length)
            await new Promise(r => setTimeout(r, 1050 - speedRef.current))
            if (await checkState()) return

            if (items[i].val === inputValue) {
                setFoundIndex(i)
                say(`Value ${inputValue} found at index ${i}!`)
                if (soundEnabled) playSuccess()
                setIsRunning(false)
                return
            }
        }

        say(`Value ${inputValue} not found in the list.`)
        if (soundEnabled) playTone(150, 400, 'sawtooth')
        setActiveIndex(-1)
        setIsRunning(false)
    }

    const Controls = (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Structure Select</h3>
                <div className="flex bg-bg-elevated p-1 rounded-lg">
                    {['stack', 'queue', 'linked-list'].map(m => (
                        <button
                            key={m}
                            onClick={() => { setMode(m); setItems([]); setLogs(`${m.toUpperCase()} Mode selected.`); setInputValue(''); setActiveIndex(-1); setFoundIndex(-1) }}
                            disabled={isRunning}
                            className={`flex-[0.33] py-2 text-[10px] font-bold uppercase rounded-md transition-colors ${mode === m ? 'bg-primary text-white shadow' : 'text-text-muted hover:text-white'}`}
                        >
                            {m.replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Operations</h3>
                <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder="Enter value"
                    className="w-full bg-bg-elevated text-white text-sm rounded-lg p-2 border border-border-glass focus:border-primary font-mono"
                    disabled={isRunning}
                />

                {mode === 'stack' && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <button onClick={handlePush} disabled={isRunning || !inputValue} className="bg-primary hover:bg-primary/90 text-white font-bold py-2 rounded-lg text-xs uppercase disabled:opacity-50">Push</button>
                        <button onClick={handlePop} disabled={isRunning || items.length === 0} className="bg-accent-orange hover:bg-accent-orange/90 text-black font-bold py-2 rounded-lg text-xs uppercase disabled:opacity-50">Pop</button>
                    </div>
                )}
                {mode === 'queue' && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <button onClick={handleEnqueue} disabled={isRunning || !inputValue} className="bg-primary hover:bg-primary/90 text-white font-bold py-2 rounded-lg text-xs uppercase disabled:opacity-50">Enqueue</button>
                        <button onClick={handleDequeue} disabled={isRunning || items.length === 0} className="bg-accent-orange hover:bg-accent-orange/90 text-black font-bold py-2 rounded-lg text-xs uppercase disabled:opacity-50">Dequeue</button>
                    </div>
                )}
                {mode === 'linked-list' && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <button onClick={handleAppend} disabled={isRunning || !inputValue} className="bg-primary hover:bg-primary/90 text-white font-bold py-2 rounded-lg text-xs uppercase disabled:opacity-50">Append</button>
                        <button onClick={handlePrepend} disabled={isRunning || !inputValue} className="bg-secondary hover:bg-secondary/90 text-white font-bold py-2 rounded-lg text-xs uppercase disabled:opacity-50">Prepend</button>
                        <button onClick={handleLLDelete} disabled={isRunning || items.length === 0} className="bg-accent-orange hover:bg-accent-orange/90 text-black font-bold py-2 rounded-lg text-xs uppercase disabled:opacity-50">Del Head</button>
                        <button onClick={handleLLSearch} disabled={isRunning || !inputValue || items.length === 0} className="bg-accent-cyan hover:bg-accent-cyan/90 text-black font-bold py-2 rounded-lg text-xs uppercase disabled:opacity-50">Search</button>
                    </div>
                )}
            </div>

            <div className="h-px bg-border-glass my-2" />

            <div className="space-y-4">
                <button onClick={() => { setItems([]); setLogs("Emptied Structure.") }} disabled={isRunning} className="w-full px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase transition-colors hover:text-danger hover:border-danger/50">
                    <Trash2 size={14} /> Clear All
                </button>

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
                </div>

                <input
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                    type="range" min="100" max="1000" step="100"
                    value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                />
            </div>
        </div>
    )

    const Metrics = (
        <div className="grid grid-cols-2 gap-3 h-full">
            <div className="glass-panel p-3 rounded-xl border-l-4 border-primary bg-bg-dark/30 flex flex-col justify-center">
                <p className="text-[10px] uppercase font-bold text-text-muted">Size</p>
                <p className="text-xl font-black text-white">{items.length}</p>
            </div>
            <div className="glass-panel p-3 rounded-xl border-l-4 border-secondary bg-bg-dark/30 flex flex-col justify-center overflow-hidden">
                <p className="text-[10px] uppercase font-bold text-text-muted">Top/Front</p>
                <p className="text-xl font-black text-white truncate">
                    {mode === 'stack' ? (items.length > 0 ? items[items.length - 1].val : '-') : (items.length > 0 ? items[0].val : '-')}
                </p>
            </div>
        </div>
    )

    const renderVisualization = () => {
        if (mode === 'stack') {
            return (
                <div className="flex flex-col-reverse items-center justify-end h-[400px] w-[200px] border-x-4 border-b-4 border-border-glass rounded-b-xl pb-2 relative">
                    <AnimatePresence>
                        {items.map((item, index) => {
                            const isActive = index === activeIndex
                            return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: -50 }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                        borderColor: isActive ? 'var(--primary)' : 'var(--border-glass)',
                                        boxShadow: isActive ? '0 0 20px var(--primary)' : 'none',
                                    }}
                                    exit={{ opacity: 0, y: -50, scale: 0.9 }}
                                    className={`w-[180px] h-12 flex items-center justify-center font-bold text-white border-2 rounded-lg mb-1 z-10 transition-colors
                                        ${isActive ? 'bg-primary/20' : 'bg-bg-elevated'}`}
                                >
                                    {item.val}
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            )
        }

        if (mode === 'queue') {
            return (
                <div className="flex items-center justify-start h-[200px] w-full max-w-[800px] border-y-4 border-border-glass px-2 overflow-x-auto">
                    <div className="text-text-muted font-black tracking-widest text-xs uppercase px-4 flex items-center gap-2 border-r-2 border-dashed border-border-glass mr-2 h-20">
                        OUT <ArrowRight size={14} />
                    </div>

                    <AnimatePresence mode="popLayout">
                        {items.map((item, index) => {
                            const isActive = index === activeIndex
                            return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{
                                        opacity: 1, x: 0,
                                        borderColor: isActive ? 'var(--primary)' : 'var(--border-glass)',
                                        boxShadow: isActive ? '0 0 20px var(--primary)' : 'none',
                                    }}
                                    exit={{ opacity: 0, x: -50, scale: 0.9 }}
                                    className={`shrink-0 w-24 h-24 flex items-center justify-center font-bold text-white border-2 rounded-xl mx-1 z-10 transition-colors
                                        ${isActive ? 'bg-primary/20' : 'bg-bg-elevated'}`}
                                >
                                    {item.val}
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>

                    <div className="text-text-muted font-black tracking-widest text-xs uppercase px-4 flex items-center gap-2 border-l-2 border-dashed border-border-glass ml-2 h-20">
                        <ArrowRight size={14} /> IN
                    </div>
                </div>
            )
        }

        if (mode === 'linked-list') {
            return (
                <div className="flex items-center justify-center flex-wrap gap-y-10 w-full px-8 py-10">
                    {items.length === 0 && <span className="text-text-muted">null</span>}
                    <AnimatePresence>
                        {items.map((item, index) => {
                            const isActive = index === activeIndex
                            const isFound = index === foundIndex
                            return (
                                <div key={item.id} className="flex items-center">
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{
                                            opacity: 1, scale: 1,
                                            borderColor: isFound ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--border-glass)',
                                            boxShadow: isFound ? '0 0 20px var(--success)' : isActive ? '0 0 20px var(--primary)' : 'none',
                                        }}
                                        exit={{ opacity: 0, scale: 0 }}
                                        className={`flex flex-col rounded-lg border-2 z-10 transition-colors overflow-hidden h-20 w-32
                                            ${isFound ? 'bg-success border-success' : isActive ? 'bg-primary/20 bg-bg-elevated' : 'bg-bg-elevated'}`}
                                    >
                                        <div className="flex-1 flex items-center justify-center border-b border-white/10 font-bold text-white truncate px-2">
                                            {item.val}
                                        </div>
                                        <div className="h-6 bg-white/5 flex items-center justify-center text-[10px] text-text-muted uppercase tracking-widest">
                                            Node {index}
                                        </div>
                                    </motion.div>

                                    {index < items.length - 1 && (
                                        <div className="flex items-center w-12 text-border-glass">
                                            <div className="h-1 flex-1 bg-current mx-1 relative">
                                                <ArrowRight size={16} className="absolute -right-2 top-1/2 -translate-y-1/2" />
                                            </div>
                                        </div>
                                    )}
                                    {index === items.length - 1 && (
                                        <div className="flex items-center ml-4 text-text-muted opacity-50 font-mono text-sm">
                                            <ArrowRight size={14} className="mr-2" /> null
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            )
        }
    }

    return (
        <StitchVisualizerLayout
            title="Data Structures"
            algoName={mode.toUpperCase()}
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={logs}
            pseudocode={mode === 'stack' ? "push(val) {\n  stack[top++] = val\n}" : mode === 'queue' ? "enqueue(val) {\n  queue[rear++] = val\n}" : "append(val) {\n  tail.next = new Node(val)\n}"}
            isRunning={isRunning}
        >
            <div className="relative w-full h-full bg-cyber-grid flex flex-col items-center justify-center p-8 overflow-y-auto">
                {items.length === 0 && mode !== 'linked-list' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted opacity-50 pointer-events-none z-0">
                        <Layers size={64} className="mb-4" />
                        <h3 className="text-xl font-bold uppercase tracking-widest text-white">Empty Structure</h3>
                        <p>Use controls to add elements</p>
                    </div>
                )}
                {renderVisualization()}
            </div>
        </StitchVisualizerLayout>
    )
}

export default DataStructuresVisualizer
