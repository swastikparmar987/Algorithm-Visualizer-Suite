import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import VisualizerLayout from './common/VisualizerLayout'
import ControlPanel from './common/ControlPanel'
import AlgorithmInfo from './AlgorithmInfo'
import { useVisualizerState } from '../hooks/useVisualizerState'

function CompressionVisualizer({ onBack }) {
    const { isRunning, setIsRunning, speed, setSpeed, stopRef, delay } = useVisualizerState(400)
    const [inputText, setInputText] = useState('abracadabra')
    const [freqTable, setFreqTable] = useState([])
    const [treeNodes, setTreeNodes] = useState([])
    const [treeEdges, setTreeEdges] = useState([])
    const [encodingMap, setEncodingMap] = useState({})
    const [encodedBits, setEncodedBits] = useState('')
    const [info, setInfo] = useState('')
    const [phase, setPhase] = useState('')
    const [activeNodeId, setActiveNodeId] = useState(null)

    const runHuffman = useCallback(async () => {
        const text = inputText
        if (!text) return

        // Phase 1: Build frequency table
        setPhase('frequency')
        setInfo('Building frequency table...')
        const freq = {}
        for (const ch of text) freq[ch] = (freq[ch] || 0) + 1
        const freqArr = Object.entries(freq).map(([char, count]) => ({ char, count })).sort((a, b) => a.count - b.count)
        setFreqTable(freqArr)
        await delay()

        // Phase 2: Build Huffman tree
        setPhase('tree')
        setInfo('Building Huffman tree...')
        let nodeId = 0
        let queue = freqArr.map(({ char, count }) => ({
            id: ++nodeId,
            char,
            freq: count,
            left: null,
            right: null,
            x: 0,
            y: 0
        }))

        const allNodes = [...queue]
        const allEdges = []

        while (queue.length > 1) {
            if (stopRef.current) return
            queue.sort((a, b) => a.freq - b.freq)
            const left = queue.shift()
            const right = queue.shift()
            const parent = {
                id: ++nodeId,
                char: null,
                freq: left.freq + right.freq,
                left: left.id,
                right: right.id,
                x: 0,
                y: 0
            }
            allNodes.push(parent)
            allEdges.push({ from: parent.id, to: left.id, label: '0' })
            allEdges.push({ from: parent.id, to: right.id, label: '1' })
            queue.push(parent)

            setInfo(`Merging: freq(${left.freq}) + freq(${right.freq}) = freq(${parent.freq})`)
            setActiveNodeId(parent.id)
            await delay()
        }

        // Layout tree
        const root = queue[0]
        const layoutNode = (id, x, y, spread) => {
            const node = allNodes.find(n => n.id === id)
            if (!node) return
            node.x = x; node.y = y
            if (node.left) layoutNode(node.left, x - spread, y + 60, spread * 0.55)
            if (node.right) layoutNode(node.right, x + spread, y + 60, spread * 0.55)
        }
        layoutNode(root.id, 400, 30, 160)
        setTreeNodes([...allNodes])
        setTreeEdges([...allEdges])
        await delay()

        // Phase 3: Generate encoding
        setPhase('encoding')
        setInfo('Generating character encodings...')
        const codes = {}
        const buildCodes = (id, code) => {
            const node = allNodes.find(n => n.id === id)
            if (!node) return
            if (node.char) { codes[node.char] = code; return }
            if (node.left) buildCodes(node.left, code + '0')
            if (node.right) buildCodes(node.right, code + '1')
        }
        buildCodes(root.id, '')
        setEncodingMap(codes)
        await delay()

        // Phase 4: Encode text
        const encoded = text.split('').map(ch => codes[ch]).join('')
        setEncodedBits(encoded)
        const origBits = text.length * 8
        const compressedBits = encoded.length
        setInfo(`Original: ${origBits} bits → Compressed: ${compressedBits} bits (${((1 - compressedBits / origBits) * 100).toFixed(1)}% savings)`)
        setActiveNodeId(null)
    }, [inputText, delay, stopRef])

    const handleStart = async () => {
        setIsRunning(true); stopRef.current = false
        setFreqTable([]); setTreeNodes([]); setTreeEdges([]); setEncodingMap({}); setEncodedBits(''); setInfo('')
        await runHuffman()
        setIsRunning(false)
    }

    const handleReset = () => {
        stopRef.current = true; setIsRunning(false)
        setFreqTable([]); setTreeNodes([]); setTreeEdges([]); setEncodingMap({}); setEncodedBits('')
        setInfo(''); setPhase(''); setActiveNodeId(null)
    }

    return (
        <VisualizerLayout
            title="Huffman Compression"
            onBack={onBack}
            sidebar={
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                    <ControlPanel
                        algorithms={[]}
                        selectedAlgo="huffman"
                        onSelectAlgo={() => { }}
                        onStart={handleStart}
                        onReset={handleReset}
                        isRunning={isRunning}
                        speed={speed}
                        onSpeedChange={setSpeed}
                    >
                        <div className="control-group">
                            <label className="control-label">Input Text</label>
                            <input value={inputText} onChange={(e) => setInputText(e.target.value)}
                                disabled={isRunning} className="glass-panel"
                                style={{ padding: '10px', background: 'var(--bg-card)', color: 'var(--text-primary)', borderRadius: '10px', width: '100%', fontFamily: 'monospace' }} />
                        </div>
                    </ControlPanel>

                    {freqTable.length > 0 && (
                        <div className="control-group">
                            <label className="control-label">Frequency Table</label>
                            <div className="glass-panel" style={{ padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {freqTable.map(({ char, count }) => (
                                    <div key={char} style={{ padding: '4px 10px', background: 'var(--bg-card)', borderRadius: '8px', fontSize: '0.8rem' }}>
                                        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{char}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>: {count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {Object.keys(encodingMap).length > 0 && (
                        <div className="control-group">
                            <label className="control-label">Encoding Map</label>
                            <div className="glass-panel" style={{ padding: '10px' }}>
                                {Object.entries(encodingMap).map(([char, code]) => (
                                    <div key={char} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>'{char}'</span>
                                        <span style={{ fontFamily: 'monospace', color: 'var(--success)' }}>{code}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {info && <div className="glass-panel" style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{info}</div>}
                </div>
            }
            info={<AlgorithmInfo algoName="Huffman Encoding" />}
        >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%' }}>
                {treeNodes.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 'auto' }}>Enter text and click Run</p>
                ) : (
                    <>
                        <svg width="100%" height="100%" viewBox="0 0 800 400" style={{ flex: 1 }}>
                            {treeEdges.map((e, i) => {
                                const from = treeNodes.find(n => n.id === e.from)
                                const to = treeNodes.find(n => n.id === e.to)
                                if (!from || !to) return null
                                return (
                                    <g key={i}>
                                        <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="var(--border-glass)" strokeWidth="1.5" />
                                        <text x={(from.x + to.x) / 2 + (e.label === '0' ? -10 : 10)} y={(from.y + to.y) / 2}
                                            fill="var(--warning)" fontSize="11" fontWeight="700">{e.label}</text>
                                    </g>
                                )
                            })}
                            {treeNodes.map((n) => (
                                <g key={n.id} className="huffman-node">
                                    <motion.circle
                                        cx={n.x} cy={n.y} r="18"
                                        fill={activeNodeId === n.id ? 'var(--primary)' : n.char ? 'var(--success)' : 'var(--bg-elevated)'}
                                        stroke="var(--border-glass)" strokeWidth="2"
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    />
                                    <text x={n.x} y={n.y - 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="600">
                                        {n.char || n.freq}
                                    </text>
                                    {n.char && (
                                        <text x={n.x} y={n.y + 10} textAnchor="middle" fill="var(--accent)" fontSize="8">
                                            {n.freq}
                                        </text>
                                    )}
                                </g>
                            ))}
                        </svg>
                        {encodedBits && (
                            <div style={{
                                padding: '12px', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--success)', background: 'var(--bg-card)',
                                borderRadius: '10px', maxWidth: '100%', overflowX: 'auto', wordBreak: 'break-all', margin: '8px 0'
                            }}>
                                {encodedBits}
                            </div>
                        )}
                    </>
                )}
            </div>
        </VisualizerLayout>
    )
}

export default CompressionVisualizer
