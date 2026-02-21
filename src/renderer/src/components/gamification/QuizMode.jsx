import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Brain, CheckCircle, XCircle, Trophy, Volume2, VolumeX } from 'lucide-react'
import ThemeToggle from '../common/ThemeToggle'
import { useAppStore } from '../../store/useAppStore'
import { playSuccess, playError, playClick, playAchievement } from '../../utils/SoundEngine'

const QUESTIONS = [
    { q: 'What is the average time complexity of Quick Sort?', opts: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], ans: 1 },
    { q: 'Which data structure does BFS use?', opts: ['Stack', 'Queue', 'Heap', 'Array'], ans: 1 },
    { q: 'What is the space complexity of Merge Sort?', opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], ans: 2 },
    { q: 'Which sorting algorithm is NOT comparison-based?', opts: ['Heap Sort', 'Merge Sort', 'Counting Sort', 'Quick Sort'], ans: 2 },
    { q: 'What is the worst case of Binary Search?', opts: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'], ans: 2 },
    { q: 'DFS uses which data structure?', opts: ['Queue', 'Stack', 'Hash Map', 'Priority Queue'], ans: 1 },
    { q: 'Dijkstra\'s algorithm fails with...', opts: ['Sparse graphs', 'Negative weights', 'Large graphs', 'Directed graphs'], ans: 1 },
    { q: 'Which algorithm uses divide-and-conquer?', opts: ['Bubble Sort', 'Selection Sort', 'Merge Sort', 'Insertion Sort'], ans: 2 },
    { q: 'Hash table average lookup time?', opts: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], ans: 2 },
    { q: 'A* pathfinding uses what over Dijkstra?', opts: ['Backtracking', 'Heuristic function', 'Random walk', 'DFS'], ans: 1 },
    { q: 'What is a stable sorting algorithm?', opts: ['Heap Sort', 'Quick Sort', 'Merge Sort', 'Selection Sort'], ans: 2 },
    { q: 'Red-Black Tree guarantees height of?', opts: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], ans: 1 },
    { q: 'Huffman coding is what type of algorithm?', opts: ['Dynamic Programming', 'Greedy', 'Backtracking', 'Divide & Conquer'], ans: 1 },
    { q: 'Bellman-Ford time complexity?', opts: ['O(V²)', 'O(VE)', 'O(V log V)', 'O(E log E)'], ans: 1 },
    { q: 'Which problem is NP-complete?', opts: ['Sorting', 'Binary Search', 'Traveling Salesman', 'Matrix Multiplication'], ans: 2 },
]

function QuizMode({ onBack }) {
    const [currentQ, setCurrentQ] = useState(0)
    const [score, setScore] = useState(0)
    const [selected, setSelected] = useState(-1)
    const [answered, setAnswered] = useState(false)
    const [finished, setFinished] = useState(false)
    const [shuffled] = useState(() => [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10))
    const soundEnabled = useAppStore(s => s.soundEnabled)
    const toggleSound = useAppStore(s => s.toggleSound)
    const addXP = useAppStore(s => s.addXP)
    const unlockAchievement = useAppStore(s => s.unlockAchievement)

    const handleAnswer = (idx) => {
        if (answered) return
        setSelected(idx)
        setAnswered(true)
        const correct = idx === shuffled[currentQ].ans
        if (correct) { setScore(s => s + 1); if (soundEnabled) playSuccess() }
        else { if (soundEnabled) playError() }
    }

    const handleNext = () => {
        if (currentQ + 1 >= shuffled.length) {
            setFinished(true)
            addXP(score * 10)
            if (score >= 8) unlockAchievement('quiz_master')
            if (soundEnabled) playAchievement()
        } else {
            setCurrentQ(c => c + 1)
            setSelected(-1)
            setAnswered(false)
            if (soundEnabled) playClick()
        }
    }

    if (finished) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '24px' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                    <Trophy size={64} color="var(--warning)" />
                </motion.div>
                <h2 style={{ fontSize: '2rem' }}>Quiz Complete!</h2>
                <p style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>{score}/{shuffled.length} correct</p>
                <p style={{ color: 'var(--text-muted)' }}>+{score * 10} XP earned</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onBack} className="glass-panel" style={{ padding: '12px 24px', color: 'white', cursor: 'pointer' }}>
                        <ArrowLeft size={16} /> Dashboard
                    </button>
                    <button onClick={() => { setCurrentQ(0); setScore(0); setSelected(-1); setAnswered(false); setFinished(false) }}
                        style={{ padding: '12px 24px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
                        Play Again
                    </button>
                </div>
            </div>
        )
    }

    const q = shuffled[currentQ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={onBack} className="back-btn"><ArrowLeft size={18} /> Back</button>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Brain size={22} /> Algorithm Quiz</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{currentQ + 1}/{shuffled.length}</span>
                    <button onClick={toggleSound} style={{ padding: '8px', borderRadius: '50%', background: soundEnabled ? 'var(--primary)' : 'var(--bg-card)', color: 'white', border: '1px solid var(--border-glass)', cursor: 'pointer' }}>
                        {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    </button>
                    <ThemeToggle />
                </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: '6px', borderRadius: '3px', background: 'var(--bg-card)', overflow: 'hidden' }}>
                <motion.div style={{ height: '100%', background: 'linear-gradient(to right, var(--primary), var(--accent))', borderRadius: '3px' }}
                    animate={{ width: `${((currentQ + 1) / shuffled.length) * 100}%` }} />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                <div className="glass-panel" style={{ padding: '32px', width: '100%', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.3rem', lineHeight: 1.5 }}>{q.q}</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
                    {q.opts.map((opt, i) => {
                        let bg = 'var(--bg-card)'
                        let border = 'var(--border-glass)'
                        if (answered) {
                            if (i === q.ans) { bg = 'rgba(16, 185, 129, 0.2)'; border = 'var(--success)' }
                            else if (i === selected && i !== q.ans) { bg = 'rgba(239, 68, 68, 0.2)'; border = 'var(--danger)' }
                        }
                        return (
                            <motion.button key={i} onClick={() => handleAnswer(i)}
                                whileHover={!answered ? { scale: 1.03 } : {}}
                                className="glass-panel"
                                style={{ padding: '16px', cursor: answered ? 'default' : 'pointer', textAlign: 'left', fontSize: '1rem', color: 'var(--text-primary)', background: bg, borderColor: border, borderWidth: '2px', borderStyle: 'solid', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                                    {String.fromCharCode(65 + i)}
                                </span>
                                {opt}
                                {answered && i === q.ans && <CheckCircle size={18} color="var(--success)" style={{ marginLeft: 'auto' }} />}
                                {answered && i === selected && i !== q.ans && <XCircle size={18} color="var(--danger)" style={{ marginLeft: 'auto' }} />}
                            </motion.button>
                        )
                    })}
                </div>

                {answered && (
                    <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={handleNext}
                        style={{ padding: '14px 36px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>
                        {currentQ + 1 >= shuffled.length ? 'See Results' : 'Next Question'}
                    </motion.button>
                )}

                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Score: <strong style={{ color: 'var(--success)' }}>{score}</strong>
                </div>
            </div>
        </div>
    )
}

export default QuizMode
