import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, RotateCcw, MousePointer2, Grid, Map, Compass, Zap, Box } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { playClick, playStep, playSuccess, playTone } from '../utils/SoundEngine'
import StitchVisualizerLayout from './common/StitchVisualizerLayout'

function PathfindingVisualizer({ onBack }) {
    const ROWS = 15
    const COLS = 29 // Adjusted for odd numbers for better mazes

    const [algorithm, setAlgorithm] = useState('Dijkstra')
    const [speed, setSpeed] = useState(10) // ms delay

    // Initial State generator
    const createGrid = () => {
        const g = []
        for (let r = 0; r < ROWS; r++) {
            const row = []
            for (let c = 0; c < COLS; c++) {
                row.push({
                    r, c,
                    isStart: r === 7 && c === 4,
                    isEnd: r === 7 && c === 24,
                    isWall: false,
                    isVisited: false,
                    isPath: false,
                    distance: Infinity,
                    totalDistance: Infinity, // f-score for A*
                    previous: null
                })
            }
            g.push(row)
        }
        return g
    }

    const [grid, setGrid] = useState(createGrid)
    const [isRunning, setIsRunning] = useState(false)
    const [stats, setStats] = useState({ visited: 0, pathLength: 0 })

    const soundEnabled = useAppStore(s => s.soundEnabled)
    const stopRef = useRef(false)

    // HANDLE RESIZE / RESET
    const resetGrid = (keepWalls = false) => {
        stopRef.current = true
        // Short timeout to allow running loops to stop
        setTimeout(() => {
            stopRef.current = false
            setGrid(prev => {
                const newGrid = createGrid()
                if (keepWalls) {
                    for (let r = 0; r < ROWS; r++) {
                        for (let c = 0; c < COLS; c++) {
                            newGrid[r][c].isWall = prev[r][c].isWall
                        }
                    }
                }
                return newGrid
            })
            setStats({ visited: 0, pathLength: 0 })
            setIsRunning(false)
            if (soundEnabled) playClick()
        }, 50)
    }

    const toggleWall = (r, c) => {
        if (isRunning) return
        if (grid[r][c].isStart || grid[r][c].isEnd) return
        const newGrid = [...grid]
        newGrid[r][c].isWall = !newGrid[r][c].isWall
        setGrid(newGrid)
        if (soundEnabled) playTone(200 + (r * c), 20)
    }

    const clearWalls = () => {
        if (isRunning) return
        setGrid(createGrid())
        setStats({ visited: 0, pathLength: 0 })
        if (soundEnabled) playClick()
    }

    // --- MAZE GENERATION (Recursive Division) ---
    const generateMaze = async () => {
        if (isRunning) return
        setIsRunning(true)
        resetGrid(false) // Clear everything first

        // Wait for reset
        await new Promise(r => setTimeout(r, 60))

        const newGrid = createGrid()
        // Add outer walls
        for (let r = 0; r < ROWS; r++) {
            newGrid[r][0].isWall = true; newGrid[r][COLS - 1].isWall = true;
        }
        for (let c = 0; c < COLS; c++) {
            newGrid[0][c].isWall = true; newGrid[ROWS - 1][c].isWall = true;
        }
        setGrid([...newGrid])

        await recursiveDivision(newGrid, 1, ROWS - 2, 1, COLS - 2)
        setIsRunning(false)
    }

    const recursiveDivision = async (g, rowStart, rowEnd, colStart, colEnd) => {
        if (rowEnd < rowStart || colEnd < colStart) return

        const horizontal = rowEnd - rowStart > colEnd - colStart

        if (horizontal) {
            if (rowEnd - rowStart < 2) return
            const y = Math.floor(Math.random() * (rowEnd - rowStart - 1)) + rowStart + 1
            const wallRow = y % 2 === 0 ? y : y + 1 // Even walls
            if (wallRow > rowEnd) return

            const passage = Math.floor(Math.random() * (colEnd - colStart + 1)) + colStart
            const passageCol = passage % 2 !== 0 ? passage : passage + 1 // Odd passage

            for (let c = colStart; c <= colEnd; c++) {
                if (c !== passageCol && !g[wallRow][c].isStart && !g[wallRow][c].isEnd) {
                    g[wallRow][c].isWall = true
                }
            }
            setGrid([...g])
            if (soundEnabled) playTone(300, 10)
            await new Promise(r => setTimeout(r, 10))

            await recursiveDivision(g, rowStart, wallRow - 1, colStart, colEnd)
            await recursiveDivision(g, wallRow + 1, rowEnd, colStart, colEnd)
        } else {
            if (colEnd - colStart < 2) return
            const x = Math.floor(Math.random() * (colEnd - colStart - 1)) + colStart + 1
            const wallCol = x % 2 === 0 ? x : x + 1
            if (wallCol > colEnd) return

            const passage = Math.floor(Math.random() * (rowEnd - rowStart + 1)) + rowStart
            const passageRow = passage % 2 !== 0 ? passage : passage + 1

            for (let r = rowStart; r <= rowEnd; r++) {
                if (r !== passageRow && !g[r][wallCol].isStart && !g[r][wallCol].isEnd) {
                    g[r][wallCol].isWall = true
                }
            }
            setGrid([...g])
            if (soundEnabled) playTone(300, 10)
            await new Promise(r => setTimeout(r, 10))

            await recursiveDivision(g, rowStart, rowEnd, colStart, wallCol - 1)
            await recursiveDivision(g, rowStart, rowEnd, wallCol + 1, colEnd)
        }
    }

    // --- ALGORITHMS ---
    const runAlgorithm = async () => {
        if (isRunning) return
        setIsRunning(true)
        if (soundEnabled) playClick()

        // Reset path only
        const newGrid = grid.map(row => row.map(node => ({
            ...node,
            isVisited: false,
            isPath: false,
            distance: Infinity,
            totalDistance: Infinity,
            previous: null
        })))
        setGrid(newGrid)
        setStats({ visited: 0, pathLength: 0 })

        stopRef.current = false

        if (algorithm === 'Dijkstra') await dijkstra(newGrid)
        else if (algorithm === 'A* Search') await aStar(newGrid)
        else if (algorithm === 'BFS') await bfs(newGrid)
        else if (algorithm === 'DFS') await dfs(newGrid)

        setIsRunning(false)
    }

    const getNeighbors = (node, g) => {
        const neighbors = []
        const { r, c } = node
        if (r > 0) neighbors.push(g[r - 1][c])
        if (r < ROWS - 1) neighbors.push(g[r + 1][c])
        if (c > 0) neighbors.push(g[r][c - 1])
        if (c < COLS - 1) neighbors.push(g[r][c + 1])
        return neighbors.filter(n => !n.isWall)
    }

    const dijkstra = async (g) => {
        const startNode = g[7][4]
        const endNode = g[7][24]
        startNode.distance = 0

        const unvisited = []
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) unvisited.push(g[r][c])

        while (unvisited.length) {
            if (stopRef.current) return
            unvisited.sort((a, b) => a.distance - b.distance)
            const closest = unvisited.shift()

            if (closest.distance === Infinity) return
            closest.isVisited = true

            if (closest === endNode) {
                await animatePath(endNode, g)
                return
            }

            const neighbors = getNeighbors(closest, g)
            for (const n of neighbors) {
                if (!n.isVisited) {
                    const alt = closest.distance + 1
                    if (alt < n.distance) {
                        n.distance = alt
                        n.previous = closest
                    }
                }
            }

            if (stats.visited % 3 === 0) setGrid([...g])
            setStats(prev => ({ ...prev, visited: prev.visited + 1 }))
            if (soundEnabled) playStep(closest.distance, 50)
            await new Promise(r => setTimeout(r, speed))
        }
    }

    const aStar = async (g) => {
        const startNode = g[7][4]
        const endNode = g[7][24]

        const heuristic = (n) => Math.abs(n.r - endNode.r) + Math.abs(n.c - endNode.c)

        startNode.distance = 0
        startNode.totalDistance = heuristic(startNode)

        let openSet = [startNode]

        while (openSet.length > 0) {
            if (stopRef.current) return
            openSet.sort((a, b) => a.totalDistance - b.totalDistance)
            const current = openSet.shift()

            if (current === endNode) {
                await animatePath(endNode, g)
                return
            }

            current.isVisited = true
            const neighbors = getNeighbors(current, g)

            for (const n of neighbors) {
                if (n.isVisited) continue

                const tentativeG = current.distance + 1
                if (tentativeG < n.distance) {
                    n.previous = current
                    n.distance = tentativeG
                    n.totalDistance = n.distance + heuristic(n)
                    if (!openSet.includes(n)) openSet.push(n)
                }
            }

            if (stats.visited % 3 === 0) setGrid([...g])
            setStats(prev => ({ ...prev, visited: prev.visited + 1 }))
            if (soundEnabled) playStep(current.totalDistance, 50)
            await new Promise(r => setTimeout(r, speed))
        }
    }

    const bfs = async (g) => {
        const startNode = g[7][4]
        const endNode = g[7][24]
        const queue = [startNode]
        startNode.isVisited = true

        while (queue.length) {
            if (stopRef.current) return
            const current = queue.shift()

            if (current === endNode) {
                await animatePath(endNode, g)
                return
            }

            const neighbors = getNeighbors(current, g)
            for (const n of neighbors) {
                if (!n.isVisited) {
                    n.isVisited = true
                    n.previous = current
                    n.distance = current.distance + 1
                    queue.push(n)
                }
            }
            if (stats.visited % 3 === 0) setGrid([...g])
            setStats(prev => ({ ...prev, visited: prev.visited + 1 }))
            if (soundEnabled) playStep(current.distance, 50)
            await new Promise(r => setTimeout(r, speed))
        }
    }

    const dfs = async (g) => {
        const startNode = g[7][4]
        const endNode = g[7][24]
        const stack = [startNode]
        let depth = 0

        while (stack.length) {
            if (stopRef.current) return
            const current = stack.pop()

            if (!current.isVisited) {
                current.isVisited = true
                if (current === endNode) {
                    await animatePath(endNode, g)
                    return
                }

                const neighbors = getNeighbors(current, g)
                for (const n of neighbors) {
                    if (!n.isVisited) {
                        n.previous = current
                        stack.push(n)
                    }
                }
            }

            if (stats.visited % 3 === 0) setGrid([...g])
            setStats(prev => ({ ...prev, visited: prev.visited + 1 }))
            if (soundEnabled) playStep(stats.visited, 200) // Pitch up as we search more
            await new Promise(r => setTimeout(r, speed))
        }
    }


    const animatePath = async (endNode, g) => {
        let curr = endNode
        let path = []
        while (curr) {
            path.push(curr)
            curr = curr.previous
        }
        path.reverse()

        for (const node of path) {
            if (stopRef.current) return
            node.isPath = true
            setGrid([...g])
            setStats(prev => ({ ...prev, pathLength: prev.pathLength + 1 }))
            if (soundEnabled) playStep(node.distance, path.length)
            await new Promise(r => setTimeout(r, 40))
        }
        if (soundEnabled) playSuccess()
    }


    const Controls = (
        <>
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Protocol</h3>
                <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    disabled={isRunning}
                    className="w-full bg-bg-elevated border border-border-glass text-white text-sm rounded-lg p-2.5 focus:ring-primary focus:border-primary block"
                >
                    <option>Dijkstra</option>
                    <option>A* Search</option>
                    <option>BFS</option>
                    <option>DFS</option>
                </select>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Terrain</h3>
                <button
                    onClick={generateMaze}
                    disabled={isRunning}
                    className="w-full bg-bg-elevated hover:bg-white/5 border border-border-glass text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs uppercase"
                >
                    <Grid size={14} /> Generate Maze
                </button>
                <button
                    onClick={clearWalls}
                    disabled={isRunning}
                    className="w-full bg-bg-elevated hover:bg-white/5 border border-border-glass text-text-muted hover:text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs uppercase"
                >
                    <Box size={14} /> Clear Walls
                </button>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-300">Delay</label>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">{speed}ms</span>
                </div>
                <input
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    type="range" min="0" max="100" step="5"
                    value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={runAlgorithm} disabled={isRunning} className="lego-button col-span-2 bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-lg flex items-center justify-center gap-2 uppercase tracking-tighter shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Play size={18} fill="currentColor" />
                    {isRunning ? "Scanning..." : "Visualize"}
                </button>

                <button onClick={() => resetGrid(true)} disabled={isRunning} className="lego-button col-span-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed">
                    <RotateCcw size={14} />
                    Reset Path
                </button>
            </div>
        </>
    )

    const Metrics = (
        <>
            <div className="glass-panel p-4 rounded-xl border-l-4 border-accent-cyan bg-bg-dark/30">
                <p className="text-[10px] uppercase font-bold text-text-muted">Explored</p>
                <p className="text-2xl font-black text-white tabular-nums">{stats.visited}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border-l-4 border-success bg-bg-dark/30">
                <p className="text-[10px] uppercase font-bold text-text-muted">Path</p>
                <p className="text-2xl font-black text-white tabular-nums">{stats.pathLength}</p>
            </div>
        </>
    )

    const Logs = isRunning
        ? `Running ${algorithm}... Exploring nodes.`
        : stats.pathLength > 0
            ? `${algorithm} complete. Target reached in ${stats.pathLength} steps.`
            : "Grid System Ready. Draw walls or generate a maze."

    const pseudocode = algorithm === 'A* Search' ? `function A_Star(start, goal):
  openSet = {start}
  gScore[start] = 0
  fScore[start] = h(start)

  while openSet not empty:
    current = node with lowest fScore
    if current == goal: return path
    
    openSet.remove(current)
    for neighbor in neighbors(current):
      tentative_g = gScore[current] + d(current, neighbor)
      if tentative_g < gScore[neighbor]:
        gScore[neighbor] = tentative_g
        fScore[neighbor] = gScore[neighbor] + h(neighbor)
        if neighbor not in openSet:
          openSet.add(neighbor)`
        : algorithm === 'DFS' ? `function DFS(node):
  if node == goal: return true
  visited.add(node)
  
  for neighbor in neighbors(node):
    if neighbor not in visited:
      if DFS(neighbor): return true
      
  return false`
            : `function Dijkstra(grid, start, end):
  for node in grid: dist[node] = Infinity
  dist[start] = 0
  Q.add(start)

  while Q is not empty:
    u = Q.removeMin()
    if u == end: break
    
    for v in neighbors(u):
      alt = u.dist + 1
      if alt < v.dist:
        v.dist = alt
        v.prev = u
        Q.add(v)`

    return (
        <StitchVisualizerLayout
            title="Pathfinding"
            algoName={algorithm}
            onBack={onBack}
            controls={Controls}
            metrics={Metrics}
            logs={Logs}
            pseudocode={pseudocode}
            isSorted={stats.pathLength > 0}
            isRunning={isRunning}
        >
            <div className="flex items-center justify-center w-full h-full p-6 overflow-hidden bg-cyber-grid">
                <div
                    className="grid gap-[2px] bg-bg-elevated p-2 rounded-2xl border border-border-glass shadow-2xl relative"
                    style={{
                        gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                        aspectRatio: `${COLS}/${ROWS}`,
                        width: '100%',
                        maxWidth: '900px'
                    }}
                >
                    {grid.map((row) => row.map((node) => (
                        <motion.div
                            key={`${node.r}-${node.c}`}
                            onMouseDown={() => toggleWall(node.r, node.c)}
                            onMouseEnter={(e) => { if (e.buttons === 1) toggleWall(node.r, node.c) }}
                            initial={false}
                            animate={{
                                backgroundColor: node.isStart ? 'var(--success)'
                                    : node.isEnd ? 'var(--danger)'
                                        : node.isWall ? '#334155'
                                            : node.isPath ? 'var(--accent-orange)'
                                                : node.isVisited ? 'rgba(123, 37, 244, 0.5)'
                                                    : 'rgba(255,255,255,0.03)',
                                scale: node.isPath || node.isStart || node.isEnd ? 1.1 : 1,
                                borderRadius: node.isWall ? '25%' : '4px',
                                boxShadow: node.isStart ? '0 0 15px var(--success)'
                                    : node.isEnd ? '0 0 15px var(--danger)'
                                        : node.isPath ? '0 0 10px var(--accent-orange)'
                                            : 'none'
                            }}
                            transition={{ duration: 0.2 }}
                            className="w-full h-full cursor-pointer relative"
                        >
                            {/* Icons for start/end */}
                            {node.isStart && <div className="absolute inset-0 flex items-center justify-center text-black font-bold"><Zap size={14} fill="currentColor" /></div>}
                            {node.isEnd && <div className="absolute inset-0 flex items-center justify-center text-black font-bold"><Map size={14} fill="currentColor" /></div>}
                        </motion.div>
                    )))}
                </div>
            </div>
        </StitchVisualizerLayout>
    )
}

export default PathfindingVisualizer
