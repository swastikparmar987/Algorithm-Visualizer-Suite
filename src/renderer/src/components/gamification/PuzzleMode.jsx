import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, RotateCcw, ChevronRight, Volume2, VolumeX, CheckCircle, XCircle } from 'lucide-react'
import ThemeToggle from '../common/ThemeToggle'
import { useAppStore } from '../../store/useAppStore'
import { playSuccess, playError, playClick, playStep, playTone } from '../../utils/SoundEngine'

const PUZZLES = [
    {
        title: 'Bubble Sort Step',
        desc: 'Perform one pass of bubble sort. Click the correct pair to swap.',
        array: [5, 3, 8, 1, 4],
        type: 'bubble'
    },
    {
        title: 'Selection Sort Pick',
        desc: 'Find the minimum element and click it to move to position 0.',
        array: [7, 2, 9, 4, 1],
        type: 'selection'
    },
    {
        title: 'Insertion Sort Place',
        desc: 'Insert the highlighted element into its correct position.',
        array: [1, 3, 7, 2, 5],
        type: 'insertion'
    },
]

function PuzzleMode({ onBack }) {
    const [puzzleIdx, setPuzzleIdx] = useState(0)
    const [array, setArray] = useState([...PUZZLES[0].array])
    const [step, setStep] = useState(0)
    const [score, setScore] = useState(0)
    const [mistakes, setMistakes] = useState(0)
    const [completed, setCompleted] = useState(false)
    const [highlight, setHighlight] = useState(-1)
    const [message, setMessage] = useState('')
    const soundEnabled = useAppStore(s => s.soundEnabled)
    const toggleSound = useAppStore(s => s.toggleSound)
    const addXP = useAppStore(s => s.addXP)

    const puzzle = PUZZLES[puzzleIdx]

    const handleClick = (idx) => {
        if (completed) return

        if (puzzle.type === 'bubble') {
            // Find first pair that needs swapping
            let swapIdx = -1
            for (let i = 0; i < array.length - 1; i++) {
                if (array[i] > array[i + 1]) { swapIdx = i; break }
            }
            if (swapIdx === -1) { setCompleted(true); return }
            if (idx === swapIdx || idx === swapIdx + 1) {
                const newArr = [...array];
                [newArr[swapIdx], newArr[swapIdx + 1]] = [newArr[swapIdx + 1], newArr[swapIdx]]
                setArray(newArr)
                setScore(s => s + 1)
                setStep(s => s + 1)
                setMessage('Correct swap!')
                if (soundEnabled) { playTone(newArr[swapIdx] * 30, 100); playSuccess() }
                // Check done
                const sorted = [...newArr].sort((a, b) => a - b)
                if (JSON.stringify(newArr) === JSON.stringify(sorted)) setCompleted(true)
            } else {
                setMistakes(m => m + 1)
                setMessage(`Wrong! Swap indices ${swapIdx} and ${swapIdx + 1}`)
                if (soundEnabled) playError()
            }
        } else if (puzzle.type === 'selection') {
            const min = Math.min(...array.slice(step))
            const minIdx = array.indexOf(min, step)
            if (idx === minIdx) {
                const newArr = [...array];
                [newArr[step], newArr[minIdx]] = [newArr[minIdx], newArr[step]]
                setArray(newArr)
                setScore(s => s + 1)
                setStep(s => s + 1)
                setMessage('Correct! Minimum found.')
                if (soundEnabled) playSuccess()
                if (step + 1 >= array.length - 1) setCompleted(true)
            } else {
                setMistakes(m => m + 1)
                setMessage('Not the minimum! Try again.')
                if (soundEnabled) playError()
            }
        } else if (puzzle.type === 'insertion') {
            // Simplified: the key element is at index step (starting at 3)
            const keyIdx = step === 0 ? 3 : Math.min(step + 3, array.length - 1)
            if (idx <= keyIdx) {
                // Try inserting
                const newArr = [...array]
                const key = newArr.splice(keyIdx, 1)[0]
                newArr.splice(idx, 0, key)
                setArray(newArr)
                const sorted = [...newArr].sort((a, b) => a - b)
                const correct = JSON.stringify(newArr.slice(0, keyIdx + 1)) === JSON.stringify(sorted.slice(0, keyIdx + 1))
                if (correct) {
                    setScore(s => s + 1)
                    setMessage('Correct placement!')
                    if (soundEnabled) playSuccess()
                    if (JSON.stringify(newArr) === JSON.stringify(sorted)) setCompleted(true)
                    else setStep(s => s + 1)
                } else {
                    setMistakes(m => m + 1)
                    setMessage('Wrong position!')
                    if (soundEnabled) playError()
                    setArray([...PUZZLES[puzzleIdx].array])
                    setStep(0)
                }
            }
        }
    }

    const handleNext = () => {
        const next = (puzzleIdx + 1) % PUZZLES.length
        setPuzzleIdx(next)
        setArray([...PUZZLES[next].array])
        setStep(0)
        setCompleted(false)
        setMessage('')
        if (soundEnabled) playClick()
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={onBack} className="back-btn"><ArrowLeft size={18} /> Back</button>
                <h2>Puzzle Mode</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button onClick={toggleSound} style={{ padding: '8px', borderRadius: '50%', background: soundEnabled ? 'var(--primary)' : 'var(--bg-card)', color: 'white', border: '1px solid var(--border-glass)', cursor: 'pointer' }}>
                        {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    </button>
                    <ThemeToggle />
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', maxWidth: '650px', margin: '0 auto', width: '100%' }}>
                <div className="glass-panel" style={{ padding: '24px', width: '100%', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>{puzzle.title}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{puzzle.desc}</p>
                </div>

                {/* Array visualization */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {array.map((v, i) => (
                        <motion.button key={i} onClick={() => handleClick(i)}
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                            style={{
                                width: '60px', height: '60px', borderRadius: '14px',
                                background: i < step && puzzle.type === 'selection' ? 'var(--success)' : 'var(--bg-elevated)',
                                border: '2px solid var(--border-glass)', color: 'var(--text-primary)',
                                fontSize: '1.3rem', fontWeight: 700, cursor: completed ? 'default' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                            {v}
                        </motion.button>
                    ))}
                </div>

                {message && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ color: message.includes('Correct') ? 'var(--success)' : 'var(--danger)', fontSize: '1rem', fontWeight: 600 }}>
                        {message}
                    </motion.div>
                )}

                <div style={{ display: 'flex', gap: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <span>Steps: <strong style={{ color: 'var(--primary)' }}>{score}</strong></span>
                    <span>Mistakes: <strong style={{ color: 'var(--danger)' }}>{mistakes}</strong></span>
                </div>

                {completed && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => { setArray([...PUZZLES[puzzleIdx].array]); setStep(0); setCompleted(false); setScore(0); setMistakes(0); setMessage('') }}
                            className="glass-panel" style={{ padding: '12px 24px', color: 'white', cursor: 'pointer' }}>
                            <RotateCcw size={16} /> Retry
                        </button>
                        <button onClick={handleNext}
                            style={{ padding: '12px 24px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                            Next Puzzle <ChevronRight size={16} />
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default PuzzleMode
