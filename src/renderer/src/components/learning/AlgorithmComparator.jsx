import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitCompare, Play, RotateCcw, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react'
import StitchVisualizerLayout from '../common/StitchVisualizerLayout'
import { useAppStore } from '../../store/useAppStore'
import { playClick, playStep } from '../../utils/SoundEngine'

const ALGO_LIST = [
    { id: 'bubble', label: 'Bubble Sort', type: 'sort', complexity: 'O(n²)' },
    { id: 'selection', label: 'Selection Sort', type: 'sort', complexity: 'O(n²)' },
    { id: 'insertion', label: 'Insertion Sort', type: 'sort', complexity: 'O(n²)' },
    { id: 'quick', label: 'Quick Sort', type: 'sort', complexity: 'O(n log n)' },
    { id: 'merge', label: 'Merge Sort', type: 'sort', complexity: 'O(n log n)' },
    { id: 'heap', label: 'Heap Sort', type: 'sort', complexity: 'O(n log n)' }
]

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#a855f7']

function AlgorithmComparator({ onBack }) {
    const [selected, setSelected] = useState(['bubble', 'quick', 'merge'])
    const [results, setResults] = useState([])
    const [isRunning, setIsRunning] = useState(false)
    const [testSizes, setTestSizes] = useState([100, 500, 1000, 2000, 5000])
    const stopRef = useRef(false)
    const soundEnabled = useAppStore(s => s.soundEnabled)

    const toggleSelect = (id) => {
        if (soundEnabled) playClick()
        setSelected(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev
        )
    }

    // Sort implementations for benchmarking (no visualization, pure speed)
    const sorts = {
        bubble: (a) => { const arr = [...a]; for (let i = 0; i < arr.length; i++) for (let j = 0; j < arr.length - i - 1; j++) if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; return arr },
        selection: (a) => { const arr = [...a]; for (let i = 0; i < arr.length; i++) { let m = i; for (let j = i + 1; j < arr.length; j++) if (arr[j] < arr[m]) m = j;[arr[i], arr[m]] = [arr[m], arr[i]] } return arr },
        insertion: (a) => { const arr = [...a]; for (let i = 1; i < arr.length; i++) { let k = arr[i], j = i - 1; while (j >= 0 && arr[j] > k) { arr[j + 1] = arr[j]; j-- } arr[j + 1] = k } return arr },
        quick: (a) => { const arr = [...a]; const qs = (a, l, r) => { if (l >= r) return; let p = a[r], i = l; for (let j = l; j < r; j++)if (a[j] < p) { [a[i], a[j]] = [a[j], a[i]]; i++ } [a[i], a[r]] = [a[r], a[i]]; qs(a, l, i - 1); qs(a, i + 1, r) }; qs(arr, 0, arr.length - 1); return arr },
        merge: (a) => { if (a.length <= 1) return a; const m = Math.floor(a.length / 2); const l = sorts.merge(a.slice(0, m)); const r = sorts.merge(a.slice(m)); const res = []; let i = 0, j = 0; while (i < l.length && j < r.length) { if (l[i] <= r[j]) res.push(l[i++]); else res.push(r[j++]) } return res.concat(l.slice(i)).concat(r.slice(j)) },
        heap: (a) => { const arr = [...a]; const n = arr.length; const h = (n, i) => { let m = i, l = 2 * i + 1, r = 2 * i + 2; if (l < n && arr[l] > arr[m]) m = l; if (r < n && arr[r] > arr[m]) m = r; if (m !== i) { [arr[i], arr[m]] = [arr[m], arr[i]]; h(n, m) } }; for (let i = Math.floor(n / 2) - 1; i >= 0; i--)h(n, i); for (let i = n - 1; i > 0; i--) { [arr[0], arr[i]] = [arr[i], arr[0]]; h(i, 0) } return arr }
    }

    const runBenchmark = useCallback(async () => {
        setIsRunning(true)
        stopRef.current = false
        if (soundEnabled) playClick()
        const allResults = []

        for (const size of testSizes) {
            if (stopRef.current) break
            const baseArr = Array.from({ length: size }, () => Math.floor(Math.random() * size * 10))
            const sizeResult = { size, times: {} }

            for (const id of selected) {
                if (stopRef.current) break
                const fn = sorts[id]
                const start = performance.now()
                fn([...baseArr])
                const elapsed = performance.now() - start
                sizeResult.times[id] = parseFloat(elapsed.toFixed(2))
            }
            allResults.push(sizeResult)
            setResults([...allResults])

            if (soundEnabled) playStep()
            // Yield to UI
            await new Promise(r => setTimeout(r, 100))
        }
        setIsRunning(false)
    }, [selected, testSizes, soundEnabled])

    const handleReset = () => {
        if (soundEnabled) playClick()
        stopRef.current = true
        setIsRunning(false)
        setResults([])
    }

    const maxTime = Math.max(...results.flatMap(r => Object.values(r.times)), 1)

    const Controls = (
        <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Contenders (Max 4)</h3>
            <div className="grid grid-cols-2 gap-2">
                {ALGO_LIST.map((a, i) => {
                    const isSelected = selected.includes(a.id)
                    return (
                        <button key={a.id} onClick={() => toggleSelect(a.id)} disabled={isRunning}
                            className={`p-2 rounded-xl border text-left flex flex-col items-start justify-center transition-all bg-bg-elevated text-xs font-bold font-display
                            ${isSelected ? 'border-transparent shadow-lg shadow-black/20 text-white' : 'border-border-glass text-text-muted hover:bg-white/5'}
                            `}
                            style={isSelected ? { backgroundColor: COLORS[i % COLORS.length] } : {}}
                        >
                            <span>{a.label}</span>
                            <span className="text-[9px] uppercase tracking-widest opacity-70 mt-0.5">{a.complexity}</span>
                        </button>
                    )
                })}
            </div>

            <div className="h-px w-full bg-border-glass"></div>

            <div className="flex gap-2">
                <button
                    onClick={runBenchmark}
                    disabled={isRunning || selected.length < 2}
                    className="flex-1 py-3 bg-primary hover:bg-primary/90 text-bg-dark font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_0_0_#4f46e5] active:shadow-none active:translate-y-1"
                >
                    {isRunning ? <RotateCcw className="animate-spin" size={16} /> : <Play size={16} />}
                    {isRunning ? 'Running' : 'Benchmark'}
                </button>
                <button
                    onClick={handleReset}
                    className="px-4 py-3 bg-bg-elevated hover:bg-white/10 text-white font-black rounded-xl border border-border-glass text-xs uppercase flex items-center justify-center transition-all"
                >
                    <RotateCcw size={16} />
                </button>
            </div>
        </div>
    )

    const Metrics = (
        <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-2">Results (ms)</h3>

            {results.length === 0 ? (
                <div className="bg-bg-elevated border border-border-glass rounded-xl p-6 text-center text-text-muted text-sm flex flex-col items-center gap-3">
                    <HelpCircle size={24} className="opacity-50" />
                    <p>Select multiple algorithms and run the benchmark to see timing data here.</p>
                </div>
            ) : (
                <div className="bg-bg-elevated border border-border-glass rounded-xl overflow-x-auto custom-scrollbar pb-1">
                    <table className="w-full text-left text-[10px] whitespace-nowrap">
                        <thead className="bg-white/5 text-text-muted uppercase tracking-widest">
                            <tr>
                                <th className="p-3 font-black border-b border-border-glass border-r">N=</th>
                                {selected.map(id => {
                                    const algoIdx = ALGO_LIST.findIndex(a => a.id === id)
                                    return (
                                        <th key={id} className="p-3 font-black border-b border-border-glass text-right" style={{ color: COLORS[algoIdx % COLORS.length] }}>
                                            {ALGO_LIST[algoIdx]?.label.split(' ')[0]}
                                        </th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-glass font-mono">
                            {results.map((r, i) => (
                                <tr key={i} className="hover:bg-white/5">
                                    <td className="p-3 font-bold border-r border-border-glass text-text-secondary">{r.size.toLocaleString()}</td>
                                    {selected.map(id => {
                                        const t = r.times[id]
                                        const minTime = Math.min(...selected.map(s => r.times[s] || Infinity))
                                        const isBest = t === minTime
                                        return (
                                            <td key={id} className={`p-3 text-right ${isBest ? 'text-success font-bold bg-success/10' : 'text-text-muted'}`}>
                                                {t?.toFixed(2) || '...'}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )

    return (
        <StitchVisualizerLayout
            title="Algorithm Comparator"
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={"Compare the raw execution speed of various sorting algorithms using randomized arrays."}
        >
            <div className="relative w-full h-full flex flex-col p-8 bg-[#0A0A0F] gap-6 overflow-hidden">
                <div className="flex-1 bg-bg-elevated border border-border-glass rounded-2xl p-6 flex flex-col relative overflow-hidden">

                    <div className="flex items-center gap-2 mb-4 relative z-10">
                        <GitCompare className="text-accent-pink" size={24} />
                        <h4 className="text-lg font-black tracking-widest text-white uppercase">Execution Time Scale</h4>
                    </div>

                    <div className="w-full flex-1 relative mt-4">
                        {results.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center flex-col text-text-muted">
                                <ShieldCheck size={48} className="mb-4 opacity-50 text-accent-cyan" />
                                <p className="font-display font-medium text-lg">System standing by.</p>
                                <p className="text-xs uppercase tracking-widest mt-2 font-bold opacity-70">Awaiting benchmark execution.</p>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex gap-6 items-end p-6 border border-border-glass bg-bg-dark/50 rounded-xl overflow-x-auto custom-scrollbar">
                                {results.map((r, ri) => (
                                    <div key={ri} className="flex flex-col items-center flex-1 h-full min-w-[100px]">
                                        <div className="flex-1 w-full flex items-end justify-center gap-1.5 pb-2">
                                            {selected.map((id, i) => {
                                                const t = r.times[id] || 0
                                                const algoIdx = ALGO_LIST.findIndex(a => a.id === id)
                                                return (
                                                    <div key={id} className="relative w-full flex justify-center group">
                                                        <motion.div
                                                            style={{
                                                                background: COLORS[algoIdx % COLORS.length],
                                                                minHeight: '4px',
                                                                width: '100%',
                                                                maxWidth: '24px'
                                                            }}
                                                            className="rounded-t-lg shadow-lg"
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${Math.max((t / maxTime) * 100, 2)}%` }}
                                                            transition={{ duration: 0.5, type: 'spring', bounce: 0 }}
                                                        />
                                                        {/* Tooltip */}
                                                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-bg-dark border border-border-glass text-white text-[10px] py-1 px-2 rounded-lg font-mono tracking-widest transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                            {t.toFixed(1)} ms
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div className="text-xs font-black uppercase tracking-widest text-text-muted pt-4 border-t border-border-glass w-full text-center">
                                            N={r.size}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StitchVisualizerLayout>
    )
}

export default AlgorithmComparator
