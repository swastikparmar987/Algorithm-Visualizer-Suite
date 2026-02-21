import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Plus, Trash2, Settings, ArrowRight, CheckCircle2, XCircle } from 'lucide-react'
import StitchVisualizerLayout from './common/StitchVisualizerLayout'
import { useAppStore } from '../store/useAppStore'
import { playClick, playStep, playSuccess, playTone } from '../utils/SoundEngine'
import { say } from './mascot/MascotAssistant'

function AutomataVisualizer({ onBack }) {
    // Mode: 'designer' (manual) or 'generator' (templates)
    const [machineType, setMachineType] = useState('DFA') // 'DFA', 'TM'
    const [mode, setMode] = useState('generator')
    const [category, setCategory] = useState('substring') // substring, length, count, modulo
    const [subType, setSubType] = useState('ends-with') // starts-with, ends-with, contains, exact, divisible-by, etc.
    const [param, setParam] = useState('101') // generic input param
    const [alphabetStr, setAlphabetStr] = useState('0, 1') // custom alphabet

    // Graph State
    const [nodes, setNodes] = useState([]) // { id, x, y, isStart, isAccept }
    const [edges, setEdges] = useState([]) // { from, to, symbol }

    // Designer State
    const [designerTool, setDesignerTool] = useState('select') // 'select', 'addNode', 'addEdge', 'trash'
    const [selectedEntity, setSelectedEntity] = useState(null) // { type: 'node'|'edge', id/index }
    const [activeEdgeSource, setActiveEdgeSource] = useState(null) // node ID
    const [edgePrompt, setEdgePrompt] = useState(null) // { source: id, target: id, symbol: '' }
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const svgRef = useRef(null)

    // Simulation State
    const [inputString, setInputString] = useState('')
    const [currentStep, setCurrentStep] = useState(-1) // -1 = not started
    const [currentState, setCurrentState] = useState(null)
    const [history, setHistory] = useState([]) // Array of { state, char, valid }
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [speed, setSpeed] = useState(500)
    const [result, setResult] = useState(null) // 'accepted' | 'rejected'

    // TM State
    const [tape, setTape] = useState({}) // Index -> Char map
    const [headPos, setHeadPos] = useState(0)
    const [tmTransitions, setTmTransitions] = useState({}) // Key: "state,read" -> { next, write, move } 

    const soundEnabled = useAppStore(s => s.soundEnabled)
    const speedRef = useRef(speed)
    const stopRef = useRef(false)
    const pauseRef = useRef(false)

    useEffect(() => { speedRef.current = speed }, [speed])

    const getDefaultSubType = (cat) => {
        if (cat === 'substring') return 'ends-with'
        if (cat === 'specific-string') return 'exact-match'
        if (cat === 'length') return 'exact'
        if (cat === 'count') return 'parity'
        if (cat === 'modulo') return 'divisible-by'
        return 'ends-with'
    }

    // --- ALGORITHMS (Machine Maker) ---
    const generateDFA = () => {
        setNodes([]); setEdges([])

        // Parse alphabet string, remove spaces and commas, get unique chars
        let alphabet = Array.from(new Set(alphabetStr.replace(/[\s,]/g, '')))
        if (alphabet.length === 0) alphabet = ['0', '1']
        const char0 = alphabet[0] || '0'
        const char1 = alphabet.length > 1 ? alphabet[1] : char0

        let newNodes = []
        let newEdges = []

        if (category === 'substring') {
            const pattern = param.replace(new RegExp(`[^${alphabet.join('')}]`, 'g'), '') || (char1 ? char1 + char0 + char1 : char0 + char0 + char0)
            const len = pattern.length

            if (subType === 'ends-with') {
                // ... Existing Ends With Logic ...
                for (let i = 0; i <= len; i++) {
                    newNodes.push({ id: `q${i}`, x: 100 + (i * 120), y: 300, isStart: i === 0, isAccept: i === len })
                }
                for (let i = 0; i <= len; i++) {
                    for (let char of alphabet) {
                        let currentStr = pattern.slice(0, i) + char
                        let nextState = 0
                        for (let k = Math.min(len, currentStr.length); k > 0; k--) {
                            if (currentStr.endsWith(pattern.slice(0, k))) {
                                nextState = k; break
                            }
                        }
                        newEdges.push({ from: `q${i}`, to: `q${nextState}`, symbol: char })
                    }
                }
            } else if (subType === 'starts-with') {
                // Starts with <pattern>
                // States 0..len. len is accept. +1 Trap state.
                const trap = len + 1
                for (let i = 0; i <= len; i++) {
                    newNodes.push({ id: `q${i}`, x: 100 + (i * 120), y: 300, isStart: i === 0, isAccept: i === len })
                }
                newNodes.push({ id: `DEAD`, x: 100 + ((len + 1) * 120), y: 400, isStart: false, isAccept: false })

                for (let i = 0; i < len; i++) {
                    const expected = pattern[i]
                    for (let char of alphabet) {
                        if (char === expected) newEdges.push({ from: `q${i}`, to: `q${i + 1}`, symbol: char })
                        else newEdges.push({ from: `q${i}`, to: `DEAD`, symbol: char })
                    }
                }
                // Accept state loops to self
                for (let char of alphabet) newEdges.push({ from: `q${len}`, to: `q${len}`, symbol: char })
                // Trap state loops to self
                for (let char of alphabet) newEdges.push({ from: `DEAD`, to: `DEAD`, symbol: char })

            } else if (subType === 'contains') {
                // Contains <pattern>
                for (let i = 0; i <= len; i++) {
                    newNodes.push({ id: `q${i}`, x: 100 + (i * 120), y: 300, isStart: i === 0, isAccept: i === len })
                }
                for (let i = 0; i < len; i++) {
                    for (let char of alphabet) {
                        if (char === pattern[i]) {
                            newEdges.push({ from: `q${i}`, to: `q${i + 1}`, symbol: char })
                        } else {
                            // KMP Fallback
                            let currentStr = pattern.slice(0, i) + char
                            let nextState = 0
                            for (let k = Math.min(i + 1, currentStr.length); k > 0; k--) { // search prefix in pattern
                                if (pattern.startsWith(currentStr.slice(-k))) { // check if pattern STARTS with the suffix we just made
                                    // Actually for "contains", failing means we act like "starts with" regarding the prefix we've built so far 
                                    // But simpler: if we fail q_i, we check if we have a shorter prefix of pattern.
                                    // E.g. Pattern 101. Input 11. q0->1->q1. q1->1. Current '11'. Suffix '1' matches prefix '1'. So goto q1.
                                    if (pattern.slice(0, k) === currentStr.slice(-k)) {
                                        nextState = k; break
                                    }
                                }
                            }
                            newEdges.push({ from: `q${i}`, to: `q${nextState}`, symbol: char })
                        }
                    }
                }
                // Final state loops
                for (let char of alphabet) newEdges.push({ from: `q${len}`, to: `q${len}`, symbol: char })
            } else if (subType === 'not-contains') {
                for (let i = 0; i <= len; i++) {
                    newNodes.push({ id: `q${i}`, x: 100 + (i * 120), y: 300, isStart: i === 0, isAccept: i < len })
                }
                for (let i = 0; i < len; i++) {
                    for (let char of alphabet) {
                        if (char === pattern[i]) {
                            newEdges.push({ from: `q${i}`, to: `q${i + 1}`, symbol: char })
                        } else {
                            let currentStr = pattern.slice(0, i) + char
                            let nextState = 0
                            for (let k = Math.min(i + 1, currentStr.length); k > 0; k--) {
                                if (pattern.startsWith(currentStr.slice(-k))) {
                                    if (pattern.slice(0, k) === currentStr.slice(-k)) {
                                        nextState = k; break
                                    }
                                }
                            }
                            newEdges.push({ from: `q${i}`, to: `q${nextState}`, symbol: char })
                        }
                    }
                }
                for (let char of alphabet) newEdges.push({ from: `q${len}`, to: `q${len}`, symbol: char })

            } else if (subType === 'starts-ends-same') {
                newNodes = [
                    { id: 'q0', x: 100, y: 300, isStart: true, isAccept: false },
                    { id: 'q1', x: 300, y: 150, isStart: false, isAccept: true },
                    { id: 'q2', x: 500, y: 150, isStart: false, isAccept: false },
                    { id: 'q3', x: 300, y: 450, isStart: false, isAccept: true },
                    { id: 'q4', x: 500, y: 450, isStart: false, isAccept: false },
                ]
                newEdges = [
                    { from: 'q0', to: 'q1', symbol: char0 }, { from: 'q0', to: 'q3', symbol: char1 },
                    { from: 'q1', to: 'q1', symbol: char0 }, { from: 'q1', to: 'q2', symbol: char1 },
                    { from: 'q2', to: 'q1', symbol: char0 }, { from: 'q2', to: 'q2', symbol: char1 },
                    { from: 'q3', to: 'q3', symbol: char1 }, { from: 'q3', to: 'q4', symbol: char0 },
                    { from: 'q4', to: 'q4', symbol: char0 }, { from: 'q4', to: 'q3', symbol: char1 },
                ]

            } else if (subType === 'starts-ends-diff') {
                newNodes = [
                    { id: 'q0', x: 100, y: 300, isStart: true, isAccept: false },
                    { id: 'q1', x: 300, y: 150, isStart: false, isAccept: false },
                    { id: 'q2', x: 500, y: 150, isStart: false, isAccept: true },
                    { id: 'q3', x: 300, y: 450, isStart: false, isAccept: false },
                    { id: 'q4', x: 500, y: 450, isStart: false, isAccept: true },
                ]
                newEdges = [
                    { from: 'q0', to: 'q1', symbol: char0 }, { from: 'q0', to: 'q3', symbol: char1 },
                    { from: 'q1', to: 'q1', symbol: char0 }, { from: 'q1', to: 'q2', symbol: char1 },
                    { from: 'q2', to: 'q1', symbol: char0 }, { from: 'q2', to: 'q2', symbol: char1 },
                    { from: 'q3', to: 'q3', symbol: char1 }, { from: 'q3', to: 'q4', symbol: char0 },
                    { from: 'q4', to: 'q4', symbol: char0 }, { from: 'q4', to: 'q3', symbol: char1 },
                ]
            } else if (subType === 'starts-x-ends-y') {
                const startChar = param[0] || char0
                const endChar = param[param.length - 1] || char1
                const trap = 'DEAD'

                newNodes = [
                    { id: 'q0', x: 100, y: 300, isStart: true, isAccept: false },
                    { id: 'q1', x: 300, y: 150, isStart: false, isAccept: startChar === char0 && endChar === char0 },
                    { id: 'q2', x: 500, y: 150, isStart: false, isAccept: startChar === char0 && endChar === char1 },
                    { id: 'q3', x: 300, y: 450, isStart: false, isAccept: startChar === char1 && endChar === char1 },
                    { id: 'q4', x: 500, y: 450, isStart: false, isAccept: startChar === char1 && endChar === char0 },
                    { id: trap, x: 600, y: 300, isStart: false, isAccept: false }
                ]

                // q0 Check
                if (startChar === char0) {
                    newEdges.push({ from: 'q0', to: 'q1', symbol: char0 })
                    newEdges.push({ from: 'q0', to: trap, symbol: char1 })
                } else {
                    newEdges.push({ from: 'q0', to: trap, symbol: char0 })
                    newEdges.push({ from: 'q0', to: 'q3', symbol: char1 })
                }

                // S0 branch
                newEdges.push({ from: 'q1', to: 'q1', symbol: char0 }, { from: 'q1', to: 'q2', symbol: char1 })
                newEdges.push({ from: 'q2', to: 'q1', symbol: char0 }, { from: 'q2', to: 'q2', symbol: char1 })
                // S1 branch
                newEdges.push({ from: 'q3', to: 'q3', symbol: char1 }, { from: 'q3', to: 'q4', symbol: char0 })
                newEdges.push({ from: 'q4', to: 'q4', symbol: char0 }, { from: 'q4', to: 'q3', symbol: char1 })
                // Trap loops for char0 and char1
                newEdges.push({ from: trap, to: trap, symbol: char0 }, { from: trap, to: trap, symbol: char1 })
            }

        } else if (category === 'specific-string') {
            const pattern = param.replace(new RegExp(`[^${alphabet.join('')}]`, 'g'), '') || (char1 ? char1 + char0 + char1 : char0 + char0 + char0)
            const len = pattern.length
            const trap = len + 1

            for (let i = 0; i <= len; i++) {
                newNodes.push({ id: `q${i}`, x: 100 + (i * 100), y: 300, isStart: i === 0, isAccept: i === len })
            }
            newNodes.push({ id: `DEAD`, x: 100 + ((len + 1) * 100), y: 400, isStart: false, isAccept: false })

            for (let i = 0; i < len; i++) {
                const expected = pattern[i]
                for (let char of alphabet) {
                    if (char === expected) newEdges.push({ from: `q${i}`, to: `q${i + 1}`, symbol: char })
                    else newEdges.push({ from: `q${i}`, to: `DEAD`, symbol: char })
                }
            }
            for (let char of alphabet) {
                newEdges.push({ from: `q${len}`, to: `DEAD`, symbol: char })
                newEdges.push({ from: `DEAD`, to: `DEAD`, symbol: char })
            }

        } else if (category === 'length') {
            const n = parseInt(param) || 2
            if (subType === 'exact') {
                // Exactly N length
                for (let i = 0; i <= n; i++) {
                    newNodes.push({ id: `q${i}`, x: 100 + (i * 120), y: 300, isStart: i === 0, isAccept: i === n })
                }
                const trap = n + 1
                newNodes.push({ id: `DEAD`, x: 100 + (trap * 120), y: 400, isStart: false, isAccept: false })

                for (let i = 0; i < n; i++) {
                    for (let char of alphabet) newEdges.push({ from: `q${i}`, to: `q${i + 1}`, symbol: char })
                }
                for (let char of alphabet) newEdges.push({ from: `q${n}`, to: `DEAD`, symbol: char })
                for (let char of alphabet) newEdges.push({ from: `DEAD`, to: `DEAD`, symbol: char })

            } else if (subType === 'at-least') {
                // At least N
                for (let i = 0; i <= n; i++) {
                    newNodes.push({ id: `q${i}`, x: 100 + (i * 120), y: 300, isStart: i === 0, isAccept: i === n })
                }
                for (let i = 0; i < n; i++) {
                    for (let char of alphabet) newEdges.push({ from: `q${i}`, to: `q${i + 1}`, symbol: char })
                }
                for (let char of alphabet) newEdges.push({ from: `q${n}`, to: `q${n}`, symbol: char })

            } else if (subType === 'at-most') {
                // Length <= N
                // q0..qN accepted. qN+1 trap.
                for (let i = 0; i <= n; i++) {
                    newNodes.push({ id: `q${i}`, x: 100 + (i * 120), y: 300, isStart: i === 0, isAccept: true })
                }
                const trap = n + 1
                newNodes.push({ id: `DEAD`, x: 100 + (trap * 120), y: 300, isStart: false, isAccept: false })

                for (let i = 0; i < n; i++) {
                    for (let char of alphabet) newEdges.push({ from: `q${i}`, to: `q${i + 1}`, symbol: char })
                }
                for (let char of alphabet) newEdges.push({ from: `q${n}`, to: `DEAD`, symbol: char })
                for (let char of alphabet) newEdges.push({ from: `DEAD`, to: `DEAD`, symbol: char })

            } else if (subType === 'divisible-by') {
                // Length % N == 0
                const radius = 150
                const center = { x: 400, y: 300 }
                for (let i = 0; i < n; i++) {
                    const angle = (2 * Math.PI * i) / n - Math.PI / 2
                    newNodes.push({
                        id: `q${i}`,
                        x: center.x + radius * Math.cos(angle),
                        y: center.y + radius * Math.sin(angle),
                        isStart: i === 0,
                        isAccept: i === 0
                    })
                }
                for (let i = 0; i < n; i++) {
                    const next = (i + 1) % n
                    for (let char of alphabet) newEdges.push({ from: `q${i}`, to: `q${next}`, symbol: char })
                }
            }

        } else if (category === 'count') {
            const n = parseInt(param) || 2
            if (subType === 'parity') {
                // Even char0, Odd char1, etc.
                // 4 states: EE, EO, OE, OO (char0 parity, char1 parity)
                const states = ['EE', 'EO', 'OE', 'OO']

                newNodes = [
                    { id: 'EE', x: 300, y: 200, isStart: true, isAccept: param === 'EE' },
                    { id: 'EO', x: 500, y: 200, isStart: false, isAccept: param === 'EO' },
                    { id: 'OE', x: 300, y: 400, isStart: false, isAccept: param === 'OE' },
                    { id: 'OO', x: 500, y: 400, isStart: false, isAccept: param === 'OO' }
                ]

                // Transitions
                newEdges.push({ from: 'EE', to: 'OE', symbol: char0 })
                newEdges.push({ from: 'EE', to: 'EO', symbol: char1 })

                newEdges.push({ from: 'EO', to: 'OO', symbol: char0 })
                newEdges.push({ from: 'EO', to: 'EE', symbol: char1 })

                newEdges.push({ from: 'OE', to: 'EE', symbol: char0 })
                newEdges.push({ from: 'OE', to: 'OO', symbol: char1 })

                newEdges.push({ from: 'OO', to: 'EO', symbol: char0 })
                newEdges.push({ from: 'OO', to: 'OE', symbol: char1 })

                // Other chars trap/loop? Not needed for basic parity, but to be robust:
                for (let char of alphabet) {
                    if (char !== char0 && char !== char1) {
                        newEdges.push({ from: 'EE', to: 'EE', symbol: char })
                        newEdges.push({ from: 'EO', to: 'EO', symbol: char })
                        newEdges.push({ from: 'OE', to: 'OE', symbol: char })
                        newEdges.push({ from: 'OO', to: 'OO', symbol: char })
                    }
                }
            } else if (subType === 'specific') {
                // Exactly N char1s
                for (let i = 0; i <= n; i++) {
                    newNodes.push({ id: `q${i}`, x: 100 + (i * 120), y: 300, isStart: i === 0, isAccept: i === n })
                }
                const trap = n + 1
                newNodes.push({ id: `DEAD`, x: 100 + (trap * 120), y: 300, isStart: false, isAccept: false })

                for (let i = 0; i < n; i++) {
                    for (let char of alphabet) {
                        if (char === char1) newEdges.push({ from: `q${i}`, to: `q${i + 1}`, symbol: char })
                        else newEdges.push({ from: `q${i}`, to: `q${i}`, symbol: char })
                    }
                }
                for (let char of alphabet) {
                    if (char === char1) newEdges.push({ from: `q${n}`, to: `DEAD`, symbol: char })
                    else newEdges.push({ from: `q${n}`, to: `q${n}`, symbol: char })
                }
                for (let char of alphabet) newEdges.push({ from: `DEAD`, to: `DEAD`, symbol: char })

            } else if (subType === 'at-least-n-zeros') {
                // At least N char0s
                for (let i = 0; i <= n; i++) {
                    newNodes.push({ id: `q${i}`, x: 100 + (i * 120), y: 300, isStart: i === 0, isAccept: i === n })
                }
                for (let i = 0; i < n; i++) {
                    for (let char of alphabet) {
                        if (char === char0) newEdges.push({ from: `q${i}`, to: `q${i + 1}`, symbol: char })
                        else newEdges.push({ from: `q${i}`, to: `q${i}`, symbol: char })
                    }
                }
                for (let char of alphabet) newEdges.push({ from: `q${n}`, to: `q${n}`, symbol: char })

            } else if (subType === 'at-most-n-zeros') {
                // At most N char0s
                for (let i = 0; i <= n; i++) {
                    newNodes.push({ id: `q${i}`, x: 100 + (i * 120), y: 300, isStart: i === 0, isAccept: true })
                }
                const trap = n + 1
                newNodes.push({ id: `DEAD`, x: 100 + (trap * 120), y: 400, isStart: false, isAccept: false })

                for (let i = 0; i < n; i++) {
                    for (let char of alphabet) {
                        if (char === char0) newEdges.push({ from: `q${i}`, to: `q${i + 1}`, symbol: char })
                        else newEdges.push({ from: `q${i}`, to: `q${i}`, symbol: char })
                    }
                }
                for (let char of alphabet) {
                    if (char === char0) newEdges.push({ from: `q${n}`, to: `DEAD`, symbol: char })
                    else newEdges.push({ from: `q${n}`, to: `q${n}`, symbol: char })
                }
                for (let char of alphabet) newEdges.push({ from: `DEAD`, to: `DEAD`, symbol: char })
            }

        } else if (category === 'modulo') {
            // Value % N == 0 (Based on reading symbols as digits if possible, else just binary)
            const n = parseInt(param) || 3
            const radius = 200
            const center = { x: 400, y: 300 }

            // Let's interpret 'char0' as digit 0, 'char1' as digit 1
            for (let i = 0; i < n; i++) {
                const angle = (2 * Math.PI * i) / n - Math.PI / 2
                newNodes.push({
                    id: `q${i}`,
                    x: center.x + radius * Math.cos(angle),
                    y: center.y + radius * Math.sin(angle),
                    isStart: i === 0,
                    isAccept: i === 0
                })
            }

            for (let r = 0; r < n; r++) {
                const rem0 = (r * 2) % n
                const rem1 = (r * 2 + 1) % n
                newEdges.push({ from: `q${r}`, to: `q${rem0}`, symbol: char0 })
                newEdges.push({ from: `q${r}`, to: `q${rem1}`, symbol: char1 })
                // Trap other chars
                for (let char of alphabet) {
                    if (char !== char0 && char !== char1) {
                        // trap
                    }
                }
            }
        }

        // Ensure DFA is complete by adding an explicit DEAD state for any missing transitions
        let hasDeadState = newNodes.some(n => n.id === 'DEAD')

        newNodes.forEach(node => {
            if (node.id === 'DEAD') return // Dead state loops to itself already

            const outgoingSymbols = newEdges.filter(e => e.from === node.id).map(e => e.symbol)
            const missingSymbols = alphabet.filter(char => !outgoingSymbols.includes(char))

            if (missingSymbols.length > 0) {
                if (!hasDeadState) {
                    newNodes.push({ id: 'DEAD', x: 400, y: 550, isStart: false, isAccept: false })
                    alphabet.forEach(c => newEdges.push({ from: 'DEAD', to: 'DEAD', symbol: c }))
                    hasDeadState = true
                }
                missingSymbols.forEach(c => newEdges.push({ from: node.id, to: 'DEAD', symbol: c }))
            }
        })

        setNodes(newNodes)
        setEdges(newEdges)
        setResult(null); setCurrentStep(-1); setHistory([])
        say(`Generated DFA for ${category} logic.`, "happy")
    }

    const generateTM = () => {
        setNodes([]); setEdges([]); setTmTransitions({})

        if (param === 'palindrome') {
            // Palindrome Detector (Binary)
            // q0: Start. Read First Char.
            // If 0: Write Blank, Move R, Goto q1 (Scan for matching 0 at end)
            // If 1: Write Blank, Move R, Goto q2 (Scan for matching 1 at end)
            // If B: Accept (Empty string is palindrome)

            // Simplified Nodes for Vis
            const tmNodes = [
                { id: 'qStart', x: 200, y: 300, isStart: true },
                { id: 'qFind0', x: 400, y: 200 },
                { id: 'qFind1', x: 400, y: 400 },
                { id: 'qCheck0', x: 600, y: 200 }, // Check matching 0
                { id: 'qCheck1', x: 600, y: 400 }, // Check matching 1
                { id: 'qBack', x: 400, y: 300 }, // Go back to start
                { id: 'qAccept', x: 700, y: 300, isAccept: true },
                { id: 'qReject', x: 700, y: 500, isAccept: false }
            ]
            setNodes(tmNodes)

            // Transitions Map: "State,Char" -> { next: 'S', write: 'W', move: 'L/R' }
            const trans = {}
            const addTr = (s, r, n, w, m) => { trans[`${s},${r}`] = { next: n, write: w, move: m } }

            // qStart: Read first char
            addTr('qStart', '0', 'qFind0', '_', 'R') // Saw 0, clear it, find matching 0 at end
            addTr('qStart', '1', 'qFind1', '_', 'R') // Saw 1, clear it, find matching 1 at end
            addTr('qStart', '_', 'qAccept', '_', 'R') // Empty string or all matched

            // qFind0: Move R until end of string (blank)
            addTr('qFind0', '0', 'qFind0', '0', 'R')
            addTr('qFind0', '1', 'qFind0', '1', 'R')
            addTr('qFind0', '_', 'qCheck0', '_', 'L') // Hit end, step back to check last char

            // qFind1: Move R until end of string
            addTr('qFind1', '0', 'qFind1', '0', 'R')
            addTr('qFind1', '1', 'qFind1', '1', 'R')
            addTr('qFind1', '_', 'qCheck1', '_', 'L')

            // qCheck0: Expect 0. If 0, replace with _, go back. If _, single match (done). 
            addTr('qCheck0', '0', 'qBack', '_', 'L') // Match found! Go back.
            addTr('qCheck0', '_', 'qAccept', '_', 'R') // Single char '0' case
            addTr('qCheck0', '1', 'qReject', '1', 'R') // Mismatch

            // qCheck1: Expect 1.
            addTr('qCheck1', '1', 'qBack', '_', 'L')
            addTr('qCheck1', '_', 'qAccept', '_', 'R')
            addTr('qCheck1', '0', 'qReject', '0', 'R')

            // qBack: Move L until we hit start blank
            addTr('qBack', '0', 'qBack', '0', 'L')
            addTr('qBack', '1', 'qBack', '1', 'L')
            addTr('qBack', '_', 'qStart', '_', 'R') // Back at start

            setTmTransitions(trans)

            // Visualization edges (Simplified subset for clarity)
            const visEdges = [
                { from: 'qStart', to: 'qFind0', symbol: '0/_ R' },
                { from: 'qStart', to: 'qFind1', symbol: '1/_ R' },
                { from: 'qFind0', to: 'qCheck0', symbol: '_/L' },
                { from: 'qFind1', to: 'qCheck1', symbol: '_/L' },
                { from: 'qCheck0', to: 'qBack', symbol: '0/_ L' },
                { from: 'qCheck1', to: 'qBack', symbol: '1/_ L' },
                { from: 'qBack', to: 'qStart', symbol: '_/R' },
            ]
            setEdges(visEdges)

            say("Loaded Turing Machine: Palindrome Detector.", "happy")

        } else if (param === 'binary-inc') {
            // Binary Increment
            // 1. Go to rightmost bit (like a generic 'seek end')
            // 2. Add 1. 
            //    - If 0, make 1, Done.
            //    - If 1, make 0, Carry (Move L).
            //    - If _, make 1 (Overflow), Done.

            const tmNodes = [
                { id: 'q0', x: 200, y: 300, isStart: true }, // Go Right
                { id: 'q1', x: 500, y: 300 }, // Add Logic
                { id: 'qDone', x: 700, y: 300, isAccept: true }
            ]
            setNodes(tmNodes)

            const trans = {}
            const addTr = (s, r, n, w, m) => { trans[`${s},${r}`] = { next: n, write: w, move: m } }

            // q0: Seek Right end
            addTr('q0', '0', 'q0', '0', 'R')
            addTr('q0', '1', 'q0', '1', 'R')
            addTr('q0', '_', 'q1', '_', 'L') // Hit blank, step back to LSB

            // q1: Add with Carry
            addTr('q1', '0', 'qDone', '1', 'L') // 0->1, No carry, Done (move L just to park)
            addTr('q1', '_', 'qDone', '1', 'L') // _->1 (Overflow e.g. 11->11_ -> 100), Done
            addTr('q1', '1', 'q1', '0', 'L') // 1->0, Carry, Loop q1 (Move L)

            setTmTransitions(trans)

            const visEdges = [
                { from: 'q0', to: 'q0', symbol: '0,1/R' },
                { from: 'q0', to: 'q1', symbol: '_/L' },
                { from: 'q1', to: 'qDone', symbol: '0->1' },
                { from: 'q1', to: 'q1', symbol: '1->0 L' },
            ]
            setEdges(visEdges)
            say("Loaded Turing Machine: Binary Increment.", "happy")
        }
    }

    // --- SIMULATION ---
    const checkState = async () => {
        if (stopRef.current) return true
        while (pauseRef.current) {
            await new Promise(r => setTimeout(r, 100))
            if (stopRef.current) return true
        }
        return false
    }

    // --- DESIGNER MODE INTERACTIONS ---
    const handleCanvasClick = (e) => {
        if (mode !== 'designer') return

        if (designerTool === 'addNode') {
            const rect = svgRef.current.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            // Generate next state ID
            let nextId = 0
            while (nodes.some(n => n.id === `q${nextId}`)) nextId++

            const newNode = {
                id: `q${nextId}`,
                x,
                y,
                isStart: nodes.length === 0, // First node is start by default
                isAccept: false
            }
            setNodes(prev => [...prev, newNode])
            if (soundEnabled) playClick()
        } else if (designerTool === 'select' || designerTool === 'trash') {
            setSelectedEntity(null) // Deselect on background click
        }

        // Cancel active edge if clicking canvas
        if (activeEdgeSource) setActiveEdgeSource(null)
    }

    const handleCanvasMouseMove = (e) => {
        if (mode !== 'designer' || !activeEdgeSource) return
        const rect = svgRef.current.getBoundingClientRect()
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }

    const handleNodeClick = (e, nodeId) => {
        if (mode !== 'designer') return
        e.stopPropagation()

        if (designerTool === 'select') {
            setSelectedEntity({ type: 'node', id: nodeId })
            if (soundEnabled) playClick()
        } else if (designerTool === 'trash') {
            setNodes(prev => prev.filter(n => n.id !== nodeId))
            setEdges(prev => prev.filter(edge => edge.from !== nodeId && edge.to !== nodeId))
            if (soundEnabled) playTone(150, 100, 'sawtooth')
            if (selectedEntity?.id === nodeId) setSelectedEntity(null)
            if (activeEdgeSource === nodeId) setActiveEdgeSource(null)
        } else if (designerTool === 'addEdge') {
            if (!activeEdgeSource) {
                // First click - set source
                setActiveEdgeSource(nodeId)
                if (soundEnabled) playClick()
            } else {
                // Second click - create edge via custom prompt
                setEdgePrompt({ source: activeEdgeSource, target: nodeId, symbol: '' })
                setActiveEdgeSource(null)
            }
        }
    }

    const handleNodeDoubleClick = (e, nodeId) => {
        if (mode !== 'designer' || designerTool !== 'select') return
        e.stopPropagation()
        setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, isAccept: !n.isAccept } : n))
        if (soundEnabled) playTone(n => n.isAccept ? 600 : 400, 100, 'sine') // Fake lookup just for tone idea, play success tone basically
    }

    const handleNodeContextMenu = (e, nodeId) => {
        e.preventDefault()
        if (mode !== 'designer' || designerTool !== 'select') return

        // Set as Start Node
        setNodes(prev => prev.map(n => ({
            ...n,
            isStart: n.id === nodeId
        })))
        if (soundEnabled) playTone(440, 150, 'sine')
    }

    const handleEdgeClick = (e, index) => {
        if (mode !== 'designer') return
        e.stopPropagation()
        if (designerTool === 'trash') {
            setEdges(prev => prev.filter((_, i) => i !== index))
            if (soundEnabled) playTone(150, 100, 'sawtooth')
            if (selectedEntity?.type === 'edge' && selectedEntity?.id === index) setSelectedEntity(null)
        } else if (designerTool === 'select') {
            setSelectedEntity({ type: 'edge', id: index })
            if (soundEnabled) playClick()
        }
    }

    const runSimulation = async () => {
        if (nodes.length === 0) return
        if (isRunning && isPaused) {
            setIsPaused(false)
            pauseRef.current = false
            return
        }

        stopRef.current = false
        setIsRunning(true)
        setIsPaused(false)
        setCurrentStep(0)
        setHistory([])
        setResult(null)

        // Find start node
        let curr = nodes.find(n => n.isStart)
        if (!curr) {
            say("Error: No start state defined.", "sad")
            setIsRunning(false)
            return
        }

        if (machineType === 'TM') {
            // Initialize Tape
            const initialTape = {}
            inputString.split('').forEach((c, i) => initialTape[i] = c)
            setTape(initialTape)
            setHeadPos(0)

            let currentHead = 0
            let stepCount = 0
            setCurrentState(curr.id)
            say("Starting Turing Machine...", "neutral")
            await new Promise(r => setTimeout(r, 500))

            while (stepCount < 1000) { // Safety limit
                if (await checkState()) return

                // Read Tape
                const char = initialTape[currentHead] || '_'

                // Look up transition
                const key = `${curr.id},${char}`
                const tr = tmTransitions[key]

                if (tr) {
                    if (soundEnabled) playClick()
                    // Execute Transition
                    initialTape[currentHead] = tr.write // Write
                    setTape({ ...initialTape }) // Trigger render

                    currentHead += (tr.move === 'R' ? 1 : -1) // Move
                    setHeadPos(currentHead)

                    curr = nodes.find(n => n.id === tr.next) // Next State
                    setCurrentState(curr.id)

                    const actionDesc = `Read '${char}' -> Write '${tr.write}', Move ${tr.move}`
                    setHistory(prev => [...prev, { state: curr.id, action: actionDesc }])
                    stepCount++

                    // Check for Accept/Reject immediately if in those states
                    if (curr.isAccept) {
                        setResult('accepted')
                        say("Halted on ACCEPT state.", "happy")
                        setIsRunning(false)
                        return
                    }
                    if (curr.id === 'qReject') {
                        setResult('rejected')
                        say("Halted on REJECT state.", "sad")
                        setIsRunning(false)
                        return
                    }

                } else {
                    // No transition = Halt (implicitly reject if not accept state)
                    say(`Halted. No transition for ${curr.id} on '${char}'.`, "neutral")
                    if (curr.isAccept) setResult('accepted')
                    else setResult('rejected')
                    setIsRunning(false)
                    return
                }

                await new Promise(r => setTimeout(r, 1050 - speedRef.current))
            }
            say("Simulation limit reached (1000 steps).", "neutral")
            setIsRunning(false)

        } else {
            // DFA LOGIC (Existing)
            setCurrentState(curr.id)
            if (soundEnabled) playClick()
            say(`Starting at initial state ${curr.id}...`, "neutral")
            await new Promise(r => setTimeout(r, 500))

            for (let i = 0; i < inputString.length; i++) {
                if (await checkState()) return

                const char = inputString[i]
                setCurrentStep(i)

                // Find transition
                const edge = edges.find(e => e.from === curr.id && e.symbol === char)

                if (edge) {
                    // Animate transition
                    if (soundEnabled) playStep(i, inputString.length)
                    curr = nodes.find(n => n.id === edge.to)
                    setCurrentState(curr.id)
                    setHistory(prev => [...prev, { state: curr.id, char, valid: true }])
                    say(`Read '${char}', transition to ${curr.id}.`, "neutral")
                } else {
                    // Trap / Crash
                    if (soundEnabled) playTone(150, 300, 'sawtooth')
                    setHistory(prev => [...prev, { state: curr.id, char, valid: false }])
                    say(`No transition for '${char}'! Machine halted.`, "sad")
                    setResult('rejected')
                    setIsRunning(false)
                    return
                }

                await new Promise(r => setTimeout(r, 1050 - speedRef.current))
            }

            // Final check
            if (curr.isAccept) {
                setResult('accepted')
                if (soundEnabled) playSuccess()
                say("String ACCEPTED! We ended in a final state.", "happy")
            } else {
                setResult('rejected')
                if (soundEnabled) playTone(200, 500, 'sawtooth')
                say("String REJECTED. Ended in non-final state.", "sad")
            }
            setIsRunning(false)
        }
    }

    const resetSim = () => {
        stopRef.current = true
        setIsRunning(false)
        setIsPaused(false)
        setCurrentStep(-1)
        setCurrentState(null)
        setHistory([])
        setResult(null)
    }

    // --- RENDER HELPERS ---
    const getEdgePath = (from, to, index, total) => {
        // Self loop
        if (from.id === to.id) {
            return `M ${from.x} ${from.y - 20} C ${from.x - 30} ${from.y - 80}, ${from.x + 30} ${from.y - 80}, ${from.x} ${from.y - 20}`
        }
        // Quadratic bezier for curve if multiple edges
        const dx = to.x - from.x
        const dy = to.y - from.y
        return `M ${from.x} ${from.y} L ${to.x} ${to.y}`
    }

    const Controls = (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Machine Type</h3>
                <div className="flex bg-bg-elevated p-1 rounded-lg">
                    <button
                        onClick={() => setMachineType('DFA')}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${machineType === 'DFA' ? 'bg-primary text-white shadow' : 'text-text-muted hover:text-white'}`}
                    >
                        DFA / NFA
                    </button>
                    <button
                        onClick={() => setMachineType('TM')}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${machineType === 'TM' ? 'bg-secondary text-white shadow' : 'text-text-muted hover:text-white'}`}
                    >
                        Turing Machine
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Mode</h3>
                <div className="flex bg-bg-elevated p-1 rounded-lg">
                    <button
                        onClick={() => { setMode('generator'); setDesignerTool('select') }}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${mode === 'generator' ? 'bg-white/10 text-white shadow' : 'text-text-muted hover:text-white'}`}
                    >
                        Generator
                    </button>
                    <button
                        onClick={() => { setMode('designer'); say("Designer mode active. Click 'Add State' to place nodes on the canvas.", "happy") }}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${mode === 'designer' ? 'bg-white/10 text-white shadow' : 'text-text-muted hover:text-white'}`}
                    >
                        Designer
                    </button>
                </div>
            </div>

            {mode === 'designer' && (
                <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-accent-orange">Designer Tools</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setDesignerTool('select')}
                            className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg border transition-colors ${designerTool === 'select' ? 'bg-accent-orange/20 border-accent-orange text-accent-orange' : 'bg-bg-elevated border-border-glass text-text-muted hover:text-white'}`}
                        >
                            Select
                        </button>
                        <button
                            onClick={() => setDesignerTool('addNode')}
                            className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg border transition-colors ${designerTool === 'addNode' ? 'bg-primary/20 border-primary text-primary' : 'bg-bg-elevated border-border-glass text-text-muted hover:text-white'}`}
                        >
                            <Plus size={14} /> Add State
                        </button>
                        <button
                            onClick={() => setDesignerTool('addEdge')}
                            className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg border transition-colors ${designerTool === 'addEdge' ? 'bg-secondary/20 border-secondary text-secondary' : 'bg-bg-elevated border-border-glass text-text-muted hover:text-white'}`}
                        >
                            <ArrowRight size={14} /> Connect
                        </button>
                        <button
                            onClick={() => setDesignerTool('trash')}
                            className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg border transition-colors ${designerTool === 'trash' ? 'bg-danger/20 border-danger text-danger' : 'bg-bg-elevated border-border-glass text-text-muted hover:text-white'}`}
                        >
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>

                    <button
                        onClick={() => { setNodes([]); setEdges([]); setSelectedEntity(null); setActiveEdgeSource(null) }}
                        className="w-full mt-2 bg-bg-elevated hover:bg-danger/20 border border-border-glass hover:border-danger text-text-muted hover:text-danger font-bold py-2 rounded-lg text-xs uppercase transition-colors"
                    >
                        Clear Canvas
                    </button>

                    <div className="mt-4 p-3 rounded-lg bg-bg-dark border border-border-glass text-[10px] text-text-muted">
                        <strong className="text-white">Tips:</strong>
                        <ul className="list-disc pl-4 mt-1 space-y-1">
                            <li>Double-click a state to make it an Accept state.</li>
                            <li>Right-click a state to make it the Start state.</li>
                            <li>In Connect mode, click origin then destination.</li>
                        </ul>
                    </div>
                </div>
            )}

            {mode === 'generator' && (
                <div className="space-y-4">
                    {machineType === 'DFA' ? (
                        <>
                            {/* Alphabet Selection */}
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase">Alphabet</label>
                                <input
                                    value={alphabetStr}
                                    onChange={e => setAlphabetStr(e.target.value)}
                                    className="w-full bg-bg-elevated text-white text-sm rounded-lg p-2 mt-1 border border-border-glass focus:border-primary font-mono"
                                    placeholder="e.g. 0,1 or a,b"
                                />
                            </div>

                            {/* Category Selection */}
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase">Category</label>
                                <select
                                    value={category}
                                    onChange={e => { setCategory(e.target.value); setSubType(getDefaultSubType(e.target.value)); }}
                                    className="w-full bg-bg-elevated text-white text-sm rounded-lg p-2 mt-1 border border-border-glass focus:border-primary"
                                >
                                    <option value="substring">Pattern Matching</option>
                                    <option value="specific-string">Specific String</option>
                                    <option value="length">String Length</option>
                                    <option value="count">Symbol Count</option>
                                    <option value="modulo">Modulo Arithmetic</option>
                                </select>
                            </div>

                            {/* SubType Selection (Dynamic) */}
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase">Question Type</label>
                                <select
                                    value={subType}
                                    onChange={e => setSubType(e.target.value)}
                                    className="w-full bg-bg-elevated text-white text-sm rounded-lg p-2 mt-1 border border-border-glass focus:border-primary"
                                >
                                    {category === 'substring' && (
                                        <>
                                            <option value="starts-with">Starts With...</option>
                                            <option value="ends-with">Ends With...</option>
                                            <option value="contains">Contains...</option>
                                            <option value="not-contains">Does NOT Contain</option>
                                            <option value="starts-ends-same">Starts & Ends with Same Char</option>
                                            <option value="starts-ends-diff">Starts & Ends with Diff Char</option>
                                            <option value="starts-x-ends-y">Starts with X, Ends with Y</option>
                                        </>
                                    )}
                                    {category === 'specific-string' && (
                                        <option value="exact-match">Exact Match Only</option>
                                    )}
                                    {category === 'length' && (
                                        <>
                                            <option value="exact">Length is Exactly N</option>
                                            <option value="at-least">Length is At Least N</option>
                                            <option value="at-most">Length is At Most N</option>
                                            <option value="divisible-by">Length Divisible by N</option>
                                        </>
                                    )}
                                    {category === 'count' && (
                                        <>
                                            <option value="parity">Count Parity (Odd/Even)</option>
                                            <option value="specific">Exactly N Ones</option>
                                            <option value="at-least-n-zeros">At Least N Zeros</option>
                                            <option value="at-most-n-zeros">At Most N Zeros</option>
                                        </>
                                    )}
                                    {category === 'modulo' && (
                                        <option value="divisible-by">Value Divisible by N</option>
                                    )}
                                </select>
                            </div>

                            {/* Parameter Input */}
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase">
                                    {category === 'substring' ? 'Binary Pattern' :
                                        category === 'count' && subType === 'parity' ? 'Accept Condition' :
                                            'Value (N)'}
                                </label>

                                {category === 'count' && subType === 'parity' ? (
                                    <select
                                        value={param}
                                        onChange={e => setParam(e.target.value)}
                                        className="w-full bg-bg-elevated text-white text-sm rounded-lg p-2 mt-1 border border-border-glass focus:border-primary"
                                    >
                                        <option value="EE">Even 1st char, Even 2nd char</option>
                                        <option value="EO">Even 1st char, Odd 2nd char</option>
                                        <option value="OE">Odd 1st char, Even 2nd char</option>
                                        <option value="OO">Odd 1st char, Odd 2nd char</option>
                                    </select>
                                ) : (
                                    <input
                                        value={param}
                                        onChange={e => {
                                            if (category === 'substring' || category === 'specific-string') {
                                                const valid = Array.from(new Set(alphabetStr.replace(/[\s,]/g, '')))
                                                if (valid.length === 0) valid.push('0', '1')
                                                const regex = new RegExp(`[^${valid.join('')}]`, 'g')
                                                setParam(e.target.value.replace(regex, ''))
                                            } else {
                                                setParam(e.target.value.replace(/[^0-9]/g, ''))
                                            }
                                        }}
                                        className="w-full bg-bg-elevated text-white text-sm rounded-lg p-2 mt-1 border border-border-glass focus:border-primary font-mono"
                                        placeholder={category === 'substring' || category === 'specific-string' ? "aba" : "3"}
                                    />
                                )}
                            </div>

                            <button
                                onClick={generateDFA}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 rounded-lg text-xs uppercase"
                            >
                                Generate DFA
                            </button>
                        </>
                    ) : (
                        /* TM Controls */
                        <>
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase">Algorithm</label>
                                <select
                                    value={param}
                                    onChange={e => setParam(e.target.value)}
                                    className="w-full bg-bg-elevated text-white text-sm rounded-lg p-2 mt-1 border border-border-glass focus:border-secondary"
                                >
                                    <option value="palindrome">Palindrome Detector</option>
                                    <option value="binary-inc">Binary Increment (+1)</option>
                                </select>
                            </div>
                            <button
                                onClick={generateTM}
                                className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-2 rounded-lg text-xs uppercase"
                            >
                                Load Turing Machine
                            </button>
                        </>
                    )}
                </div>
            )}

            <div className="h-px bg-border-glass my-2" />

            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Simulation</h3>
                <div>
                    <label className="text-xs font-bold text-text-muted uppercase">Input String</label>
                    <input
                        value={inputString}
                        onChange={e => {
                            const valid = Array.from(new Set(alphabetStr.replace(/[\s,]/g, '')))
                            if (valid.length === 0) valid.push('0', '1')
                            const regex = new RegExp(`[^${valid.join('')}]`, 'g')
                            setInputString(e.target.value.replace(regex, ''))
                        }}
                        className="w-full bg-bg-elevated text-white text-sm rounded-lg p-2 mt-1 border border-border-glass focus:border-primary font-mono tracking-widest"
                        placeholder="Type string..."
                        disabled={isRunning}
                    />
                </div>

                <div className="flex gap-2">
                    {!isRunning || isPaused ? (
                        <button onClick={runSimulation} className="flex-1 bg-accent-green hover:bg-accent-green/90 text-black font-black py-3 rounded-lg flex items-center justify-center gap-2 uppercase tracking-tighter shadow-lg shadow-accent-green/20">
                            <Play size={16} fill="currentColor" /> {isPaused ? "Resume" : "Test"}
                        </button>
                    ) : (
                        <button onClick={() => { setIsPaused(true); pauseRef.current = true; }} className="flex-1 bg-accent-orange text-black font-black py-3 rounded-lg flex items-center justify-center gap-2 uppercase">
                            <Pause size={16} fill="currentColor" /> Pause
                        </button>
                    )}
                    <button onClick={resetSim} className="px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg">
                        <RotateCcw size={16} />
                    </button>
                </div>

                <input
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                    type="range" min="100" max="1000" step="100"
                    value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                />
            </div>
        </div>
    )

    const Metrics = (
        <div className="grid grid-cols-2 gap-3 h-full">
            <div className={`glass-panel p-3 rounded-xl border-l-4 bg-bg-dark/30 flex flex-col justify-center ${result === 'accepted' ? 'border-success' : result === 'rejected' ? 'border-danger' : 'border-text-muted'}`}>
                <p className="text-[10px] uppercase font-bold text-text-muted">Result</p>
                <p className={`text-lg font-black ${result === 'accepted' ? 'text-success' : result === 'rejected' ? 'text-danger' : 'text-white'}`}>
                    {result ? result.toUpperCase() : "PENDING"}
                </p>
            </div>
            <div className="glass-panel p-3 rounded-xl border-l-4 border-primary bg-bg-dark/30 flex flex-col justify-center">
                <p className="text-[10px] uppercase font-bold text-text-muted">Current State</p>
                <p className="text-xl font-black text-white">{currentState || "-"}</p>
            </div>
        </div>
    )

    return (
        <StitchVisualizerLayout
            title="Automata Machine"
            algoName={mode === 'generator' ? `${machineType}: ${category} (${subType}) - '${param}'` : 'Custom Designer'}
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={history.length > 0 ? `Step ${history.length}: Moved to ${currentState}` : "Define a machine and test an input string."}
            pseudocode=""
            isSorted={result === 'accepted'}
            isRunning={isRunning}
        >
            <div
                className={`relative w-full h-full bg-cyber-grid overflow-hidden flex items-center justify-center ${mode === 'designer' && designerTool === 'addNode' ? 'cursor-crosshair' : ''}`}
                onMouseMove={handleCanvasMouseMove}
                onClick={handleCanvasClick}
            >
                <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-muted)" />
                        </marker>
                        <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="var(--primary)" />
                        </marker>
                        <marker id="arrowhead-selected" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-orange)" />
                        </marker>
                    </defs>

                    {/* Live Dragging Edge for Designer */}
                    {activeEdgeSource && (
                        <line
                            x1={nodes.find(n => n.id === activeEdgeSource)?.x || 0}
                            y1={nodes.find(n => n.id === activeEdgeSource)?.y || 0}
                            x2={mousePos.x}
                            y2={mousePos.y}
                            stroke="var(--secondary)"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                        />
                    )}

                    {edges.map((edge, i) => {
                        const from = nodes.find(n => n.id === edge.from)
                        const to = nodes.find(n => n.id === edge.to)
                        if (!from || !to) return null

                        // Determine if this edge was just used
                        const isRecent = currentState === to.id && history.length > 0 && history[history.length - 1].state === to.id
                        const isSelected = selectedEntity?.type === 'edge' && selectedEntity?.id === i

                        return (
                            <g
                                key={i}
                                className={mode === 'designer' ? 'pointer-events-auto cursor-pointer' : ''}
                                onClick={(e) => handleEdgeClick(e, i)}
                            >
                                {/* Invisible wide line for easier clicking */}
                                {mode === 'designer' && (
                                    <path
                                        d={getEdgePath(from, to, i, edges.length)}
                                        stroke="transparent"
                                        strokeWidth="20"
                                        fill="none"
                                    />
                                )}
                                <path
                                    d={getEdgePath(from, to, i, edges.length)}
                                    stroke={isSelected ? "var(--accent-orange)" : isRecent ? "var(--primary)" : "var(--border-glass)"}
                                    strokeWidth={isRecent || isSelected ? 3 : 2}
                                    fill="none"
                                    markerEnd={isSelected ? "url(#arrowhead-selected)" : isRecent ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                                />
                                <rect
                                    x={(from.x + to.x) / 2 - 15}
                                    y={(from.y + to.y) / 2 - 20}
                                    width="30" height="20"
                                    fill="var(--bg-dark)"
                                    rx="4"
                                    opacity="0.8"
                                />
                                <text
                                    x={(from.x + to.x) / 2}
                                    y={(from.y + to.y) / 2 - 5}
                                    fill={isSelected ? "var(--accent-orange)" : isRecent ? "var(--primary)" : "var(--text-muted)"}
                                    fontSize="12"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                >
                                    {edge.symbol}
                                </text>
                            </g>
                        )
                    })}
                </svg>

                <AnimatePresence>
                    {nodes.map(node => {
                        const isActive = currentState === node.id
                        const isSelected = selectedEntity?.type === 'node' && selectedEntity?.id === node.id
                        const isSource = activeEdgeSource === node.id

                        let borderColor = 'var(--border-glass)'
                        if (isSelected || isSource) borderColor = 'var(--accent-orange)'
                        else if (isActive) borderColor = 'var(--primary)'
                        else if (node.isAccept) borderColor = 'var(--success)'
                        else if (node.id === 'DEAD') borderColor = 'var(--danger)'

                        let boxShadow = 'none'
                        if (isSelected || isSource) boxShadow = '0 0 15px var(--accent-orange)'
                        else if (isActive) boxShadow = '0 0 20px var(--primary)'
                        else if (node.isAccept) boxShadow = '0 0 10px var(--success)'
                        else if (node.id === 'DEAD') boxShadow = '0 0 10px var(--danger)'

                        return (
                            <motion.div
                                key={node.id}
                                layout
                                initial={{ scale: 0 }}
                                animate={{
                                    scale: 1,
                                    borderColor,
                                    boxShadow,
                                    opacity: node.id === 'DEAD' && !isActive ? 0.7 : 1
                                }}
                                onClick={(e) => handleNodeClick(e, node.id)}
                                onDoubleClick={(e) => handleNodeDoubleClick(e, node.id)}
                                onContextMenu={(e) => handleNodeContextMenu(e, node.id)}
                                className={`absolute size-16 rounded-full border-4 flex items-center justify-center font-bold z-10 
                                    ${node.isAccept ? 'double-ring' : ''}
                                    ${node.id === 'DEAD' ? 'bg-danger/10 border-dashed text-danger' : 'bg-bg-elevated'}
                                    ${mode === 'designer' ? 'cursor-pointer hover:border-accent-orange' : ''}
                                    ${designerTool === 'addEdge' && isSource ? 'ring-4 ring-secondary ring-offset-4 ring-offset-bg-dark' : ''}
                                `}
                                style={{
                                    left: node.x - 32,
                                    top: node.y - 32,
                                }}
                            >
                                {node.isStart && <ArrowRight className="absolute -left-8 text-white" />}
                                <span className={node.id === 'DEAD' ? 'text-danger text-2xl drop-shadow-[0_0_8px_var(--danger)]' : 'text-white text-lg'}>
                                    {node.id === 'DEAD' ? '☠️' : node.id}
                                </span>
                                {node.isAccept && <div className="absolute inset-1 rounded-full border-2 border-inherit pointer-events-none" />}
                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                {nodes.length === 0 && (
                    <div className="text-center opacity-50">
                        <Settings size={48} className="mx-auto mb-4 text-text-muted" />
                        <h3 className="text-xl font-bold text-white">No Machine Built</h3>
                        <p className="text-text-muted">Use the Generator to create a DFA</p>
                    </div>
                )}
            </div>

            {/* Input Tape Visualization */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                {machineType === 'TM' && <div className="text-secondary font-bold text-xs uppercase tracking-widest bg-bg-dark/80 px-2 py-1 rounded">Turing Machine Tape</div>}

                <div className={`flex gap-1 p-2 backdrop-blur-md rounded-xl border transition-colors ${machineType === 'TM' ? 'bg-secondary/10 border-secondary/30' : 'bg-black/50 border-border-glass'}`}>
                    {machineType === 'TM'
                        ? (
                            // Infinite Tape Window (Show Head - 4 to Head + 4)
                            Array.from({ length: 9 }).map((_, offset) => {
                                const idx = headPos - 4 + offset
                                const val = tape[idx] || '_'
                                const isHead = idx === headPos
                                return (
                                    <div
                                        key={idx}
                                        className={`size-12 flex flex-col items-center justify-center rounded-lg text-lg font-mono font-bold transition-all border-2
                                            ${isHead ? 'bg-secondary text-white border-white scale-110 z-10 shadow-[0_0_15px_rgba(255,255,255,0.3)]' :
                                                'bg-white/5 text-text-muted border-transparent'}`}
                                    >
                                        <span>{val}</span>
                                        <span className="text-[8px] opacity-50 mt-[-2px]">{idx}</span>
                                    </div>
                                )
                            })
                        )
                        : (
                            // DFA Tape
                            inputString.split('').map((char, i) => (
                                <div
                                    key={i}
                                    className={`size-10 flex items-center justify-center rounded text-lg font-mono font-bold transition-all
                                        ${i === currentStep ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' :
                                            i < currentStep ? 'bg-white/10 text-text-muted' : 'bg-transparent text-white'}`}
                                >
                                    {char}
                                </div>
                            ))
                        )
                    }
                </div>
            </div>

            {/* Custom Edge Prompt Modal */}
            <AnimatePresence>
                {edgePrompt && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9_5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9_5 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <div className="bg-bg-dark border border-border-glass rounded-xl p-6 shadow-2xl w-80 relative">
                            <div className="absolute top-0 right-0 p-3 opacity-50"><Settings size={16} /></div>
                            <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tight">Transition Symbol</h3>
                            <p className="text-xs text-text-muted mb-4">Enter the symbol(s) that trigger this transition (e.g. <span className="text-primary font-mono">0</span>, <span className="text-primary font-mono">1</span>, <span className="text-primary font-mono">a,b</span>)</p>

                            <input
                                autoFocus
                                value={edgePrompt.symbol}
                                onChange={e => setEdgePrompt(prev => ({ ...prev, symbol: e.target.value }))}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && edgePrompt.symbol) {
                                        setEdges(prev => [...prev, { from: edgePrompt.source, to: edgePrompt.target, symbol: edgePrompt.symbol }])
                                        if (soundEnabled) playSuccess()
                                        setEdgePrompt(null)
                                    } else if (e.key === 'Escape') {
                                        setEdgePrompt(null)
                                    }
                                }}
                                className="w-full bg-bg-elevated text-white rounded-lg p-3 border border-border-glass focus:border-primary focus:ring-1 focus:ring-primary font-mono mb-4 outline-none transition-all shadow-inner"
                                placeholder="ex: 0, 1"
                            />

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEdgePrompt(null)}
                                    className="flex-1 py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (edgePrompt.symbol) {
                                            setEdges(prev => [...prev, { from: edgePrompt.source, to: edgePrompt.target, symbol: edgePrompt.symbol }])
                                            if (soundEnabled) playSuccess()
                                            setEdgePrompt(null)
                                        }
                                    }}
                                    className={`flex-1 py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-colors ${edgePrompt.symbol ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20' : 'bg-primary/20 text-white/50 cursor-not-allowed'}`}
                                >
                                    Create Edge
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </StitchVisualizerLayout>
    )
}

export default AutomataVisualizer
