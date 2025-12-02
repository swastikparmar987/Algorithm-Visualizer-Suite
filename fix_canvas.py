"""
Fix for all embedded visualizers - ensures canvas renders properly
"""

import os
import re

def fix_canvas_rendering(filename):
    """Add canvas update_idletasks and proper initialization"""
    
    with open(filename, 'r') as f:
        content = f.read()
    
    # Find the draw method and add update_idletasks before drawing
    # This ensures canvas is properly sized before drawing
    
    # For sorting visualizer - fix draw_array
    if 'draw_array' in content:
        content = re.sub(
            r'(def draw_array\(self[^)]*\):.*?""".*?""")',
            r'\1\n        self.canvas.update_idletasks()  # Ensure canvas is ready',
            content,
            flags=re.DOTALL,
            count=1
        )
    
    # For other visualizers - fix draw methods
    if 'draw_graph' in content:
        content = re.sub(
            r'(def draw_graph\(self[^)]*\):.*?""".*?""")',
            r'\1\n        self.canvas.update_idletasks()  # Ensure canvas is ready',
            content,
            flags=re.DOTALL,
            count=1
        )
    
    if 'draw_tree' in content:
        content = re.sub(
            r'(def draw_tree\(self[^)]*\):.*?""".*?""")',
            r'\1\n        self.canvas.update_idletasks()  # Ensure canvas is ready',
            content,
            flags=re.DOTALL,
            count=1
        )
    
    if 'draw_structure' in content:
        content = re.sub(
            r'(def draw_structure\(self[^)]*\):.*?""".*?""")',
            r'\1\n        self.canvas.update_idletasks()  # Ensure canvas is ready',
            content,
            flags=re.DOTALL,
            count=1
        )
    
    if 'draw_maze' in content:
        content = re.sub(
            r'(def draw_maze\(self[^)]*\):)',
            r'\1\n        self.canvas.update_idletasks()  # Ensure canvas is ready',
            content,
            count=1
        )
    
    # Also add after() call to ensure canvas is fully rendered after setup_ui
    content = re.sub(
        r'(self\.setup_ui\(\))\n(\s+)(self\.(generate_array|generate_graph|generate_tree|draw_structure|draw_maze)\(\))',
        r'\1\n\2# Force canvas to render\n\2self.after(100, self.\3)',
        content
    )
    
    with open(filename, 'w') as f:
        f.write(content)
    
    return True

# Fix all embedded visualizers
files = [
    'sorting_visualizer_embedded.py',
    'searching_visualizer_embedded.py',
    'graph_visualizer_embedded.py',
    'tree_visualizer_embedded.py',
    'maze_visualizer_embedded.py',
    'data_structures_visualizer_embedded.py'
]

for file in files:
    if os.path.exists(file):
        try:
            fix_canvas_rendering(file)
            print(f"✅ Fixed {file}")
        except Exception as e:
            print(f"❌ Error fixing {file}: {e}")

print("\n✅ All visualizers updated with canvas rendering fixes!")
