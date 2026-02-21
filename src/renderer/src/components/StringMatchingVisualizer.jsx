import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Activity, AlignLeft, Search, Fingerprint } from 'lucide-react'
import StitchVisualizerLayout from './common/StitchVisualizerLayout'
import { playStep, playSuccess, playClick, playTone } from '../utils/SoundEngine'
import { useAppStore } from '../store/useAppStore'

const STR_ALGOS = [
    { id: 'naive', label: 'Naive Search' },
    { id: 'kmp', label: 'Knuth-Morris-Pratt (KMP)' },
    { id: 'rabinkarp', label: 'Rabin-Karp' }
]

function StringMatchingVisualizer({ onBack }) {
    const theme = useAppStore(s => s.theme)
    const soundEnabled = useAppStore(s => s.soundEnabled)

    const [selectedAlgo, setSelectedAlgo] = useState('naive')

    // Core Data
    const [text, setText] = useState('ABABDABACDABABCABABC')
    const [pattern, setPattern] = useState('ABABC')

    // Visualization State
    const [textStates, setTextStates] = useState([]) // array of styles per char
    const [patternStates, setPatternStates] = useState([]) // array of styles per pattern char
    const [patternOffset, setPatternOffset] = useState(0)
    const [matchPositions, setMatchPositions] = useState([])
    const [failureTable, setFailureTable] = useState([])
    const [hashInfo, setHashInfo] = useState({ pHash: null, tHash: null })

    // UI State
    const [speed, setSpeed] = useState(250)
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [logs, setLogs] = useState("Configure text and pattern, then click Start.")

    // Refs for async control
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
        setTextStates(Array(text.length).fill('default'))
        setPatternStates(Array(pattern.length).fill('default'))
        setPatternOffset(0)
        setMatchPositions([])
        setFailureTable([])
        setHashInfo({ pHash: null, tHash: null })
        say("Ready.")
    }

    // Initialize states on text/pattern change
    useEffect(() => {
        if (!isRunning) resetVis()
    }, [text, pattern])

    // --- ALGORITHMS ---

    const runNaive = async () => {
        const t = text, p = pattern
        const n = t.length, m = p.length
        say(`Starting Naive String Search. Pattern length: ${m}, Text length: ${n}`)

        let matchCount = 0

        for (let i = 0; i <= n - m; i++) {
            if (await checkState()) return
            setPatternOffset(i)

            let j = 0
            while (j < m) {
                if (await checkState()) return

                // Compare state
                const newTStates = Array(n).fill('default')
                const newPStates = Array(m).fill('default')

                // Keep previous matches highlighted green
                matchPositions.forEach(pos => {
                    for (let k = 0; k < m; k++) newTStates[pos + k] = 'matched'
                })

                // Set current comparing chars
                newTStates[i + j] = 'comparing'
                newPStates[j] = 'comparing'

                // Keep previously matched chars in this window green
                for (let k = 0; k < j; k++) {
                    newTStates[i + k] = 'matched'
                    newPStates[k] = 'matched'
                }

                setTextStates([...newTStates])
                setPatternStates([...newPStates])
                say(`Comparing Text['${t[i + j]}'] with Pattern['${p[j]}'] at offset ${i}`)
                if (soundEnabled) playStep(j, m)

                await new Promise(r => setTimeout(r, 1050 - speedRef.current))

                if (t[i + j] === p[j]) {
                    newTStates[i + j] = 'matched'
                    newPStates[j] = 'matched'
                    setTextStates([...newTStates])
                    setPatternStates([...newPStates])
                    if (soundEnabled) playTone(500 + (j * 50), 100, 'sine')
                    await new Promise(r => setTimeout(r, (1050 - speedRef.current) / 2))
                    j++
                } else {
                    newTStates[i + j] = 'mismatched'
                    newPStates[j] = 'mismatched'
                    setTextStates([...newTStates])
                    setPatternStates([...newPStates])
                    say(`Mismatch at offset ${i}. Shifting pattern right.`)
                    if (soundEnabled) playTone(200, 100, 'square')
                    await new Promise(r => setTimeout(r, 1050 - speedRef.current))
                    break // Next i
                }
            }

            if (j === m) {
                matchCount++
                setMatchPositions(prev => [...prev, i])
                say(`✅ Match found at index ${i}!`)
                if (soundEnabled) playSuccess()
                await new Promise(r => setTimeout(r, 1050 - speedRef.current))
            }
        }

        // Final state
        const finalTStates = Array(n).fill('default')
        matchPositions.forEach(pos => {
            for (let k = 0; k < m; k++) finalTStates[pos + k] = 'matched'
        })
        setTextStates(finalTStates)
        setPatternStates(Array(m).fill('default'))
        say(`Search complete. Found ${matchCount} match(es).`)
    }

    const runKMP = async () => {
        const t = text, p = pattern
        const n = t.length, m = p.length
        say(`Starting KMP. Building LPS (Longest Prefix Suffix) Array...`)

        // Build LPS
        const lps = new Array(m).fill(0)
        let len = 0, idx = 1

        while (idx < m) {
            if (await checkState()) return

            setFailureTable([...lps])
            if (p[idx] === p[len]) {
                len++
                lps[idx] = len
                idx++
                if (soundEnabled) playTone(400, 50, 'sine')
                await new Promise(r => setTimeout(r, (1050 - speedRef.current) / 2))
            } else {
                if (len !== 0) {
                    len = lps[len - 1]
                    if (soundEnabled) playTone(300, 50, 'sawtooth')
                    await new Promise(r => setTimeout(r, (1050 - speedRef.current) / 2))
                } else {
                    lps[idx] = 0
                    idx++
                    if (soundEnabled) playTone(200, 50, 'square')
                    await new Promise(r => setTimeout(r, (1050 - speedRef.current) / 2))
                }
            }
        }
        setFailureTable([...lps])
        say(`LPS Table built: [${lps.join(', ')}]. Starting search phase.`)
        await new Promise(r => setTimeout(r, 1000))

        // Search Phase
        let i = 0, j = 0
        let matchCount = 0

        while (i < n) {
            if (await checkState()) return
            setPatternOffset(i - j)

            const ts = Array(n).fill('default')
            const ps = Array(m).fill('default')

            matchPositions.forEach(pos => {
                for (let k = 0; k < m; k++) ts[pos + k] = 'matched'
            })

            ts[i] = 'comparing'
            ps[j] = 'comparing'
            for (let k = 0; k < j; k++) {
                ts[i - j + k] = 'matched'
                ps[k] = 'matched'
            }

            setTextStates([...ts])
            setPatternStates([...ps])

            say(`Comparing Text['${t[i]}'] with Pattern['${p[j]}'] (LPS skip context)`)
            if (soundEnabled) playStep(j, m)
            await new Promise(r => setTimeout(r, 1050 - speedRef.current))

            if (p[j] === t[i]) {
                ts[i] = 'matched'
                ps[j] = 'matched'
                setTextStates([...ts])
                setPatternStates([...ps])
                if (soundEnabled) playTone(500 + (j * 50), 100, 'sine')
                await new Promise(r => setTimeout(r, (1050 - speedRef.current) / 2))
                i++
                j++
            }

            if (j === m) {
                matchCount++
                setMatchPositions(prev => [...prev, i - j])
                say(`✅ Match found at index ${i - j}! Using LPS to jump pattern.`)
                if (soundEnabled) playSuccess()
                await new Promise(r => setTimeout(r, 1050 - speedRef.current))
                j = lps[j - 1]
            } else if (i < n && p[j] !== t[i]) {
                ts[i] = 'mismatched'
                ps[j] = 'mismatched'
                setTextStates([...ts])
                setPatternStates([...ps])
                say(`Mismatch. LPS table tells us to skip ${j !== 0 ? j - lps[j - 1] : 1} comparisons.`)
                if (soundEnabled) playTone(200, 100, 'square')
                await new Promise(r => setTimeout(r, 1050 - speedRef.current))

                if (j !== 0) {
                    j = lps[j - 1]
                } else {
                    i++
                }
            }
        }

        // Final state
        const finalTStates = Array(n).fill('default')
        matchPositions.forEach(pos => {
            for (let k = 0; k < m; k++) finalTStates[pos + k] = 'matched'
        })
        setTextStates(finalTStates)
        setPatternStates(Array(m).fill('default'))
        say(`KMP Search complete. Found ${matchCount} match(es).`)
    }

    const runRabinKarp = async () => {
        const t = text, p = pattern
        const n = t.length, m = p.length
        const d = 256, q = 101 // Prime mod

        let pHash = 0, tHash = 0, h = 1

        say(`Precomputing hash values (Base ${d}, Mod ${q})...`)
        // The value of h would be "pow(d, m-1)%q"
        for (let i = 0; i < m - 1; i++) h = (h * d) % q

        // Calculate the hash value of pattern and first window of text
        for (let i = 0; i < m; i++) {
            pHash = (d * pHash + p.charCodeAt(i)) % q
            tHash = (d * tHash + t.charCodeAt(i)) % q
        }

        setHashInfo({ pHash, tHash })
        say(`Initial Hashes - Pattern Hash: ${pHash} | Window Hash: ${tHash}`)
        await new Promise(r => setTimeout(r, 1000))

        let matchCount = 0

        for (let i = 0; i <= n - m; i++) {
            if (await checkState()) return
            setPatternOffset(i)

            const ts = Array(n).fill('default')
            const ps = Array(m).fill('comparing')

            matchPositions.forEach(pos => {
                for (let k = 0; k < m; k++) ts[pos + k] = 'matched'
            })

            for (let k = 0; k < m; k++) ts[i + k] = 'comparing'

            setTextStates([...ts])
            setPatternStates([...ps])

            say(`Comparing hashes at offset ${i}. Pattern: ${pHash}, Window: ${tHash}`)
            if (soundEnabled) playTone(300, 100, 'triangle')
            await new Promise(r => setTimeout(r, 1050 - speedRef.current))

            if (pHash === tHash) {
                say(`Hash Collision! Validating exact characters...`)
                if (soundEnabled) playTone(600, 100, 'sine')
                await new Promise(r => setTimeout(r, (1050 - speedRef.current) / 2))

                let match = true
                for (let j = 0; j < m; j++) {
                    if (t[i + j] !== p[j]) { match = false; break; }
                }

                if (match) {
                    for (let k = 0; k < m; k++) ts[i + k] = 'matched'
                    setTextStates([...ts])
                    setPatternStates(Array(m).fill('matched'))

                    matchCount++
                    setMatchPositions(prev => [...prev, i])
                    say(`✅ Exact match confirmed at index ${i}!`)
                    if (soundEnabled) playSuccess()
                    await new Promise(r => setTimeout(r, 1050 - speedRef.current))
                } else {
                    for (let k = 0; k < m; k++) ts[i + k] = 'mismatched'
                    setTextStates([...ts])
                    setPatternStates(Array(m).fill('mismatched'))
                    say(`Spurious hit at index ${i}. Characters don't match.`)
                    if (soundEnabled) playTone(200, 100, 'square')
                    await new Promise(r => setTimeout(r, 1050 - speedRef.current))
                }
            } else {
                for (let k = 0; k < m; k++) ts[i + k] = 'mismatched'
                setTextStates([...ts])
                setPatternStates(Array(m).fill('mismatched'))
                say(`Hash mismatch. Rolling window forward.`)
                if (soundEnabled) playTone(150, 50, 'sawtooth', 0.1)
                await new Promise(r => setTimeout(r, (1050 - speedRef.current) / 2))
            }

            // Calculate hash value for next window of text
            if (i < n - m) {
                tHash = (d * (tHash - t.charCodeAt(i) * h) + t.charCodeAt(i + m)) % q
                if (tHash < 0) tHash += q
                setHashInfo({ pHash, tHash })
            }
        }

        // Final state
        const finalTStates = Array(n).fill('default')
        matchPositions.forEach(pos => {
            for (let k = 0; k < m; k++) finalTStates[pos + k] = 'matched'
        })
        setTextStates(finalTStates)
        setPatternStates(Array(m).fill('default'))
        say(`Rabin-Karp Search complete. Found ${matchCount} match(es).`)
    }


    const processStart = async () => {
        setIsRunning(true)
        setIsPaused(false)
        setTextStates(Array(text.length).fill('default'))
        setPatternStates(Array(pattern.length).fill('default'))
        setMatchPositions([])
        setPatternOffset(0)
        setFailureTable([])
        setHashInfo({ pHash: null, tHash: null })
        if (soundEnabled) playClick()

        await new Promise(r => setTimeout(r, 50))

        if (selectedAlgo === 'naive') await runNaive()
        else if (selectedAlgo === 'kmp') await runKMP()
        else if (selectedAlgo === 'rabinkarp') await runRabinKarp()

        setIsRunning(false)
    }

    // --- RENDERING HELPERS ---

    const getBgClass = (state) => {
        switch (state) {
            case 'comparing': return 'bg-accent-orange/40 border-accent-orange text-white'
            case 'matched': return 'bg-success/30 border-success text-success'
            case 'mismatched': return 'bg-danger/30 border-danger/50 text-danger/80'
            default: return 'bg-bg-elevated border-border-glass text-text-secondary'
        }
    }

    const renderArray = (str, states, isText = false) => {
        return (
            <div className="flex flex-nowrap overflow-x-auto pb-4 gap-[2px]">
                {str.split('').map((ch, i) => {
                    const StateClass = getBgClass(states[i] || 'default')
                    return (
                        <motion.div
                            key={`${isText ? 'T' : 'P'}-${i}`}
                            className={`flex flex-col items-center justify-center shrink-0 w-10 h-12 rounded border ${StateClass} transition-colors`}
                            animate={states[i] === 'comparing' ? { scale: 1.05 } : { scale: 1 }}
                        >
                            {isText && <span className="text-[10px] text-text-muted mt-[-15px] absolute opacity-50">{i}</span>}
                            <span className="font-mono text-xl font-bold">{ch}</span>
                        </motion.div>
                    )
                })}
            </div>
        )
    }

    const Controls = (
        <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Algorithm Target</h3>
            <div className="grid grid-cols-1 gap-2">
                {STR_ALGOS.map(algo => (
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

            <div className="space-y-3">
                <div>
                    <label className="text-xs font-bold text-text-muted uppercase flex items-center gap-2 mb-1"><AlignLeft size={14} /> Base Text</label>
                    <input
                        type="text" value={text} onChange={e => setText(e.target.value.toUpperCase())}
                        disabled={isRunning}
                        className="w-full bg-bg-elevated text-white rounded-lg p-2 font-mono uppercase tracking-widest border border-border-glass focus:border-primary"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-text-muted uppercase flex items-center gap-2 mb-1"><Search size={14} /> Pattern</label>
                    <input
                        type="text" value={pattern} onChange={e => setPattern(e.target.value.toUpperCase())}
                        disabled={isRunning}
                        className="w-full bg-bg-elevated text-accent-cyan rounded-lg p-2 font-mono uppercase tracking-widest border border-border-glass focus:border-accent-cyan"
                    />
                </div>
            </div>

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
        </div>
    )

    const Metrics = (
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-bg-elevated rounded-xl p-4 border border-border-glass flex justify-between items-center">
                <div>
                    <p className="text-[10px] font-black tracking-widest text-text-muted uppercase">Algorithm</p>
                    <p className="text-xl font-bold text-white mt-1 uppercase tracking-tighter">String Matching</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black tracking-widest text-text-muted uppercase">Matches Found</p>
                    <p className="text-2xl font-mono text-success font-black mt-1">{matchPositions.length}</p>
                </div>
            </div>

            {/* Contextual Metric for KMP */}
            {selectedAlgo === 'kmp' && failureTable.length > 0 && (
                <div className="col-span-2 bg-bg-elevated rounded-xl p-4 border border-border-glass">
                    <p className="text-[10px] font-black tracking-widest text-text-muted uppercase mb-2">LPS Failure Table</p>
                    <div className="flex gap-1 overflow-x-auto">
                        {failureTable.map((val, i) => (
                            <div key={i} className="flex flex-col items-center flex-1 min-w-[30px]">
                                <span className="text-[10px] text-text-muted">{pattern[i]}</span>
                                <span className="text-md font-mono text-accent-cyan bg-accent-cyan/10 px-2 py-1 rounded border border-accent-cyan/30 mt-1">{val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Contextual Metric for Rabin-Karp */}
            {selectedAlgo === 'rabinkarp' && hashInfo.pHash !== null && (
                <div className="col-span-2 bg-bg-elevated rounded-xl p-4 border border-border-glass">
                    <p className="text-[10px] font-black tracking-widest text-text-muted uppercase mb-2 flex items-center gap-2"><Fingerprint size={12} /> Rolling Hash Values</p>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-bg-card p-2 rounded text-center border border-border-glass">
                            <span className="text-[10px] text-text-muted uppercase block">Pattern Hash</span>
                            <span className="text-lg font-mono text-accent-cyan font-bold">{hashInfo.pHash}</span>
                        </div>
                        <div className="bg-bg-card p-2 rounded text-center border border-border-glass">
                            <span className="text-[10px] text-text-muted uppercase block">Window Hash</span>
                            <span className={`text-lg font-mono font-bold ${hashInfo.pHash === hashInfo.tHash ? 'text-success drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'text-accent-orange'}`}>{hashInfo.tHash}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <StitchVisualizerLayout
            title="String Matching"
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={logs}
        >
            <div className="relative w-full h-full flex flex-col items-start justify-center p-8 overflow-hidden gap-12">

                {/* TEXT CONTAINER */}
                <div className="w-full">
                    <h4 className="text-xs font-black uppercase tracking-widest text-text-muted mb-4 pl-2 border-l-2 border-primary">Target Text String</h4>
                    <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
                        {renderArray(text, textStates, true)}
                    </div>
                </div>

                {/* PATTERN CONTAINER - Abstracted to slide based on offset */}
                <div className="w-full">
                    <h4 className="text-xs font-black uppercase tracking-widest text-text-muted mb-4 pl-2 border-l-2 border-accent-cyan">Search Pattern</h4>
                    <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
                        <motion.div
                            className="flex"
                            initial={{ x: 0 }}
                            animate={{ x: patternOffset * 42 }} // 40px width + 2px gap = 42px offset per char
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            {renderArray(pattern, patternStates, false)}
                        </motion.div>
                    </div>
                </div>

                {/* OVERLAY MATCH LOCATIONS */}
                {matchPositions.length > 0 && (
                    <div className="absolute bottom-8 left-8 right-8 flex justify-center">
                        <div className="bg-success/10 border border-success/30 text-success px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                            Indices Found at: {matchPositions.join(', ')}
                        </div>
                    </div>
                )}

            </div>
        </StitchVisualizerLayout>
    )
}

export default StringMatchingVisualizer
