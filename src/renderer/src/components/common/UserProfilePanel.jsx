import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, Flame, Activity, Star, Lock, Map, Code, LogOut } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

function UserProfilePanel({ isOpen, onClose }) {
    const { xp, level, dailyStreak, unlockedAchievements, allAchievements, visitedVisualizers, sortsRun, userName, logout } = useAppStore()

    const maxLevelXP = (level + 1) * 500;
    const progressPercent = Math.min(100, (xp / maxLevelXP) * 100);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 1000
                        }}
                    />

                    {/* Sliding Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            position: 'fixed', top: 0, right: 0, width: '400px', maxWidth: '100%', height: '100vh',
                            background: 'var(--bg-dark)', borderLeft: '1px solid var(--border-glass)',
                            zIndex: 1001, display: 'flex', flexDirection: 'column',
                            overflowY: 'auto'
                        }}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border-glass sticky top-0 bg-bg-dark/80 backdrop-blur-md z-10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl overflow-hidden border-2 border-primary/50 neo-glow shrink-0">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User Avatar" className="w-full h-full object-cover bg-bg-elevated" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white leading-none mb-1">{userName || 'Dev'} 👾</h2>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Level {level} Code Ninja</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { logout(); onClose(); }}
                                    className="p-2 bg-bg-elevated hover:bg-red-500/20 rounded-lg text-text-muted hover:text-red-400 transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut size={16} />
                                </button>
                                <button onClick={onClose} className="p-2 bg-bg-elevated hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-8">

                            {/* XP Progress Bar */}
                            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Activity size={100} />
                                </div>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-4 relative z-10">Current Designation Track</h3>

                                <div className="flex justify-between items-end mb-2 relative z-10">
                                    <span className="text-2xl font-black text-white">{progressPercent.toFixed(1)}%</span>
                                    <span className="text-xs font-bold text-primary font-mono">{xp} / {maxLevelXP} XP</span>
                                </div>

                                <div className="h-3 w-full bg-black/40 rounded-full border border-border-glass relative overflow-hidden">
                                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent-cyan relative shadow-[0_0_10px_var(--primary)]" style={{ width: `${progressPercent}%` }}>
                                        <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Lifetime Stats */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                                    <Activity size={14} className="text-accent-orange" /> Lifetime Metrics
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-bg-elevated border border-border-glass p-4 rounded-xl flex flex-col gap-1 items-start">
                                        <Code size={16} className="text-text-muted mb-1" />
                                        <span className="text-xl font-black text-white font-mono">{sortsRun.length}</span>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">Sorts Executed</span>
                                    </div>
                                    <div className="bg-bg-elevated border border-border-glass p-4 rounded-xl flex flex-col gap-1 items-start">
                                        <Map size={16} className="text-text-muted mb-1" />
                                        <span className="text-xl font-black text-white font-mono">{visitedVisualizers.length}</span>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">Systems Mapped</span>
                                    </div>
                                    <div className="bg-bg-elevated border border-border-glass p-4 rounded-xl flex flex-col gap-1 items-start">
                                        <Flame size={16} className="text-accent-orange mb-1" />
                                        <span className="text-xl font-black text-white font-mono">{dailyStreak}</span>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">Daily Streak</span>
                                    </div>
                                    <div className="bg-bg-elevated border border-border-glass p-4 rounded-xl flex flex-col gap-1 items-start">
                                        <Star size={16} className="text-accent-cyan mb-1" />
                                        <span className="text-xl font-black text-white font-mono">Top {Math.max(1, 100 - (level * 2))}%</span>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">Global Percentile</span>
                                    </div>
                                </div>
                            </div>

                            {/* Achievements Cabinet */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                                        <Trophy size={14} className="text-accent-green" /> Trophy Cabinet
                                    </h3>
                                    <span className="text-[10px] font-bold bg-bg-elevated px-2 py-1 rounded text-text-muted">
                                        {unlockedAchievements.length} / {allAchievements.length}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {allAchievements.map(ach => {
                                        const isUnlocked = unlockedAchievements.includes(ach.id)
                                        return (
                                            <div
                                                key={ach.id}
                                                className={`flex items-center gap-4 p-3 rounded-xl border ${isUnlocked ? 'bg-primary/10 border-primary/30' : 'bg-black/20 border-border-glass grayscale opacity-50'}`}
                                            >
                                                <div className="text-2xl shrink-0">
                                                    {isUnlocked ? ach.icon : <Lock size={20} className="text-text-muted m-1" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className={`text-sm font-bold truncate ${isUnlocked ? 'text-white' : 'text-text-secondary'}`}>
                                                        {ach.title}
                                                    </h4>
                                                    <p className="text-[10px] text-text-muted truncate">{ach.desc}</p>
                                                </div>
                                                <div className="shrink-0 text-right">
                                                    <span className={`text-[10px] font-mono font-bold ${isUnlocked ? 'text-primary' : 'text-text-muted'}`}>+{ach.xp} XP</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default UserProfilePanel
