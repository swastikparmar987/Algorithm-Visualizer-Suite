import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Search, Filter, History, Clock, Hash } from 'lucide-react'
import StitchVisualizerLayout from '../common/StitchVisualizerLayout'
import { useAppStore } from '../../store/useAppStore'
import { playClick } from '../../utils/SoundEngine'

const EVENTS = [
    { year: '300 BC', title: 'Euclidean Algorithm', desc: 'Greatest Common Divisor (GCD)', category: 'Number Theory' },
    { year: '825 AD', title: 'Al-Khwarizmi', desc: 'Introduced algebra and the concept of algorithms', category: 'Math' },
    { year: '1843', title: 'Ada Lovelace', desc: 'First computer algorithm (Bernoulli numbers)', category: 'Computing' },
    { year: '1936', title: 'Turing Machine', desc: 'Alan Turing defines computability', category: 'Theory' },
    { year: '1945', title: 'Merge Sort', desc: 'John von Neumann invents Merge Sort', category: 'Sorting' },
    { year: '1956', title: 'BFS / Kruskal\'s', desc: 'Algorithms for shortest path & MST', category: 'Graph' },
    { year: '1959', title: 'Dijkstra\'s Algorithm', desc: 'Shortest path in graph', category: 'Graph' },
    { year: '1960', title: 'Quick Sort', desc: 'Tony Hoare develops Quick Sort', category: 'Sorting' },
    { year: '1965', title: 'Fast Fourier Transform', desc: 'Cooley & Tukey optimize FFT', category: 'Signal' },
    { year: '1970', title: 'B-Trees', desc: 'Bayer & McCreight', category: 'Data Structure' },
    { year: '1977', title: 'RSA Encryption', desc: 'Rivest, Shamir, Adleman public-key crypto', category: 'Crypto' },
    { year: '1980s', title: 'Neural Networks', desc: 'Backpropagation popularized', category: 'AI' }
]

const CATEGORIES = [...new Set(EVENTS.map(e => e.category))]

function AlgorithmTimeline({ onBack }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const soundEnabled = useAppStore(s => s.soundEnabled)

    const filteredEvents = useMemo(() => {
        return EVENTS.filter(e => {
            const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.year.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.desc.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCat = selectedCategory === 'All' || e.category === selectedCategory
            return matchesSearch && matchesCat
        })
    }, [searchTerm, selectedCategory])

    const handleCategoryClick = (cat) => {
        if (soundEnabled) playClick()
        setSelectedCategory(cat)
    }

    const Logs = "Navigate computational history. Filter milestones by category or search for specific algorithms."

    const Controls = (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Search size={14} /> Database Query
                </h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input
                        className="w-full bg-bg-dark border border-border-glass rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-text-muted"
                        placeholder="Search algorithms, people, years..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="h-px w-full bg-border-glass"></div>

            <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-accent-cyan flex items-center gap-2">
                    <Filter size={14} /> Category Filter
                </h3>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleCategoryClick('All')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border
                            ${selectedCategory === 'All' ? 'bg-accent-cyan/20 border-accent-cyan text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-bg-dark border-border-glass text-text-muted hover:bg-white/5'}
                        `}
                    >
                        All
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryClick(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border
                                ${selectedCategory === cat ? 'bg-accent-cyan/20 border-accent-cyan text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-bg-dark border-border-glass text-text-muted hover:bg-white/5'}
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )

    const Metrics = (
        <div className="grid grid-cols-2 gap-4 h-full">
            <div className="bg-bg-dark/50 border border-primary/30 rounded-xl p-4 flex flex-col items-center justify-center text-center col-span-2 relative overflow-hidden group hover:border-primary/60 transition-colors">
                <div className="absolute inset-0 bg-primary/5"></div>
                <Hash size={24} className="text-primary mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold relative z-10">Records Found</span>
                <span className="text-3xl font-black font-mono text-white relative z-10">{filteredEvents.length}</span>
            </div>

            <div className="bg-bg-elevated border border-border-glass rounded-xl p-4 flex flex-col items-center justify-center text-center group hover:border-border-glass/80 transition-colors col-span-2 sm:col-span-1 lg:col-span-2 xl:col-span-1">
                <Clock size={20} className="text-text-muted mb-2 group-hover:text-white transition-colors" />
                <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Origin</span>
                <span className="text-sm font-black text-white mt-1">300 BC</span>
            </div>
            <div className="bg-bg-elevated border border-border-glass rounded-xl p-4 flex flex-col items-center justify-center text-center group hover:border-border-glass/80 transition-colors col-span-2 sm:col-span-1 lg:col-span-2 xl:col-span-1">
                <History size={20} className="text-text-muted mb-2 group-hover:text-white transition-colors" />
                <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Latest Entry</span>
                <span className="text-sm font-black text-white mt-1">1980s</span>
            </div>
        </div>
    )

    return (
        <StitchVisualizerLayout
            title="Algorithm Timeline"
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={Logs}
        >
            <div className="w-full h-full p-8 bg-[#0A0A0F] overflow-hidden flex flex-col">
                <div className="flex-1 bg-bg-elevated border border-border-glass rounded-2xl relative overflow-y-auto custom-scrollbar flex flex-col max-h-full">
                    {filteredEvents.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-text-muted opacity-50 p-6 min-h-[400px]">
                            <History size={64} className="mb-6 opacity-20" />
                            <p className="font-display font-medium text-lg uppercase tracking-widest">No Historical Records Found.</p>
                            <p className="text-sm mt-2 opacity-70">Adjust query parameters.</p>
                        </div>
                    ) : (
                        <div className="relative max-w-4xl mx-auto w-full py-16 px-4 sm:px-8">
                            {/* Glowing Center Core */}
                            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-primary/50 to-transparent transform -translate-x-1/2" />
                            <div className="absolute left-1/2 top-0 bottom-0 w-[10px] blur-[8px] bg-primary/20 transform -translate-x-1/2" />

                            <AnimatePresence>
                                {filteredEvents.map((event, i) => {
                                    const isEven = i % 2 === 0
                                    return (
                                        <motion.div
                                            key={`${event.title}-${i}`}
                                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                                            className={`relative flex items-center justify-between mb-16 w-full ${isEven ? 'flex-row-reverse' : ''}`}
                                        >
                                            {/* Spacer for the other side */}
                                            <div className="w-5/12" />

                                            {/* Node on Timeline */}
                                            <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 flex items-center justify-center z-10 cursor-pointer group">
                                                <div className="absolute w-full h-full bg-primary rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500 ease-out" />
                                                <div className="w-4 h-4 bg-bg-dark border-2 border-primary rounded-full group-hover:bg-primary transition-colors shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
                                            </div>

                                            {/* Connecting Line (Optional, for visual flair) */}
                                            <div className={`absolute top-1/2 -translate-y-1/2 w-[calc(50%-2rem)] h-px bg-gradient-to-r ${isEven ? 'from-border-glass to-primary/50 right-[50%]' : 'from-primary/50 to-border-glass left-[50%]'}`} />

                                            {/* Content Card */}
                                            <div
                                                className={`w-5/12 bg-bg-dark/80 backdrop-blur-md border border-border-glass p-5 rounded-2xl shadow-xl hover:border-primary/50 transition-colors group relative overflow-hidden`}
                                                onMouseEnter={() => soundEnabled && playClick()}
                                            >
                                                {/* Cyberpunk Accent */}
                                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                                <div className={`flex items-baseline gap-3 mb-2 ${isEven ? 'flex-row-reverse' : ''}`}>
                                                    <span className="text-2xl font-black font-mono text-white/90 group-hover:text-white transition-colors tracking-tighter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                                                        {event.year}
                                                    </span>
                                                    <span className="text-[10px] uppercase font-bold tracking-widest text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                                                        {event.category}
                                                    </span>
                                                </div>

                                                <h3 className={`text-xl font-bold text-white mb-2 leading-tight ${isEven ? 'text-right' : 'text-left'}`}>
                                                    {event.title}
                                                </h3>

                                                <p className={`text-sm text-text-secondary ${isEven ? 'text-right' : 'text-left'}`}>
                                                    {event.desc}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </StitchVisualizerLayout>
    )
}

export default AlgorithmTimeline
