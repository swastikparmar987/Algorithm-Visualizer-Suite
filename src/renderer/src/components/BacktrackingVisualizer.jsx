import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Activity, Grid3x3, ShieldCheck, ShieldAlert } from 'lucide-react'
import StitchVisualizerLayout from './common/StitchVisualizerLayout'
import { playStep, playSuccess, playClick, playTone } from '../utils/SoundEngine'
import { useAppStore } from '../store/useAppStore'

const BT_ALGOS = [
    { id: 'nqueens', label: 'N-Queens' },
    { id: 'sudoku', label: 'Sudoku Solver' }
]

const SUDOKU_PUZZLE = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
]

function BacktrackingVisualizer({ onBack }) {
    const theme = useAppStore(s => s.theme)
    const soundEnabled = useAppStore(s => s.soundEnabled)

    const [selectedAlgo, setSelectedAlgo] = useState('nqueens')

    // Core State
    const [board, setBoard] = useState([])
    const [activeCell, setActiveCell] = useState(null)
    const [conflictCells, setConflictCells] = useState([])

    // Inputs
    const [boardSize, setBoardSize] = useState(8)
    const [steps, setSteps] = useState(0)

    // Control States
    const [speed, setSpeed] = useState(250)
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [logs, setLogs] = useState("Select an algorithm and click Start.")

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

    const incrementSteps = () => {
        stepsRef.current += 1
        setSteps(stepsRef.current)
    }

    const resetVis = () => {
        setIsRunning(false)
        setIsPaused(false)
        isRunningRef.current = false
        isPausedRef.current = false
        setBoard([])
        setActiveCell(null)
        setConflictCells([])
        setSteps(0)
        stepsRef.current = 0
        say("Reset ready.")
    }

    // --- ALGORITHMS ---

    const runNQueens = async () => {
        const n = Math.min(10, Math.max(4, boardSize))
        const b = Array.from({ length: n }, () => new Array(n).fill(0))
        setBoard(b.map(r => [...r]))
        say(`Starting N-Queens visualization for a ${n}x${n} board.`)

        const isSafe = (board, row, col) => {
            let conflicts = []
            // Check column
            for (let i = 0; i < row; i++) if (board[i][col]) conflicts.push(`${i}-${col}`)
            // Check upper diagonal on left side
            for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) if (board[i][j]) conflicts.push(`${i}-${j}`)
            // Check upper diagonal on right side
            for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) if (board[i][j]) conflicts.push(`${i}-${j}`)

            return { safe: conflicts.length === 0, conflicts }
        }

        const solve = async (board, row) => {
            if (await checkState()) return false
            if (row >= n) return true

            for (let col = 0; col < n; col++) {
                if (await checkState()) return false
                incrementSteps()

                setActiveCell(`${row}-${col}`)
                if (soundEnabled) playStep(col, n)
                say(`Checking position (${row}, ${col})...`)

                const { safe, conflicts } = isSafe(board, row, col)

                if (safe) {
                    board[row][col] = 1
                    setBoard(board.map(r => [...r]))
                    setConflictCells([])
                    say(`Queen safely placed at (${row}, ${col}). Target lower rows.`)
                    if (soundEnabled) playTone(400 + (row * 50), 100, 'sine')

                    await new Promise(r => setTimeout(r, 1050 - speedRef.current))

                    if (await solve(board, row + 1)) return true

                    board[row][col] = 0
                    setBoard(board.map(r => [...r]))
                    say(`Backtracking from (${row}, ${col}). Need alternative column in row ${row}.`)
                    setConflictCells([`${row}-${col}`])
                    if (soundEnabled) playTone(200, 100, 'sawtooth')

                    await new Promise(r => setTimeout(r, 1050 - speedRef.current))
                } else {
                    setConflictCells(conflicts)
                    say(`Conflict found at (${row}, ${col}) with placed queens. Unsafe.`)
                    if (soundEnabled) playTone(150, 50, 'square', 0.1)
                    await new Promise(r => setTimeout(r, (1050 - speedRef.current) / 2))
                }
            }
            return false
        }

        if (await solve(b, 0)) {
            setActiveCell(null)
            setConflictCells([])
            say(`✅ Solution found in ${stepsRef.current} steps!`)
            if (soundEnabled) playSuccess()
        } else {
            setActiveCell(null)
            setConflictCells([])
            say(`❌ No solution exists for ${n}x${n} board.`)
        }
    }

    const runSudoku = async () => {
        const b = SUDOKU_PUZZLE.map(r => [...r])
        setBoard(b.map(r => [...r]))
        say(`Starting Sudoku Backtracking Solver...`)
        await new Promise(r => setTimeout(r, 1000))

        const isValid = (b, r, c, num) => {
            let conflicts = []
            // Check row and col
            for (let x = 0; x < 9; x++) {
                if (b[r][x] === num) conflicts.push(`${r}-${x}`)
                if (b[x][c] === num) conflicts.push(`${x}-${c}`)
            }
            // Check 3x3 box
            const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (b[br + i][bc + j] === num) conflicts.push(`${br + i}-${bc + j}`)
                }
            }
            // Remove the cell itself from conflicts if checking
            conflicts = conflicts.filter(id => id !== `${r}-${c}`)
            return { valid: conflicts.length === 0, conflicts }
        }

        const solve = async (b) => {
            if (await checkState()) return false

            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (b[r][c] === 0) {
                        for (let num = 1; num <= 9; num++) {
                            if (await checkState()) return false
                            incrementSteps()

                            setActiveCell(`${r}-${c}`)
                            b[r][c] = num
                            setBoard(b.map(row => [...row]))

                            const { valid, conflicts } = isValid(b, r, c, num)

                            if (valid) {
                                setConflictCells([])
                                say(`Trying ${num} at (${r}, ${c}). Looking safe.`)
                                if (soundEnabled) playStep(num, 9)

                                await new Promise(res => setTimeout(res, 1050 - speedRef.current))

                                if (await solve(b)) return true

                                b[r][c] = 0 // backtrack
                                setBoard(b.map(row => [...row]))
                                say(`Backtracking. Removing ${num} from (${r}, ${c}).`)
                                setConflictCells([`${r}-${c}`])
                                if (soundEnabled) playTone(200, 50, 'square')

                                await new Promise(res => setTimeout(res, (1050 - speedRef.current) / 2))
                            } else {
                                setConflictCells(conflicts)
                                if (soundEnabled && (1050 - speedRef.current) > 200) playTone(100, 30, 'sawtooth', 0.05)
                                await new Promise(res => setTimeout(res, (1050 - speedRef.current) / 4))
                            }
                        }
                        // Exhausted all 1-9
                        b[r][c] = 0
                        setBoard(b.map(row => [...row]))
                        return false
                    }
                }
            }
            return true
        }

        if (await solve(b)) {
            setActiveCell(null)
            setConflictCells([])
            say(`✅ Sudoku solved in ${stepsRef.current} steps!`)
            if (soundEnabled) playSuccess()
        } else {
            say(`❌ Puzzle is unsolvable.`)
        }
    }

    const processStart = async () => {
        setIsRunning(true)
        setIsPaused(false)
        setBoard([])
        setActiveCell(null)
        setConflictCells([])
        setSteps(0)
        stepsRef.current = 0
        if (soundEnabled) playClick()

        await new Promise(r => setTimeout(r, 50))

        if (selectedAlgo === 'nqueens') await runNQueens()
        else if (selectedAlgo === 'sudoku') await runSudoku()

        setIsRunning(false)
    }

    // --- RENDERING ---

    const renderNQueens = () => {
        if (board.length === 0) return null
        const n = board.length

        return (
            <div className="flex flex-col gap-1 items-center bg-bg-elevated p-6 rounded-2xl border border-border-glass shadow-2xl overflow-auto max-h-[60vh]">
                {board.map((row, r) => (
                    <div key={`r-${r}`} className="flex gap-1">
                        {row.map((cell, c) => {
                            const cellId = `${r}-${c}`
                            const isDark = (r + c) % 2 === 1
                            const isActive = activeCell === cellId
                            const isConflict = conflictCells.includes(cellId)
                            const hasQueen = cell === 1

                            // Cell background logic
                            let bgClass = isDark ? 'bg-[#2A2A35]' : 'bg-[#3A3A48]'
                            let borderClass = 'border-transparent'

                            if (isActive) {
                                bgClass = 'bg-primary/20'
                                borderClass = 'border-primary'
                            } else if (isConflict) {
                                bgClass = 'bg-danger/20'
                                borderClass = 'border-danger'
                            }

                            return (
                                <motion.div
                                    key={cellId}
                                    className={`relative flex items-center justify-center w-[45px] h-[45px] rounded-sm border-2 ${bgClass} ${borderClass} transition-colors`}
                                >
                                    <AnimatePresence>
                                        {hasQueen && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0, rotate: 180 }}
                                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                className={`text-3xl ${isConflict ? 'text-danger drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-accent-orange drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]'}`}
                                            >
                                                ♛
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )
                        })}
                    </div>
                ))}
            </div>
        )
    }

    const renderSudoku = () => {
        if (board.length === 0) return null

        return (
            <div className="bg-[#1e1e24] p-2 rounded-xl border border-border-glass shadow-2xl flex flex-col gap-[2px]">
                {board.map((row, r) => (
                    <div key={`r-${r}`} className={`flex gap-[2px] ${r % 3 === 2 && r !== 8 ? 'mb-2' : ''}`}>
                        {row.map((cell, c) => {
                            const cellId = `${r}-${c}`
                            const isFixed = SUDOKU_PUZZLE[r]?.[c] !== 0
                            const isActive = activeCell === cellId
                            const isConflict = conflictCells.includes(cellId)

                            let bgClass = 'bg-[#2A2A35]'
                            let textClass = isFixed ? 'text-text-secondary font-semibold' : 'text-white font-black'

                            if (isActive) {
                                bgClass = 'bg-primary border border-primary text-black'
                                textClass = 'text-black font-black'
                            } else if (isConflict) {
                                bgClass = 'bg-danger/80 border border-danger'
                                textClass = 'text-white'
                            } else if (!isFixed && cell !== 0) {
                                textClass = 'text-accent-cyan font-black drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]'
                            }

                            return (
                                <div
                                    key={cellId}
                                    className={`relative flex items-center justify-center w-[40px] h-[40px] rounded-sm transition-colors ${bgClass} ${c % 3 === 2 && c !== 8 ? 'mr-2' : ''}`}
                                >
                                    <span className={`text-lg transition-all ${textClass}`}>
                                        {cell !== 0 ? cell : ''}
                                    </span>
                                </div>
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
                {BT_ALGOS.map(algo => (
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

            {selectedAlgo === 'nqueens' && (
                <div>
                    <label className="text-xs font-bold text-text-muted uppercase">Board Size (N)</label>
                    <input
                        type="number" min="4" max="10"
                        value={boardSize} onChange={e => setBoardSize(parseInt(e.target.value) || 4)}
                        disabled={isRunning}
                        className="w-full bg-bg-elevated text-white rounded-lg p-2 mt-1 border border-border-glass focus:border-primary"
                    />
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
                <div className="flex items-center gap-2 text-xs text-text-muted font-bold"><ShieldCheck size={14} className="text-primary" /> Safe Cell Check</div>
                <div className="flex items-center gap-2 text-xs text-text-muted font-bold"><ShieldAlert size={14} className="text-danger" /> Rule Conflict</div>
            </div>
        </div>
    )

    const Metrics = (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass">
                <p className="text-[10px] font-black tracking-widest text-text-muted uppercase">Algorithm</p>
                <p className="text-xl font-bold text-white mt-1 uppercase tracking-tighter">Backtracking</p>
            </div>
            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                <p className="text-[10px] font-black tracking-widest text-text-muted uppercase relative z-10">Steps Taken</p>
                <p className="text-2xl font-mono text-primary font-black mt-1 relative z-10">{steps}</p>
            </div>
        </div>
    )

    return (
        <StitchVisualizerLayout
            title="Backtracking Search"
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={logs}
        >
            <div className="relative w-full h-full flex flex-col items-center justify-center p-8 overflow-hidden">
                {board.length === 0 ? (
                    <div className="text-text-muted flex flex-col items-center gap-4">
                        <Grid3x3 size={48} className="opacity-20" />
                        <p className="font-mono text-sm uppercase tracking-widest">Awaiting Simulation Matrix</p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center"
                    >
                        {selectedAlgo === 'nqueens' ? renderNQueens() : renderSudoku()}
                    </motion.div>
                )}
            </div>
        </StitchVisualizerLayout>
    )
}

export default BacktrackingVisualizer
