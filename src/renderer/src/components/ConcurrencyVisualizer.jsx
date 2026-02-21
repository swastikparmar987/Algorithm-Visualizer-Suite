import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, GitCommit } from 'lucide-react'
import StitchVisualizerLayout from './common/StitchVisualizerLayout'
import { playTone, playSuccess, playClick, playStep } from '../utils/SoundEngine'
import { useAppStore } from '../store/useAppStore'

const CONC_ALGOS = [
    { id: 'dining', label: 'Dining Philosophers' },
    { id: 'prodcons', label: 'Producer-Consumer' },
    { id: 'deadlock', label: 'Deadlock Demo' }
]

const PHILOSOPHER_NAMES = ['Plato', 'Aristotle', 'Socrates', 'Descartes', 'Kant']

function ConcurrencyVisualizer({ onBack }) {
    const theme = useAppStore(s => s.theme)
    const soundEnabled = useAppStore(s => s.soundEnabled)

    const [algorithm, setAlgorithm] = useState('dining')

    // Dining Philosophers & Deadlock State
    const [philosophers, setPhilosophers] = useState(
        PHILOSOPHER_NAMES.map((name, i) => ({ id: i, name, state: 'thinking' }))
    )
    const [forks, setForks] = useState(Array(5).fill(null)) // null = free, number = taken by philosopher ID

    // Producer-Consumer State
    const [buffer, setBuffer] = useState([])
    const [bufferSize] = useState(5)
    const [producerState, setProducerState] = useState('idle')
    const [consumerState, setConsumerState] = useState('idle')
    const [logs, setLogs] = useState("Ready. Select concurrency scenario and run.")

    // Control States
    const [speed, setSpeed] = useState(400)
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)

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

    const resetVis = () => {
        setIsRunning(false)
        setIsPaused(false)
        isRunningRef.current = false
        isPausedRef.current = false
        setPhilosophers(PHILOSOPHER_NAMES.map((name, i) => ({ id: i, name, state: 'thinking' })))
        setForks(Array(5).fill(null))
        setBuffer([])
        setProducerState('idle')
        setConsumerState('idle')
        say("Concurrency simulator reset. Ready.")
        if (soundEnabled) playClick()
    }

    // --- ALGORITHMS ---

    const runDining = async () => {
        const states = [...PHILOSOPHER_NAMES.map(() => 'thinking')]
        const forkOwners = Array(5).fill(null)
        const rounds = 15

        for (let round = 0; round < rounds; round++) {
            if (await checkState()) return

            for (let i = 0; i < 5; i++) {
                if (await checkState()) return
                const leftFork = i
                const rightFork = (i + 1) % 5

                if (states[i] === 'thinking' && Math.random() > 0.5) {
                    states[i] = 'hungry'
                    setPhilosophers(PHILOSOPHER_NAMES.map((name, j) => ({ id: j, name, state: states[j] })))
                    say(`${PHILOSOPHER_NAMES[i]} is hungry`)
                    if (soundEnabled) playStep()
                    await new Promise(r => setTimeout(r, speedRef.current))

                    // Try pick up both (odd picks right first to prevent immediate deadlock)
                    const first = i % 2 === 0 ? leftFork : rightFork
                    const second = i % 2 === 0 ? rightFork : leftFork

                    if (forkOwners[first] === null && forkOwners[second] === null) {
                        forkOwners[first] = i
                        forkOwners[second] = i
                        states[i] = 'eating'
                        setForks([...forkOwners])
                        setPhilosophers(PHILOSOPHER_NAMES.map((name, j) => ({ id: j, name, state: states[j] })))
                        say(`${PHILOSOPHER_NAMES[i]} picked up both forks and is eating`)
                        if (soundEnabled) playTone(400 + i * 50, 100)
                        await new Promise(r => setTimeout(r, speedRef.current))
                    } else {
                        say(`${PHILOSOPHER_NAMES[i]} is waiting for forks...`)
                    }
                } else if (states[i] === 'eating') {
                    // Put down forks
                    forkOwners[leftFork] = null
                    forkOwners[rightFork] = null
                    states[i] = 'thinking'
                    setForks([...forkOwners])
                    setPhilosophers(PHILOSOPHER_NAMES.map((name, j) => ({ id: j, name, state: states[j] })))
                    say(`${PHILOSOPHER_NAMES[i]} finished eating, put down forks, and is thinking`)
                    if (soundEnabled) playClick()
                    await new Promise(r => setTimeout(r, speedRef.current))
                }
            }
        }
        say('Dining Philosophers simulation complete!')
        if (soundEnabled) playSuccess()
    }

    const runProdCons = async () => {
        const buf = []
        let itemCount = 0

        for (let round = 0; round < 20; round++) {
            if (await checkState()) return

            // Producer
            if (Math.random() > 0.3 && buf.length < bufferSize) {
                itemCount++
                const item = itemCount
                setProducerState('producing')
                say(`Producer is creating item ${item}...`)
                if (soundEnabled) playStep()
                await new Promise(r => setTimeout(r, speedRef.current))

                buf.push(item)
                setBuffer([...buf])
                setProducerState('idle')
                say(`Producer added item ${item}. Buffer: [${buf.length}/${bufferSize}]`)
                if (soundEnabled) playTone(600, 50, 'sine')
                await new Promise(r => setTimeout(r, speedRef.current))
            } else if (buf.length >= bufferSize) {
                setProducerState('waiting')
                say('Producer: buffer is full, spinning/waiting...')
                await new Promise(r => setTimeout(r, speedRef.current))
                setProducerState('idle')
            }

            if (await checkState()) return

            // Consumer
            if (Math.random() > 0.4 && buf.length > 0) {
                setConsumerState('consuming')
                const item = buf.shift()
                say(`Consumer is removing item ${item} from buffer...`)
                if (soundEnabled) playClick()
                await new Promise(r => setTimeout(r, speedRef.current))

                setBuffer([...buf])
                setConsumerState('idle')
                say(`Consumer processed item ${item}. Buffer: [${buf.length}/${bufferSize}]`)
                if (soundEnabled) playTone(300, 50, 'triangle')
                await new Promise(r => setTimeout(r, speedRef.current))
            } else if (buf.length === 0) {
                setConsumerState('waiting')
                say('Consumer: buffer is empty, spinning/waiting...')
                await new Promise(r => setTimeout(r, speedRef.current))
                setConsumerState('idle')
            }
        }
        say('Producer-Consumer simulation complete!')
        if (soundEnabled) playSuccess()
    }

    const runDeadlock = async () => {
        const states = PHILOSOPHER_NAMES.map(() => 'thinking')
        const forkOwners = Array(5).fill(null)

        say('Demonstrating deadlock: All philosophers become hungry simultaneously.')
        await new Promise(r => setTimeout(r, speedRef.current))

        // Each picks left fork
        for (let i = 0; i < 5; i++) {
            if (await checkState()) return
            forkOwners[i] = i
            states[i] = 'hungry'
            setForks([...forkOwners])
            setPhilosophers(PHILOSOPHER_NAMES.map((name, j) => ({ id: j, name, state: states[j] })))
            say(`${PHILOSOPHER_NAMES[i]} picked up left fork ${i}`)
            if (soundEnabled) playTone(200 + i * 50, 50)
            await new Promise(r => setTimeout(r, speedRef.current))
        }

        // Try right fork - Circular Wait condition
        say('CRITICAL: All philosophers are now waiting for the right fork.')
        if (soundEnabled) playTone(150, 500, 'sawtooth')
        await new Promise(r => setTimeout(r, speedRef.current))

        for (let i = 0; i < 5; i++) {
            states[i] = 'deadlocked'
        }
        setPhilosophers(PHILOSOPHER_NAMES.map((name, j) => ({ id: j, name, state: 'deadlocked' })))
        say('SYSTEM HALTED: DEADLOCK. Circular wait detected, resources frozen.')

        // Jitter to symbolize deadlock
        for (let t = 0; t < 6; t++) {
            if (await checkState()) return
            if (soundEnabled) playTone(100, 30, 'square')
            await new Promise(r => setTimeout(r, speedRef.current / 2))
        }
    }

    const processStart = async () => {
        resetVis()

        // Wait a tiny bit for the reset to settle
        await new Promise(r => setTimeout(r, 50))

        setIsRunning(true)
        setIsPaused(false)
        isRunningRef.current = true
        isPausedRef.current = false

        if (soundEnabled) playClick()
        await new Promise(r => setTimeout(r, 50))

        if (algorithm === 'dining') await runDining()
        else if (algorithm === 'prodcons') await runProdCons()
        else if (algorithm === 'deadlock') await runDeadlock()

        if (await checkState()) return
        setIsRunning(false)
        isRunningRef.current = false
    }

    // --- RENDERING VIEWS ---

    const renderDiningPhilosophers = () => {
        const cx = 300, cy = 250, radius = 160
        return (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-4">
                <svg viewBox="60 20 480 460" className="w-full h-full max-h-full max-w-full">
                    {/* Table */}
                    <circle cx={cx} cy={cy} r={radius - 40} fill="var(--bg-card)" stroke="var(--border-glass)" strokeWidth="4" />

                    {/* Philosophers */}
                    {philosophers.map((p, i) => {
                        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
                        const px = cx + radius * Math.cos(angle)
                        const py = cy + radius * Math.sin(angle)

                        const stateColors = {
                            thinking: 'var(--primary)',
                            eating: 'var(--success)',
                            hungry: 'var(--warning)',
                            deadlocked: 'var(--danger)'
                        }
                        const stateEmoji = { thinking: '💭', eating: '🍽️', hungry: '⏰', deadlocked: '💀' }

                        return (
                            <g key={p.id}>
                                <motion.circle
                                    cx={px} cy={py} r="35"
                                    fill="var(--bg-elevated)"
                                    stroke={stateColors[p.state] || 'var(--border-glass)'}
                                    strokeWidth="4"
                                    animate={p.state === 'deadlocked' ? { x: [0, -4, 4, -4, 0] } : { scale: p.state === 'eating' ? 1.1 : 1 }}
                                    transition={p.state === 'deadlocked' ? { repeat: Infinity, duration: 0.2 } : { duration: 0.3 }}
                                />
                                <text x={px} y={py + 5} textAnchor="middle" fontSize="22">{stateEmoji[p.state]}</text>
                                <text x={px} y={py + 55} textAnchor="middle" fill="var(--text-primary)" fontSize="12" fontWeight="bold">
                                    {p.name}
                                </text>
                                <text x={px} y={py - 45} textAnchor="middle" fill={stateColors[p.state]} fontSize="10" fontWeight="bold" className="uppercase tracking-widest">
                                    {p.state}
                                </text>
                            </g>
                        )
                    })}

                    {/* Forks */}
                    {forks.map((owner, i) => {
                        const angle = ((i + 0.5) * 2 * Math.PI) / 5 - Math.PI / 2
                        // If taken, move fork closer to the owner's position
                        let fx = cx + (radius - 60) * Math.cos(angle)
                        let fy = cy + (radius - 60) * Math.sin(angle)

                        if (owner !== null) {
                            const ownerAngle = (owner * 2 * Math.PI) / 5 - Math.PI / 2
                            fx = cx + (radius - 20) * Math.cos(ownerAngle) + (i === owner ? -20 : 20)
                            fy = cy + (radius - 20) * Math.sin(ownerAngle) + (i === owner ? -20 : 20)
                        }

                        return (
                            <motion.g key={`fork-${i}`} animate={{ x: fx - (cx + (radius - 60) * Math.cos(angle)), y: fy - (cy + (radius - 60) * Math.sin(angle)) }}>
                                <circle
                                    cx={cx + (radius - 60) * Math.cos(angle)}
                                    cy={cy + (radius - 60) * Math.sin(angle)}
                                    r="14"
                                    fill={owner !== null ? 'var(--warning)' : 'var(--bg-elevated)'}
                                    stroke="var(--border-glass)"
                                    strokeWidth="2"
                                />
                                <text
                                    x={cx + (radius - 60) * Math.cos(angle)}
                                    y={cy + (radius - 60) * Math.sin(angle) + 4}
                                    textAnchor="middle" fontSize="12"
                                >🍴</text>
                            </motion.g>
                        )
                    })}
                </svg>
            </div>
        )
    }

    const renderProdCons = () => (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-12 overflow-hidden px-4">
            <div className="flex w-full items-center justify-between max-w-3xl mx-auto z-10 scale-[1.15] origin-center">
                {/* PRODUCER */}
                <div className="flex flex-col items-center gap-4 shrink-0">
                    <motion.div
                        className={`size-24 rounded-full flex items-center justify-center text-3xl border-4 shadow-xl z-20
                            ${producerState === 'producing' ? 'bg-primary border-primary/50 shadow-primary/30' :
                                producerState === 'waiting' ? 'bg-warning border-warning/50 shadow-warning/30' :
                                    'bg-bg-elevated border-border-glass'}`}
                        animate={producerState === 'producing' ? { scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] } : {}}
                    >
                        🏭
                    </motion.div>
                    <div className="text-center">
                        <h4 className="font-black text-white uppercase tracking-widest text-sm">Producer</h4>
                        <span className={`text-xs font-bold uppercase tracking-widest
                            ${producerState === 'producing' ? 'text-primary' : producerState === 'waiting' ? 'text-warning' : 'text-text-muted'}`}>
                            {producerState}
                        </span>
                    </div>
                </div>

                {/* PIPE 1 */}
                <div className={`flex-1 h-0 border-t-4 border-dashed mx-4 mt-[-40px] opacity-60 transition-colors
                    ${producerState === 'producing' ? 'border-primary animate-pulse opacity-100' : 'border-border-glass'}`} />

                {/* SHARED BUFFER */}
                <div className="flex flex-col items-center gap-4 z-10 shrink-0">
                    <h4 className="font-black text-text-muted uppercase tracking-widest text-xs">Shared Buffer Queue</h4>
                    <div className="flex gap-2 p-3 rounded-2xl bg-bg-card border border-border-glass shadow-inner h-20 items-end">
                        {Array.from({ length: bufferSize }).map((_, i) => (
                            <div key={i} className="w-12 h-14 rounded-xl border border-border-glass bg-bg-elevated/50 flex flex-col justify-end overflow-hidden relative">
                                <AnimatePresence>
                                    {buffer[i] && (
                                        <motion.div
                                            initial={{ y: 50, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -50, opacity: 0 }}
                                            className="absolute inset-0 bg-success flex items-center justify-center font-black text-white neo-glow shadow-success/50"
                                        >
                                            {buffer[i]}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                    <span className="text-xs font-mono text-white bg-bg-elevated px-4 py-1 rounded-full border border-border-glass">
                        Load: {buffer.length} / {bufferSize}
                    </span>
                </div>

                {/* PIPE 2 */}
                <div className={`flex-1 h-0 border-t-4 border-dashed mx-4 mt-[-40px] opacity-60 transition-colors
                    ${consumerState === 'consuming' ? 'border-accent-orange animate-pulse opacity-100' : 'border-border-glass'}`} />

                {/* CONSUMER */}
                <div className="flex flex-col items-center gap-4 shrink-0">
                    <motion.div
                        className={`size-24 rounded-full flex items-center justify-center text-3xl border-4 shadow-xl z-20
                            ${consumerState === 'consuming' ? 'bg-accent-orange border-accent-orange/50 shadow-accent-orange/30' :
                                consumerState === 'waiting' ? 'bg-warning border-warning/50 shadow-warning/30' :
                                    'bg-bg-elevated border-border-glass'}`}
                        animate={consumerState === 'consuming' ? { scale: [1, 1.1, 1], rotate: [0, -10, 10, 0] } : {}}
                    >
                        🛒
                    </motion.div>
                    <div className="text-center">
                        <h4 className="font-black text-white uppercase tracking-widest text-sm">Consumer</h4>
                        <span className={`text-xs font-bold uppercase tracking-widest
                            ${consumerState === 'consuming' ? 'text-accent-orange' : consumerState === 'waiting' ? 'text-warning' : 'text-text-muted'}`}>
                            {consumerState}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )

    // --- SUB-COMPONENTS ---

    const Controls = (
        <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Scenario Switcher</h3>

            <div className="grid grid-cols-1 gap-2">
                {CONC_ALGOS.map(alg => (
                    <button
                        key={alg.id}
                        disabled={isRunning}
                        onClick={() => { setAlgorithm(alg.id); if (soundEnabled) playClick(); }}
                        className={`py-3 px-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all flex items-center justify-between
                            ${algorithm === alg.id
                                ? 'bg-primary text-black shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                                : 'bg-bg-elevated border border-border-glass text-text-muted hover:text-white disabled:opacity-50'}`}
                    >
                        {alg.label}
                        {algorithm === alg.id && <GitCommit size={14} />}
                    </button>
                ))}
            </div>

            <div className="h-px w-full bg-border-glass my-4"></div>

            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Execution</h3>
            <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-text-muted uppercase">
                    <span>Tick Speed</span>
                    <span className="font-mono bg-bg-elevated px-2 py-1 rounded text-primary">{speed}ms</span>
                </div>
                <input
                    type="range" min="100" max="1000" step="50"
                    value={1100 - speed}
                    onChange={(e) => setSpeed(1100 - parseInt(e.target.value))}
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
            <div className={`bg-bg-elevated rounded-xl p-4 border ${algorithm === 'prodcons' ? (buffer.length === bufferSize ? 'border-danger/50' : 'border-border-glass') : 'border-border-glass'} col-span-2 flex justify-between items-center transition-colors`}>
                <div>
                    <p className="flex items-center gap-2 text-[10px] font-black tracking-widest text-text-muted uppercase">
                        Current Scenario
                    </p>
                    <p className="text-lg font-black mt-1 text-white">
                        {CONC_ALGOS.find(a => a.id === algorithm)?.label}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black tracking-widest text-text-muted uppercase">Status</p>
                    <p className={`text-sm font-black mt-1 uppercase tracking-widest ${isRunning ? (isPaused ? 'text-warning' : 'text-success') : 'text-primary'}`}>
                        {isRunning ? (isPaused ? 'Paused' : 'Running') : 'Idle'}
                    </p>
                </div>
            </div>

            {algorithm === 'dining' || algorithm === 'deadlock' ? (
                <>
                    <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass text-center">
                        <p className="text-[10px] items-center justify-center font-black tracking-widest text-text-muted uppercase mb-1">Starving</p>
                        <p className="text-2xl font-black text-warning font-mono">{philosophers.filter(p => p.state === 'hungry').length}</p>
                    </div>
                    <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass text-center">
                        <p className="text-[10px] font-black tracking-widest text-text-muted uppercase mb-1">Eating</p>
                        <p className="text-2xl font-black text-success font-mono">{philosophers.filter(p => p.state === 'eating').length}</p>
                    </div>
                </>
            ) : (
                <>
                    <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass text-center">
                        <p className="text-[10px] items-center justify-center font-black tracking-widest text-text-muted uppercase mb-1">Producer Wait</p>
                        <p className={`text-2xl font-black font-mono ${producerState === 'waiting' ? 'text-danger' : 'text-white'}`}>{producerState === 'waiting' ? 'YES' : 'NO'}</p>
                    </div>
                    <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass text-center">
                        <p className="text-[10px] font-black tracking-widest text-text-muted uppercase mb-1">Consumer Wait</p>
                        <p className={`text-2xl font-black font-mono ${consumerState === 'waiting' ? 'text-danger' : 'text-white'}`}>{consumerState === 'waiting' ? 'YES' : 'NO'}</p>
                    </div>
                </>
            )}

        </div>
    )

    return (
        <StitchVisualizerLayout
            title="Concurrency"
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={logs}
        >
            <div className="relative w-full h-full flex flex-col p-8 bg-[#0A0A0F] gap-6 overflow-hidden">
                <div className="flex-1 bg-bg-elevated border border-border-glass rounded-2xl p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-4 relative z-10">
                        <GitCommit className="text-primary" size={24} />
                        <h4 className="text-lg font-black tracking-widest text-white uppercase">OS Thread Simulation</h4>
                    </div>

                    <div className="w-full flex-1 relative mt-4 overflow-visible">
                        {algorithm === 'prodcons' ? renderProdCons() : renderDiningPhilosophers()}
                    </div>
                </div>
            </div>
        </StitchVisualizerLayout>
    )
}

export default ConcurrencyVisualizer
