import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Clock, User, PlayCircle, FileText } from 'lucide-react';

const TutorialViewer = ({ tutorial, onBack }) => {
    if (!tutorial) return null;

    const isVideo = tutorial.type === 'Video';

    return (
        <div className="flex flex-col h-screen bg-[#0b0812] text-slate-300 overflow-hidden">
            {/* Minimalist Reader Navbar */}
            <div className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-20">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 p-2 -ml-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="font-medium text-sm">Back to Academy</span>
                </button>
                <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border shadow-sm backdrop-blur-md ${isVideo ? 'border-sky-500/50 text-sky-300 bg-sky-900/60' : 'border-rose-500/50 text-rose-300 bg-rose-900/60'
                        }`}>
                        {tutorial.type}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {tutorial.category}
                    </span>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto custom-scrollbar relative">

                {/* Unified Header */}
                <header className="relative py-20 px-8 flex justify-center border-b border-white/5">
                    {/* Background Blur derived from title */}
                    <div className="absolute inset-0 z-0 opacity-20" style={{
                        backgroundImage: `url(${tutorial.thumbnail})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(100px) brightness(0.5)'
                    }} />

                    <div className="relative z-10 max-w-4xl w-full text-center space-y-6">
                        <div className="flex justify-center mb-6">
                            {isVideo ? <PlayCircle className="w-16 h-16 text-sky-400 opacity-80" /> : <FileText className="w-16 h-16 text-rose-400 opacity-80" />}
                        </div>
                        <h1 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-xl">{tutorial.title}</h1>
                        <div className="flex items-center justify-center gap-8 text-sm text-slate-400 font-medium">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-emerald-500" />
                                {tutorial.author}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-500" />
                                {tutorial.readTime} {isVideo ? 'runtime' : 'read'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="max-w-4xl mx-auto px-8 py-16">
                    {isVideo ? (
                        // Video Player Setup
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-sky-900/20 bg-black"
                        >
                            <iframe
                                src={tutorial.videoUrl}
                                title={tutorial.title}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            ></iframe>
                        </motion.div>
                    ) : (
                        // Article Reader Setup (Markdown simulation using prose)
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="prose prose-invert prose-purple max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-emerald-400 hover:prose-a:text-emerald-300 prose-code:text-purple-300 prose-code:bg-purple-900/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none"
                        >
                            {tutorial.content?.split('\n').map((line, i) => {
                                if (line.startsWith('# ')) return <h1 key={i}>{line.replace('# ', '')}</h1>
                                if (line.startsWith('## ')) return <h2 key={i} className="mt-12">{line.replace('## ', '')}</h2>
                                if (line.startsWith('### ')) return <h3 key={i} className="mt-8">{line.replace('### ', '')}</h3>
                                if (line.startsWith('*   ')) return <li key={i} className="ml-4">{line.replace('*   ', '')}</li>
                                if (line.trim() === '') return <br key={i} />

                                // Basic bold parsing
                                let parsedLine = line;
                                const boldMatches = parsedLine.match(/\\*\\*(.*?)\\*\\*/g);
                                if (boldMatches) {
                                    // Simplified rendering for mock data
                                    return <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>') }} />
                                }

                                return <p key={i} className="text-slate-300 leading-relaxed text-lg">{line}</p>
                            })}
                        </motion.div>
                    )}
                </div>

                {/* Minimal Footer */}
                <footer className="py-12 text-center text-slate-600 text-sm border-t border-white/5 mt-20">
                    <p>Algorithm Visualizer Academy &middot; Master the Machine</p>
                </footer>
            </main>
        </div>
    );
};

export default TutorialViewer;
