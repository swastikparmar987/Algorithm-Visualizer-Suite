import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Play, Send, Layout, Info, Terminal, Settings, RotateCcw, Code } from 'lucide-react';
import CodeSandbox from '../CodeSandbox'; // Reuse existing editor or create specialized one
import { say } from '../mascot/MascotAssistant';

const ProblemInterface = ({ problem, onBack }) => {
    const [activeTab, setActiveTab] = useState('description');
    const [code, setCode] = useState(problem?.starterCode || '');
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState(null);

    useEffect(() => {
        if (problem) {
            setCode(problem.starterCode);
            setResults(null);

            // AlgoBot Context-Aware Greeting
            const hints = {
                'Arrays': "An array puzzle! Keep an eye on your loop boundaries and index access.",
                'Two Pointers': "A Two Pointers challenge! Try initializing one pointer at the start and one at the end.",
                'Strings': "String manipulation! Remember that strings are immutable in JavaScript, so you might need to build a new one or use arrays.",
                'Hash Table': "Hash Tables are great for O(1) lookups. Think about what you need to use as the 'key'!",
                'Dynamic Programming': "This looks demanding. Remember to break it down into subproblems and store the results to avoid redundant work!",
                'Graphs / BFS': "Graph traversal! For BFS, a Queue is your best friend. For DFS, try recursion or a Stack."
            };

            const defaultHint = problem.difficulty === 'Hard' ? "A tough one! Take your time and plan out the logic before coding." : "Let's crack this logic!";
            const message = hints[problem.category] || defaultHint;

            setTimeout(() => {
                say(message, problem.difficulty === 'Hard' ? 'thinking' : 'excited');
            }, 1000);
        }
    }, [problem]);

    const handleRunCode = async () => {
        if (!window.api || !window.api.executeTestCases) {
            console.error("Test runner API not available");
            return;
        }

        setIsRunning(true);
        try {
            const result = await window.api.executeTestCases({
                code,
                testCases: problem.testCases,
                functionName: problem.functionName,
                inPlace: problem.inPlace || false
            });

            setResults(result);
            setActiveTab('results');

            // AlgoBot Test Case & Error Analysis
            if (result.tests && result.tests.length > 0) {
                const failedTest = result.tests.find(t => t.status !== 'pass');
                if (!failedTest) {
                    say("Incredible! Your algorithm passed all test cases flawlessly. You can move to the next one!", "happy");
                } else if (failedTest.status === 'error') {
                    // Runtime Error Analyst
                    const errMsg = failedTest.actual || '';
                    if (errMsg.includes('not defined')) {
                        say(`Oops! You tried to use a variable that doesn't exist. Did you forget to declare it with 'let' or 'const'?`, "surprised");
                    } else if (errMsg.includes('read properties of undefined')) {
                        say(`Watch out! You're trying to access a property on something that is undefined. Check your variables and objects!`, "surprised");
                    } else if (errMsg.includes('is not a function')) {
                        say(`Type Error! It looks like you're trying to call something that isn't a function.`, "thinking");
                    } else {
                        say(`Crash detected: ${errMsg}. Check for syntax or runtime issues!`, "surprised");
                    }
                } else {
                    // Logic Error Analyst
                    say(`Hmm, Test Case ${failedTest.id + 1} failed. It expected ${failedTest.expected} but your logic returned ${failedTest.actual}.`, "thinking");
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsRunning(false);
        }
    };

    if (!problem) return null;

    return (
        <div className="flex flex-col h-screen bg-[#0d1117] text-slate-300 overflow-hidden">
            {/* Header / Navbar */}
            <div className="h-14 border-b border-slate-800 bg-[#161b22] flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="h-6 w-[1px] bg-slate-800 mx-2" />
                    <h2 className="font-bold text-white flex items-center gap-2">
                        <span className="text-purple-500 font-mono text-sm"># {problem.id}</span>
                        {problem.title}
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRunCode}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-all"
                    >
                        <Play className={`w-4 h-4 ${isRunning ? 'animate-pulse' : ''}`} />
                        Run
                    </button>
                    <button className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-purple-900/20 transition-all">
                        <Send className="w-4 h-4" />
                        Submit
                    </button>
                </div>
            </div>

            {/* Main Content Areas */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Pane: Description & Info */}
                <div className="w-1/2 border-r border-slate-800 flex flex-col bg-[#0d1117]">
                    <div className="flex border-b border-slate-800 px-4">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'description' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500'
                                }`}
                        >
                            Description
                        </button>
                        <button
                            onClick={() => setActiveTab('results')}
                            className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'results' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500'
                                }`}
                        >
                            Test Results
                        </button>
                    </div>

                    <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                        {activeTab === 'description' ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${problem.difficulty === 'Easy' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' :
                                        problem.difficulty === 'Medium' ? 'border-amber-500/30 text-amber-400 bg-amber-500/5' :
                                            'border-rose-500/30 text-rose-400 bg-rose-500/5'
                                        }`}>
                                        {problem.difficulty}
                                    </span>
                                    <span className="text-slate-600 text-xs font-mono">{problem.category}</span>
                                </div>

                                <h1 className="text-2xl font-bold text-white tracking-tight">{problem.title}</h1>

                                <div className="prose prose-invert prose-purple max-w-none text-slate-400 leading-relaxed font-sans">
                                    {problem.description.split('\n').map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>

                                <div className="space-y-4 pt-6">
                                    <h3 className="text-white font-bold flex items-center gap-2">
                                        <Info className="w-4 h-4 text-purple-500" />
                                        Examples
                                    </h3>
                                    {problem.examples.map((ex, i) => (
                                        <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Example {i + 1}</div>
                                            <div className="grid gap-1">
                                                <div className="text-sm"><span className="text-purple-400 font-mono">Input:</span> <code className="text-white/80">{ex.input}</code></div>
                                                <div className="text-sm"><span className="text-purple-400 font-mono">Output:</span> <code className="text-white/80">{ex.output}</code></div>
                                                {ex.explanation && (
                                                    <div className="text-sm"><span className="text-purple-400 font-mono">Explanation:</span> <span className="text-slate-500">{ex.explanation}</span></div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 pt-6 pb-12">
                                    <h3 className="text-white font-bold">Constraints:</h3>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-500">
                                        {problem.constraints.map((c, i) => (
                                            <li key={i}>{c}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {results ? (
                                    results.tests.map((test, i) => (
                                        <div key={i} className={`p-4 rounded-xl border ${test.status === 'pass' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'
                                            }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-[10px] font-bold uppercase ${test.status === 'pass' ? 'text-emerald-400' : 'text-rose-400'
                                                    }`}>
                                                    Test Case {i + 1}
                                                </span>
                                                <div className={`p-1 rounded-full ${test.status === 'pass' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                                    }`}>
                                                    {test.status === 'pass' ? <Settings className="w-3 h-3" /> : <RotateCcw className="w-3 h-3" />}
                                                </div>
                                            </div>
                                            <div className="grid gap-2 font-mono text-xs">
                                                <div><span className="text-slate-500">Input:</span> {test.input}</div>
                                                <div><span className="text-slate-500">Expected:</span> <span className="text-emerald-400">{test.expected}</span></div>
                                                <div><span className="text-slate-500">Actual:</span> <span className={test.status === 'pass' ? 'text-emerald-400' : 'text-rose-400'}>{test.actual}</span></div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                                        <Terminal className="w-12 h-12 mb-4 opacity-20" />
                                        <p>Run your code to see test results</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Pane: Code Editor */}
                <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                    <div className="h-10 border-b border-slate-800 bg-[#161b22] flex items-center px-4 justify-between">
                        <div className="flex items-center gap-2">
                            <Code className="w-4 h-4 text-purple-500" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main.js</span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-slate-600 font-mono">
                            <span>JavaScript</span>
                            <Settings className="w-3 h-3" />
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        {/* We reuse the CodeSandbox editor logic here */}
                        <CodeSandbox
                            embedded={true}
                            initialValue={code}
                            onChange={(val) => setCode(val)}
                        />
                    </div>

                    {/* Bottom Console/Output Area (Optional) */}
                    <div className="h-12 border-t border-slate-800 bg-[#161b22] flex items-center px-4 justify-between shrink-0">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Layout className="w-4 h-4" />
                            <span>Console</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemInterface;
