import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calculator, TrendingUp, LineChart, Info } from 'lucide-react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import StitchVisualizerLayout from '../common/StitchVisualizerLayout'
import { useAppStore } from '../../store/useAppStore'
import { playClick, playStep } from '../../utils/SoundEngine'

const COMPLEXITIES = [
    { name: 'O(1)', label: 'Constant', color: '#10b981', examples: ['Array access', 'Hash lookup', 'Stack push/pop'] },
    { name: 'O(log n)', label: 'Logarithmic', color: '#06b6d4', examples: ['Binary Search', 'BST lookup', 'Balanced tree ops'] },
    { name: 'O(n)', label: 'Linear', color: '#6366f1', examples: ['Linear Search', 'Array traversal', 'Counting Sort'] },
    { name: 'O(n log n)', label: 'Linearithmic', color: '#f59e0b', examples: ['Merge Sort', 'Quick Sort (avg)', 'Heap Sort'] },
    { name: 'O(n²)', label: 'Quadratic', color: '#ef4444', examples: ['Bubble Sort', 'Insertion Sort', 'Selection Sort'] },
    { name: 'O(2ⁿ)', label: 'Exponential', color: '#dc2626', examples: ['Fibonacci (naive)', 'Power set', 'Backtracking'] },
    { name: 'O(n!)', label: 'Factorial', color: '#991b1b', examples: ['Permutations', 'TSP brute force', 'N-Queens brute force'] }
]

function ComplexityAnalyzer({ onBack }) {
    const [inputN, setInputN] = useState(1000)
    const [selectedComplexity, setSelectedComplexity] = useState(null)
    const soundEnabled = useAppStore(s => s.soundEnabled)

    const computeOps = (n) => {
        return {
            'O(1)': 1,
            'O(log n)': Math.ceil(Math.log2(Math.max(2, n))),
            'O(n)': n,
            'O(n log n)': Math.ceil(n * Math.log2(Math.max(2, n))),
            'O(n²)': n * n,
            'O(2ⁿ)': n <= 30 ? Math.pow(2, n) : Infinity,
            'O(n!)': n <= 12 ? COMPLEXITIES.reduce((acc, _, i) => i <= n ? acc * (i || 1) : acc, 1) : Infinity
        }
    }

    const ops = computeOps(inputN)

    // Generate data specifically for the visual chart to show relative growth clearly
    const chartData = useMemo(() => {
        const data = []
        for (let i = 1; i <= 50; i++) {
            const n = i * 2; // 2 to 100
            data.push({
                n: n,
                'O(1)': 5,
                'O(log n)': Math.log2(n) * 4,
                'O(n)': n * 0.6,
                'O(n log n)': n * Math.log2(n) * 0.12,
                'O(n²)': (n * n) * 0.01
            })
        }
        return data
    }, [])

    const handleSelect = (name) => {
        if (soundEnabled) playClick()
        setSelectedComplexity(name === selectedComplexity ? null : name)
    }

    const Controls = (
        <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Input Configuration</h3>

            <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-text-muted uppercase">
                    <span>Target Input Size (n)</span>
                    <span className="font-mono bg-bg-elevated px-2 py-1 rounded text-primary border border-border-glass">
                        {inputN.toLocaleString()}
                    </span>
                </div>
                <input
                    type="range" min="10" max="10000" step="10"
                    value={inputN}
                    onChange={(e) => {
                        setInputN(Number(e.target.value))
                        if (soundEnabled && e.target.value % 500 === 0) playStep()
                    }}
                    className="w-full accent-primary"
                />
            </div>

            <div className="h-px w-full bg-border-glass"></div>
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Class Catalog</h3>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {COMPLEXITIES.map(c => (
                    <div
                        key={c.name}
                        onClick={() => handleSelect(c.name)}
                        className={`p-3 rounded-xl border border-border-glass cursor-pointer transition-all
                        ${selectedComplexity === c.name ? 'bg-bg-elevated/50 border-l-4' : 'bg-bg-elevated hover:bg-white/5'}
                        `}
                        style={{ borderLeftColor: c.color }}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <span className="font-black text-sm" style={{ color: c.color }}>{c.name}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-2">{c.label}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {c.examples.map((ex, i) => (
                                <span key={i} className="px-2 py-1 bg-black/20 rounded-md text-[9px] font-bold text-text-secondary border border-border-glass uppercase">
                                    {ex}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

    const Metrics = (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass col-span-2">
                <p className="flex items-center gap-2 text-[10px] font-black tracking-widest text-text-muted uppercase">
                    <Info size={12} /> Live Operations Count
                </p>
                {selectedComplexity ? (
                    <p className="text-3xl font-black mt-1 font-mono tracking-tighter" style={{ color: COMPLEXITIES.find(c => c.name === selectedComplexity)?.color }}>
                        {ops[selectedComplexity] === Infinity ? '∞' : ops[selectedComplexity].toLocaleString()} <span className="text-sm font-normal text-text-muted tracking-normal">ops</span>
                    </p>
                ) : (
                    <p className="text-sm font-bold text-text-secondary mt-2">Select a class from the catalog to view estimated operations.</p>
                )}
            </div>
            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass text-center">
                <p className="text-[10px] font-black tracking-widest text-text-muted uppercase mb-1">Time Profile</p>
                <p className="text-sm font-black text-white font-mono break-words">
                    {selectedComplexity ? selectedComplexity : 'N/A'}
                </p>
            </div>
            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass text-center">
                <p className="text-[10px] items-center justify-center font-black tracking-widest text-text-muted uppercase mb-1">Scalability</p>
                <p className={`text-sm font-black font-mono break-words ${selectedComplexity && COMPLEXITIES.findIndex(c => c.name === selectedComplexity) > 3 ? 'text-danger' : 'text-success'}`}>
                    {selectedComplexity ? (COMPLEXITIES.findIndex(c => c.name === selectedComplexity) > 3 ? 'POOR' : 'EXCELLENT') : 'N/A'}
                </p>
            </div>
        </div>
    )

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const realOps = computeOps(label);
            return (
                <div className="bg-bg-elevated border border-border-glass rounded-xl p-3 shadow-2xl min-w-[150px]">
                    <p className="text-xs font-black tracking-widest text-text-muted uppercase mb-2">Input N = {label}</p>
                    {payload.map((entry, index) => {
                        const val = realOps[entry.dataKey];
                        const displayVal = val === Infinity ? '∞' : val > 1000000 ? val.toExponential(2) : Math.round(val).toLocaleString();
                        return (
                            <div key={`item-${index}`} className="flex justify-between items-center text-xs mb-1">
                                <span style={{ color: entry.color }} className="font-bold flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                    {entry.dataKey}:
                                </span>
                                <span className="font-mono text-white opacity-80">{displayVal}</span>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    return (
        <StitchVisualizerLayout
            title="Complexity Analyzer"
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={"Select a complexity class to highlight its growth curve and see operational counts. Adjust N to see how it scales."}
        >
            <div className="relative w-full h-full flex flex-col p-8 bg-[#0A0A0F] gap-6 overflow-hidden">
                <div className="flex-1 bg-bg-elevated border border-border-glass rounded-2xl p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-4 relative z-10">
                        <TrendingUp className="text-primary" size={24} />
                        <h4 className="text-lg font-black tracking-widest text-white uppercase">Growth Rate Comparison</h4>
                    </div>

                    <div className="w-full relative mt-4 overflow-visible h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                                <XAxis
                                    dataKey="n"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={false}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={false}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                />
                                <Legend
                                    verticalAlign="top"
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', fill: 'var(--text-secondary)' }}
                                />

                                {COMPLEXITIES.slice(0, 5).map(c => {
                                    const isActive = selectedComplexity === c.name || !selectedComplexity
                                    return (
                                        <Line
                                            key={c.name}
                                            type="monotone"
                                            dataKey={c.name}
                                            stroke={c.color}
                                            strokeWidth={selectedComplexity === c.name ? 6 : 3}
                                            dot={false}
                                            activeDot={{ r: 6, fill: c.color, stroke: 'var(--bg-dark)', strokeWidth: 2 }}
                                            opacity={isActive ? 1 : 0.2}
                                            isAnimationActive={false}
                                        />
                                    )
                                })}
                            </RechartsLineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </StitchVisualizerLayout>
    )
}

export default ComplexityAnalyzer
