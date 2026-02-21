import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, Volume2, VolumeX, Play, RotateCcw } from 'lucide-react'
import ThemeToggle from '../common/ThemeToggle'
import { useAppStore } from '../../store/useAppStore'
import { playSuccess, playError, playClick, playTone } from '../../utils/SoundEngine'

const ALGO_CONFIGS = [
    { name: 'Bubble Sort', sort: (a) => { const r = [...a]; const steps = []; for (let i = 0; i < r.length; i++) for (let j = 0; j < r.length - i - 1; j++) { if (r[j] > r[j + 1]) { [r[j], r[j + 1]] = [r[j + 1], r[j]] }; steps.push([...r]) }; return steps } },
    { name: 'Selection Sort', sort: (a) => { const r = [...a]; const steps = []; for (let i = 0; i < r.length; i++) { let m = i; for (let j = i + 1; j < r.length; j++) if (r[j] < r[m]) m = j;[r[i], r[m]] = [r[m], r[i]]; steps.push([...r]) }; return steps } },
    { name: 'Insertion Sort', sort: (a) => { const r = [...a]; const steps = []; for (let i = 1; i < r.length; i++) { let k = r[i], j = i - 1; while (j >= 0 && r[j] > k) { r[j + 1] = r[j]; j-- }; r[j + 1] = k; steps.push([...r]) }; return steps } },
    { name: 'Quick Sort', sort: (a) => { const r = [...a]; const steps = []; const qs = (lo, hi) => { if (lo >= hi) return; let p = r[hi], i = lo; for (let j = lo; j < hi; j++) { if (r[j] < p) { [r[i], r[j]] = [r[j], r[i]]; i++ }; steps.push([...r]) };[r[i], r[hi]] = [r[hi], r[i]]; steps.push([...r]); qs(lo, i - 1); qs(i + 1, hi) }; qs(0, r.length - 1); return steps } },
]

function AlgorithmDetective({ onBack }) {
    const [round, setRound] = useState(0)
    const [score, setScore] = useState(0)
    const [total, setTotal] = useState(0)
    const [currentSteps, setCurrentSteps] = useState([])
    const [stepIdx, setStepIdx] = useState(0)
    const [answer, setAnswer] = useState('')
    const [revealed, setRevealed] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const stopRef = useRef(false)
    const soundEnabled = useAppStore(s => s.soundEnabled)
    const toggleSound = useAppStore(s => s.toggleSound)
    const addXP = useAppStore(s => s.addXP)

    const startNewRound = () => {
        const algoIdx = Math.floor(Math.random() * ALGO_CONFIGS.length)
        const algo = ALGO_CONFIGS[algoIdx]
        const arr = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100) + 1)
        const steps = algo.sort(arr)
        setAnswer(algo.name)
        setCurrentSteps([[...arr], ...steps])
        setStepIdx(0)
        setRevealed(false)
        setRound(r => r + 1)
        if (soundEnabled) playClick()
    }

    useEffect(() => { startNewRound() }, [])

    const playAnimation = async () => {
        setIsPlaying(true)
        stopRef.current = false
        for (let i = 0; i < currentSteps.length; i++) {
            if (stopRef.current) break
            setStepIdx(i)
            if (soundEnabled && currentSteps[i]) {
                const maxVal = Math.max(...currentSteps[i])
                playTone(currentSteps[i][0] * 5, 50)
            }
            await new Promise(r => setTimeout(r, 120))
        }
        setIsPlaying(false)
    }

    const handleGuess = (name) => {
        setRevealed(true)
        setTotal(t => t + 1)
        if (name === answer) {
            setScore(s => s + 1)
            addXP(15)
            if (soundEnabled) playSuccess()
        } else {
            if (soundEnabled) playError()
        }
    }

    const currentArr = currentSteps[stepIdx] || []
    const maxVal = Math.max(...currentArr, 1)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={onBack} className="back-btn"><ArrowLeft size={18} /> Back</button>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Eye size={22} /> Algorithm Detective</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Score: {score}/{total}</span>
                    <button onClick={toggleSound} style={{ padding: '8px', borderRadius: '50%', background: soundEnabled ? 'var(--primary)' : 'var(--bg-card)', color: 'white', border: '1px solid var(--border-glass)', cursor: 'pointer' }}>
                        {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    </button>
                    <ThemeToggle />
                </div>
            </div>

            {/* Bars visualization */}
            <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '3px', padding: '20px', minHeight: 0 }}>
                {currentArr.map((v, i) => (
                    <motion.div key={i}
                        layout
                        style={{ flex: 1, background: 'var(--primary)', borderRadius: '4px 4px 0 0', minWidth: '8px' }}
                        animate={{ height: `${(v / maxVal) * 100}%` }}
                        transition={{ duration: 0.1 }}
                    />
                ))}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={playAnimation} disabled={isPlaying}
                    style={{ padding: '10px 20px', borderRadius: '10px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    <Play size={14} /> Play Sort
                </button>
                <button onClick={() => { stopRef.current = true; setStepIdx(0) }}
                    className="glass-panel" style={{ padding: '10px 20px', color: 'white', cursor: 'pointer' }}>
                    <RotateCcw size={14} /> Reset
                </button>
            </div>

            {/* Guess buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {ALGO_CONFIGS.map(a => (
                    <motion.button key={a.name} onClick={() => !revealed && handleGuess(a.name)}
                        whileHover={!revealed ? { scale: 1.05 } : {}}
                        disabled={revealed}
                        style={{
                            padding: '12px 24px', borderRadius: '12px', fontWeight: 600, cursor: revealed ? 'default' : 'pointer',
                            background: revealed && a.name === answer ? 'var(--success)' : revealed ? 'var(--bg-card)' : 'var(--bg-elevated)',
                            color: 'white', border: '1px solid var(--border-glass)',
                            opacity: revealed && a.name !== answer ? 0.5 : 1
                        }}>
                        {a.name}
                    </motion.button>
                ))}
            </div>

            {revealed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        The algorithm was <strong style={{ color: 'var(--accent)' }}>{answer}</strong>
                    </p>
                    <button onClick={startNewRound}
                        style={{ padding: '12px 30px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        Next Round
                    </button>
                </motion.div>
            )}
        </div>
    )
}

export default AlgorithmDetective
