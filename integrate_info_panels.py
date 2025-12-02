"""
Script to automatically integrate InfoPanel into all visualizers
"""

import re

# Define the visualizer files to update
VISUALIZERS = [
    'searching_visualizer_embedded.py',
    'graph_visualizer_embedded.py',
    'tree_visualizer_embedded.py',
    'maze_visualizer_embedded.py',
    'data_structures_visualizer_embedded.py'
]

def add_imports(content):
    """Add InfoPanel and ALGORITHM_INFO imports"""
    if 'from info_panel import InfoPanel' in content:
        return content
    
    # Find the utils import line
    utils_import = 'from utils import'
    if utils_import in content:
        # Add imports after utils import
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if utils_import in line:
                lines.insert(i + 1, 'from info_panel import InfoPanel')
                lines.insert(i + 2, 'from algorithm_info import ALGORITHM_INFO')
                break
        return '\n'.join(lines)
    return content

def update_grid_config(content):
    """Update grid configuration to add third column for info panel"""
    # Replace 2 columns with 3 columns
    content = re.sub(
        r'# Configure grid: 2 rows, 2 columns',
        '# Configure grid: 2 rows, 3 columns (added info panel column)',
        content
    )
    
    # Update column weights
    content = re.sub(
        r'main_container\.grid_columnconfigure\(0, weight=3\)',
        'main_container.grid_columnconfigure(0, weight=2)  # Canvas',
        content
    )
    
    content = re.sub(
        r'main_container\.grid_columnconfigure\(1, weight=1\)',
        'main_container.grid_columnconfigure(1, weight=1)  # Control panel\n        main_container.grid_columnconfigure(2, weight=1)  # Info panel',
        content
    )
    
    # Update back button colspan
    content = re.sub(
        r'back_btn_frame\.grid\(row=0, column=0, columnspan=2',
        'back_btn_frame.grid(row=0, column=0, columnspan=3',
        content
    )
    
    return content

def add_info_panel(content, default_algorithm):
    """Add InfoPanel widget and initialization"""
    # Find the end of setup_ui method (before the next method definition)
    # Look for the pattern where stats_time is packed
    pattern = r'(self\.stats_time\.pack\(pady=\(2, 10\)\))\s+def '
    
    replacement = r'''\1
        
        # Information Panel (right column)
        self.info_panel = InfoPanel(main_container, width=350)
        self.info_panel.grid(row=1, column=2, sticky="nsew", padx=(10, 0))
        
        # Set initial algorithm info
        self.update_algorithm_info("''' + default_algorithm + r'''")
    
    def '''
    
    content = re.sub(pattern, replacement, content)
    
    return content

def add_update_method(content):
    """Add update_algorithm_info method"""
    # Find on_algorithm_change method and replace it
    pattern = r'def on_algorithm_change\(self, algorithm_name\):\s+"""Called when user selects a different algorithm"""\s+pass'
    
    replacement = '''def on_algorithm_change(self, algorithm_name):
        """Called when user selects a different algorithm"""
        self.update_algorithm_info(algorithm_name)
    
    def update_algorithm_info(self, algorithm_name):
        """Update the information panel with selected algorithm info"""
        if algorithm_name in ALGORITHM_INFO:
            self.info_panel.set_algorithm(ALGORITHM_INFO[algorithm_name])
        else:
            self.info_panel.clear()'''
    
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    return content

def process_file(filepath, default_algorithm):
    """Process a single visualizer file"""
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Apply transformations
        content = add_imports(content)
        content = update_grid_config(content)
        content = add_info_panel(content, default_algorithm)
        content = add_update_method(content)
        
        with open(filepath, 'w') as f:
            f.write(content)
        
        print(f"✅ Updated {filepath}")
        return True
    except Exception as e:
        print(f"❌ Error updating {filepath}: {e}")
        return False

if __name__ == "__main__":
    import os
    
    base_path = "/Users/swastikparmar/Downloads/visalizer"
    
    # Define default algorithms for each visualizer
    defaults = {
        'searching_visualizer_embedded.py': 'Linear Search',
        'graph_visualizer_embedded.py': 'BFS',
        'tree_visualizer_embedded.py': 'Inorder Traversal',
        'maze_visualizer_embedded.py': 'BFS',
        'data_structures_visualizer_embedded.py': 'Stack'
    }
    
    print("🚀 Starting InfoPanel integration...")
    
    for visualizer in VISUALIZERS:
        filepath = os.path.join(base_path, visualizer)
        if os.path.exists(filepath):
            default_algo = defaults.get(visualizer, "")
            process_file(filepath, default_algo)
        else:
            print(f"⚠️  File not found: {filepath}")
    
    print("\n✨ Integration complete!")
