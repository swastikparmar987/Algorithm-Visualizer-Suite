#!/usr/bin/env python3
"""
Algorithm Visualizer Suite - Launcher
Smooth single-window navigation for 25+ algorithms
"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import and run
from main_menu import AlgorithmVisualizerApp

if __name__ == "__main__":
    print("🎯 Launching Algorithm Visualizer Suite...")
    print("✨ Single-window navigation | 25+ algorithms | Smooth performance")
    print()
    
    app = AlgorithmVisualizerApp()
    app.run()
