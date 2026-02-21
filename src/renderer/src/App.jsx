import React, { lazy, Suspense, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Dashboard from './components/Dashboard'
import AuthScreen from './components/AuthScreen'
import OTPVerification from './components/OTPVerification'
import { useAppStore } from './store/useAppStore'
import { playNavigate, stopAllSounds } from './utils/SoundEngine'

// Lazy-load all visualizers and features for code splitting
const SortingVisualizer = lazy(() => import('./components/SortingVisualizer'))
const SearchingVisualizer = lazy(() => import('./components/SearchingVisualizer'))
const PathfindingVisualizer = lazy(() => import('./components/PathfindingVisualizer'))
const DataStructuresVisualizer = lazy(() => import('./components/DataStructuresVisualizer'))
const GraphVisualizer = lazy(() => import('./components/GraphVisualizer'))
const TreeVisualizer = lazy(() => import('./components/TreeVisualizer'))
const CPUSchedulingVisualizer = lazy(() => import('./components/CPUSchedulingVisualizer'))
const DPVisualizer = lazy(() => import('./components/DPVisualizer'))
const StringMatchingVisualizer = lazy(() => import('./components/StringMatchingVisualizer'))
const BacktrackingVisualizer = lazy(() => import('./components/BacktrackingVisualizer'))
const RecursionTreeVisualizer = lazy(() => import('./components/RecursionTreeVisualizer'))
const CompressionVisualizer = lazy(() => import('./components/CompressionVisualizer'))
const ConcurrencyVisualizer = lazy(() => import('./components/ConcurrencyVisualizer'))
const MemoryVisualizer = lazy(() => import('./components/MemoryVisualizer'))
const DiskSchedulingVisualizer = lazy(() => import('./components/DiskSchedulingVisualizer'))

// Gamification
const AlgorithmBattle = lazy(() => import('./components/battle/AlgorithmBattle'))
const ChallengeMode = lazy(() => import('./components/challenges/ChallengeMode'))
const AchievementSystem = lazy(() => import('./components/gamification/AchievementSystem'))
const QuizMode = lazy(() => import('./components/gamification/QuizMode'))
const PuzzleMode = lazy(() => import('./components/gamification/PuzzleMode'))
const AlgorithmDetective = lazy(() => import('./components/gamification/AlgorithmDetective'))

// Learning
const ComplexityAnalyzer = lazy(() => import('./components/learning/ComplexityAnalyzer'))
const AlgorithmComparator = lazy(() => import('./components/learning/AlgorithmComparator'))
const CodeSandbox = lazy(() => import('./components/CodeSandbox'))
const StepDebugger = lazy(() => import('./components/learning/StepDebugger'))
const SpaceComplexityVisualizer = lazy(() => import('./components/learning/SpaceComplexityVisualizer'))
const AlgorithmTimeline = lazy(() => import('./components/learning/AlgorithmTimeline'))

// New Phase 2 Visualizers
const HashingVisualizer = lazy(() => import('./components/HashingVisualizer'))
const NetworkFlowVisualizer = lazy(() => import('./components/NetworkFlowVisualizer'))
const ConvexHullVisualizer = lazy(() => import('./components/ConvexHullVisualizer'))
const BTreeVisualizer = lazy(() => import('./components/BTreeVisualizer'))
const RegexVisualizer = lazy(() => import('./components/RegexVisualizer'))
const FFTVisualizer = lazy(() => import('./components/FFTVisualizer'))
const AutomataVisualizer = lazy(() => import('./components/AutomataVisualizer'))

// Phase 4: Next-Gen
const GraphVisualizer3D = lazy(() => import('./components/GraphVisualizer3D'))

// New Mascot
const MascotAssistant = lazy(() => import('./components/mascot/MascotAssistant'))

// Phase 5: Practice Engine
const PracticeMode = lazy(() => import('./components/practice/PracticeMode'))
const ProblemInterface = lazy(() => import('./components/practice/ProblemInterface'))

// Phase 6: Academy
const AcademyDashboard = lazy(() => import('./components/academy/AcademyDashboard'))
const TutorialViewer = lazy(() => import('./components/academy/TutorialViewer'))

const LoadingSpinner = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <motion.div
            style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border-glass)', borderTop: '3px solid var(--primary)' }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        />
    </div>
)

function App() {
    const [currentView, setCurrentView] = useState('dashboard')
    const [selectedProblem, setSelectedProblem] = useState(null)
    const [selectedTutorial, setSelectedTutorial] = useState(null)
    const [verifyingEmail, setVerifyingEmail] = useState(null)

    const {
        theme, soundEnabled, markVisualizerVisited,
        isAuthenticated, login, loadProgressData,
        xp, level, dailyStreak, visitedVisualizers, unlockedAchievements, userId
    } = useAppStore()

    // Real-time Cloud Sync
    useEffect(() => {
        if (isAuthenticated && userId) {
            const progressData = { xp, level, dailyStreak, visitedVisualizers, unlockedAchievements };
            window.api.authSyncProgress({ userId, progressData })
                .catch(err => console.error("Cloud Sync Error:", err));
        }
    }, [xp, level, dailyStreak, visitedVisualizers.length, unlockedAchievements.length, isAuthenticated, userId]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
    }, [theme])

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape' && currentView !== 'dashboard') {
                if (currentView === 'solve') setCurrentView('practice')
                else setCurrentView('dashboard')
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [currentView])

    const handleNavigate = (view) => {
        stopAllSounds() // Cut off previous algo sounds
        setCurrentView(view)
        if (soundEnabled) playNavigate()
        if (view !== 'dashboard' && view !== 'practice' && view !== 'solve') markVisualizerVisited(view)
    }

    const handleProblemSelect = (problem) => {
        setSelectedProblem(problem)
        handleNavigate('solve')
    }

    const goBack = () => {
        stopAllSounds() // Cut off previous algo sounds
        setCurrentView('dashboard')
    }

    const ROUTES = {
        'dashboard': () => <Dashboard onNavigate={handleNavigate} />,
        'sorting': () => <SortingVisualizer onBack={goBack} />,
        'searching': () => <SearchingVisualizer onBack={goBack} />,
        'pathfinding': () => <PathfindingVisualizer onBack={goBack} />,
        'data-structures': () => <DataStructuresVisualizer onBack={goBack} />,
        'graph': () => <GraphVisualizer onBack={goBack} onNavigate={handleNavigate} />,
        'tree': () => <TreeVisualizer onBack={goBack} />,
        'cpu-scheduling': () => <CPUSchedulingVisualizer onBack={goBack} />,
        'dp': () => <DPVisualizer onBack={goBack} />,
        'string-matching': () => <StringMatchingVisualizer onBack={goBack} />,
        'backtracking': () => <BacktrackingVisualizer onBack={goBack} />,
        'recursion': () => <RecursionTreeVisualizer onBack={goBack} />,
        'compression': () => <CompressionVisualizer onBack={goBack} />,
        'concurrency': () => <ConcurrencyVisualizer onBack={goBack} />,
        'memory': () => <MemoryVisualizer onBack={goBack} />,
        'disk': () => <DiskSchedulingVisualizer onBack={goBack} />,
        // Gamification
        'battle': () => <AlgorithmBattle onBack={goBack} />,
        'challenges': () => <ChallengeMode onBack={goBack} />,
        'achievements': () => <AchievementSystem onBack={goBack} />,
        'quiz': () => <QuizMode onBack={goBack} />,
        'puzzle-mode': () => <PuzzleMode onBack={goBack} />,
        'detective': () => <AlgorithmDetective onBack={goBack} />,
        // Learning
        'complexity': () => <ComplexityAnalyzer onBack={goBack} />,
        'comparator': () => <AlgorithmComparator onBack={goBack} />,
        'step-debugger': () => <StepDebugger onBack={goBack} />,
        'space-complexity': () => <SpaceComplexityVisualizer onBack={goBack} />,
        'algo-timeline': () => <AlgorithmTimeline onBack={goBack} />,
        // Phase 2 Visualizers
        'hashing': () => <HashingVisualizer onBack={goBack} />,
        'network-flow': () => <NetworkFlowVisualizer onBack={goBack} />,
        'convex-hull': () => <ConvexHullVisualizer onBack={goBack} />,
        'btree': () => <BTreeVisualizer onBack={goBack} />,
        'regex': () => <RegexVisualizer onBack={goBack} />,
        'fft': () => <FFTVisualizer onBack={goBack} />,
        'automata': () => <AutomataVisualizer onBack={goBack} />,
        'sandbox': () => <CodeSandbox onBack={goBack} />,
        'graph3d': () => <GraphVisualizer3D onBack={goBack} />,
        // Phase 5: Practice
        'practice': () => <PracticeMode onSelectProblem={handleProblemSelect} />,
        'solve': () => <ProblemInterface problem={selectedProblem} onBack={() => handleNavigate('practice')} />,
        // Phase 6: Academy
        'academy': () => <AcademyDashboard onNavigate={handleNavigate} onSelectTutorial={handleTutorialSelect} />,
        'academy-view': () => <TutorialViewer tutorial={selectedTutorial} onBack={() => handleNavigate('academy')} />,
    }

    const handleTutorialSelect = (tutorial) => {
        setSelectedTutorial(tutorial);
        handleNavigate('academy-view');
    };

    const renderView = () => {
        const factory = ROUTES[currentView] || ROUTES['dashboard']
        return factory()
    }

    const renderAuthGateway = () => {
        if (verifyingEmail) {
            return (
                <OTPVerification
                    email={verifyingEmail}
                    onVerifySuccess={(userId, userName, progressData) => {
                        loadProgressData(progressData);
                        login(userId, userName);
                        setVerifyingEmail(null);
                    }}
                    onCancel={() => setVerifyingEmail(null)}
                />
            );
        }

        return (
            <AuthScreen
                onLoginSuccess={(userId, userName, progressData) => {
                    loadProgressData(progressData);
                    login(userId, userName);
                }}
                onRequireOtp={(email) => setVerifyingEmail(email)}
            />
        );
    }

    return (
        <div className="app-container" style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
            {!isAuthenticated ? (
                renderAuthGateway()
            ) : (
                <>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentView}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <Suspense fallback={<LoadingSpinner />}>
                                {renderView()}
                            </Suspense>
                        </motion.div>
                    </AnimatePresence>

                    <div className="glow" style={{ position: 'fixed', top: '10%', left: '10%', width: '30vw', height: '30vh', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', zIndex: -1, pointerEvents: 'none' }} />
                    <div className="glow" style={{ position: 'fixed', bottom: '10%', right: '10%', width: '40vw', height: '40vh', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)', zIndex: -1, pointerEvents: 'none' }} />

                    <Suspense fallback={null}>
                        <MascotAssistant />
                    </Suspense>
                </>
            )}
        </div>
    )
}

export default App
