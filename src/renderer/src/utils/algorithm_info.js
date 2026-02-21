export const ALGORITHM_INFO = {
    // Sorting
    'Bubble Sort': {
        description: 'Bubble Sort is a simple comparison-based sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.',
        complexity: { time: 'O(n²)', space: 'O(1)' },
        features: ['Simple implementation', 'Stable', 'In-place'],
        code: {
            cpp: `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n-1; i++)
        for (int j = 0; j < n-i-1; j++)
            if (arr[j] > arr[j+1])
                swap(arr[j], arr[j+1]);
}`,
            python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]`
        }
    },
    'Selection Sort': {
        description: 'Selection Sort divides the array into sorted and unsorted regions. It repeatedly selects the smallest element from the unsorted region and moves it to the sorted region.',
        complexity: { time: 'O(n²)', space: 'O(1)' },
        features: ['Minimizes swaps', 'In-place'],
        code: {
            cpp: `void selectionSort(int arr[], int n) {
    for (int i = 0; i < n-1; i++) {
        int min_idx = i;
        for (int j = i+1; j < n; j++)
            if (arr[j] < arr[min_idx])
                min_idx = j;
        swap(arr[min_idx], arr[i]);
    }
}`,
            python: `def selection_sort(arr):
    for i in range(len(arr)):
        min_idx = i
        for j in range(i+1, len(arr)):
            if arr[min_idx] > arr[j]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]`
        }
    },
    'Insertion Sort': {
        description: 'Insertion Sort builds a sorted array one element at a time by repeatedly taking the next element and inserting it into its correct position.',
        complexity: { time: 'O(n²)', space: 'O(1)' },
        features: ['Adaptive', 'Stable', 'Online'],
        code: {
            cpp: `void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i], j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
}`
        }
    },
    'Quick Sort': {
        description: 'Quick Sort is a Divide and Conquer algorithm. It picks an element as pivot and partitions the given array around the picked pivot.',
        complexity: { time: 'O(n log n)', space: 'O(log n)' },
        features: ['Fast for large datasets', 'In-place'],
        code: {
            cpp: `int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++; swap(arr[i], arr[j]);
        }
    }
    swap(arr[i+1], arr[high]);
    return i + 1;
}`,
            python: `def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)`
        }
    },
    'Merge Sort': {
        description: 'Merge Sort is a Divide and Conquer algorithm that divides the input array into two halves, calls itself for the two halves, and then merges the two sorted halves.',
        complexity: { time: 'O(n log n)', space: 'O(n)' },
        features: ['Stable', 'Predictable time', 'External sorting'],
        code: {
            cpp: `void merge(int arr[], int l, int m, int r) {
    // Merge two halves...
}`
        }
    },
    'Heap Sort': {
        description: 'Heap Sort is a comparison-based sorting technique based on Binary Heap data structure. It is similar to selection sort where we first find the maximum element and place it at the end.',
        complexity: { time: 'O(n log n)', space: 'O(1)' },
        features: ['In-place', 'Unstable'],
        code: {
            cpp: `void heapify(int arr[], int n, int i) {
    // Maintain heap property...
}`
        }
    },

    // Searching
    'Linear Search': {
        description: 'Linear Search is a simple search algorithm that checks every element in the list until a match is found or the whole list has been searched.',
        complexity: { time: 'O(n)', space: 'O(1)' },
        features: ['No sorting required', 'Works on any data structure'],
        code: {
            python: `def linear_search(arr, x):
    for i in range(len(arr)):
        if arr[i] == x: return i
    return -1`
        }
    },
    'Binary Search': {
        description: 'Binary Search is an efficient algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list that could contain the item.',
        complexity: { time: 'O(log n)', space: 'O(1)' },
        features: ['Efficient', 'Requires sorted array'],
        code: {
            cpp: `int binarySearch(int arr[], int l, int r, int x) {
    while (l <= r) {
        int m = l + (r - l) / 2;
        if (arr[m] == x) return m;
        if (arr[m] < x) l = m + 1;
        else r = m - 1;
    }
    return -1;
}`,
            python: `def binary_search(arr, x):
    l, r = 0, len(arr) - 1
    while l <= r:
        mid = l + (r - l) // 2
        if arr[mid] == x: return mid
        elif arr[mid] < x: l = mid + 1
        else: r = mid - 1
    return -1`
        }
    },
    'Jump Search': {
        description: 'Jump Search works on sorted arrays. It checks fewer elements than linear search by jumping ahead by fixed steps.',
        complexity: { time: 'O(√n)', space: 'O(1)' },
        features: ['Backtracking linear search', 'Good for large arrays'],
        code: {
            python: `def jump_search(arr, x, n):
    step = math.sqrt(n)
    # ... logic ...`
        }
    },
    'Interpolation Search': {
        description: 'Interpolation Search is an improvement over Binary Search for cases where the values in a sorted array are uniformly distributed.',
        complexity: { time: 'O(log log n)', space: 'O(1)' },
        features: ['Formula-based position', 'Super fast for uniform data'],
    },

    // Pathfinding
    'BFS': {
        description: 'Breadth-First Search (BFS) explores all neighbor nodes at the present depth before moving to nodes at the next depth level.',
        complexity: { time: 'O(V + E)', space: 'O(V)' },
        features: ['Finds shortest path in unweighted graphs', 'Systematic search'],
    },
    'Dijkstra': {
        description: "Dijkstra's algorithm finds the shortest path from a starting node to all other nodes in a weighted graph.",
        complexity: { time: 'O(E log V)', space: 'O(V)' },
        features: ['Greedy strategy', 'Shortest path guarantee'],
        code: {
            cpp: `void dijkstra(int src) {
    // ... Dijkstra logic ...
}`
        }
    },
    'A*': {
        description: 'A* (A-Star) search algorithm is an extension of Dijkstra that uses heuristics to speed up the process of finding the shortest path.',
        complexity: { time: 'O(b^d)', space: 'O(b^d)' },
        features: ['Heuristic-driven', 'Optimal and complete'],
    },

    // Graphs
    'BFS Traversal': {
        description: 'BFS explores nodes layer by layer. In graphs, it is used to find connectivity or shortest paths in unweighted systems.',
        complexity: { time: 'O(V + E)', space: 'O(V)' },
        features: ['Level-order', 'Queues'],
    },

    // Trees
    'Inorder': {
        description: 'Inorder Traversal visits the Left subtree, then the Root, and finally the Right subtree. For BST, this results in sorted order.',
        complexity: { time: 'O(n)', space: 'O(h)' },
        features: ['Sorted output for BST', 'Recursive/Iterative'],
    },
    'Preorder': {
        description: 'Preorder Traversal visits the Root, then the Left subtree, and finally the Right subtree.',
        complexity: { time: 'O(n)', space: 'O(h)' },
        features: ['Top-down', 'Tree duplication'],
    },
    'Postorder': {
        description: 'Postorder Traversal visits the Left subtree, then the Right subtree, and finally the Root.',
        complexity: { time: 'O(n)', space: 'O(h)' },
        features: ['Bottom-up', 'Deletion/Cleanup'],
    },

    // Data Structures
    'stack': {
        description: 'Stack is a linear data structure that follows the LIFO (Last In First Out) principle.',
        complexity: { access: 'O(n)', search: 'O(n)', insertion: 'O(1)', deletion: 'O(1)' },
        features: ['LIFO', 'Recursive calls', 'Undo mechanisms'],
    },
    'queue': {
        description: 'Queue is a linear data structure that follows the FIFO (First In First Out) principle.',
        complexity: { access: 'O(n)', search: 'O(n)', insertion: 'O(1)', deletion: 'O(1)' },
        features: ['FIFO', 'Scheduling', 'BFS'],
    },
    'linkedlist': {
        description: 'Linked List is a dynamic data structure where elements are connected via pointers.',
        complexity: { access: 'O(n)', search: 'O(n)', insertion: 'O(1)', deletion: 'O(1)' },
        features: ['Dynamic size', 'No contiguous memory needed'],
    },

    // CPU Scheduling
    'FCFS': {
        description: 'First Come First Serve (FCFS) is the simplest CPU scheduling algorithm. Processes are executed in the order they arrive in the ready queue.',
        complexity: { time: 'O(n)', space: 'O(n)' },
        features: ['Non-preemptive', 'Simple', 'Convoy effect possible'],
        code: {
            cpp: `void fcfs(Process p[], int n) {
    sort(p, p+n, [](auto& a, auto& b) {
        return a.arrival < b.arrival;
    });
    int time = 0;
    for (int i = 0; i < n; i++) {
        if (time < p[i].arrival) time = p[i].arrival;
        p[i].start = time;
        time += p[i].burst;
        p[i].finish = time;
    }
}`,
            python: `def fcfs(processes):
    processes.sort(key=lambda p: p['arrival'])
    time = 0
    for p in processes:
        if time < p['arrival']: time = p['arrival']
        p['start'] = time
        time += p['burst']
        p['finish'] = time`
        }
    },
    'SJF': {
        description: 'Shortest Job First (SJF) Non-Preemptive selects the process with the smallest burst time from the ready queue. Once started, a process runs to completion.',
        complexity: { time: 'O(n²)', space: 'O(n)' },
        features: ['Non-preemptive', 'Optimal avg waiting time', 'Starvation possible'],
        code: {
            cpp: `void sjf(Process p[], int n) {
    int completed = 0, time = 0;
    vector<bool> done(n, false);
    while (completed < n) {
        int idx = -1, minBurst = INT_MAX;
        for (int i = 0; i < n; i++) {
            if (!done[i] && p[i].arrival <= time && p[i].burst < minBurst) {
                minBurst = p[i].burst;
                idx = i;
            }
        }
        if (idx == -1) { time++; continue; }
        p[idx].start = time;
        time += p[idx].burst;
        p[idx].finish = time;
        done[idx] = true;
        completed++;
    }
}`,
            python: `def sjf(processes):
    n = len(processes)
    done = [False] * n
    time = completed = 0
    while completed < n:
        available = [(i, p) for i, p in enumerate(processes) 
                     if not done[i] and p['arrival'] <= time]
        if not available:
            time += 1
            continue
        idx, p = min(available, key=lambda x: x[1]['burst'])
        p['start'] = time
        time += p['burst']
        p['finish'] = time
        done[idx] = True
        completed += 1`
        }
    },
    'SRTF': {
        description: 'Shortest Remaining Time First (SRTF) is the preemptive version of SJF. When a new process arrives with shorter burst time than remaining time of current process, the CPU switches.',
        complexity: { time: 'O(n²)', space: 'O(n)' },
        features: ['Preemptive', 'Optimal', 'Overhead from context switching'],
        code: {
            cpp: `void srtf(Process p[], int n) {
    int completed = 0, time = 0, current = -1;
    while (completed < n) {
        int idx = -1, minRemain = INT_MAX;
        for (int i = 0; i < n; i++) {
            if (p[i].arrival <= time && p[i].remaining > 0 && p[i].remaining < minRemain) {
                minRemain = p[i].remaining;
                idx = i;
            }
        }
        if (idx == -1) { time++; continue; }
        p[idx].remaining--;
        time++;
        if (p[idx].remaining == 0) {
            p[idx].finish = time;
            completed++;
        }
    }
}`,
            python: `def srtf(processes):
    n = len(processes)
    remaining = [p['burst'] for p in processes]
    completed = time = 0
    while completed < n:
        available = [(i, remaining[i]) for i, p in enumerate(processes)
                     if p['arrival'] <= time and remaining[i] > 0]
        if not available:
            time += 1
            continue
        idx = min(available, key=lambda x: x[1])[0]
        remaining[idx] -= 1
        time += 1
        if remaining[idx] == 0:
            processes[idx]['finish'] = time
            completed += 1`
        }
    },
    'RoundRobin': {
        description: 'Round Robin (RR) assigns a fixed time quantum to each process. If a process does not complete within its quantum, it is moved to the back of the queue.',
        complexity: { time: 'O(n * total_burst / quantum)', space: 'O(n)' },
        features: ['Preemptive', 'Fair', 'Time-sharing systems'],
        code: {
            cpp: `void roundRobin(Process p[], int n, int quantum) {
    queue<int> q;
    int time = 0;
    // Add initial processes
    for (int i = 0; i < n && p[i].arrival == 0; i++) q.push(i);
    while (!q.empty()) {
        int i = q.front(); q.pop();
        int exec = min(quantum, p[i].remaining);
        time += exec;
        p[i].remaining -= exec;
        // Add newly arrived processes
        for (int j = 0; j < n; j++)
            if (p[j].arrival <= time && p[j].remaining > 0 && j != i)
                q.push(j);
        if (p[i].remaining > 0) q.push(i);
        else p[i].finish = time;
    }
}`,
            python: `from collections import deque
def round_robin(processes, quantum):
    queue = deque([p for p in processes if p['arrival'] == 0])
    remaining = {p['id']: p['burst'] for p in processes}
    time = 0
    while queue:
        p = queue.popleft()
        exec_time = min(quantum, remaining[p['id']])
        time += exec_time
        remaining[p['id']] -= exec_time
        for proc in processes:
            if proc['arrival'] <= time and remaining[proc['id']] > 0 and proc not in queue:
                queue.append(proc)
        if remaining[p['id']] > 0:
            queue.append(p)
        else:
            p['finish'] = time`
        }
    },

    // Dynamic Programming
    'Fibonacci DP': {
        description: 'Fibonacci using Dynamic Programming stores previously computed values in a table, avoiding redundant calculations. Bottom-up DP iterates from base cases to the target.',
        complexity: { time: 'O(n)', space: 'O(n)' },
        features: ['Memoization', 'Bottom-up', 'Optimal substructure'],
    },
    '0/1 Knapsack': {
        description: 'The 0/1 Knapsack problem uses DP to find the maximum value that can be put in a knapsack of capacity W, where each item can either be included or excluded.',
        complexity: { time: 'O(nW)', space: 'O(nW)' },
        features: ['Pseudo-polynomial', 'Optimization', 'Decision problem'],
    },
    'LCS': {
        description: 'Longest Common Subsequence finds the longest subsequence common to two sequences using a 2D DP table.',
        complexity: { time: 'O(mn)', space: 'O(mn)' },
        features: ['String comparison', 'Diff algorithms', 'Bioinformatics'],
    },
    'Coin Change': {
        description: 'Coin Change finds the minimum number of coins needed to make a given amount using DP.',
        complexity: { time: 'O(n×amount)', space: 'O(amount)' },
        features: ['Optimization', 'Greedy fails here', 'Unbounded knapsack variant'],
    },

    // String Matching
    'KMP': {
        description: 'Knuth-Morris-Pratt algorithm uses a failure function (partial match table) to avoid re-examining characters that have already been matched.',
        complexity: { time: 'O(n+m)', space: 'O(m)' },
        features: ['No backtracking', 'Failure function', 'Linear time'],
    },
    'Rabin-Karp': {
        description: 'Rabin-Karp uses hashing to find pattern matches. It computes hash values for the pattern and text windows, comparing full strings only on hash matches.',
        complexity: { time: 'O(n+m) avg', space: 'O(1)' },
        features: ['Rolling hash', 'Multiple pattern search', 'Probabilistic'],
    },
    'Boyer-Moore': {
        description: 'Boyer-Moore skips sections of the text using two heuristics: bad character and good suffix rules, making it very fast in practice.',
        complexity: { time: 'O(n/m) best', space: 'O(m+σ)' },
        features: ['Right-to-left', 'Bad character rule', 'Fastest in practice'],
    },

    // Backtracking
    'N-Queens': {
        description: 'The N-Queens problem places N queens on an N×N chessboard such that no two queens threaten each other. Solved via backtracking.',
        complexity: { time: 'O(N!)', space: 'O(N²)' },
        features: ['Constraint satisfaction', 'Pruning', 'Classic backtracking'],
    },
    'Sudoku': {
        description: 'Sudoku Solver fills empty cells with digits 1-9 using backtracking, ensuring no row, column, or 3×3 box has repeated digits.',
        complexity: { time: 'O(9^(n²))', space: 'O(n²)' },
        features: ['Constraint propagation', 'Backtracking', 'NP-complete'],
    },

    // Recursion
    'Fibonacci Recursion': {
        description: 'Recursive Fibonacci demonstrates exponential tree growth — each call branches into two sub-calls, creating overlapping subproblems.',
        complexity: { time: 'O(2ⁿ)', space: 'O(n)' },
        features: ['Exponential', 'Overlapping subproblems', 'Tree branching'],
    },
    'Factorial': {
        description: 'Factorial recursion computes n! = n × (n-1)! with base case 0! = 1. It produces a linear call chain.',
        complexity: { time: 'O(n)', space: 'O(n)' },
        features: ['Linear recursion', 'Tail recursion possible', 'Base case: 0! = 1'],
    },

    // Compression
    'Huffman Encoding': {
        description: 'Huffman coding assigns variable-length codes to characters based on frequency — frequent characters get shorter codes, achieving optimal prefix-free compression.',
        complexity: { time: 'O(n log n)', space: 'O(n)' },
        features: ['Greedy', 'Prefix-free', 'Optimal lossless compression'],
    },

    // Concurrency
    'Dining Philosophers': {
        description: 'A classic synchronization problem where five philosophers sit at a table with five forks, alternating between thinking and eating, demonstrating deadlock and resource contention.',
        complexity: { time: 'N/A', space: 'N/A' },
        features: ['Deadlock prevention', 'Mutual exclusion', 'Resource allocation'],
    },
    'Producer-Consumer': {
        description: 'The Producer-Consumer problem involves two processes sharing a fixed-size buffer. The producer adds items while the consumer removes them, requiring synchronization.',
        complexity: { time: 'N/A', space: 'O(buffer size)' },
        features: ['Bounded buffer', 'Semaphores', 'Condition variables'],
    },
    'Deadlock': {
        description: 'Deadlock occurs when two or more processes are blocked forever, each waiting for resources held by the others. Demonstrated via circular wait.',
        complexity: { time: 'N/A', space: 'N/A' },
        features: ['Circular wait', 'Mutual exclusion', 'Four conditions'],
    },

    // Memory Management
    'First Fit': {
        description: 'First Fit allocates the first memory block that is large enough. It is fast but can lead to external fragmentation.',
        complexity: { time: 'O(n)', space: 'O(1)' },
        features: ['Fast', 'External fragmentation', 'First available'],
    },
    'Best Fit': {
        description: 'Best Fit allocates the smallest block that is large enough, minimizing wasted space but requiring a full scan.',
        complexity: { time: 'O(n)', space: 'O(1)' },
        features: ['Minimal waste', 'Slower', 'Small fragments'],
    },
    'Worst Fit': {
        description: 'Worst Fit allocates the largest available block, leaving the biggest remaining space for future allocations.',
        complexity: { time: 'O(n)', space: 'O(1)' },
        features: ['Large remaining blocks', 'Slowest', 'Reduces small fragments'],
    },
    'LRU Page Replacement': {
        description: 'Least Recently Used replaces the page that has not been used for the longest time when a page fault occurs.',
        complexity: { time: 'O(n)', space: 'O(frames)' },
        features: ['Temporal locality', 'Optimal approximation', 'Stack-based'],
    },

    // Disk Scheduling
    'Disk FCFS': {
        description: 'Disk FCFS services requests in arrival order. Simple but can result in large head movements (seek time).',
        complexity: { time: 'O(n)', space: 'O(1)' },
        features: ['Simple', 'Fair', 'High seek time'],
    },
    'SCAN': {
        description: 'SCAN (Elevator) moves the disk head in one direction, servicing requests, then reverses when reaching the end.',
        complexity: { time: 'O(n log n)', space: 'O(1)' },
        features: ['Elevator algorithm', 'Uniform wait', 'No starvation'],
    },
    'C-SCAN': {
        description: 'Circular SCAN services requests in one direction only, jumping back to the start after reaching the end, ensuring uniform wait times.',
        complexity: { time: 'O(n log n)', space: 'O(1)' },
        features: ['Circular', 'Uniform response', 'Variant of SCAN'],
    },
    'LOOK': {
        description: 'LOOK is similar to SCAN but only goes as far as the last request in each direction, not to the end of the disk.',
        complexity: { time: 'O(n log n)', space: 'O(1)' },
        features: ['Efficient SCAN', 'No unnecessary travel', 'Practical variant'],
    }
}
