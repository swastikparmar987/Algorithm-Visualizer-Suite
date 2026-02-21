import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Activity, Search, Type } from 'lucide-react'
import StitchVisualizerLayout from './common/StitchVisualizerLayout'
import { playStep, playSuccess, playClick, playTone, playError } from '../utils/SoundEngine'
import { useAppStore } from '../store/useAppStore'

function RegexVisualizer({ onBack }) {
    const theme = useAppStore(s => s.theme)
    const soundEnabled = useAppStore(s => s.soundEnabled)

    const [pattern, setPattern] = useState('(a|b)*c')
    const [testStr, setTestStr] = useState('abac')

    // Animation States
    const [activeCharIdx, setActiveCharIdx] = useState(-1)
    const [activePatternIdx, setActivePatternIdx] = useState(-1)
    const [matchResult, setMatchResult] = useState(null) // true/false
    const [matchHistory, setMatchHistory] = useState([]) // Array of match objects

    const [parsedTokens, setParsedTokens] = useState([])

    // Control States
    const [speed, setSpeed] = useState(200)
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [logs, setLogs] = useState("Ready. Enter a Regex pattern and Test String.")

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

    const resetVis = () => {
        setIsRunning(false)
        setIsPaused(false)
        isRunningRef.current = false
        isPausedRef.current = false
        setActiveCharIdx(-1)
        setActivePatternIdx(-1)
        setMatchResult(null)
        setMatchHistory([])
        stepsRef.current = 0
        setParsedTokens(tokenizeRegex(pattern))
        say("Engine reset. Ready.")
    }

    // A simple regex tokenizer just for visualization highlighting
    const tokenizeRegex = (pat) => {
        const tokens = []
        for (let i = 0; i < pat.length; i++) {
            tokens.push({ char: pat[i], id: i })
        }
        return tokens;
    }

    useEffect(() => {
        setParsedTokens(tokenizeRegex(pattern))
    }, [pattern])

    // --- ALGORITHMS ---

    const runRegexMatch = async () => {
        say(`Evaluating pattern /${pattern}/ against '${testStr}'`)

        let re;
        try {
            re = new RegExp(pattern, 'g')
        } catch (e) {
            say("Invalid Regular Expression.")
            setMatchResult(false)
            if (soundEnabled) playError()
            return
        }

        let fullMatchObj = null
        let allMatches = []

        // Find all matches first to know the exact boundaries
        // We do this to simulate the animation step-by-step
        let tempStr = testStr
        let match;
        while ((match = re.exec(tempStr)) !== null) {
            if (match[0].length === 0) {
                // Prevent infinite loop on zero-length matches
                re.lastIndex++;
            } else {
                allMatches.push({ index: match.index, length: match[0].length, text: match[0], groups: [...match].slice(1) })
            }
        }

        // Simulate reading the string
        let currentStringIndex = 0;

        for (let i = 0; i < testStr.length; i++) {
            if (await checkState()) return

            setActiveCharIdx(i)
            stepsRef.current++

            // Highlight a random pattern index to simulate "engine checking"
            setActivePatternIdx(Math.floor(Math.random() * parsedTokens.length))

            if (soundEnabled) playTone(400 + (testStr.charCodeAt(i) * 5), 30, 'sine')
            await new Promise(r => setTimeout(r, Math.max(20, (600 - speedRef.current) / 2)))

            // Check if this index starts a match
            const foundMatch = allMatches.find(m => m.index === i)
            if (foundMatch) {
                say(`Match found at index ${i}: '${foundMatch.text}'`)

                // Animate matching sequence
                for (let j = 0; j < foundMatch.length; j++) {
                    if (await checkState()) return
                    setActiveCharIdx(i + j)
                    setActivePatternIdx(parsedTokens.length - 1) // point to end of regex loosely
                    if (soundEnabled) playStep()
                    await new Promise(r => setTimeout(r, Math.max(50, (600 - speedRef.current))))
                }

                setMatchHistory(prev => [...prev, foundMatch])
                fullMatchObj = true
                if (soundEnabled) playSuccess()

                i += foundMatch.length - 1 // Skip matched characters
            } else {
                // Miss
                if (soundEnabled) playTone(150, 20, 'square')
            }

            setActivePatternIdx(-1)
        }

        if (await checkState()) return

        setActiveCharIdx(-1)
        setActivePatternIdx(-1)
        setMatchResult(allMatches.length > 0)

        if (allMatches.length > 0) {
            say(`Evaluation complete. Found ${allMatches.length} match(es).`)
        } else {
            say(`Evaluation complete. No matches found.`)
        }
    }

    const processStart = async () => {
        if (!pattern || !testStr) {
            say("Please enter both a pattern and a test string.")
            return
        }
        setIsRunning(true)
        setIsPaused(false)
        setActiveCharIdx(-1)
        setActivePatternIdx(-1)
        setMatchResult(null)
        setMatchHistory([])
        stepsRef.current = 0
        if (soundEnabled) playClick()

        await new Promise(r => setTimeout(r, 50))
        await runRegexMatch()

        setIsRunning(false)
        isRunningRef.current = false
    }

    // --- RENDERING ---

    const Controls = (
        <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Engine Configuration</h3>

            <div className="space-y-4">
                <div>
                    <label className="text-[10px] font-black tracking-widest text-text-muted uppercase block mb-2">Regex Pattern (JS syntax)</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3 font-mono text-text-muted text-lg">/</span>
                        <input
                            type="text"
                            value={pattern}
                            onChange={(e) => !isRunning && setPattern(e.target.value)}
                            disabled={isRunning}
                            className="w-full bg-bg-elevated border border-border-glass rounded-xl py-3 pl-8 pr-8 text-white font-mono tracking-widest focus:outline-none focus:border-primary disabled:opacity-50"
                        />
                        <span className="absolute right-3 font-mono text-text-muted text-lg">/g</span>
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black tracking-widest text-text-muted uppercase block mb-2">Target String</label>
                    <input
                        type="text"
                        value={testStr}
                        onChange={(e) => !isRunning && setTestStr(e.target.value)}
                        disabled={isRunning}
                        className="w-full bg-bg-elevated border border-border-glass rounded-xl p-3 text-white font-mono focus:outline-none focus:border-accent-cyan disabled:opacity-50"
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
                    type="range" min="20" max="600" step="20"
                    value={620 - speed}
                    onChange={(e) => setSpeed(620 - parseInt(e.target.value))}
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
                        <Play size={16} fill="currentColor" /> Evaluate
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
            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                <p className="flex items-center gap-2 text-[10px] font-black tracking-widest text-text-muted uppercase relative z-10">
                    <Search size={12} className="text-accent-cyan" /> Matches
                </p>
                <p className={`text-3xl font-mono ${matchResult === true ? 'text-accent-green' : matchResult === false ? 'text-danger' : 'text-accent-cyan'} font-black mt-1 relative z-10`}>
                    {matchHistory.length}
                </p>
            </div>
            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass">
                <p className="text-[10px] font-black tracking-widest text-text-muted uppercase">Steps</p>
                <p className="text-xl font-mono text-white mt-1 uppercase tracking-tighter">{stepsRef.current}</p>
            </div>
        </div>
    )

    // Highlight strings based on matched status
    const renderTestString = () => {
        return testStr.split('').map((char, index) => {
            const isActive = index === activeCharIdx

            // Check if this index belongs to any matched block
            const isMatched = matchHistory.some(m => index >= m.index && index < m.index + m.length)

            let bgClass = "bg-bg-elevated border-border-glass text-white"
            if (isActive) bgClass = "bg-primary border-primary text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            else if (isMatched) bgClass = "bg-accent-green/20 border-accent-green/50 text-accent-green"

            return (
                <div key={`char-${index}`} className="flex flex-col items-center gap-2">
                    <div className="text-[10px] text-text-muted font-mono">{index}</div>
                    <motion.div
                        initial={false}
                        animate={{
                            y: isActive ? -5 : 0,
                            scale: isActive ? 1.1 : 1
                        }}
                        className={`w-12 h-14 flex items-center justify-center rounded-lg border-2 font-mono text-2xl font-bold transition-colors ${bgClass}`}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </motion.div>
                </div>
            )
        })
    }

    const renderPatternTokens = () => {
        return parsedTokens.map((token, index) => {
            const isActive = index === activePatternIdx
            return (
                <motion.div
                    key={`pat-${index}`}
                    animate={{
                        scale: isActive ? 1.2 : 1,
                        color: isActive ? '#a855f7' : '#fff'
                    }}
                    className={`font-mono text-3xl font-black ${isActive ? 'text-primary' : 'text-white'}`}
                >
                    {token.char}
                </motion.div>
            )
        })
    }

    return (
        <StitchVisualizerLayout
            title="Regex Engine"
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={logs}
        >
            <div className="relative w-full h-full flex flex-col items-center justify-center p-8 overflow-hidden bg-[#0A0A0F] gap-12">

                {/* Pattern Display */}
                <div className="flex flex-col items-center">
                    <h4 className="text-[10px] font-black tracking-widest text-text-muted uppercase mb-4">Regex Pattern</h4>
                    <div className="flex bg-bg-elevated px-8 py-4 rounded-2xl border border-border-glass shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5"></div>
                        <span className="font-mono text-3xl font-black text-text-muted mr-1">/</span>
                        <div className="flex">
                            {renderPatternTokens()}
                        </div>
                        <span className="font-mono text-3xl font-black text-text-muted ml-1">/g</span>
                    </div>
                </div>

                {/* Test String Array */}
                <div className="flex flex-col items-center w-full max-w-4xl">
                    <h4 className="text-[10px] font-black tracking-widest text-text-muted uppercase mb-4">Target Array</h4>
                    <div className="flex flex-wrap gap-2 justify-center w-full">
                        <AnimatePresence>
                            {renderTestString()}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Match Results Below */}
                {matchHistory.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-4xl border border-accent-green/30 rounded-xl overflow-hidden bg-bg-elevated/50"
                    >
                        <div className="bg-accent-green/10 px-4 py-2 border-b border-accent-green/30">
                            <h4 className="text-[10px] font-black tracking-widest text-accent-green uppercase">Captures</h4>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-4">
                            {matchHistory.map((m, i) => (
                                <div key={i} className="bg-[#0A0A0F] border border-border-glass rounded-lg p-3 flex justify-between items-center">
                                    <span className="text-text-muted font-mono text-xs">Match {i + 1} [Idx {m.index}]:</span>
                                    <span className="text-accent-green font-mono font-bold text-lg">{m.text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

            </div>
        </StitchVisualizerLayout>
    )
}

export default RegexVisualizer
