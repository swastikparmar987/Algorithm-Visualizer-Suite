import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, FileText, Search, Clock, User, ArrowLeft, BookOpen, GraduationCap, ChevronLeft } from 'lucide-react';
import academyData from '../../data/academy.json';

const AcademyDashboard = ({ onNavigate, onSelectTutorial }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterType, setFilterType] = useState('All');

    const categories = ['All', 'Fundamentals', 'Data Structures', 'Algorithms', 'System Design'];
    const types = ['All', 'Article', 'Video'];

    const filteredContent = academyData.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
        const matchesType = filterType === 'All' || item.type === filterType;
        return matchesSearch && matchesCategory && matchesType;
    });

    const featuredTutorial = academyData.find(item => item.id === 'dynamic-programming-patterns'); // Hardcode a featured item

    return (
        <div className="flex flex-col h-screen bg-[#0b0812] text-slate-300 overflow-hidden relative selection:bg-purple-500/30">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle at 50% 0%, #7c3aed 0%, transparent 60%)'
            }} />

            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{
                backgroundImage: `linear-gradient(rgba(124, 58, 237, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 58, 237, 0.1) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
            }} />

            {/* Header */}
            <header className="relative z-10 h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 px-12 shrink-0">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <GraduationCap className="w-4 h-4 text-emerald-400" />
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-tight">The Academy</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search tutorials..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-1.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                        />
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar p-8">
                <div className="max-w-7xl mx-auto space-y-12">

                    {/* Featured Section (Hide if searching) */}
                    {!searchTerm && filterCategory === 'All' && filterType === 'All' && featuredTutorial && (
                        <section>
                            <h2 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-4">Featured Material</h2>
                            <div
                                onClick={() => onSelectTutorial(featuredTutorial)}
                                className="group cursor-pointer relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 hover:border-emerald-500/50 transition-all duration-300"
                            >
                                <div className="absolute inset-0 z-0">
                                    <img src={featuredTutorial.thumbnail} alt={featuredTutorial.title} className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0812] via-[#0b0812]/80 to-transparent" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#0b0812] via-[#0b0812]/80 to-transparent" />
                                </div>
                                <div className="relative z-10 p-10 flex flex-col h-full min-h-[300px] justify-end">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                                            {featuredTutorial.category}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-white/60 bg-white/5 px-2.5 py-1 rounded-full backdrop-blur-md">
                                            <Play className="w-3.5 h-3.5" /> Video Tutorial
                                        </span>
                                    </div>
                                    <h3 className="text-4xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors drop-shadow-lg">{featuredTutorial.title}</h3>
                                    <div className="flex items-center gap-6 text-sm text-slate-300 font-medium">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-emerald-500" />
                                            {featuredTutorial.author}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-emerald-500" />
                                            {featuredTutorial.readTime} runtime
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Filters & Grid */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-6">
                            <div className="flex gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setFilterCategory(cat)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterCategory === cat
                                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                                                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                                {types.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(type)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filterType === type
                                                ? 'bg-white/10 text-white shadow-sm'
                                                : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredContent.map(item => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                        onClick={() => onSelectTutorial(item)}
                                        className="group cursor-pointer bg-black/40 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300 shadow-xl"
                                    >
                                        <div className="h-40 relative overflow-hidden">
                                            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                                            {item.type === 'Video' && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white group-hover:bg-purple-600 group-hover:border-purple-400 transition-colors shadow-2xl">
                                                        <Play className="w-5 h-5 ml-1" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3 flex gap-2">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border shadow-sm backdrop-blur-md ${item.type === 'Video' ? 'border-sky-500/50 text-sky-300 bg-sky-900/60' : 'border-rose-500/50 text-rose-300 bg-rose-900/60'
                                                    }`}>
                                                    {item.type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <div className="text-xs font-bold text-purple-400 mb-2">{item.category}</div>
                                            <h3 className="text-lg font-bold text-white mb-4 line-clamp-2 leading-tight group-hover:text-purple-300 transition-colors">{item.title}</h3>
                                            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5" /> {item.author}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" /> {item.readTime}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {filteredContent.length === 0 && (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500">
                                    <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                                    <p>No tutorials found matching your search.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default AcademyDashboard;
