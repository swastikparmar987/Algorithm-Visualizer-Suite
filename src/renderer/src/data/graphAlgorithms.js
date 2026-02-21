export const GRAPH_ALGO_DATA = {
    'BFS': {
        code: `// Breadth-First Search (BFS)
function BFS(startNode) {
    const queue = [startNode];
    const visited = new Set();
    visited.add(startNode);
    
    while (queue.length > 0) {
        const node = queue.shift();
        
        for (const neighbor of adj[node]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
}`,
        explanation: 'BFS explores the graph layer by layer. It starts at the root (or an arbitrary node) and explores all neighbor nodes at the present depth prior to moving on to the nodes at the next depth level.',
        complexity: { time: 'O(V + E)', space: 'O(V)' }
    },
    'DFS': {
        code: `// Depth-First Search (DFS)
function DFS(node, visited = new Set()) {
    visited.add(node);
    
    for (const neighbor of adj[node]) {
        if (!visited.has(neighbor)) {
            DFS(neighbor, visited);
        }
    }
}`,
        explanation: 'DFS explores as far as possible along each branch before backtracking. It starts at the root (or an arbitrary node) and explores as far as possible along each branch before backtracking.',
        complexity: { time: 'O(V + E)', space: 'O(V)' }
    }
}
