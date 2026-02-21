import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Code, ChevronRight, Filter, Search, Award } from 'lucide-react';
import problems from '../../data/problems.json';

const PracticeMode = ({ onSelectProblem }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    const categories = ['All', ...new Set(problems.map(p => p.category))];

    const filteredProblems = problems.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const getDifficultyColor = (diff) => {
        switch (diff.toLowerCase()) {
            case 'easy': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
            case 'medium': return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
            case 'hard': return 'text-rose-400 border-rose-400/30 bg-rose-400/10';
            default: return 'text-slate-400 border-slate-400/30 bg-slate-400/10';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-8 min-h-screen">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        <Award className="w-10 h-10 text-purple-500" />
                        PRACTICE <span className="text-purple-500">ENGINE</span>
                    </h1>
                    <p className="text-slate-400 mt-2">Level up your data structures and algorithms skills.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search problems..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <Filter className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${filterCategory === cat
                                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Problem List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProblems.map((problem, idx) => (
                    <motion.div
                        key={problem.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -5 }}
                        onClick={() => onSelectProblem(problem)}
                        className="group bg-slate-900/40 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-6 cursor-pointer transition-all hover:bg-slate-800/40 hover:shadow-2xl hover:shadow-purple-900/10 flex flex-col justify-between min-h-[220px]"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md border ${getDifficultyColor(problem.difficulty)}`}>
                                    {problem.difficulty}
                                </span>
                                <span className="text-slate-600 font-mono text-[10px]"># {problem.id}</span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                                {problem.title}
                            </h3>

                            <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                                {problem.description.replace(/[`*]/g, '')}
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                            <div className="flex items-center gap-2 text-slate-500">
                                <Code className="w-4 h-4" />
                                <span className="text-xs">{problem.category}</span>
                            </div>

                            <div className="flex items-center gap-1 text-purple-500 font-medium text-sm">
                                Solve Now
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredProblems.length === 0 && (
                <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
                    <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-500">No problems found matching your criteria.</h3>
                    <p className="text-slate-600">Try adjusting your filters or search term.</p>
                </div>
            )}
        </div>
    );
};

export default PracticeMode;
