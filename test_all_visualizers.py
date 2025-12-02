#!/usr/bin/env python3
"""
Test each visualizer to identify rendering issues
"""

import customtkinter as ctk
from utils import COLORS

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("green")

def test_visualizer(name, module_name, class_name):
    """Test a single visualizer"""
    print(f"\n{'='*60}")
    print(f"Testing: {name}")
    print(f"{'='*60}")
    
    try:
        # Create test window
        app = ctk.CTk()
        app.title(f"Test: {name}")
        app.geometry("1200x800")
        app.configure(fg_color=COLORS['bg_dark'])
        
        # Import and create visualizer
        module = __import__(module_name, fromlist=[class_name])
        visualizer_class = getattr(module, class_name)
        
        def close_test():
            app.destroy()
        
        # Create visualizer frame
        frame = visualizer_class(app, close_test)
        frame.pack(fill="both", expand=True)
        
        print(f"✅ {name} created successfully!")
        print(f"   Close the window to test next visualizer...")
        
        # Run briefly to check for errors
        app.after(2000, lambda: print(f"   {name} is running..."))
        app.after(4000, lambda: app.destroy())  # Auto-close after 4 seconds
        
        app.mainloop()
        
        print(f"✅ {name} - PASSED")
        return True
        
    except Exception as e:
        print(f"❌ {name} - FAILED")
        print(f"   Error: {e}")
        import traceback
        traceback.print_exc()
        return False

# Test all visualizers
visualizers = [
    ("Sorting", "sorting_visualizer_embedded", "SortingVisualizerFrame"),
    ("Searching", "searching_visualizer_embedded", "SearchingVisualizerFrame"),
    ("Graph", "graph_visualizer_embedded", "GraphVisualizerFrame"),
    ("Tree", "tree_visualizer_embedded", "TreeVisualizerFrame"),
    ("Maze", "maze_visualizer_embedded", "MazeVisualizerFrame"),
    ("Data Structures", "data_structures_visualizer_embedded", "DataStructuresVisualizerFrame"),
]

print("\n" + "="*60)
print("VISUALIZER TESTING SUITE")
print("="*60)
print("Each visualizer will open for 4 seconds")
print("Watch for any errors or blank screens")
print("="*60)

results = {}
for name, module, cls in visualizers:
    results[name] = test_visualizer(name, module, cls)

print("\n" + "="*60)
print("TEST RESULTS SUMMARY")
print("="*60)
for name, passed in results.items():
    status = "✅ PASSED" if passed else "❌ FAILED"
    print(f"{name}: {status}")
print("="*60 + "\n")
