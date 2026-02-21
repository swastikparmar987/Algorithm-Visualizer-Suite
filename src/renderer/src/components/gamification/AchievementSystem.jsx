import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, Star, Lock, Unlock } from 'lucide-react'
import ThemeToggle from '../common/ThemeToggle'
import { useAppStore } from '../../store/useAppStore'

function AchievementSystem({ onBack }) {
    const xp = useAppStore(s => s.xp)
    const level = useAppStore(s => s.level)
    const unlockedAchievements = useAppStore(s => s.unlockedAchievements)
    const allAchievements = useAppStore(s => s.allAchievements)
    const dailyStreak = useAppStore(s => s.dailyStreak)

    const xpInLevel = xp % 100
    const xpForNext = 100

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={onBack} className="back-btn"><ArrowLeft size={18} /> Back</button>
                <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Trophy size={24} color="var(--warning)" /> Achievements
                </h2>
                <ThemeToggle />
            </div>

            {/* Stats bar */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        fontSize: '1.5rem', fontWeight: 800, color: 'white'
                    }}>
                        {level}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Level {level}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{xp} total XP</div>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Progress to Level {level + 1}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{xpInLevel}/{xpForNext}</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-card)', borderRadius: '4px', overflow: 'hidden' }}>
                        <motion.div
                            style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: '4px' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(xpInLevel / xpForNext) * 100}%` }}
                            transition={{ duration: 0.6 }}
                        />
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem' }}>🔥</div>
                    <div style={{ fontWeight: 700, color: 'var(--warning)' }}>{dailyStreak}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Streak</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem' }}>🏆</div>
                    <div style={{ fontWeight: 700, color: 'var(--success)' }}>{unlockedAchievements.length}/{allAchievements.length}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Unlocked</div>
                </div>
            </div>

            {/* Achievement grid */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                    {allAchievements.map((ach, i) => {
                        const unlocked = unlockedAchievements.includes(ach.id)
                        return (
                            <motion.div
                                key={ach.id}
                                className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div className="achievement-icon">
                                    {unlocked ? ach.icon : '🔒'}
                                </div>
                                <div className="achievement-info" style={{ flex: 1 }}>
                                    <h4>{ach.title}</h4>
                                    <p>{ach.desc}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: unlocked ? 'var(--warning)' : 'var(--text-muted)' }}>
                                        <Star size={14} /> {ach.xp} XP
                                    </div>
                                    {unlocked ? (
                                        <Unlock size={14} color="var(--success)" style={{ marginTop: '4px' }} />
                                    ) : (
                                        <Lock size={14} color="var(--text-muted)" style={{ marginTop: '4px' }} />
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default AchievementSystem
