import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Activity, BarChart2 } from 'lucide-react'
import StitchVisualizerLayout from './common/StitchVisualizerLayout'
import { playTone, playSuccess, playClick, playStep } from '../utils/SoundEngine'
import { useAppStore } from '../store/useAppStore'

function FFTVisualizer({ onBack }) {
    const theme = useAppStore(s => s.theme)
    const soundEnabled = useAppStore(s => s.soundEnabled)

    const [numSamples] = useState(64)
    const [freq1, setFreq1] = useState(3)
    const [freq2, setFreq2] = useState(8)
    const [amp1, setAmp1] = useState(1)
    const [amp2, setAmp2] = useState(0.5)

    // Animation States
    const [fftData, setFftData] = useState([])
    const [activeFreqIdx, setActiveFreqIdx] = useState(-1)

    // Control States
    const [speed, setSpeed] = useState(100)
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [logs, setLogs] = useState("Ready. Adjust frequencies and click Run Transform.")

    const speedRef = useRef(speed)
    const isPausedRef = useRef(isPaused)
    const isRunningRef = useRef(isRunning)
    const stepsRef = useRef(0)

    useEffect(() => { speedRef.current = speed }, [speed])
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])
    useEffect(() => { isRunningRef.current = isRunning }, [isRunning])

    const say = (msg) => setLogs(msg)

    const checkState = async () => {
        while (isPausedRef.current) {
            await new Promise(r => setTimeout(r, 100))
        }
        return !isRunningRef.current
    }

    const resetVis = () => {
        setIsRunning(false)
        setIsPaused(false)
        isRunningRef.current = false
        isPausedRef.current = false
        setFftData([])
        setActiveFreqIdx(-1)
        stepsRef.current = 0
        say("Transform reset. Ready.")
    }

    const generateSignal = useCallback(() => {
        const signal = []
        for (let i = 0; i < numSamples; i++) {
            const t = i / numSamples
            signal.push(amp1 * Math.sin(2 * Math.PI * freq1 * t) + amp2 * Math.sin(2 * Math.PI * freq2 * t))
        }
        return signal
    }, [numSamples, freq1, freq2, amp1, amp2])

    const signal = generateSignal()
    const maxSig = Math.max(...signal.map(Math.abs), 1)

    // --- ALGORITHMS ---

    // Simple DFT (not FFT, but visually equivalent for small N to show step-by-step extraction)
    const computeFFT = async () => {
        say(`Computing DFT iteratively for N=${numSamples} samples...`)

        const N = signal.length

        let buildingFFT = []

        for (let k = 0; k < N / 2; k++) {
            if (await checkState()) return

            setActiveFreqIdx(k)
            say(`Analyzing target frequency bin ${k}...`)

            let re = 0, im = 0
            for (let n = 0; n < N; n++) {
                const angle = (2 * Math.PI * k * n) / N
                re += signal[n] * Math.cos(angle)
                im -= signal[n] * Math.sin(angle)
                stepsRef.current++
            }
            const magnitude = Math.sqrt(re * re + im * im) / N

            buildingFFT.push(magnitude)
            setFftData([...buildingFFT])

            if (soundEnabled) {
                // Play a tone corresponding to the frequency bin we are extracting
                // Only play loud if the magnitude is substantial
                const volume = magnitude > 0.05 ? 100 : 10
                playTone(100 + k * 15, volume, magnitude > 0.05 ? 'sine' : 'square')
            }

            await new Promise(r => setTimeout(r, Math.max(20, (600 - speedRef.current) / 2)))
        }

        if (await checkState()) return

        setActiveFreqIdx(-1)
        say(`Transformation complete. Found peaks at primarily ${freq1}Hz and ${freq2}Hz.`)
        if (soundEnabled) playSuccess()
    }

    const processStart = async () => {
        setIsRunning(true)
        setIsPaused(false)
        setFftData([])
        setActiveFreqIdx(-1)
        stepsRef.current = 0
        if (soundEnabled) playClick()

        await new Promise(r => setTimeout(r, 50))
        await computeFFT()

        setIsRunning(false)
        isRunningRef.current = false
    }

    // --- RENDERING ---

    const Controls = (
        <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Signal Generator</h3>

            <div className="space-y-4">
                <div className="bg-bg-elevated/50 p-4 rounded-xl border border-border-glass">
                    <label className="text-[10px] font-black tracking-widest text-accent-cyan uppercase block mb-3 flex items-center justify-between">
                        <span>Wave 1</span>
                        <span className="font-mono bg-bg-elevated px-2 py-1 rounded">{freq1}Hz / {amp1} A</span>
                    </label>
                    <div className="space-y-2">
                        <div className="flex gap-2 items-center">
                            <span className="text-xs text-text-muted">Freq</span>
                            <input type="range" min="1" max="30" value={freq1} onChange={e => !isRunning && setFreq1(Number(e.target.value))} className="w-full accent-accent-cyan" disabled={isRunning} />
                        </div>
                        <div className="flex gap-2 items-center">
                            <span className="text-xs text-text-muted">Amp</span>
                            <input type="range" min="0" max="2" step="0.1" value={amp1} onChange={e => !isRunning && setAmp1(Number(e.target.value))} className="w-full accent-accent-cyan" disabled={isRunning} />
                        </div>
                    </div>
                </div>

                <div className="bg-bg-elevated/50 p-4 rounded-xl border border-border-glass">
                    <label className="text-[10px] font-black tracking-widest text-accent-pink uppercase block mb-3 flex items-center justify-between">
                        <span>Wave 2</span>
                        <span className="font-mono bg-bg-elevated px-2 py-1 rounded">{freq2}Hz / {amp2} A</span>
                    </label>
                    <div className="space-y-2">
                        <div className="flex gap-2 items-center">
                            <span className="text-xs text-text-muted">Freq</span>
                            <input type="range" min="1" max="30" value={freq2} onChange={e => !isRunning && setFreq2(Number(e.target.value))} className="w-full accent-accent-pink" disabled={isRunning} />
                        </div>
                        <div className="flex gap-2 items-center">
                            <span className="text-xs text-text-muted">Amp</span>
                            <input type="range" min="0" max="2" step="0.1" value={amp2} onChange={e => !isRunning && setAmp2(Number(e.target.value))} className="w-full accent-accent-pink" disabled={isRunning} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-px w-full bg-border-glass my-4"></div>

            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Execution</h3>
            <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-text-muted uppercase">
                    <span>Speed</span>
                    <span className="font-mono bg-bg-elevated px-2 py-1 rounded text-primary">{speed}ms</span>
                </div>
                <input
                    type="range" min="20" max="600" step="20"
                    value={620 - speed}
                    onChange={(e) => setSpeed(620 - parseInt(e.target.value))}
                    className="w-full accent-primary"
                />
            </div>

            <div className="flex gap-2 mt-4">
                {isRunning ? (
                    <button onClick={() => setIsPaused(!isPaused)} className="flex-1 bg-accent-orange text-black font-black py-3 rounded-lg flex items-center justify-center gap-2 uppercase shadow-[0_0_15px_rgba(251,146,60,0.3)]">
                        <Pause size={16} fill="currentColor" /> {isPaused ? "Resume" : "Pause"}
                    </button>
                ) : (
                    <button onClick={processStart} className="flex-1 bg-primary text-black font-black py-3 rounded-lg flex items-center justify-center gap-2 uppercase shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:bg-white transition-colors">
                        <Play size={16} fill="currentColor" /> Run Transform
                    </button>
                )}
                <button onClick={resetVis} className="p-3 rounded-lg bg-bg-elevated border border-border-glass hover:bg-white/10 transition-colors text-white">
                    <RotateCcw size={16} />
                </button>
            </div>
        </div>
    )

    const maxFFTMag = Math.max(...fftData, 0.01)

    const Metrics = (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                <p className="flex items-center gap-2 text-[10px] font-black tracking-widest text-text-muted uppercase relative z-10">
                    <Activity size={12} className="text-accent-pink" /> Peak Amp
                </p>
                <p className="text-3xl font-mono text-accent-pink font-black mt-1 relative z-10">
                    {maxFFTMag.toFixed(2)}
                </p>
            </div>
            <div className="bg-bg-elevated rounded-xl p-4 border border-border-glass">
                <p className="text-[10px] font-black tracking-widest text-text-muted uppercase">Ops</p>
                <p className="text-xl font-mono text-white mt-1 uppercase tracking-tighter">{stepsRef.current}</p>
            </div>
        </div>
    )

    return (
        <StitchVisualizerLayout
            title="Fast Fourier Transform"
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={logs}
        >
            <div className="relative w-full h-full flex flex-col p-8 bg-[#0A0A0F] gap-6">

                {/* Time Domain (Input Signal) */}
                <div className="flex-1 bg-bg-elevated border border-border-glass rounded-2xl p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-4 relative z-10">
                        <Activity className="text-primary" size={20} />
                        <h4 className="text-sm font-black tracking-widest text-white uppercase">Time Domain</h4>
                    </div>

                    <div className="flex-1 w-full h-full relative">
                        <svg width="100%" height="100%" viewBox={`0 0 ${numSamples * 8} 200`} preserveAspectRatio="none" className="overflow-visible">
                            {/* Grid Lines */}
                            <line x1="0" y1="100" x2={numSamples * 8} y2="100" stroke="var(--border-glass)" strokeDasharray="4 4" strokeWidth="2" />

                            {/* The Signal */}
                            <motion.polyline
                                points={signal.map((v, i) => `${i * 8},${100 - (v / maxSig) * 80}`).join(' ')}
                                fill="none"
                                stroke="#a855f7"
                                strokeWidth="3"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                initial={{ opacity: 0, pathLength: 0 }}
                                animate={{ opacity: 1, pathLength: 1 }}
                                transition={{ duration: 1 }}
                                style={{ filter: 'drop-shadow(0 0 8px rgba(168,85,247,0.5))' }}
                            />
                        </svg>
                    </div>
                </div>

                {/* Frequency Domain (FFT Magnitude) */}
                <div className="flex-1 bg-bg-elevated border border-border-glass rounded-2xl p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-4 relative z-10">
                        <BarChart2 className="text-accent-cyan" size={20} />
                        <h4 className="text-sm font-black tracking-widest text-white uppercase">Frequency Domain</h4>
                    </div>

                    <div className="flex-1 w-full h-full relative flex items-end">
                        <svg width="100%" height="100%" viewBox={`0 0 ${numSamples * 4} 200`} preserveAspectRatio="none" className="overflow-visible">
                            <line x1="0" y1="180" x2={numSamples * 4} y2="180" stroke="var(--border-glass)" strokeWidth="2" />

                            {Array.from({ length: numSamples / 2 }).map((_, i) => {
                                const val = fftData[i] || 0
                                const h = (val / Math.max(0.5, maxFFTMag)) * 160
                                const isActive = i === activeFreqIdx
                                const isPeak = val > 0.1 && (i === freq1 || i === freq2)

                                let barColor = 'var(--text-muted)'
                                if (isActive) barColor = '#fff'
                                else if (isPeak) barColor = '#22d3ee' // accent-cyan

                                return (
                                    <g key={i}>
                                        <motion.rect
                                            x={i * (numSamples * 4 / (numSamples / 2))}
                                            y={180 - h}
                                            width={Math.max(2, (numSamples * 4 / (numSamples / 2)) - 4)}
                                            height={h}
                                            fill={barColor}
                                            rx="2"
                                            animate={{
                                                y: 180 - h,
                                                height: h,
                                                fill: barColor
                                            }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                            style={{
                                                filter: isPeak ? 'drop-shadow(0 0 10px rgba(34, 211, 238, 0.6))'
                                                    : isActive ? 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.8))'
                                                        : 'none'
                                            }}
                                        />
                                        {/* X-axis labels for peaks */}
                                        {isPeak && h > 10 && (
                                            <text
                                                x={i * (numSamples * 4 / (numSamples / 2)) + ((numSamples * 4 / (numSamples / 2)) / 2)}
                                                y="195"
                                                fill="var(--accent-cyan)"
                                                fontSize="12"
                                                fontWeight="bold"
                                                textAnchor="middle"
                                                fontFamily="monospace"
                                            >
                                                {i}Hz
                                            </text>
                                        )}
                                    </g>
                                )
                            })}
                        </svg>
                    </div>
                </div>

            </div>
        </StitchVisualizerLayout>
    )
}

export default FFTVisualizer
