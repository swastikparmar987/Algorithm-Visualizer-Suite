import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, BookOpen, Activity, ChevronRight, ChevronLeft, Settings2, Play, RefreshCw, Terminal } from 'lucide-react'

const VisualizerSidebar = ({
    algorithmName,
    algorithms = [],
    onAlgorithmChange,
    complexity,
    codeSnippet,
    explanation,
    controls = null // Custom controls component
}) => {
    const [isOpen, setIsOpen] = useState(true)
    const [activeTab, setActiveTab] = useState('controls') // controls, code, explanation, complexity

    return (
        <motion.div
            animate={{ width: isOpen ? '350px' : '50px' }}
            initial={{ width: '350px' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="glass-panel"
            style={{
                height: '100%', borderRight: '1px solid var(--border-glass)',
                display: 'flex', flexDirection: 'column', position: 'relative',
                background: 'var(--bg-card)', overflow: 'hidden', zIndex: 50
            }}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'absolute', top: '10px', right: '-15px', zIndex: 10,
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: 'var(--primary)', color: 'white', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
            >
                {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>

            {/* Content Area */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}
                    >
                        {/* Header & Algorithm Selection */}
                        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-glass)' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>ALGORITHM</label>

                            {algorithms.length > 0 ? (
                                <select
                                    value={algorithmName}
                                    onChange={(e) => onAlgorithmChange && onAlgorithmChange(e.target.value)}
                                    style={{
                                        width: '100%', padding: '10px', borderRadius: '8px',
                                        background: 'var(--bg-elevated)', color: 'white', border: '1px solid var(--border-glass)',
                                        cursor: 'pointer', fontSize: '1rem', fontWeight: 600
                                    }}
                                >
                                    {algorithms.map(algo => (
                                        <option key={algo} value={algo}>{algo}</option>
                                    ))}
                                </select>
                            ) : (
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{algorithmName}</h3>
                            )}
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', padding: '10px', gap: '5px', borderBottom: '1px solid var(--border-glass)' }}>
                            <TabButton id="controls" label="Run" icon={Settings2} active={activeTab} onClick={setActiveTab} />
                            <TabButton id="code" label="Code" icon={Code2} active={activeTab} onClick={setActiveTab} />
                            <TabButton id="explanation" label="Learn" icon={BookOpen} active={activeTab} onClick={setActiveTab} />
                        </div>

                        {/* Body */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 15px' }}>
                            {activeTab === 'controls' && controls}

                            {activeTab === 'code' && (
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        fontSize: '0.85rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap',
                                        color: '#a5b4fc', background: '#1e1e2e', padding: '15px', borderRadius: '8px',
                                        border: '1px solid var(--border-glass)'
                                    }}>
                                        {codeSnippet || '// No code snippet available'}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'explanation' && (
                                <div>
                                    <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                                        {explanation || 'No explanation available.'}
                                    </div>
                                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Complexity</h4>
                                        <ComplexityCard title="Time" value={complexity?.time || 'N/A'} color="#10b981" />
                                        <ComplexityCard title="Space" value={complexity?.space || 'N/A'} color="#f59e0b" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
        onClick={() => onClick(id)}
        style={{
            flex: 1, padding: '8px', borderRadius: '6px', border: 'none',
            background: active === id ? 'var(--primary)' : 'transparent',
            color: active === id ? 'white' : 'var(--text-muted)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s'
        }}
    >
        <Icon size={14} /> {label}
    </button>
)

const ComplexityCard = ({ title, value, color }) => (
    <div style={{
        padding: '12px', borderRadius: '8px', background: 'var(--bg-elevated)',
        borderLeft: `3px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{title}</div>
        <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'monospace' }}>{value}</div>
    </div>
)

export default VisualizerSidebar
