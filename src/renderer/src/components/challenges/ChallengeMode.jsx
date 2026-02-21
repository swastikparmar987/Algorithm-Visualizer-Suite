import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trophy, Clock, Star, Zap } from 'lucide-react'
import ThemeToggle from '../common/ThemeToggle'
import { useAppStore } from '../../store/useAppStore'

const CHALLENGES = [
    {
        id: 'sort_min_swaps',
        title: 'Minimum Swaps',
        desc: 'Sort this array using the minimum number of swaps. Click elements to swap them.',
        type: 'sorting',
        timeLimit: 60,
        targetSwaps: 5,
        generateData: () => {
            const arr = [5, 3, 8, 1, 9, 2, 7, 4, 6]
            return arr
        }
    },
    {
        id: 'find_target',
        title: 'Find the Target',
        desc: 'Find the target value in the sorted array using binary search. Click the correct index.',
        type: 'searching',
        timeLimit: 30,
        generateData: () => {
            const arr = [2, 5, 8, 12, 16, 23, 38, 42, 56, 72, 91]
            const target = arr[Math.floor(Math.random() * arr.length)]
            return { arr, target }
        }
    },
    {
        id: 'shortest_path',
        title: 'Shortest Path',
        desc: 'Find the shortest path length between nodes. Enter your answer.',
        type: 'graph',
        timeLimit: 45,
        generateData: () => {
            return {
                nodes: [0, 1, 2, 3, 4],
                edges: [[0, 1, 4], [0, 2, 1], [1, 3, 1], [2, 1, 2], [2, 3, 5], [3, 4, 3]],
                start: 0, end: 4, answer: 7
            }
        }
    }
]

function ChallengeMode({ onBack }) {
    const [selectedChallenge, setSelectedChallenge] = useState(null)
    const [challengeData, setChallengeData] = useState(null)
    const [timeLeft, setTimeLeft] = useState(0)
    const [isActive, setIsActive] = useState(false)
    const [score, setScore] = useState(0)
    const [swapCount, setSwapCount] = useState(0)
    const [selectedIdx, setSelectedIdx] = useState(null)
    const [result, setResult] = useState(null) // 'win' | 'lose'
    const [userAnswer, setUserAnswer] = useState('')
    const timerRef = useRef(null)
    const unlockAchievement = useAppStore(s => s.unlockAchievement)
    const addXP = useAppStore(s => s.addXP)

    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [])

    const startChallenge = (challenge) => {
        setSelectedChallenge(challenge)
        const data = challenge.generateData()
        setChallengeData(data)
        setTimeLeft(challenge.timeLimit)
        setIsActive(true)
        setSwapCount(0)
        setResult(null)
        setSelectedIdx(null)
        setUserAnswer('')
        setScore(0)

        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current)
                    setIsActive(false)
                    setResult('lose')
                    return 0
                }
                return t - 1
            })
        }, 1000)
    }

    const handleSwap = (idx) => {
        if (!isActive || selectedChallenge?.type !== 'sorting') return
        if (selectedIdx === null) {
            setSelectedIdx(idx)
        } else {
            if (selectedIdx !== idx) {
                const newData = Array.isArray(challengeData) ? [...challengeData] : [...challengeData]
                const temp = newData[selectedIdx]
                newData[selectedIdx] = newData[idx]
                newData[idx] = temp
                setChallengeData(newData)
                setSwapCount(s => s + 1)

                // Check if sorted
                let sorted = true
                for (let i = 0; i < newData.length - 1; i++) {
                    if (newData[i] > newData[i + 1]) { sorted = false; break }
                }
                if (sorted) {
                    clearInterval(timerRef.current)
                    setIsActive(false)
                    const bonus = Math.max(0, (selectedChallenge.targetSwaps - swapCount - 1) * 5)
                    const timeBonus = timeLeft * 2
                    setScore(100 + bonus + timeBonus)
                    setResult('win')
                    addXP(20)
                    unlockAchievement('challenger')
                }
            }
            setSelectedIdx(null)
        }
    }

    const handleSearchClick = (idx) => {
        if (!isActive || selectedChallenge?.type !== 'searching') return
        clearInterval(timerRef.current)
        setIsActive(false)
        if (challengeData.arr[idx] === challengeData.target) {
            setScore(100 + timeLeft * 3)
            setResult('win')
            addXP(15)
            unlockAchievement('challenger')
        } else {
            setResult('lose')
        }
    }

    const handleGraphAnswer = () => {
        if (!isActive) return
        clearInterval(timerRef.current)
        setIsActive(false)
        if (parseInt(userAnswer) === challengeData.answer) {
            setScore(100 + timeLeft * 3)
            setResult('win')
            addXP(15)
            unlockAchievement('challenger')
        } else {
            setResult('lose')
        }
    }

    const resetToMenu = () => {
        setSelectedChallenge(null)
        setChallengeData(null)
        setResult(null)
        if (timerRef.current) clearInterval(timerRef.current)
    }

    if (!selectedChallenge) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button onClick={onBack} className="back-btn"><ArrowLeft size={18} /> Back</button>
                    <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Trophy size={24} color="var(--warning)" /> Challenges
                    </h2>
                    <ThemeToggle />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {CHALLENGES.map(ch => (
                        <div key={ch.id} className="glass-card" onClick={() => startChallenge(ch)}
                            style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Zap size={20} color="var(--warning)" />
                                <h3>{ch.title}</h3>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>{ch.desc}</p>
                            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <Clock size={14} /> {ch.timeLimit}s
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--warning)' }}>
                                    <Star size={14} /> +20 XP
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={resetToMenu} className="back-btn"><ArrowLeft size={18} /> Challenges</button>
                <div className="challenge-timer">{timeLeft}s</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {selectedChallenge.type === 'sorting' && (
                        <span style={{ padding: '6px 14px', background: 'var(--bg-card)', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Swaps: <strong style={{ color: 'var(--accent)' }}>{swapCount}</strong>
                        </span>
                    )}
                </div>
            </div>

            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                {selectedChallenge.desc}
            </div>

            <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px' }}>
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{
                                position: 'absolute', zIndex: 10, padding: '40px 60px', borderRadius: '24px',
                                background: result === 'win' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                                textAlign: 'center', backdropFilter: 'blur(10px)'
                            }}
                        >
                            <div style={{ fontSize: '3rem' }}>{result === 'win' ? '🎉' : '😢'}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '8px' }}>
                                {result === 'win' ? 'Challenge Complete!' : 'Time\'s Up!'}
                            </div>
                            {result === 'win' && <div style={{ fontSize: '1.1rem', marginTop: '4px' }}>Score: {score}</div>}
                            <button onClick={resetToMenu} className="action-btn primary-btn" style={{ marginTop: '16px', padding: '10px 24px' }}>
                                Back to Challenges
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Sorting challenge */}
                {selectedChallenge.type === 'sorting' && Array.isArray(challengeData) && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {challengeData.map((val, i) => (
                            <motion.div key={i} onClick={() => handleSwap(i)}
                                style={{
                                    width: '50px', height: '50px', borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.2rem', fontWeight: 700, cursor: 'pointer',
                                    background: selectedIdx === i ? 'var(--primary)' : 'var(--bg-card)',
                                    color: selectedIdx === i ? 'white' : 'var(--text-primary)',
                                    border: `2px solid ${selectedIdx === i ? 'var(--primary)' : 'var(--border-glass)'}`
                                }}
                                animate={selectedIdx === i ? { scale: 1.1 } : { scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                            >
                                {val}
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Searching challenge */}
                {selectedChallenge.type === 'searching' && challengeData && (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.1rem' }}>
                            Find: <strong style={{ color: 'var(--accent)', fontSize: '1.3rem' }}>{challengeData.target}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {challengeData.arr.map((val, i) => (
                                <motion.div key={i} onClick={() => handleSearchClick(i)}
                                    style={{
                                        width: '45px', height: '45px', borderRadius: '10px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                                        background: 'var(--bg-card)', border: '2px solid var(--border-glass)'
                                    }}
                                    whileHover={{ scale: 1.1, borderColor: 'var(--primary)' }}
                                >
                                    {val}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Graph challenge */}
                {selectedChallenge.type === 'graph' && challengeData && (
                    <div style={{ textAlign: 'center' }}>
                        <svg width="400" height="250" viewBox="0 0 400 250">
                            {challengeData.edges.map(([from, to, w], i) => {
                                const pos = [{ x: 60, y: 80 }, { x: 200, y: 30 }, { x: 140, y: 180 }, { x: 280, y: 130 }, { x: 370, y: 180 }]
                                return (
                                    <g key={i}>
                                        <line x1={pos[from].x} y1={pos[from].y} x2={pos[to].x} y2={pos[to].y} stroke="var(--border-glass)" strokeWidth="2" />
                                        <text x={(pos[from].x + pos[to].x) / 2} y={(pos[from].y + pos[to].y) / 2 - 8} fill="var(--warning)" fontSize="12" fontWeight="700" textAnchor="middle">{w}</text>
                                    </g>
                                )
                            })}
                            {[{ x: 60, y: 80 }, { x: 200, y: 30 }, { x: 140, y: 180 }, { x: 280, y: 130 }, { x: 370, y: 180 }].map((pos, i) => (
                                <g key={i}>
                                    <circle cx={pos.x} cy={pos.y} r="22" fill={i === challengeData.start ? 'var(--success)' : i === challengeData.end ? 'var(--danger)' : 'var(--bg-card)'} stroke="var(--border-glass)" strokeWidth="2" />
                                    <text x={pos.x} y={pos.y + 5} fill="white" fontSize="14" fontWeight="700" textAnchor="middle">{i}</text>
                                </g>
                            ))}
                        </svg>
                        <div style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                            <span>Shortest path {challengeData.start} → {challengeData.end} = </span>
                            <input type="number" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)}
                                className="glass-panel" style={{ width: '60px', padding: '8px', textAlign: 'center', color: 'var(--text-primary)', background: 'var(--bg-card)' }} />
                            <button onClick={handleGraphAnswer} className="action-btn primary-btn" style={{ padding: '8px 16px' }}>Submit</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ChallengeMode
