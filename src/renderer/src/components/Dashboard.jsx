import React, { useState } from 'react'
import {
    Terminal, Search, Bell, User, Flame,
    ArrowRight, BarChart2, Share2, Map,
    Brain, Layers, Cpu, Swords, Zap, HelpCircle,
    Settings, Volume2, VolumeX, Keyboard, Activity,
    Route, FileSearch, Droplets, Hexagon,
    Type, HardDrive, Database, Hash, GitCommit, GitMerge,
    LineChart, GitCompare, BugPlay, Box, History, Code, GraduationCap
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { playClick, playNavigate } from '../utils/SoundEngine'
import SettingsPanel from './common/SettingsPanel'
import KeyboardShortcuts from './common/KeyboardShortcuts'
import UserProfilePanel from './common/UserProfilePanel'
import Logo from './common/Logo'

const Dashboard = ({ onNavigate }) => {
    const { xp, level, dailyStreak, soundEnabled, toggleSound, unlockedAchievements, visitedVisualizers, sortsRun, userName } = useAppStore()
    const [showSettings, setShowSettings] = useState(false)
    const [showShortcuts, setShowShortcuts] = useState(false)
    const [showProfile, setShowProfile] = useState(false)

    const handleNav = (id) => {
        if (soundEnabled) playNavigate()
        onNavigate(id)
    }

    return (
        <div className="flex flex-col h-full bg-bg-dark text-text-primary overflow-hidden font-display">
            <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
            <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
            <UserProfilePanel isOpen={showProfile} onClose={() => setShowProfile(false)} />

            {/* HEADER */}
            <header className="sticky top-0 z-50 glass-panel border-b border-border-glass px-6 py-4 flex items-center justify-between shrink-0 m-4 rounded-2xl">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-1.5 rounded-xl shadow-xl shadow-primary/10 overflow-hidden">
                            <Logo className="size-10 text-primary" />
                        </div>
                        <h2 className="text-xl font-extrabold tracking-tighter text-white">ALGO_V1S</h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <button className="text-primary font-bold text-xs uppercase tracking-widest">Dashboard</button>
                        <button onClick={() => handleNav('academy')} className="text-text-muted hover:text-white transition-colors font-semibold text-xs uppercase tracking-widest">Academy</button>
                        <button onClick={() => alert('Global Ops Sector is classified. Coming Soon in V2.')} className="text-text-muted hover:text-white transition-colors font-semibold text-xs uppercase tracking-widest">Global Ops</button>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <button onClick={() => setShowShortcuts(true)} className="p-2.5 rounded-xl bg-bg-elevated border border-border-glass hover:bg-white/10 text-text-secondary transition-all">
                            <Keyboard size={18} />
                        </button>
                        <button onClick={toggleSound} className="p-2.5 rounded-xl bg-bg-elevated border border-border-glass hover:bg-white/10 text-text-secondary transition-all">
                            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                        </button>
                        <button onClick={() => setShowSettings(true)} className="p-2.5 rounded-xl bg-bg-elevated border border-border-glass hover:bg-white/10 text-text-secondary transition-all">
                            <Settings size={18} />
                        </button>
                    </div>
                    <button onClick={() => setShowProfile(true)} className="size-10 rounded-xl overflow-hidden border-2 border-primary/50 neo-glow hover:border-primary transition-colors cursor-pointer group">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover bg-bg-elevated group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto px-6 pb-10 space-y-12 dashboard-scroll">

                {/* HERO SECTION */}
                <section className="space-y-8 mt-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <p className="text-primary font-mono text-xs tracking-[0.2em] font-bold uppercase">System Online // User: {userName}</p>
                            <div className="inline-block">
                                <h1 className="text-4xl md:text-5xl font-black text-white typewriter pr-4">Welcome back, {userName} 👾</h1>
                            </div>
                        </div>
                        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-accent-orange/30">
                            <div className="relative">
                                <Flame className="text-accent-orange" size={32} />
                                <div className="absolute inset-0 bg-accent-orange blur-xl opacity-30"></div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-accent-orange/70 uppercase tracking-widest">Current Streak</p>
                                <p className="text-2xl font-black text-white font-mono">{dailyStreak} DAYS</p>
                            </div>
                        </div>
                    </div>

                    {/* XP BAR */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end px-2">
                            <div className="space-y-1">
                                <p className="text-white font-bold text-lg">Level {level}: Code Ninja</p>
                                <p className="text-text-muted text-[10px] font-semibold uppercase tracking-widest">Next Rank: Cyber Architect</p>
                            </div>
                            <div className="text-right">
                                <p className="text-primary font-mono font-black text-lg">{xp} / {(level + 1) * 500} XP</p>
                            </div>
                        </div>
                        <div className="h-3 w-full bg-black/40 rounded-full border border-border-glass relative overflow-hidden shadow-[0_0_20px_var(--primary-glow)]">
                            <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent-cyan relative shadow-[0_0_10px_var(--primary)]" style={{ width: `${Math.min(100, (xp / ((level + 1) * 500)) * 100)}%` }}>
                                <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* STATS ROW */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard label="Algos Explored" value={visitedVisualizers.length} sub="MODULES" colorHover="primary" />
                        <StatCard label="Current Streak" value={dailyStreak} sub="DAYS" colorHover="accent-orange" />
                        <StatCard label="Achievements" value={unlockedAchievements.length} sub={`/ ${useAppStore(s => s.allAchievements.length)}`} colorHover="accent-green" />
                        <StatCard label="Algos Tested" value={sortsRun ? sortsRun.length : 0} sub="RUNS" colorHover="secondary" />
                    </div>
                </section>

                {/* VISUALIZER CATEGORIES */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                            <span className="w-10 h-1 bg-primary rounded-full"></span>
                            Algorithm Sectors
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                        <CategoryCard
                            title="Sorting Protocols"
                            desc="Master Quicksort, Mergesort, and Heapsort visualization mechanics."
                            icon={BarChart2}
                            color="text-primary"
                            bg="bg-primary/20"
                            border="border-primary/30"
                            progress={82}
                            onClick={() => handleNav('sorting')}
                            tag="In Progress"
                        />

                        <CategoryCard
                            title="Search Heuristics"
                            desc="Binary Search trees, BFS, and DFS traversal patterns."
                            icon={Search}
                            color="text-accent-cyan"
                            bg="bg-accent-cyan/20"
                            border="border-accent-cyan/30"
                            progress={45}
                            onClick={() => handleNav('searching')}
                            tag="In Progress"
                        />

                        <CategoryCard
                            title="Graph Neural Nets"
                            desc="Dijkstra, A*, and Bellman-Ford shortest path algorithms."
                            icon={Share2}
                            color="text-secondary"
                            bg="bg-secondary/20"
                            border="border-secondary/30"
                            progress={12}
                            onClick={() => handleNav('graph')}
                            tag="Unlocked"
                        />

                        <CategoryCard
                            title="CPU Scheduling"
                            desc="Process management: FCFS, SJF, and Round Robin timelines."
                            icon={Cpu}
                            color="text-danger"
                            bg="bg-danger/20"
                            border="border-danger/30"
                            progress={60}
                            onClick={() => handleNav('cpu-scheduling')}
                            tag="System"
                        />

                        <CategoryCard
                            title="Memory Management"
                            desc="RAM allocation: First, Best, and Worst Fit algorithms."
                            icon={Database}
                            color="text-accent-pink"
                            bg="bg-accent-pink/20"
                            border="border-accent-pink/30"
                            progress={100}
                            onClick={() => handleNav('memory')}
                            tag="System"
                        />

                        <CategoryCard
                            title="Disk Scheduling"
                            desc="Optimize head movement: FCFS, SSTF, SCAN, LOOK."
                            icon={HardDrive}
                            color="text-accent-cyan"
                            bg="bg-accent-cyan/20"
                            border="border-accent-cyan/30"
                            progress={100}
                            onClick={() => handleNav('disk')}
                            tag="System"
                        />

                        <CategoryCard
                            title="OS Concurrency"
                            desc="Dining Philosophers, Producer-Consumer & Deadlock."
                            icon={GitCommit}
                            color="text-primary"
                            bg="bg-primary/20"
                            border="border-primary/30"
                            progress={100}
                            onClick={() => handleNav('concurrency')}
                            tag="System"
                        />

                        <CategoryCard
                            title="Hash Tables"
                            desc="Chaining and Open Addressing with real-time stats."
                            icon={Hash}
                            color="text-accent-orange"
                            bg="bg-accent-orange/20"
                            border="border-accent-orange/30"
                            progress={100}
                            onClick={() => handleNav('hashing')}
                            tag="System"
                        />

                        <CategoryCard
                            title="B-Trees"
                            desc="Self-balancing disk-based search trees."
                            icon={GitMerge}
                            color="text-accent-pink"
                            bg="bg-accent-pink/20"
                            border="border-accent-pink/30"
                            progress={100}
                            onClick={() => handleNav('btree')}
                            tag="System"
                        />

                        <CategoryCard
                            title="Pathfinding Ops"
                            desc="Grid-based traversal using Dijkstra and A* algorithms."
                            icon={Map}
                            color="text-accent-green"
                            bg="bg-accent-green/20"
                            border="border-accent-green/30"
                            progress={25}
                            onClick={() => handleNav('pathfinding')}
                            tag="New Sector"
                        />

                        <CategoryCard
                            title="Tree Architect"
                            desc="Binary Search Trees and AVL balancing visualizations."
                            icon={Brain}
                            color="text-accent-orange"
                            bg="bg-accent-orange/20"
                            border="border-accent-orange/30"
                            progress={100}
                            onClick={() => handleNav('tree')}
                            tag="New"
                        />

                        <CategoryCard
                            title="Data Structures"
                            desc="Core memory structures: Stacks, Queues, and Lists."
                            icon={Layers}
                            color="text-primary"
                            bg="bg-primary/20"
                            border="border-primary/30"
                            progress={100}
                            onClick={() => handleNav('data-structures')}
                            tag="New"
                        />

                        <CategoryCard
                            title="Automata Theory"
                            desc="Design & Simulate DFAs, NFAs, and Turing Machines."
                            icon={Settings}
                            color="text-accent-cyan"
                            bg="bg-accent-cyan/20"
                            border="border-accent-cyan/30"
                            progress={100}
                            onClick={() => handleNav('automata')}
                            tag="New"
                        />

                        <CategoryCard
                            title="Dynamic Programming"
                            desc="Solve complex problems by breaking them into overlapping subproblems."
                            icon={Activity}
                            color="text-accent-pink"
                            bg="bg-accent-pink/20"
                            border="border-accent-pink/30"
                            progress={100}
                            onClick={() => handleNav('dp')}
                            tag="New"
                        />

                        <CategoryCard
                            title="Backtracking Search"
                            desc="Explore all possible paths: N-Queens, Sudoku Solver."
                            icon={Route}
                            color="text-accent-orange"
                            bg="bg-accent-orange/20"
                            border="border-accent-orange/30"
                            progress={100}
                            onClick={() => handleNav('backtracking')}
                            tag="New"
                        />

                        <CategoryCard
                            title="String Matching"
                            desc="Text pattern finding: KMP, Rabin-Karp, and Naive Search."
                            icon={FileSearch}
                            color="text-accent-green"
                            bg="bg-accent-green/20"
                            border="border-accent-green/30"
                            progress={100}
                            onClick={() => handleNav('string-matching')}
                            tag="New"
                        />

                        <CategoryCard
                            title="Network Flow"
                            desc="Max flow visualization: Edmonds-Karp and BFS paths."
                            icon={Droplets}
                            color="text-accent-cyan"
                            bg="bg-accent-cyan/20"
                            border="border-accent-cyan/30"
                            progress={100}
                            onClick={() => handleNav('network-flow')}
                            tag="New"
                        />

                        <CategoryCard
                            title="Convex Hull"
                            desc="Computational geometry: Graham Scan and Jarvis March."
                            icon={Hexagon}
                            color="text-accent-pink"
                            bg="bg-accent-pink/20"
                            border="border-accent-pink/30"
                            progress={100}
                            onClick={() => handleNav('convex-hull')}
                            tag="New"
                        />

                        <CategoryCard
                            title="Regex Engine"
                            desc="Interactive pattern matching and NFA simulation."
                            icon={Type}
                            color="text-primary"
                            bg="bg-primary/20"
                            border="border-primary/30"
                            progress={100}
                            onClick={() => handleNav('regex')}
                            tag="New"
                        />

                        <CategoryCard
                            title="Fast Fourier Transform"
                            desc="Analyze signals in time and frequency domains."
                            icon={Activity}
                            color="text-accent-orange"
                            bg="bg-accent-orange/20"
                            border="border-accent-orange/30"
                            progress={100}
                            onClick={() => handleNav('fft')}
                            tag="New"
                        />

                    </div >
                </section >

                {/* LEARNING LAB */}
                < section className="space-y-6" >
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                            <span className="w-10 h-1 bg-accent-orange rounded-full"></span>
                            Learning Lab
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <CategoryCard
                            title="The Academy Hub"
                            desc="Master algorithms and system design with curated articles and video tutorials."
                            icon={GraduationCap}
                            color="text-emerald-400"
                            bg="bg-emerald-500/20"
                            border="border-emerald-500/30"
                            progress={100}
                            onClick={() => handleNav('academy')}
                            tag="New"
                        />

                        <CategoryCard
                            title="Complexity Analyzer"
                            desc="Interactive Big-O growth rate charts and input testing."
                            icon={LineChart}
                            color="text-primary"
                            bg="bg-primary/20"
                            border="border-primary/30"
                            progress={100}
                            onClick={() => handleNav('complexity')}
                            tag="System"
                        />

                        <CategoryCard
                            title="Algorithm Comparator"
                            desc="Benchmark sorts head-to-head with live ms timings."
                            icon={GitCompare}
                            color="text-accent-pink"
                            bg="bg-accent-pink/20"
                            border="border-accent-pink/30"
                            progress={100}
                            onClick={() => handleNav('comparator')}
                            tag="System"
                        />

                        <CategoryCard
                            title="Interactive Sandbox"
                            desc="Write your own custom JavaScript algorithms."
                            icon={Code}
                            color="text-accent-cyan"
                            bg="bg-accent-cyan/20"
                            border="border-accent-cyan/30"
                            progress={100}
                            onClick={() => handleNav('sandbox')}
                            tag="System"
                        />

                        <CategoryCard
                            title="Graph 3D Cyberspace"
                            desc="Immersive 3D representation of graph protocol routing."
                            icon={Box}
                            color="text-[#00f0ff]"
                            bg="bg-[#00f0ff]/20"
                            border="border-[#00f0ff]/30"
                            progress={100}
                            onClick={() => handleNav('graph3d')}
                            tag="Cyberspace"
                        />


                        <CategoryCard
                            title="Step Debugger"
                            desc="Line-by-line execution tracking with variable states."
                            icon={BugPlay}
                            color="text-accent-cyan"
                            bg="bg-accent-cyan/20"
                            border="border-accent-cyan/30"
                            progress={100}
                            onClick={() => handleNav('step-debugger')}
                            tag="System"
                        />

                        <CategoryCard
                            title="Space Complexity"
                            desc="Visualize memory allocation and call stack footprint."
                            icon={Box}
                            color="text-secondary"
                            bg="bg-secondary/20"
                            border="border-secondary/30"
                            progress={100}
                            onClick={() => handleNav('space-complexity')}
                            tag="System"
                        />

                        <CategoryCard
                            title="Algorithm Timeline"
                            desc="Historical milestones in computational theory."
                            icon={History}
                            color="text-accent-orange"
                            bg="bg-accent-orange/20"
                            border="border-accent-orange/30"
                            progress={100}
                            onClick={() => handleNav('algo-timeline')}
                            tag="System"
                        />
                    </div>
                </section >

                {/* ENGAGEMENT HUB */}
                < section className="space-y-6" >
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                        <span className="w-10 h-1 bg-primary rounded-full"></span>
                        Engagement Hub
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <ToolCard
                            title="Practice Engine"
                            desc="Solve LeetCode-style challenges and verify your logic."
                            icon={Code}
                            btnText="Start Practice"
                            gradient="from-purple-600 via-pink-600 to-rose-500"
                            onClick={() => handleNav('practice')}
                        />
                        <ToolCard
                            title="Algo Battle"
                            desc="PVP algorithm optimization matches."
                            icon={Swords}
                            btnText="Enter Arena"
                            gradient="from-indigo-600 via-blue-600 to-primary"
                            onClick={() => handleNav('battle')}
                        />
                        <ToolCard
                            title="Elite Challenges"
                            desc="Curated problems with exclusive vanity rewards."
                            icon={Zap}
                            btnText="Accept Mission"
                            gradient="from-orange-600 via-amber-500 to-yellow-400"
                            onClick={() => handleNav('challenges')}
                        />
                        <ToolCard
                            title="Theory Quiz"
                            desc="Reinforce your mental models with flash-fire questions."
                            icon={HelpCircle}
                            btnText="Start Quiz"
                            gradient="from-emerald-600 via-teal-500 to-accent-cyan"
                            onClick={() => handleNav('quiz')}
                        />
                    </div>
                </section >

            </main >
        </div >
    )
}

// SUB-COMPONENTS for Cleanliness

const StatCard = ({ label, value, sub, colorHover }) => (
    <div
        className="relative group p-6 rounded-2xl bg-bg-dark/80 backdrop-blur-md border border-border-glass overflow-hidden transition-all duration-300 hover:-translate-y-1"
        style={{ '--glow-color': `var(--${colorHover})` }}
    >
        {/* Dynamic Inner Glow using standard CSS variable from style prop */}
        <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-8 opacity-30 blur-2xl rounded-full group-hover:opacity-70 group-hover:h-12 transition-all duration-500"
            style={{ backgroundColor: 'var(--glow-color)' }}
        ></div>

        <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-2 relative z-10">{label}</p>
        <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-black text-white font-mono tracking-tight">{value}</span>
            <span className="font-bold text-xs" style={{ color: 'var(--glow-color)' }}>{sub}</span>
        </div>

        {/* Border Hover Effect overlay */}
        <div className="absolute inset-0 border-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ borderColor: 'var(--glow-color)' }}></div>
    </div>
)

const CategoryCard = ({ title, desc, icon: Icon, color, bg, border, progress, onClick, tag }) => (
    <div
        onClick={onClick}
        className="glass-panel p-8 rounded-3xl relative group hover:border-primary/50 transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] origin-center"
    >
        <div className="flex justify-between items-start mb-10">
            <div className={`size-16 rounded-2xl ${bg} flex items-center justify-center ${color} border ${border} group-hover:scale-110 transition-transform`}>
                <Icon size={32} />
            </div>
            {tag && <span className={`px-3 py-1 rounded-lg ${bg} ${color} text-[10px] font-black uppercase tracking-widest border ${border}`}>{tag}</span>}
        </div>
        <h3 className="text-2xl font-black text-white mb-2">{title}</h3>
        <p className="text-text-secondary text-sm mb-6 h-10">{desc}</p>
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold">
                <span className="text-text-muted uppercase">Synchronizing</span>
                <span className={color}>{progress}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full bg-current ${color} rounded-full`} style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    </div>
)

const LockedCard = ({ title, desc, icon: Icon }) => (
    <div className="glass-panel p-8 rounded-3xl relative border-border-glass bg-white/[0.02] grayscale opacity-50 overflow-hidden group cursor-not-allowed">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        <div className="flex justify-between items-start mb-10">
            <div className="size-16 rounded-2xl bg-white/10 flex items-center justify-center text-text-muted border border-border-glass">
                <Icon size={32} />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
                LOCKED
            </div>
        </div>
        <h3 className="text-2xl font-black text-text-secondary mb-2">{title}</h3>
        <p className="text-text-muted text-sm mb-6">{desc}</p>
    </div>
)

const ToolCard = ({ title, desc, icon: Icon, btnText, gradient, onClick }) => (
    <div className={`p-0.5 rounded-3xl bg-gradient-to-br ${gradient} shadow-2xl`}>
        <div className="glass-panel h-full p-8 rounded-[1.4rem] flex flex-col items-start bg-bg-dark/80 backdrop-blur-xl border-none">
            <div className="bg-white/10 text-white p-3 rounded-2xl mb-6">
                <Icon size={32} />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">{title}</h3>
            <p className="text-text-secondary text-sm mb-8">{desc}</p>
            <button
                onClick={onClick}
                className="mt-auto w-full py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl lego-button uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all"
            >
                {btnText} <ArrowRight size={16} />
            </button>
        </div>
    </div>
)

export default Dashboard
