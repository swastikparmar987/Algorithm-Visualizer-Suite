import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const ACHIEVEMENTS = [
    { id: 'first_sort', title: 'First Sort', desc: 'Run your first sorting algorithm', icon: '🎯', xp: 10 },
    { id: 'speed_demon', title: 'Speed Demon', desc: 'Run a sort at max speed', icon: '⚡', xp: 15 },
    { id: 'explorer', title: 'Explorer', desc: 'Visit 5 different visualizers', icon: '🗺️', xp: 20 },
    { id: 'pathfinder', title: 'Pathfinder', desc: 'Complete a pathfinding visualization', icon: '🧭', xp: 15 },
    { id: 'tree_climber', title: 'Tree Climber', desc: 'Run all 3 tree traversals', icon: '🌳', xp: 20 },
    { id: 'dp_master', title: 'DP Master', desc: 'Solve a dynamic programming problem', icon: '🧩', xp: 25 },
    { id: 'battle_winner', title: 'Battle Winner', desc: 'Win an algorithm battle', icon: '⚔️', xp: 30 },
    { id: 'challenger', title: 'Challenger', desc: 'Complete your first challenge', icon: '🏆', xp: 20 },
    { id: 'streak_3', title: 'On Fire', desc: 'Complete 3 daily challenges in a row', icon: '🔥', xp: 40 },
    { id: 'all_sorts', title: 'Sort Master', desc: 'Run all sorting algorithms', icon: '👑', xp: 50 },
    { id: 'night_owl', title: 'Night Owl', desc: 'Use the app after midnight', icon: '🦉', xp: 10 },
    { id: 'data_whiz', title: 'Data Whiz', desc: 'Use all data structures', icon: '📊', xp: 25 },
]

export const useAppStore = create(
    persist(
        (set, get) => ({
            // Theme
            theme: 'cyberpunk',
            setTheme: (name) => set({ theme: name }),

            // Authentication
            isAuthenticated: false,
            userId: null,
            userName: 'Dev',
            login: (userId, userName) => set({ isAuthenticated: true, userId, userName }),
            logout: () => set({ isAuthenticated: false, userId: null, userName: 'Dev' }),

            // Sync MongoDB Data
            loadProgressData: (data) => set((s) => ({
                ...s,
                xp: data.xp || 0,
                level: data.level || 1,
                dailyStreak: data.dailyStreak || 0,
                visitedVisualizers: data.visitedVisualizers || [],
                unlockedAchievements: data.unlockedAchievements || []
            })),

            // Sound
            soundEnabled: false,
            toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

            // XP & Achievements
            xp: 0,
            level: 1,
            unlockedAchievements: [],
            addXP: (amount) =>
                set((s) => {
                    const newXP = s.xp + amount
                    const newLevel = Math.floor(newXP / 100) + 1
                    return { xp: newXP, level: newLevel }
                }),
            unlockAchievement: (id) =>
                set((s) => {
                    if (s.unlockedAchievements.includes(id)) return s
                    const achievement = ACHIEVEMENTS.find((a) => a.id === id)
                    const newXP = s.xp + (achievement?.xp || 0)
                    const newLevel = Math.floor(newXP / 100) + 1
                    return {
                        unlockedAchievements: [...s.unlockedAchievements, id],
                        xp: newXP,
                        level: newLevel
                    }
                }),

            // Tracking
            visitedVisualizers: [],
            markVisualizerVisited: (name) =>
                set((s) => {
                    if (s.visitedVisualizers.includes(name)) return s
                    const next = [...s.visitedVisualizers, name]
                    // Auto-unlock explorer achievement
                    if (next.length >= 5) {
                        const achIds = s.unlockedAchievements
                        if (!achIds.includes('explorer')) {
                            const ach = ACHIEVEMENTS.find((a) => a.id === 'explorer')
                            return {
                                visitedVisualizers: next,
                                unlockedAchievements: [...achIds, 'explorer'],
                                xp: s.xp + (ach?.xp || 0),
                                level: Math.floor((s.xp + (ach?.xp || 0)) / 100) + 1
                            }
                        }
                    }
                    return { visitedVisualizers: next }
                }),

            // Daily Challenge
            dailyStreak: 0,
            lastDailyDate: null,
            completeDailyChallenge: () =>
                set((s) => {
                    const today = new Date().toDateString()
                    if (s.lastDailyDate === today) return s
                    const yesterday = new Date(Date.now() - 86400000).toDateString()
                    const streak = s.lastDailyDate === yesterday ? s.dailyStreak + 1 : 1
                    return { dailyStreak: streak, lastDailyDate: today }
                }),

            // Sort tracking
            sortsRun: [],
            trackSort: (algo) =>
                set((s) => {
                    const next = s.sortsRun.includes(algo) ? s.sortsRun : [...s.sortsRun, algo]
                    return { sortsRun: next }
                }),

            // All achievements data
            allAchievements: ACHIEVEMENTS,

            // Favorites
            favorites: [],
            toggleFavorite: (id) => set((s) => ({
                favorites: s.favorites.includes(id)
                    ? s.favorites.filter(f => f !== id)
                    : [...s.favorites, id]
            })),

            addLeaderboardEntry: (entry) => set((s) => ({
                leaderboard: [...s.leaderboard, { ...entry, date: Date.now() }]
                    .sort((a, b) => b.score - a.score).slice(0, 20)
            })),

            // Reset
            resetProgress: () => set({
                xp: 0,
                level: 1,
                unlockedAchievements: [],
                visitedVisualizers: [],
                dailyStreak: 0,
                lastDailyDate: null,
                sortsRun: [],
                favorites: [],
                isAuthenticated: false,
                user: null
            })
        }),
        {
            name: 'algovisual-store'
        }
    )
)
