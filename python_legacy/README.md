# 🎯 Algorithm Visualizer Suite

A comprehensive, stunning algorithm visualization suite with **smooth single-window navigation** and dedicated visualizers for different algorithm categories.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![CustomTkinter](https://img.shields.io/badge/CustomTkinter-5.2+-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Key Features

### 🚀 **Smooth Single-Window Navigation**
- **No Multiple Windows** - Everything in one smooth application
- **Instant Frame Switching** - Fast, responsive navigation
- **Back to Menu** - Easy return from any visualizer
- **No Widget Errors** - Proper cleanup and frame management

### 🏠 **Main Menu**
- **Modern Card-Based Layout** - 6 beautifully designed category cards
- **Hover Effects** - Interactive visual feedback
- **One-Click Launch** - Instant visualizer loading
- **Stunning Dark Theme** - Professional color palette

## 📊 Visualizers Included

### 1. Sorting Algorithms (6 algorithms)
- Bubble Sort, Selection Sort, Insertion Sort
- Merge Sort, Quick Sort, Heap Sort
- **Features:** Animated bars, color-coded operations, live stats

### 2. Searching Algorithms (4 algorithms)
- Linear Search, Binary Search
- Jump Search, Interpolation Search
- **Features:** Box display, target input, comparison tracking

### 3. Graph Algorithms (5 algorithms)
- BFS, DFS, Dijkstra's Shortest Path
- Prim's MST, Kruskal's MST
- **Features:** Circular layout, weighted edges, node highlighting

### 4. Tree Algorithms (4 traversals)
- Inorder, Preorder, Postorder, Level Order
- **Features:** Hierarchical layout, BST operations, result display

### 5. Pathfinding/Maze (3 algorithms)
- BFS, DFS, A* Search
- **Features:** Random mazes, path animation, glowing markers

### 6. Data Structures (3 structures)
- Stack (LIFO), Queue (FIFO), Linked List
- **Features:** Interactive operations, visual feedback

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pip install -r requirements.txt
```

### Launch Application

```bash
python run.py
```

## 🎮 How to Use

1. **Launch** - Run `python run.py`
2. **Select** - Click any category card
3. **Visualize** - Use controls to adjust parameters
4. **Navigate** - Click "← Back to Menu" to return
5. **Explore** - Try different algorithms and settings

## 🎨 What Makes It Special

### Smooth Performance
- ✅ Single window - no multiple windows
- ✅ Fast frame switching
- ✅ Responsive controls
- ✅ No widget destruction errors
- ✅ Optimized animations

### Beautiful Design
- 🎨 Modern dark theme
- 🎨 Vibrant accent colors
- 🎨 Smooth hover effects
- 🎨 Professional typography
- 🎨 Color-coded operations

### Educational Value
- 📚 25+ algorithms visualized
- 📚 Live statistics tracking
- 📚 Step-by-step animations
- 📚 Complexity comparisons
- 📚 Interactive learning

## 📁 Project Structure

```
visalizer/
├── main_menu.py                          # Main application (single window)
├── utils.py                              # Shared utilities
├── *_visualizer_embedded.py              # Embedded visualizer frames
├── *_visualizer.py                       # Standalone versions (legacy)
└── README.md                             # This file
```

## 🎯 Algorithm Complexity Quick Reference

| Algorithm | Time (Avg) | Space | Best For |
|-----------|------------|-------|----------|
| **Sorting** |
| Bubble Sort | O(n²) | O(1) | Small datasets, teaching |
| Quick Sort | O(n log n) | O(log n) | General purpose |
| Merge Sort | O(n log n) | O(n) | Stable sorting |
| **Searching** |
| Linear | O(n) | O(1) | Unsorted data |
| Binary | O(log n) | O(1) | Sorted data |
| **Graph** |
| BFS/DFS | O(V+E) | O(V) | Traversal |
| Dijkstra | O((V+E)log V) | O(V) | Shortest path |

## 🛠️ Technical Details

- **Framework:** CustomTkinter (modern UI)
- **Graphics:** Tkinter Canvas
- **Navigation:** Frame switching (single window)
- **Font:** SF Pro Display
- **Theme:** Dark mode with vibrant accents

## 🎓 Perfect For

- 📖 Computer Science students
- 👨‍🏫 Teaching demonstrations
- 💼 Interview preparation
- 🧠 Algorithm learning
- 🔬 Performance comparison

## 🚀 Performance Improvements

### Before (Multiple Windows)
- ❌ Multiple Tkinter windows
- ❌ Widget destruction errors
- ❌ Slow subprocess launching
- ❌ Memory overhead

### After (Single Window)
- ✅ One smooth application
- ✅ Fast frame switching
- ✅ No widget errors
- ✅ Optimized memory usage

## 📝 License

Open source - free for educational use

## 🙏 Acknowledgments

- **Python** - Programming language
- **CustomTkinter** - Modern UI framework
- **Community** - Algorithm implementations

---

**Made with ❤️ for algorithm enthusiasts**

**Enjoy smooth, beautiful algorithm visualization! 🚀**
