import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Activity } from 'lucide-react'
import StitchVisualizerLayout from './common/StitchVisualizerLayout'
import { playStep, playSuccess, playClick, playTone } from '../utils/SoundEngine'
import { useAppStore } from '../store/useAppStore'

const DP_ALGOS = [
    { id: 'fibonacci', label: 'Fibonacci' },
    { id: 'knapsack', label: '0/1 Knapsack' },
    { id: 'lcs', label: 'L.C.S.' }
]

function DPVisualizer({ onBack }) {
    const theme = useAppStore(s => s.theme)
    const soundEnabled = useAppStore(s => s.soundEnabled)

    const [selectedAlgo, setSelectedAlgo] = useState('fibonacci')
    const [dpTable, setDpTable] = useState([])
    const [readCells, setReadCells] = useState([]) // Array of string ids or indices
    const [writeCell, setWriteCell] = useState(null)
    const [computedCells, setComputedCells] = useState(new Set())

    // Inputs
    const [fibN, setFibN] = useState(10)
    const [strA, setStrA] = useState('ABCBDAB')
    const [strB, setStrB] = useState('BDCAB')

    // Control States
    const [speed, setSpeed] = useState(500)
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [logs, setLogs] = useState("Select an algorithm and click Start.")

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
        setDpTable([])
        setReadCells([])
        setWriteCell(null)
        setComputedCells(new Set())
        say("Reset ready.")
    }

    // --- ALGORITHMS ---

    const runFibonacci = async () => {
        const n = Math.min(20, Math.max(2, fibN))
        const table = new Array(n + 1).fill('')
        table[0] = 0
        table[1] = 1
        setDpTable([...table])
        setComputedCells(new Set([0, 1]))
        say(`Computing Fibonacci(${n}) using tabulation.`)

        for (let i = 2; i <= n; i++) {
            if (await checkState()) return

            setReadCells([i - 1, i - 2])
            setWriteCell(i)
            say(`F(${i}) depends on F(${i - 1}) and F(${i - 2}).`)
            if (soundEnabled) playStep(i, n)

            await new Promise(r => setTimeout(r, 1050 - speedRef.current))
            if (await checkState()) return

            table[i] = table[i - 1] + table[i - 2]
            setDpTable([...table])
            setComputedCells(prev => new Set([...prev, i]))
            say(`F(${i}) = ${table[i - 1]} + ${table[i - 2]} = ${table[i]}.`)

            await new Promise(r => setTimeout(r, (1050 - speedRef.current) / 2))
        }

        setReadCells([])
        setWriteCell(null)
        say(`Completed. Fibonacci(${n}) = ${table[n]}.`)
        if (soundEnabled) playSuccess()
    }

    const runKnapsack = async () => {
        const weights = [2, 3, 4, 5]
        const values = [3, 4, 5, 6]
        const W = 8
        const n = weights.length

        const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(''))

        // Base case initialization
        for (let i = 0; i <= n; i++) dp[i][0] = 0
        for (let w = 0; w <= W; w++) dp[0][w] = 0

        setDpTable(dp.map(r => [...r]))
        const compSet = new Set()
        for (let i = 0; i <= n; i++) compSet.add(`${i}-0`)
        for (let w = 0; w <= W; w++) compSet.add(`0-${w}`)
        setComputedCells(compSet)
        say(`Knapsack: ${n} items, Capacity=${W}. Initializing base cases.`)
        await new Promise(r => setTimeout(r, 1050 - speedRef.current))

        for (let i = 1; i <= n; i++) {
            for (let w = 1; w <= W; w++) {
                if (await checkState()) return

                setWriteCell(`${i}-${w}`)
                let reads = []
                if (weights[i - 1] <= w) {
                    reads = [`${i - 1}-${w}`, `${i - 1}-${w - weights[i - 1]}`]
                    say(`Item ${i} (W:${weights[i - 1]}, V:${values[i - 1]}) fits in capacity ${w}. Max of taking vs not taking.`)
                } else {
                    reads = [`${i - 1}-${w}`]
                    say(`Item ${i} (W:${weights[i - 1]}) exceeds capacity ${w}. Carry over previous value.`)
                }
                setReadCells(reads)
                if (soundEnabled) playStep(w, W)

                await new Promise(r => setTimeout(r, 1050 - speedRef.current))
                if (await checkState()) return

                if (weights[i - 1] <= w) {
                    dp[i][w] = Math.max(dp[i - 1][w], values[i - 1] + dp[i - 1][w - weights[i - 1]])
                } else {
                    dp[i][w] = dp[i - 1][w]
                }

                setDpTable(dp.map(r => [...r]))
                setComputedCells(prev => new Set([...prev, `${i}-${w}`]))
                await new Promise(r => setTimeout(r, (1050 - speedRef.current) / 4))
            }
        }

        setReadCells([])
        setWriteCell(null)
        say(`Completed. Max value possible is ${dp[n][W]}.`)
        if (soundEnabled) playSuccess()
    }

    const runLCS = async () => {
        const m = strA.length
        const n = strB.length
        const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(''))

        // Base case
        for (let i = 0; i <= m; i++) dp[i][0] = 0
        for (let j = 0; j <= n; j++) dp[0][j] = 0

        setDpTable(dp.map(r => [...r]))
        const compSet = new Set()
        for (let i = 0; i <= m; i++) compSet.add(`${i}-0`)
        for (let j = 0; j <= n; j++) compSet.add(`0-${j}`)
        setComputedCells(compSet)
        say(`LCS: "${strA}" vs "${strB}". Initializing base cases.`)
        await new Promise(r => setTimeout(r, 1050 - speedRef.current))

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (await checkState()) return

                setWriteCell(`${i}-${j}`)
                if (strA[i - 1] === strB[j - 1]) {
                    setReadCells([`${i - 1}-${j - 1}`])
                    say(`Match found: '${strA[i - 1]}'. Inherit diagonal + 1.`)
                    if (soundEnabled) playTone(800, 100, 'sine')
                } else {
                    setReadCells([`${i - 1}-${j}`, `${i}-${j - 1}`])
                    say(`Mismatch: '${strA[i - 1]}' != '${strB[j - 1]}'. Max of up vs left.`)
                    if (soundEnabled) playStep(j, n)
                }

                await new Promise(r => setTimeout(r, 1050 - speedRef.current))
                if (await checkState()) return

                if (strA[i - 1] === strB[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
                }

                setDpTable(dp.map(r => [...r]))
                setComputedCells(prev => new Set([...prev, `${i}-${j}`]))
                await new Promise(r => setTimeout(r, (1050 - speedRef.current) / 4))
            }
        }

        setReadCells([])
        setWriteCell(null)
        say(`Completed. LCS length is ${dp[m][n]}.`)
        if (soundEnabled) playSuccess()
    }

    const processStart = async () => {
        setIsRunning(true)
        setIsPaused(false)
        setDpTable([])
        setReadCells([])
        setWriteCell(null)
        setComputedCells(new Set())
        if (soundEnabled) playClick()

        if (selectedAlgo === 'fibonacci') await runFibonacci()
        else if (selectedAlgo === 'knapsack') await runKnapsack()
        else if (selectedAlgo === 'lcs') await runLCS()

        setIsRunning(false)
    }

    // --- RENDERING ---

    const render1DTable = () => {
        if (dpTable.length === 0) return null
        return (
            <div className="flex flex-wrap gap-2 justify-center max-w-2xl mt-12">
                {dpTable.map((val, i) => {
                    const isWrite = writeCell === i
                    const isRead = readCells.includes(i)
                    const isComputed = computedCells.has(i)

                    let bg = 'bg-bg-elevated'
                    let border = 'border-border-glass'
                    if (isWrite) { bg = 'bg-accent-orange/20'; border = 'border-accent-orange' }
                    else if (isRead) { bg = 'bg-primary/20'; border = 'border-primary' }
                    else if (isComputed) { bg = 'bg-success/10'; border = 'border-success/30' }

                    return (
                        <motion.div
                            key={i} layout
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`flex flex-col items-center justify-center w-[50px] h-[50px] rounded-lg border-2 ${bg} ${border} transition-colors`}
                        >
                            <span className="text-[10px] text-text-muted font-bold absolute -top-5">i={i}</span>
                            <span className={`font-black text-lg ${isWrite ? 'text-accent-orange' : isRead ? 'text-primary' : 'text-white'}`}>
                                {val}
                            </span>
                        </motion.div>
                    )
                })}
            </div>
        )
    }

    const render2DTable = () => {
        if (dpTable.length === 0) return null
        const rows = dpTable.length
        const cols = dpTable[0].length

        return (
            <div className="flex flex-col gap-1 items-center mt-8 overflow-auto max-h-[60vh] p-4">
                {/* Headers if LCS */}
                {selectedAlgo === 'lcs' && (
                    <div className="flex gap-1 ml-12">
                        <div className="w-[45px]"></div>
                        <div className="w-[45px] text-center text-text-muted font-bold">∅</div>
                        {strB.split('').map((char, j) => (
                            <div key={`header-col-${j}`} className="w-[45px] text-center text-primary font-bold">{char}</div>
                        ))}
                    </div>
                )}
                {selectedAlgo === 'knapsack' && (
                    <div className="flex gap-1 ml-12">
                        {Array.from({ length: cols }).map((_, j) => (
                            <div key={`header-w-${j}`} className="w-[45px] text-center text-text-muted text-[10px] font-bold pb-1">W:{j}</div>
                        ))}
                    </div>
                )}

                {dpTable.map((row, i) => (
                    <div key={`row-${i}`} className="flex gap-1">
                        {/* Row Labels */}
                        {selectedAlgo === 'lcs' && (
                            <div className="w-[45px] flex items-center justify-center font-bold text-accent-cyan shrink-0">
                                {i === 0 ? '∅' : strA[i - 1]}
                            </div>
                        )}
                        {selectedAlgo === 'knapsack' && (
                            <div className="w-[45px] flex items-center justify-end pr-2 text-[10px] font-bold text-text-muted shrink-0">
                                {i === 0 ? 'Base' : `I:${i}`}
                            </div>
                        )}

                        {row.map((val, j) => {
                            const cellId = `${i}-${j}`
                            const isWrite = writeCell === cellId
                            const isRead = readCells.includes(cellId)
                            const isComputed = computedCells.has(cellId)

                            let bg = 'bg-bg-elevated'
                            let border = 'border-border-glass'
                            if (isWrite) { bg = 'bg-accent-orange/20'; border = 'border-accent-orange' }
                            else if (isRead) { bg = 'bg-primary/20'; border = 'border-primary' }
                            else if (isComputed) { bg = 'bg-success/10'; border = 'border-success/30' }

                            return (
                                <motion.div
                                    key={cellId}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={`flex items-center justify-center w-[45px] h-[45px] rounded border ${bg} ${border} transition-colors`}
                                >
                                    <span className={`font-black ${isWrite ? 'text-accent-orange' : isRead ? 'text-primary' : 'text-white'}`}>
                                        {val}
                                    </span>
                                </motion.div>
                            )
                        })}
                    </div>
                ))}
            </div>
        )
    }

    const Controls = (
        <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Algorithm Target</h3>
            <div className="grid grid-cols-1 gap-2">
                {DP_ALGOS.map(algo => (
                    <button
                        key={algo.id}
                        onClick={() => { setSelectedAlgo(algo.id); resetVis(); }}
                        className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left flex items-center justify-between group ${selectedAlgo === algo.id ? 'bg-primary/20 text-primary border border-primary/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-bg-elevated text-text-secondary border border-border-glass hover:bg-white/5 hover:text-white hover:border-white/20'}`}
                    >
                        <span>{algo.label}</span>
                        {selectedAlgo === algo.id && <Activity size={14} className="animate-pulse" />}
                    </button>
                ))}
            </div>

            <div className="h-px w-full bg-border-glass my-4"></div>

            {selectedAlgo === 'fibonacci' && (
                <div>
                    <label className="text-xs font-bold text-text-muted uppercase">N Value</label>
                    <input
                        type="number" value={fibN} onChange={e => setFibN(e.target.value)}
                        disabled={isRunning}
                        className="w-full bg-bg-elevated text-white rounded-lg p-2 mt-1 border border-border-glass focus:border-primary"
                    />
                </div>
            )}

            {selectedAlgo === 'lcs' && (
                <div className="space-y-2">
                    <div>
                        <label className="text-xs font-bold text-text-muted uppercase">String A</label>
                        <input
                            type="text" value={strA} onChange={e => setStrA(e.target.value.toUpperCase())}
                            disabled={isRunning}
                            className="w-full bg-bg-elevated text-white rounded-lg p-2 border border-border-glass focus:border-primary font-mono text-xs uppercase"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-text-muted uppercase">String B</label>
                        <input
                            type="text" value={strB} onChange={e => setStrB(e.target.value.toUpperCase())}
                            disabled={isRunning}
                            className="w-full bg-bg-elevated text-white rounded-lg p-2 border border-border-glass focus:border-primary font-mono text-xs uppercase"
                        />
                    </div>
                </div>
            )}

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

            <div className="p-4 bg-bg-elevated rounded-xl border border-border-glass mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-text-muted font-bold"><div className="w-3 h-3 rounded bg-accent-orange/20 border border-accent-orange"></div> Target Cell (Write)</div>
                <div className="flex items-center gap-2 text-xs text-text-muted font-bold"><div className="w-3 h-3 rounded bg-primary/20 border border-primary"></div> Dependency Cells (Read)</div>
            </div>
        </div>
    )

    const Metrics = (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass">
                <p className="text-[10px] font-black tracking-widest text-text-muted uppercase">Table Size</p>
                <p className="text-2xl font-mono text-white mt-1">
                    {dpTable.length === 0 ? '0' : selectedAlgo === 'fibonacci' ? dpTable.length : `${dpTable.length} x ${dpTable[0].length}`}
                </p>
            </div>
            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass">
                <p className="text-[10px] font-black tracking-widest text-text-muted uppercase">Computed Cells</p>
                <p className="text-2xl font-mono text-primary mt-1">{computedCells.size}</p>
            </div>
        </div>
    )

    return (
        <StitchVisualizerLayout
            title="Dynamic Programming"
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={logs}
        >
            <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
                {dpTable.length === 0 ? (
                    <div className="text-text-muted flex flex-col items-center gap-4">
                        <Activity size={48} className="opacity-20" />
                        <p className="font-mono text-sm uppercase tracking-widest">Awaiting execution matrix</p>
                    </div>
                ) : (
                    selectedAlgo === 'fibonacci' ? render1DTable() : render2DTable()
                )}
            </div>
        </StitchVisualizerLayout>
    )
}

export default DPVisualizer

