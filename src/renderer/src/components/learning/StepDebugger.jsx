import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, ChevronRight, RotateCcw, BugPlay, TerminalSquare, Variable } from 'lucide-react'
import StitchVisualizerLayout from '../common/StitchVisualizerLayout'
import { useAppStore } from '../../store/useAppStore'
import { playClick, playStep } from '../../utils/SoundEngine'

const ALGORITHMS = {
    'Binary Search': {
        code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid; // Found
    }
    
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1; // Not found
}`,
        steps: [
            { lines: [2, 3], vars: { left: 0, right: 9, mid: undefined } },
            { lines: [5], vars: { left: 0, right: 9, mid: undefined } },
            { lines: [6], vars: { left: 0, right: 9, mid: 4 } },
            { lines: [8], vars: { left: 0, right: 9, mid: 4, 'arr[mid]': 5 } },
            { lines: [12], vars: { left: 0, right: 9, mid: 4, 'arr[mid]': 5 } },
            { lines: [13], vars: { left: 5, right: 9, mid: 4 } },
            { lines: [5], vars: { left: 5, right: 9, mid: 4 } },
            { lines: [6], vars: { left: 5, right: 9, mid: 7 } },
            { lines: [8], vars: { left: 5, right: 9, mid: 7, 'arr[mid]': 8 } },
            { lines: [9], vars: { left: 5, right: 9, mid: 7 } }, // Found target 8
        ]
    },
    'Bubble Sort (Pass 1)': {
        code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
}`,
        steps: [
            { lines: [2], vars: { n: 5, i: undefined, j: undefined } },
            { lines: [3], vars: { n: 5, i: 0, j: undefined } },
            { lines: [4], vars: { n: 5, i: 0, j: 0 } },
            { lines: [5], vars: { n: 5, i: 0, j: 0, 'arr[j]': 5, 'arr[j+1]': 3 } },
            { lines: [7, 8, 9], vars: { n: 5, i: 0, j: 0, swap: true } },
            { lines: [4], vars: { n: 5, i: 0, j: 1 } },
            { lines: [5], vars: { n: 5, i: 0, j: 1, 'arr[j]': 5, 'arr[j+1]': 8 } },
            { lines: [4], vars: { n: 5, i: 0, j: 2 } },
        ]
    }
}

function StepDebugger({ onBack }) {
    const [algoName, setAlgoName] = useState('Binary Search')
    const [currentStep, setCurrentStep] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [playbackSpeed, setPlaybackSpeed] = useState(1000)
    const soundEnabled = useAppStore(s => s.soundEnabled)

    const algo = ALGORITHMS[algoName]
    const stepData = algo.steps[currentStep] || algo.steps[0]
    const lines = algo.code.split('\n')

    useEffect(() => {
        let interval
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentStep(curr => {
                    if (curr >= algo.steps.length - 1) {
                        setIsPlaying(false)
                        return curr
                    }
                    if (soundEnabled) playStep()
                    return curr + 1
                })
            }, playbackSpeed)
        }
        return () => clearInterval(interval)
    }, [isPlaying, algo.steps.length, playbackSpeed, soundEnabled])

    const handleStep = () => {
        if (currentStep < algo.steps.length - 1) {
            setCurrentStep(c => c + 1)
            if (soundEnabled) playClick()
        }
    }

    const handleReset = () => {
        setCurrentStep(0)
        setIsPlaying(false)
        if (soundEnabled) playClick()
    }

    const Logs = "Debug algorithms step-by-step. Watch variables update in real-time as execution progresses through the code structure."

    const Controls = (
        <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Execution Target</h3>

            <div className="space-y-2">
                <select
                    value={algoName}
                    onChange={e => {
                        setAlgoName(e.target.value)
                        setCurrentStep(0)
                        setIsPlaying(false)
                        if (soundEnabled) playClick()
                    }}
                    className="w-full bg-bg-dark border border-border-glass rounded-xl p-3 text-sm text-white font-bold appearance-none cursor-pointer outline-none focus:border-primary transition-colors duration-300"
                >
                    {Object.keys(ALGORITHMS).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase tracking-widest px-1 mt-1">
                    <span>Target Context</span>
                    <span>Ready</span>
                </div>
            </div>

            <div className="h-px w-full bg-border-glass"></div>
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Transport</h3>

            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => {
                        setIsPlaying(!isPlaying)
                        if (soundEnabled) playClick()
                    }}
                    className={`col-span-2 py-3 font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:shadow-none active:translate-y-1
                    ${isPlaying ? 'bg-accent-orange text-bg-dark shadow-[0_4px_0_0_#c2410c]' : 'bg-primary text-bg-dark shadow-[0_4px_0_0_#4f46e5]'}
                    `}
                >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying ? 'Pause Execution' : 'Run Auto-step'}
                </button>
                <button
                    onClick={handleStep}
                    disabled={isPlaying || currentStep >= algo.steps.length - 1}
                    className="py-3 bg-bg-elevated hover:bg-white/10 text-white font-black rounded-xl border border-border-glass text-[10px] uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Step <ChevronRight size={14} />
                </button>
                <button
                    onClick={handleReset}
                    className="py-3 bg-bg-elevated hover:bg-white/10 text-white font-black rounded-xl border border-border-glass text-[10px] uppercase flex items-center justify-center gap-2 transition-all"
                >
                    <RotateCcw size={14} /> Reset
                </button>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-text-muted uppercase">
                    <span>Auto-step Speed</span>
                    <span className="font-mono bg-bg-elevated px-2 py-1 rounded text-primary border border-border-glass">
                        {playbackSpeed}ms
                    </span>
                </div>
                <input
                    type="range" min="100" max="2500" step="100"
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="w-full accent-primary"
                />
            </div>
        </div>
    )

    const Metrics = (
        <div className="flex flex-col h-full gap-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <Variable size={14} className="text-accent-cyan" /> Current State Vector
            </h3>

            <div className="flex-1 bg-bg-elevated border border-border-glass rounded-xl p-4 overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                    {Object.entries(stepData.vars).map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center bg-bg-dark/50 p-2 rounded-lg border border-border-glass/50 group hover:border-accent-cyan/50 transition-colors">
                            <span className="font-mono text-accent-cyan text-sm font-bold tracking-tight">{k}</span>
                            <span className="font-mono font-black text-white px-2 py-0.5 bg-black/40 rounded shadow-inner text-sm">
                                {String(v)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-auto">
                <div className="bg-bg-dark/50 border border-border-glass rounded-lg p-3 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5"></div>
                    <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold relative z-10">Total Steps</span>
                    <span className="text-xl font-black font-mono text-white relative z-10">{algo.steps.length}</span>
                </div>
                <div className="bg-bg-dark/50 border border-border-glass rounded-lg p-3 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-accent-pink/5"></div>
                    <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold relative z-10">Current PC</span>
                    <span className="text-xl font-black font-mono text-white relative z-10">{currentStep + 1}</span>
                </div>
            </div>
        </div>
    )

    return (
        <StitchVisualizerLayout
            title="Step Debugger"
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={Logs}
        >
            <div className="w-full h-full flex flex-col p-8 bg-[#0A0A0F] gap-6 overflow-hidden">
                <div className="flex-1 bg-bg-elevated border border-border-glass rounded-2xl p-6 flex flex-col relative overflow-hidden">

                    <div className="flex items-center justify-between mb-4 relative z-10 border-b border-border-glass pb-4">
                        <div className="flex items-center gap-2">
                            <TerminalSquare className="text-accent-cyan" size={24} />
                            <h4 className="text-lg font-black tracking-widest text-white uppercase">Virtual Execution Engine</h4>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1 items-center">
                                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-success animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-text-muted'}`}></span>
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{isPlaying ? 'Running' : 'Halted'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex-1 relative overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed bg-[#050508] p-4 rounded-xl border border-border-glass">
                        {lines.map((line, i) => {
                            const lineNum = i + 1
                            const isExecuted = stepData.lines.includes(lineNum)
                            return (
                                <div key={i} className={`flex rounded transition-colors duration-200 relative
                                    ${isExecuted ? 'bg-accent-cyan/15' : 'hover:bg-white/5'}
                                `}>
                                    {isExecuted && (
                                        <motion.div
                                            layoutId="executionHighlight"
                                            className="absolute left-0 top-0 bottom-0 w-1 bg-accent-cyan rounded-l"
                                            initial={false}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                    <span className="w-12 text-right pr-4 py-1 text-text-muted select-none opacity-50 border-r border-border-glass/30 mr-4">
                                        {lineNum}
                                    </span>
                                    <span className={`py-1 whitespace-pre max-w-full overflow-x-auto ${isExecuted ? 'text-white font-bold' : 'text-text-secondary'}`}>
                                        {line}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </StitchVisualizerLayout>
    )
}

export default StepDebugger
