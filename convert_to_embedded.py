import re

def convert_to_embedded(input_file, output_file, class_name, frame_class_name):
    """Convert standalone visualizer to embedded frame version"""
    
    with open(input_file, 'r') as f:
        content = f.read()
    
    # Replace class definition
    content = re.sub(
        rf'class {class_name}:',
        f'class {frame_class_name}(ctk.CTkFrame):',
        content
    )
    
    # Replace __init__ to accept parent and back_callback
    content = re.sub(
        r'def __init__\(self\):',
        'def __init__(self, parent, back_callback):',
        content
    )
    
    # Replace self = ctk.CTk() with super().__init__(parent)
    content = re.sub(
        r'self\.app = ctk\.CTk\(\)',
        'super().__init__(parent, fg_color=COLORS["bg_dark"])',
        content
    )
    
    # Remove app.title and app.geometry
    content = re.sub(r'\s+self\.app\.title\([^)]+\)\n', '', content)
    content = re.sub(r'\s+self\.app\.geometry\([^)]+\)\n', '', content)
    content = re.sub(r'\s+self\.app\.configure\([^)]+\)\n', '', content)
    
    # Store back_callback
    content = re.sub(
        r'(super\(\).__init__\(parent, fg_color=COLORS\["bg_dark"\]\))',
        r'\1\n        self.back_callback = back_callback',
        content
    )
    
    # Replace self.update() with self.update()
    content = content.replace('self.update()', 'self.update()')
    
    # Replace self.mainloop() with pass in run method
    content = re.sub(
        r'def run\(self\):\s+self\.app\.mainloop\(\)',
        'def run(self):\n        pass  # Not needed for embedded version',
        content
    )
    
    # Remove if __name__ == "__main__" block
    content = re.sub(
        r'if __name__ == "__main__":[^$]*',
        '',
        content,
        flags=re.DOTALL
    )
    
    # Add back button in setup_ui after main_container creation
    # Find main_container pack line and add back button after
    content = re.sub(
        r'(main_container\.pack\(fill="both", expand=True[^)]*\))',
        r'''\1
        
        # Back button
        back_btn_frame = ctk.CTkFrame(main_container, fg_color="transparent")
        back_btn_frame.pack(fill="x", pady=(0, 10))
        
        back_btn = ctk.CTkButton(
            back_btn_frame,
            text="← Back to Menu",
            command=self.back_callback,
            font=FONTS['button'],
            fg_color=COLORS['bg_light'],
            hover_color=COLORS['node_default'],
            height=35,
            width=150,
            corner_radius=10
        )
        back_btn.pack(side="left")''',
        content,
        count=1
    )
    
    with open(output_file, 'w') as f:
        f.write(content)

# Convert all visualizers
conversions = [
    ('sorting_visualizer_embedded.py', 'SortingVisualizer', 'SortingVisualizerFrame'),
    ('searching_visualizer_embedded.py', 'SearchingVisualizer', 'SearchingVisualizerFrame'),
    ('graph_visualizer_embedded.py', 'GraphVisualizer', 'GraphVisualizerFrame'),
    ('tree_visualizer_embedded.py', 'TreeVisualizer', 'TreeVisualizerFrame'),
    ('maze_visualizer_embedded.py', 'MazeVisualizer', 'MazeVisualizerFrame'),
    ('data_structures_visualizer_embedded.py', 'DataStructuresVisualizer', 'DataStructuresVisualizerFrame'),
]

for file, old_class, new_class in conversions:
    convert_to_embedded(file, file, old_class, new_class)
    print(f"Converted {file}")

print("All conversions complete!")
