import React, { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Swords, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import ThemeToggle from '../common/ThemeToggle'
import { useAppStore } from '../../store/useAppStore'
import { playBattleStart, playVictory, playClick } from '../../utils/SoundEngine'

const BATTLE_ALGOS = [
    'Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Quick Sort', 'Merge Sort', 'Heap Sort'
]

const ALGO_COLORS = {
    'Bubble Sort': '#6366f1',
    'Selection Sort': '#ec4899',
    'Insertion Sort': '#10b981',
    'Quick Sort': '#f59e0b',
    'Merge Sort': '#06b6d4',
    'Heap Sort': '#a855f7'
}

function AlgorithmBattle({ onBack }) {
    const [leftAlgo, setLeftAlgo] = useState('Bubble Sort')
    const [rightAlgo, setRightAlgo] = useState('Quick Sort')
    const [leftArray, setLeftArray] = useState([])
    const [rightArray, setRightArray] = useState([])
    const [leftStats, setLeftStats] = useState({ comparisons: 0, swaps: 0, time: 0 })
    const [rightStats, setRightStats] = useState({ comparisons: 0, swaps: 0, time: 0 })
    const [isRunning, setIsRunning] = useState(false)
    const [winner, setWinner] = useState(null)
    const [arraySize, setArraySize] = useState(30)
    const stopRef = useRef(false)
    const unlockAchievement = useAppStore(s => s.unlockAchievement)
    const soundEnabled = useAppStore(s => s.soundEnabled)
    const toggleSound = useAppStore(s => s.toggleSound)

    const generateArray = useCallback(() => {
        const arr = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 200) + 10)
        return arr
    }, [arraySize])

    const delay = (ms) => new Promise(res => setTimeout(res, ms))

    // Sort implementations that track comparisons/swaps
    const bubbleSort = async (arr, setArr, setStats, id) => {
        const a = [...arr]; let comps = 0, swps = 0
        for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < a.length - i - 1; j++) {
                if (stopRef.current) return
                comps++
                if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; swps++ }
                if (comps % 3 === 0) { setArr([...a]); setStats(s => ({ ...s, comparisons: comps, swaps: swps })); await delay(1) }
            }
        }
        setArr([...a]); setStats(s => ({ ...s, comparisons: comps, swaps: swps }))
    }

    const selectionSort = async (arr, setArr, setStats) => {
        const a = [...arr]; let comps = 0, swps = 0
        for (let i = 0; i < a.length; i++) {
            let min = i
            for (let j = i + 1; j < a.length; j++) {
                if (stopRef.current) return
                comps++
                if (a[j] < a[min]) min = j
                if (comps % 3 === 0) { setArr([...a]); setStats(s => ({ ...s, comparisons: comps, swaps: swps })); await delay(1) }
            }
            if (min !== i) { [a[i], a[min]] = [a[min], a[i]]; swps++ }
            setArr([...a])
        }
        setStats(s => ({ ...s, comparisons: comps, swaps: swps }))
    }

    const insertionSort = async (arr, setArr, setStats) => {
        const a = [...arr]; let comps = 0, swps = 0
        for (let i = 1; i < a.length; i++) {
            let key = a[i], j = i - 1
            while (j >= 0 && a[j] > key) {
                if (stopRef.current) return
                comps++; a[j + 1] = a[j]; swps++; j--
                if (comps % 3 === 0) { setArr([...a]); setStats(s => ({ ...s, comparisons: comps, swaps: swps })); await delay(1) }
            }
            a[j + 1] = key; comps++
        }
        setArr([...a]); setStats(s => ({ ...s, comparisons: comps, swaps: swps }))
    }

    const quickSortImpl = async (a, lo, hi, setArr, setStats, statsObj) => {
        if (lo >= hi || stopRef.current) return
        let pivot = a[hi], i = lo
        for (let j = lo; j < hi; j++) {
            if (stopRef.current) return
            statsObj.comps++
            if (a[j] < pivot) { [a[i], a[j]] = [a[j], a[i]]; statsObj.swps++; i++ }
            if (statsObj.comps % 3 === 0) { setArr([...a]); setStats(s => ({ ...s, comparisons: statsObj.comps, swaps: statsObj.swps })); await delay(1) }
        }
        [a[i], a[hi]] = [a[hi], a[i]]; statsObj.swps++
        setArr([...a])
        await quickSortImpl(a, lo, i - 1, setArr, setStats, statsObj)
        await quickSortImpl(a, i + 1, hi, setArr, setStats, statsObj)
    }

    const quickSort = async (arr, setArr, setStats) => {
        const a = [...arr]; const s = { comps: 0, swps: 0 }
        await quickSortImpl(a, 0, a.length - 1, setArr, setStats, s)
        setArr([...a]); setStats(st => ({ ...st, comparisons: s.comps, swaps: s.swps }))
    }

    const mergeSortImpl = async (a, l, r, setArr, setStats, statsObj) => {
        if (l >= r || stopRef.current) return
        const m = Math.floor((l + r) / 2)
        await mergeSortImpl(a, l, m, setArr, setStats, statsObj)
        await mergeSortImpl(a, m + 1, r, setArr, setStats, statsObj)
        const temp = []; let i = l, j = m + 1
        while (i <= m && j <= r) {
            if (stopRef.current) return
            statsObj.comps++
            if (a[i] <= a[j]) temp.push(a[i++])
            else { temp.push(a[j++]); statsObj.swps++ }
            if (statsObj.comps % 5 === 0) { setArr([...a]); setStats(s => ({ ...s, comparisons: statsObj.comps, swaps: statsObj.swps })); await delay(1) }
        }
        while (i <= m) temp.push(a[i++])
        while (j <= r) temp.push(a[j++])
        for (let k = 0; k < temp.length; k++) a[l + k] = temp[k]
        setArr([...a])
    }

    const mergeSort = async (arr, setArr, setStats) => {
        const a = [...arr]; const s = { comps: 0, swps: 0 }
        await mergeSortImpl(a, 0, a.length - 1, setArr, setStats, s)
        setArr([...a]); setStats(st => ({ ...st, comparisons: s.comps, swaps: s.swps }))
    }

    const heapSortImpl = async (a, setArr, setStats, statsObj) => {
        const n = a.length
        const heapify = async (n, i) => {
            let max = i, l = 2 * i + 1, r = 2 * i + 2
            if (l < n) { statsObj.comps++; if (a[l] > a[max]) max = l }
            if (r < n) { statsObj.comps++; if (a[r] > a[max]) max = r }
            if (max !== i) {
                [a[i], a[max]] = [a[max], a[i]]; statsObj.swps++
                if (statsObj.comps % 3 === 0) { setArr([...a]); setStats(s => ({ ...s, comparisons: statsObj.comps, swaps: statsObj.swps })); await delay(1) }
                await heapify(n, max)
            }
        }
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) { if (stopRef.current) return; await heapify(n, i) }
        for (let i = n - 1; i > 0; i--) {
            if (stopRef.current) return
            [a[0], a[i]] = [a[i], a[0]]; statsObj.swps++
            setArr([...a])
            await heapify(i, 0)
        }
    }

    const heapSort = async (arr, setArr, setStats) => {
        const a = [...arr]; const s = { comps: 0, swps: 0 }
        await heapSortImpl(a, setArr, setStats, s)
        setArr([...a]); setStats(st => ({ ...st, comparisons: s.comps, swaps: s.swps }))
    }

    const getSort = (name) => {
        const map = {
            'Bubble Sort': bubbleSort, 'Selection Sort': selectionSort, 'Insertion Sort': insertionSort,
            'Quick Sort': quickSort, 'Merge Sort': mergeSort, 'Heap Sort': heapSort
        }
        return map[name]
    }

    const handleStart = async () => {
        const baseArr = generateArray()
        setLeftArray([...baseArr]); setRightArray([...baseArr])
        setLeftStats({ comparisons: 0, swaps: 0, time: 0 }); setRightStats({ comparisons: 0, swaps: 0, time: 0 })
        setWinner(null); setIsRunning(true); stopRef.current = false
        if (soundEnabled) playBattleStart()

        const leftSort = getSort(leftAlgo)
        const rightSort = getSort(rightAlgo)

        const t1 = performance.now()
        const leftPromise = leftSort([...baseArr], setLeftArray, setLeftStats)
            .then(() => { setLeftStats(s => ({ ...s, time: Math.round(performance.now() - t1) })) })
        const rightPromise = rightSort([...baseArr], setRightArray, setRightStats)
            .then(() => { setRightStats(s => ({ ...s, time: Math.round(performance.now() - t1) })) })

        await Promise.all([leftPromise, rightPromise])
        setIsRunning(false)
        if (soundEnabled) playVictory()
        unlockAchievement('battle_winner')
    }

    const handleReset = () => {
        stopRef.current = true; setIsRunning(false)
        setLeftArray([]); setRightArray([]); setWinner(null)
        setLeftStats({ comparisons: 0, swaps: 0, time: 0 }); setRightStats({ comparisons: 0, swaps: 0, time: 0 })
    }

    const renderBars = (arr, color) => {
        const maxVal = Math.max(...arr, 1)
        return (
            <div className="battle-bars glass-panel">
                {arr.map((v, i) => (
                    <div key={i} className="battle-bar" style={{ height: `${(v / maxVal) * 100}%`, background: color }} />
                ))}
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={onBack} className="back-btn"><ArrowLeft size={18} /> Back</button>
                <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Swords size={24} /> Algorithm Battle
                </h2>
                <ThemeToggle />
                <button onClick={toggleSound} title={soundEnabled ? 'Mute' : 'Unmute'}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px',
                        background: soundEnabled ? 'var(--primary)' : 'var(--bg-card)', color: 'white', border: '1px solid var(--border-glass)',
                        cursor: 'pointer', fontSize: '0.85rem'
                    }}>
                    {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
            </div>

            {/* Algo selectors */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                    <label className="control-label">Left Fighter</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                        {BATTLE_ALGOS.map(a => (
                            <button key={a} onClick={() => setLeftAlgo(a)} disabled={isRunning}
                                className={`algo-btn ${leftAlgo === a ? 'active' : ''}`}
                                style={leftAlgo === a ? { background: ALGO_COLORS[a] } : {}}
                            >{a.split(' ')[0]}</button>
                        ))}
                    </div>
                </div>
                <div className="vs-divider">⚔️</div>
                <div style={{ flex: 1 }}>
                    <label className="control-label">Right Fighter</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                        {BATTLE_ALGOS.map(a => (
                            <button key={a} onClick={() => setRightAlgo(a)} disabled={isRunning}
                                className={`algo-btn ${rightAlgo === a ? 'active' : ''}`}
                                style={rightAlgo === a ? { background: ALGO_COLORS[a] } : {}}
                            >{a.split(' ')[0]}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button onClick={handleStart} disabled={isRunning} className="action-btn primary-btn" style={{ padding: '10px 28px' }}>
                    <Play size={16} /> Battle!
                </button>
                <button onClick={handleReset} className="action-btn reset-btn" style={{ padding: '10px 28px' }}>
                    <RotateCcw size={16} /> Reset
                </button>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label className="control-label" style={{ margin: 0 }}>Size: </label>
                    <input type="range" min="10" max="80" value={arraySize} onChange={(e) => setArraySize(Number(e.target.value))}
                        disabled={isRunning} style={{ width: '120px', accentColor: 'var(--primary)' }} />
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{arraySize}</span>
                </div>
            </div>

            {/* Battle Arena */}
            <div className="battle-arena" style={{ flex: 1, minHeight: 0 }}>
                <div className="battle-side">
                    <div className="battle-header glass-panel" style={{ color: ALGO_COLORS[leftAlgo] }}>{leftAlgo}</div>
                    {leftArray.length > 0 ? renderBars(leftArray, ALGO_COLORS[leftAlgo]) : (
                        <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            Click Battle to start
                        </div>
                    )}
                    <div className="battle-stats glass-panel">
                        <div className="battle-stat">
                            <div className="battle-stat-label">Comparisons</div>
                            <div className="battle-stat-value" style={{ color: ALGO_COLORS[leftAlgo] }}>{leftStats.comparisons}</div>
                        </div>
                        <div className="battle-stat">
                            <div className="battle-stat-label">Swaps</div>
                            <div className="battle-stat-value" style={{ color: ALGO_COLORS[leftAlgo] }}>{leftStats.swaps}</div>
                        </div>
                        <div className="battle-stat">
                            <div className="battle-stat-label">Time</div>
                            <div className="battle-stat-value" style={{ color: ALGO_COLORS[leftAlgo] }}>{leftStats.time}ms</div>
                        </div>
                    </div>
                </div>

                <div className="vs-divider">VS</div>

                <div className="battle-side">
                    <div className="battle-header glass-panel" style={{ color: ALGO_COLORS[rightAlgo] }}>{rightAlgo}</div>
                    {rightArray.length > 0 ? renderBars(rightArray, ALGO_COLORS[rightAlgo]) : (
                        <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            Click Battle to start
                        </div>
                    )}
                    <div className="battle-stats glass-panel">
                        <div className="battle-stat">
                            <div className="battle-stat-label">Comparisons</div>
                            <div className="battle-stat-value" style={{ color: ALGO_COLORS[rightAlgo] }}>{rightStats.comparisons}</div>
                        </div>
                        <div className="battle-stat">
                            <div className="battle-stat-label">Swaps</div>
                            <div className="battle-stat-value" style={{ color: ALGO_COLORS[rightAlgo] }}>{rightStats.swaps}</div>
                        </div>
                        <div className="battle-stat">
                            <div className="battle-stat-label">Time</div>
                            <div className="battle-stat-value" style={{ color: ALGO_COLORS[rightAlgo] }}>{rightStats.time}ms</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AlgorithmBattle
