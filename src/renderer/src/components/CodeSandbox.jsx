import React, { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Play, RotateCcw, AlertTriangle, Code2 } from 'lucide-react'
import StitchVisualizerLayout from './common/StitchVisualizerLayout'
import { useAppStore } from '../store/useAppStore'
import { playClick, playStep, playSuccess, playTone } from '../utils/SoundEngine'
import { say } from './mascot/MascotAssistant'

const DEFAULT_CODES = {
    javascript: `// Welcome to the Interactive Code Sandbox!
// We provide an array 'arr' and an API object 'vizAPI'.

async function customSort(arr, api) {
    api.log("Starting custom sort...", "neutral")
    
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            
            api.highlight([j, j + 1], 'primary')
            await api.sleep(100)
            
            if (arr[j] > arr[j + 1]) {
                api.swap(j, j + 1)
                
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                
                api.playSound(arr[j])
            }
            api.highlight([], null) // clear
        }
    }
    
    api.log("Finished sort!", "happy")
    api.success()
}

await customSort(arr, vizAPI);
`,
    python: `# Python Sandbox
# You receive the array as a comma-separated string in sys.argv[1].
# To animate, print specific commands to stdout.
# Commands:
# print("swap:i,j")
# print("highlight:i,j:color")
# print("play:value")
# print("log:Message text:mood")
# print("success")

import sys
import time

def parse_input():
    if len(sys.argv) > 1:
        return [int(x) for x in sys.argv[1].split(',')]
    return []

def bubble_sort(arr):
    n = len(arr)
    print("log:Starting Python Sort:neutral", flush=True)
    
    for i in range(n):
        for j in range(0, n-i-1):
            print(f"highlight:{j},{j+1}:primary", flush=True)
            
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
                print(f"swap:{j},{j+1}", flush=True)
                print(f"play:{arr[j]}", flush=True)
                
            print("highlight::", flush=True) # clear
            
    print("log:Array Sorted!:happy", flush=True)
    print("success", flush=True)

if __name__ == "__main__":
    arr = parse_input()
    bubble_sort(arr)
`,
    cpp: `// C++ Sandbox
// You receive the array as a comma-separated string in argv[1].
// To animate, use cout to print specific commands:
// cout << "swap:i,j\\n";
// cout << "highlight:i,j:color\\n";
// cout << "play:value\\n";
// cout << "log:Message text:mood\\n";
// cout << "success\\n";

#include <iostream>
#include <vector>
#include <sstream>
#include <string>

using namespace std;

vector<int> parse_input(string arg) {
    vector<int> arr;
    stringstream ss(arg);
    string token;
    while (getline(ss, token, ',')) {
        arr.push_back(stoi(token));
    }
    return arr;
}

int main(int argc, char* argv[]) {
    if (argc < 2) return 0;
    
    vector<int> arr = parse_input(argv[1]);
    int n = arr.size();
    
    cout << "log:Starting C++ Sort:neutral\\n";
    
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            cout << "highlight:" << j << "," << j+1 << ":primary\\n";
            
            if (arr[j] > arr[j+1]) {
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
                
                cout << "swap:" << j << "," << j+1 << "\\n";
                cout << "play:" << arr[j] << "\\n";
            }
            cout << "highlight::\\n"; // clear
        }
    }
    
    cout << "log:Sorting Complete!:happy\\n";
    cout << "success\\n";
    
    return 0;
}
`
}

function CodeSandbox({ onBack, embedded = false, initialValue = null, onChange = null }) {
    const [language, setLanguage] = useState('javascript')
    const [code, setCode] = useState(initialValue || DEFAULT_CODES['javascript'])
    const [array, setArray] = useState([])
    const [highlights, setHighlights] = useState({ indices: [], color: null })
    const [isRunning, setIsRunning] = useState(false)
    const [error, setError] = useState(null)
    const [consoleOutput, setConsoleOutput] = useState([])

    const soundEnabled = useAppStore(s => s.soundEnabled)
    const sleepTimeout = useRef(null)

    // Generate random array
    const generateArray = () => {
        const newArr = Array.from({ length: 20 }, () => Math.floor(Math.random() * 90) + 10)
        setArray(newArr)
        setHighlights({ indices: [], color: null })
        setConsoleOutput([])
        setError(null)
    }

    useEffect(() => {
        if (!embedded) generateArray()
        return () => {
            if (sleepTimeout.current) clearTimeout(sleepTimeout.current)
        }
    }, [embedded])

    useEffect(() => {
        if (initialValue) setCode(initialValue)
    }, [initialValue])

    const handleCodeChange = (val) => {
        setCode(val)
        if (onChange) onChange(val)
    }

    const handleLanguageChange = (e) => {
        const lang = e.target.value
        setLanguage(lang)
        setCode(DEFAULT_CODES[lang])
        setConsoleOutput([])
        setError(null)
    }

    const sleep = (ms) => new Promise(resolve => {
        sleepTimeout.current = setTimeout(resolve, ms)
    })

    const runUserCode = async () => {
        if (isRunning) return
        setIsRunning(true)
        setError(null)
        setConsoleOutput([])

        const workingArray = [...array]

        // Native Sandbox API for JavaScript
        const vizAPI = {
            log: (msg, mood) => setConsoleOutput(prev => [...prev, { msg, type: 'info' }]),
            highlight: (indices, color) => setHighlights({ indices, color }),
            swap: (i, j) => {
                setArray(prev => {
                    const next = [...prev]
                    const temp = next[i]
                    next[i] = next[j]
                    next[j] = temp
                    return next
                })
            },
            sleep: sleep,
            playSound: (val) => { if (soundEnabled) playStep(val, 100) },
            success: () => { if (soundEnabled) playSuccess() }
        }

        try {
            if (language === 'javascript') {
                // To allow top-level 'await' in the editor, we wrap the code in an AsyncFunction.
                // We do NOT use template literals mapping '${code}' here because esbuild breaks on nested interpolations.
                // Instead, we just pass the raw 'code' string directly into the function body.
                const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor
                const runner = new AsyncFunction('arr', 'vizAPI', code)

                await runner(workingArray, vizAPI)
                setArray([...workingArray])

            } else {
                // PYTHON / C++ IPC EXECUTION
                if (!window.api || !window.api.executeCode) {
                    throw new Error("IPC Native Execution is not available. Please restart the app.")
                }

                // Call main process to run the binary
                const stdout = await window.api.executeCode(language, code, workingArray)

                // Parse stdout and animate
                const lines = stdout.split('\\n')

                for (let line of lines) {
                    if (!line.trim()) continue;

                    if (line.startsWith('swap:')) {
                        const [i, j] = line.replace('swap:', '').split(',').map(Number)
                        vizAPI.swap(i, j)

                        // Force a slight delay to visualize IPC steps
                        await sleep(50)
                    }
                    else if (line.startsWith('highlight:')) {
                        const parts = line.replace('highlight:', '').split(':')
                        const indices = parts[0] ? parts[0].split(',').map(Number) : []
                        const color = parts[1] || null
                        vizAPI.highlight(indices, color)
                        if (indices.length > 0) await sleep(50)
                    }
                    else if (line.startsWith('log:')) {
                        const parts = line.replace('log:', '').split(':')
                        vizAPI.log(parts[0], parts[1] || 'neutral')
                    }
                    else if (line.startsWith('play:')) {
                        const val = parseInt(line.replace('play:', ''))
                        vizAPI.playSound(val)
                    }
                    else if (line.startsWith('success')) {
                        vizAPI.success()
                    }
                    else {
                        // Raw normal stdout
                        vizAPI.log(line)
                    }
                }
            }
        } catch (err) {
            console.error(err)
            const errMsg = err.message || "Unknown execution error"
            setError(errMsg)
            if (soundEnabled) playTone(150, 300, 'sawtooth')

            // AlgoBot Runtime Error Analysis
            if (errMsg.includes('not defined')) {
                say(`Syntax Error! You tried to use a variable that doesn't exist. Check your spelling or declare it with 'let'.`, "surprised");
            } else if (errMsg.includes('read properties of undefined') || errMsg.includes('Cannot read property')) {
                say(`Null Reference! You're trying to access a property on an undefined object. Check your array iterations!`, "surprised");
            } else if (errMsg.includes('is not a function')) {
                say(`Type Error! It looks like you're trying to call something that isn't a function.`, "thinking");
            } else if (errMsg.includes('Unexpected token')) {
                say(`Syntax Error! There's a typo in your code. Check for missing brackets '}' or parentheses ')'.`, "thinking");
            } else {
                say(`Execution halted: ${errMsg}. Check the console output above for clues!`, "surprised");
            }
        } finally {
            setIsRunning(false)
            setHighlights({ indices: [], color: null })
        }
    }

    const Controls = (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Language</label>
                <div className="relative">
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        disabled={isRunning}
                        className="w-full bg-bg-dark border border-border-glass text-white font-bold py-2 px-3 rounded-lg appearance-none cursor-pointer hover:border-accent-cyan outline-none transition-colors"
                    >
                        <option value="javascript">JavaScript (Browser Native)</option>
                        <option value="python">Python (IPC Node Exec)</option>
                        <option value="cpp">C++ (IPC Node Exec)</option>
                    </select>
                    <Code2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
            </div>

            <button
                onClick={generateArray}
                disabled={isRunning}
                className="w-full bg-bg-elevated hover:bg-white/10 text-white font-bold py-2 rounded-lg text-xs uppercase transition-colors"
            >
                Generate Array
            </button>

            <div className="h-px bg-border-glass my-2" />

            <button
                onClick={runUserCode}
                disabled={isRunning}
                className="w-full bg-accent-green hover:bg-accent-green/90 text-black font-black py-4 rounded-lg flex items-center justify-center gap-2 uppercase tracking-tighter shadow-lg shadow-accent-green/20"
            >
                <Play size={18} fill="currentColor" /> {isRunning ? "Running..." : "Execute Code"}
            </button>

            {error && (
                <div className="bg-danger/20 border border-danger p-3 rounded-lg text-danger text-xs flex gap-2 items-start mt-4 max-h-40 overflow-y-auto">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <span className="font-mono break-words whitespace-pre-wrap">{error}</span>
                </div>
            )}
        </div>
    )

    const Metrics = (
        <div className="glass-panel p-3 rounded-xl border-l-4 border-primary bg-bg-dark/30 h-full flex flex-col">
            <p className="text-[10px] uppercase font-bold text-text-muted sticky top-0 pb-1 mb-2">Console Output / Stdout</p>
            <div className="font-mono text-xs text-text-muted space-y-1 flex-1 overflow-y-auto">
                {consoleOutput.length === 0 ? (
                    <span className="opacity-50">Awaiting execution...</span>
                ) : (
                    consoleOutput.map((out, i) => (
                        <div key={i} className="text-white border-l-2 border-border-glass pl-2">&gt; {out.msg}</div>
                    ))
                )}
            </div>
        </div>
    )

    if (embedded) {
        return (
            <div className="w-full h-full rounded-xl overflow-hidden border border-border-glass shadow-2xl relative">
                <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    value={code}
                    onChange={handleCodeChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: 'JetBrains Mono, monospace',
                        smoothScrolling: true,
                        padding: { top: 16 },
                        roundedSelection: false,
                        scrollBeyondLastLine: false
                    }}
                />
            </div>
        )
    }

    return (
        <StitchVisualizerLayout
            title="Code Sandbox"
            algoName="Multi-Language Terminal"
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={isRunning ? "Executing " + language.toUpperCase() + " custom code..." : "Write " + language.toUpperCase() + " algorithm and interact with the standard output API."}
            pseudocode=""
            isRunning={isRunning}
        >
            <div className="w-full h-full flex flex-col pt-[70px] bg-cyber-grid gap-4 p-4 relative">

                {/* Visualizer Canvas Top Half */}
                <div className="h-1/3 flex items-center justify-center gap-1 bg-black/40 rounded-xl border border-border-glass p-8 relative overflow-hidden">
                    <div className="absolute top-2 left-3 text-[10px] font-black text-white/20 uppercase tracking-widest">{language} Runtime</div>

                    {array.map((val, idx) => {
                        const isHighlighted = highlights.indices.includes(idx)
                        return (
                            <div key={idx} className="flex flex-col justify-end items-center h-full w-full max-w-[40px] group relative">
                                <div
                                    className={`w-full rounded-t-sm transition-all duration-300 relative flex items-end justify-center pb-2 ${isHighlighted ? (highlights.color === 'primary' ? 'bg-primary shadow-[0_0_15px_var(--primary)] text-white font-bold' : 'bg-secondary shadow-[0_0_15px_var(--secondary)] text-white font-bold') : 'bg-white/20 text-text-muted group-hover:bg-white/40'}`}
                                    style={{ height: (val / 100) * 100 + "%" }}
                                >
                                    <span className="text-xs">{val}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Monaco Editor Bottom Half */}
                <div className="h-2/3 w-full rounded-xl overflow-hidden border border-border-glass shadow-2xl relative">
                    <Editor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={code}
                        onChange={handleCodeChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: 'JetBrains Mono, monospace',
                            smoothScrolling: true,
                            padding: { top: 16 },
                            roundedSelection: false,
                            scrollBeyondLastLine: false
                        }}
                    />
                </div>
            </div>
        </StitchVisualizerLayout>
    )
}

export default CodeSandbox
