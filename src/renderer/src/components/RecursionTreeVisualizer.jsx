import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import VisualizerLayout from './common/VisualizerLayout'
import ControlPanel from './common/ControlPanel'
import AlgorithmInfo from './AlgorithmInfo'
import { useVisualizerState } from '../hooks/useVisualizerState'

const REC_ALGOS = [
    { id: 'fibonacci', label: 'Fibonacci' },
    { id: 'factorial', label: 'Factorial' },
    { id: 'mergesort', label: 'Merge Sort' }
]

function RecursionTreeVisualizer({ onBack }) {
    const { isRunning, setIsRunning, speed, setSpeed, selectedAlgo, setSelectedAlgo, stopRef, delay } =
        useVisualizerState(400)
    const [nodes, setNodes] = useState([])
    const [edges, setEdges] = useState([])
    const [activeNodeId, setActiveNodeId] = useState(null)
    const [callStack, setCallStack] = useState([])
    const [info, setInfo] = useState('')
    const [inputN, setInputN] = useState(5)

    let nodeIdCounter = 0
    const getNextId = () => ++nodeIdCounter

    // Fibonacci Recursion Tree
    const runFibonacci = useCallback(async () => {
        const n = Math.min(inputN, 7) // limit for performance
        const allNodes = []
        const allEdges = []

        const fib = async (val, x, y, level, parentId) => {
            if (stopRef.current) return 0
            const id = getNextId()
            const node = { id, label: `fib(${val})`, x, y, result: null, active: false, computed: false }
            allNodes.push(node)
            if (parentId != null) allEdges.push({ from: parentId, to: id })
            setNodes([...allNodes]); setEdges([...allEdges])
            setActiveNodeId(id)
            setCallStack(prev => [...prev, `fib(${val})`])
            setInfo(`Computing fib(${val})`)
            await delay()

            if (val <= 1) {
                node.result = val
                node.computed = true
                setNodes([...allNodes])
                setCallStack(prev => prev.slice(0, -1))
                await delay()
                return val
            }

            const spread = 180 / Math.pow(1.8, level)
            const left = await fib(val - 1, x - spread, y + 70, level + 1, id)
            if (stopRef.current) return 0
            const right = await fib(val - 2, x + spread, y + 70, level + 1, id)
            if (stopRef.current) return 0

            node.result = left + right
            node.computed = true
            setActiveNodeId(id)
            setNodes([...allNodes])
            setCallStack(prev => prev.slice(0, -1))
            setInfo(`fib(${val}) = ${left} + ${right} = ${node.result}`)
            await delay()
            return node.result
        }

        await fib(n, 400, 40, 0, null)
    }, [inputN, delay, stopRef])

    // Factorial
    const runFactorial = useCallback(async () => {
        const n = Math.min(inputN, 10)
        const allNodes = []
        const allEdges = []

        const fact = async (val, x, y, parentId) => {
            if (stopRef.current) return 1
            const id = getNextId()
            const node = { id, label: `${val}!`, x, y, result: null, computed: false }
            allNodes.push(node)
            if (parentId != null) allEdges.push({ from: parentId, to: id })
            setNodes([...allNodes]); setEdges([...allEdges])
            setActiveNodeId(id)
            setCallStack(prev => [...prev, `${val}!`])
            setInfo(`Computing ${val}!`)
            await delay()

            if (val <= 1) {
                node.result = 1; node.computed = true
                setNodes([...allNodes])
                setCallStack(prev => prev.slice(0, -1))
                await delay()
                return 1
            }

            const sub = await fact(val - 1, x, y + 80, id)
            if (stopRef.current) return 1
            node.result = val * sub
            node.computed = true
            setActiveNodeId(id)
            setNodes([...allNodes])
            setCallStack(prev => prev.slice(0, -1))
            setInfo(`${val}! = ${val} × ${sub} = ${node.result}`)
            await delay()
            return node.result
        }

        await fact(n, 400, 40, null)
    }, [inputN, delay, stopRef])

    // Merge Sort tree
    const runMergeSort = useCallback(async () => {
        const arr = [38, 27, 43, 3, 9, 82, 10]
        const allNodes = []
        const allEdges = []

        const msort = async (a, x, y, level, parentId) => {
            if (stopRef.current) return a
            const id = getNextId()
            const node = { id, label: `[${a.join(',')}]`, x, y, result: null, computed: false }
            allNodes.push(node)
            if (parentId != null) allEdges.push({ from: parentId, to: id })
            setNodes([...allNodes]); setEdges([...allEdges])
            setActiveNodeId(id)
            setInfo(`Splitting [${a.join(',')}]`)
            await delay()

            if (a.length <= 1) {
                node.result = `[${a.join(',')}]`; node.computed = true
                setNodes([...allNodes])
                await delay()
                return a
            }

            const mid = Math.floor(a.length / 2)
            const spread = 140 / Math.pow(1.5, level)
            const left = await msort(a.slice(0, mid), x - spread, y + 70, level + 1, id)
            if (stopRef.current) return a
            const right = await msort(a.slice(mid), x + spread, y + 70, level + 1, id)
            if (stopRef.current) return a

            const merged = []
            let i = 0, j = 0
            while (i < left.length && j < right.length) {
                if (left[i] <= right[j]) merged.push(left[i++])
                else merged.push(right[j++])
            }
            while (i < left.length) merged.push(left[i++])
            while (j < right.length) merged.push(right[j++])

            node.result = `[${merged.join(',')}]`; node.computed = true
            setActiveNodeId(id)
            setNodes([...allNodes])
            setInfo(`Merged → [${merged.join(',')}]`)
            await delay()
            return merged
        }

        await msort(arr, 400, 30, 0, null)
    }, [delay, stopRef])

    const handleStart = async () => {
        if (!selectedAlgo) return
        setIsRunning(true); stopRef.current = false
        nodeIdCounter = 0
        setNodes([]); setEdges([]); setCallStack([]); setActiveNodeId(null); setInfo('')
        switch (selectedAlgo) {
            case 'fibonacci': await runFibonacci(); break
            case 'factorial': await runFactorial(); break
            case 'mergesort': await runMergeSort(); break
        }
        setActiveNodeId(null)
        setIsRunning(false)
    }

    const handleReset = () => {
        stopRef.current = true; setIsRunning(false)
        setNodes([]); setEdges([]); setCallStack([]); setActiveNodeId(null); setInfo('')
    }

    return (
        <VisualizerLayout
            title="Recursion Tree"
            onBack={onBack}
            sidebar={
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                    <ControlPanel
                        algorithms={REC_ALGOS}
                        selectedAlgo={selectedAlgo}
                        onSelectAlgo={setSelectedAlgo}
                        onStart={handleStart}
                        onReset={handleReset}
                        isRunning={isRunning}
                        speed={speed}
                        onSpeedChange={setSpeed}
                    >
                        {selectedAlgo !== 'mergesort' && (
                            <div className="control-group">
                                <label className="control-label">N</label>
                                <input type="number" min="1" max={selectedAlgo === 'fibonacci' ? 7 : 10} value={inputN}
                                    onChange={(e) => setInputN(Number(e.target.value))}
                                    className="glass-panel" disabled={isRunning}
                                    style={{ padding: '10px', background: 'var(--bg-card)', color: 'var(--text-primary)', borderRadius: '10px', width: '100%' }} />
                            </div>
                        )}
                    </ControlPanel>
                    {/* Call Stack */}
                    <div className="control-group">
                        <label className="control-label">Call Stack</label>
                        <div className="glass-panel" style={{ padding: '12px', minHeight: '80px', maxHeight: '200px', overflowY: 'auto' }}>
                            {callStack.length === 0 ? (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Empty</span>
                            ) : (
                                callStack.map((c, i) => (
                                    <div key={i} style={{
                                        padding: '4px 8px', marginBottom: '2px', borderRadius: '6px', fontSize: '0.8rem',
                                        background: i === callStack.length - 1 ? 'var(--primary)' : 'var(--bg-card)',
                                        color: i === callStack.length - 1 ? 'white' : 'var(--text-secondary)'
                                    }}>{c}</div>
                                )).reverse()
                            )}
                        </div>
                    </div>
                    {info && <div className="glass-panel" style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{info}</div>}
                </div>
            }
            info={<AlgorithmInfo algoName={selectedAlgo === 'fibonacci' ? 'Fibonacci Recursion' : selectedAlgo === 'factorial' ? 'Factorial' : 'Merge Sort'} />}
        >
            <svg width="100%" height="100%" viewBox="0 0 800 500" style={{ overflow: 'visible' }}>
                {edges.map((e, i) => {
                    const from = nodes.find(n => n.id === e.from)
                    const to = nodes.find(n => n.id === e.to)
                    if (!from || !to) return null
                    return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="var(--border-glass)" strokeWidth="1.5" />
                })}
                {nodes.map((n) => (
                    <g key={n.id}>
                        <motion.circle
                            cx={n.x} cy={n.y}
                            r={selectedAlgo === 'mergesort' ? 28 : 22}
                            fill={activeNodeId === n.id ? 'var(--primary)' : n.computed ? 'var(--success)' : 'var(--bg-card)'}
                            stroke={activeNodeId === n.id ? 'var(--accent)' : 'var(--border-glass)'}
                            strokeWidth="2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        />
                        <text x={n.x} y={n.y - 6} textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="600">
                            {n.label}
                        </text>
                        {n.result != null && (
                            <text x={n.x} y={n.y + 10} textAnchor="middle" fill="var(--accent)" fontSize="11" fontWeight="800">
                                {n.result}
                            </text>
                        )}
                    </g>
                ))}
            </svg>
        </VisualizerLayout>
    )
}

export default RecursionTreeVisualizer
