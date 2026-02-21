import customtkinter as ctk
from utils import COLORS, FONTS, ThemeManager

ctk.set_default_color_theme("green")

class AlgorithmVisualizerApp:
    def __init__(self):
        # Set initial appearance mode from ThemeManager
        ctk.set_appearance_mode(ThemeManager.get_current_theme())
        
        self.app = ctk.CTk()
        self.app.title("🎯 Algorithm Visualizer Suite")
        self.app.geometry("1400x850")
        self.app.configure(fg_color=COLORS['bg_dark'])
        
        self.current_frame = None
        self.loading = False  # Prevent multiple clicks
        self.is_fullscreen = False
        
        # Register theme change callback
        ThemeManager.register_callback(self.on_theme_change)
        
        # Setup keyboard shortcuts
        self.setup_keyboard_shortcuts()
        
        self.show_main_menu()
    
    def clear_frame(self):
        if self.current_frame:
            self.current_frame.destroy()
            self.current_frame = None
    
    def show_main_menu(self):
        self.clear_frame()
        self.loading = False
        
        self.current_frame = ctk.CTkFrame(self.app, fg_color=COLORS['bg_dark'])
        self.current_frame.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Header
        header_frame = ctk.CTkFrame(self.current_frame, fg_color="transparent")
        header_frame.pack(fill="x", pady=(0, 30))
        
        title = ctk.CTkLabel(
            header_frame,
            text="🎯 Algorithm Visualizer Suite",
            font=("SF Pro Display", 36, "bold"),
            text_color=COLORS['text']
        )
        title.pack(side="left")
        
        # Fullscreen toggle button
        self.fullscreen_btn = ctk.CTkButton(
            header_frame,
            text="⛶",
            width=40,
            height=40,
            command=self.toggle_fullscreen,
            font=("SF Pro Display", 20),
            fg_color=COLORS['bg_medium'],
            hover_color=COLORS['bg_light'],
            corner_radius=10
        )
        self.fullscreen_btn.pack(side="right")
        
        subtitle = ctk.CTkLabel(
            header_frame,
            text="Explore and visualize algorithms in action | Press F11 for fullscreen | T for theme",
            font=("SF Pro Display", 16),
            text_color=COLORS['text_secondary']
        )
        subtitle.pack(pady=(5, 0))
        
        # Cards container
        cards_container = ctk.CTkFrame(self.current_frame, fg_color="transparent")
        cards_container.pack(fill="both", expand=True)
        
        visualizers = [
            ('📊 Sorting Algorithms', 'Bubble, Selection, Insertion, Merge, Quick, Heap Sort', 
             COLORS['gradient_1_start'], 'sorting_visualizer_embedded', 'SortingVisualizerFrame', 0, 0),
            ('🔍 Searching Algorithms', 'Linear, Binary, Jump, Interpolation Search',
             COLORS['gradient_2_start'], 'searching_visualizer_embedded', 'SearchingVisualizerFrame', 0, 1),
            ('🕸️ Graph Algorithms', 'BFS, DFS, Dijkstra, Prim\'s, Kruskal\'s MST',
             COLORS['gradient_3_start'], 'graph_visualizer_embedded', 'GraphVisualizerFrame', 0, 2),
            ('🌳 Tree Algorithms', 'Traversals, BST Operations, AVL Rotations',
             COLORS['gradient_4_start'], 'tree_visualizer_embedded', 'TreeVisualizerFrame', 1, 0),
            ('🎯 Pathfinding (Maze)', 'BFS, DFS, A* in maze environments',
             COLORS['gradient_5_start'], 'maze_visualizer_embedded', 'MazeVisualizerFrame', 1, 1),
            ('📦 Data Structures', 'Stack, Queue, Linked List, Hash Table',
             COLORS['gradient_6_start'], 'data_structures_visualizer_embedded', 'DataStructuresVisualizerFrame', 1, 2),
        ]
        
        # Configure grid
        for i in range(2):
            cards_container.grid_rowconfigure(i, weight=1)
        for i in range(3):
            cards_container.grid_columnconfigure(i, weight=1)
        
        # Create cards with 3px black borders
        for title, desc, color, module, cls, row, col in visualizers:
            self.create_card(cards_container, title, desc, color, module, cls, row, col, 
                             border_width=3, border_color='#000000')
        
        # Footer
        footer = ctk.CTkLabel(
            self.current_frame,
            text="Built with Python & CustomTkinter | Click any card to begin",
            font=("SF Pro Display", 12),
            text_color=COLORS['text_secondary']
        )
        footer.pack(pady=(20, 0))
    
    def create_card(self, parent, title, description, color, module_name, class_name, row, col, border_width=0, border_color=None):
        """Create a visualizer card with optional borders"""
        # Card frame with border support
        card = ctk.CTkFrame(
            parent,
            fg_color=color,
            corner_radius=15,
            border_width=border_width,
            border_color=border_color if border_color else color
        )
        card.grid(row=row, column=col, padx=20, pady=20, sticky="nsew")
        
        # Inner container
        inner = ctk.CTkFrame(card, fg_color="transparent")
        inner.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Title
        title_label = ctk.CTkLabel(
            inner,
            text=title,
            font=("SF Pro Display", 22, "bold"),
            text_color="#ffffff"  # White for contrast
        )
        title_label.pack(pady=(0, 10))
        
        # Description
        desc_label = ctk.CTkLabel(
            inner,
            text=description,
            font=("SF Pro Display", 13),
            text_color="#ffffff",  # White for contrast
            wraplength=250
        )
        desc_label.pack(pady=(0, 20))
        
        # Spacer
        spacer = ctk.CTkFrame(inner, fg_color="transparent", height=20)
        spacer.pack(fill="x", expand=True)
        
        # Launch button - prominent and bold
        launch_btn = ctk.CTkButton(
            inner,
            text="Launch Visualizer",
            font=("SF Pro Display", 16, "bold"),
            fg_color="#000000",  # Black background
            hover_color="#1a1a1a",  # Dark gray on hover
            text_color="#ffffff",  # White text
            height=45,
            corner_radius=10,
            border_width=2,
            border_color="#ffffff"  # White border
        )
        launch_btn.pack(fill="x", pady=(0, 0))
        
        # CRITICAL: Bind to ButtonRelease instead of using command
        # This ensures the click is registered immediately
        def on_button_release(event):
            if not self.loading:
                self.loading = True
                self.load_visualizer(module_name, class_name)
        
        launch_btn.bind("<ButtonRelease-1>", on_button_release)
        
        # Also make the entire card clickable
        def on_card_click(event):
            if not self.loading:
                self.loading = True
                self.load_visualizer(module_name, class_name)
        
        card.bind("<Button-1>", on_card_click)
        
        # Hover effects
        def on_enter(e):
            card.configure(border_color=COLORS['button_primary'])
        
        def on_leave(e):
            card.configure(border_color=color)
        
        card.bind("<Enter>", on_enter)
        card.bind("<Leave>", on_leave)
    
    def darken_color(self, hex_color):
        hex_color = hex_color.lstrip('#')
        r, g, b = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        r, g, b = int(r * 0.8), int(g * 0.8), int(b * 0.8)
        return f'#{r:02x}{g:02x}{b:02x}'
    
    def load_visualizer(self, module_name, class_name):
        self.clear_frame()
        
        try:
            module = __import__(module_name, fromlist=[class_name])
            visualizer_class = getattr(module, class_name)
            
            self.current_frame = visualizer_class(self.app, self.show_main_menu)
            self.current_frame.pack(fill="both", expand=True)
            
        except Exception as e:
            self.loading = False
    
    def toggle_theme(self):
        """Toggle between dark and light theme"""
        from tkinter import messagebox
        
        # Toggle theme
        ThemeManager.toggle_theme()
        current_theme = ThemeManager.get_current_theme()
        
        # Show message to user
        messagebox.showinfo(
            "Theme Changed",
            f"Theme changed to {current_theme} mode.\n\n"
            "Please restart the application to see the changes:\n"
            "python run.py"
        )
    
    def on_theme_change(self, theme_name):
        """Callback when theme changes"""
        pass
    
    def toggle_fullscreen(self):
        """Toggle fullscreen mode"""
        self.is_fullscreen = not self.is_fullscreen
        self.app.attributes('-fullscreen', self.is_fullscreen)
        # Update button icon
        icon = "⛶" if not self.is_fullscreen else "⛉"
        if hasattr(self, 'fullscreen_btn'):
            self.fullscreen_btn.configure(text=icon)
    
    def setup_keyboard_shortcuts(self):
        """Setup global keyboard shortcuts"""
        # F11 for fullscreen
        self.app.bind('<F11>', lambda e: self.toggle_fullscreen())
        # Escape to exit fullscreen
        self.app.bind('<Escape>', lambda e: self.exit_fullscreen())
        # T for theme toggle
        self.app.bind('<t>', lambda e: self.toggle_theme())
        self.app.bind('<T>', lambda e: self.toggle_theme())
    
    def exit_fullscreen(self):
        """Exit fullscreen mode"""
        if self.is_fullscreen:
            self.is_fullscreen = False
            self.app.attributes('-fullscreen', False)
            if hasattr(self, 'fullscreen_btn'):
                self.fullscreen_btn.configure(text="⛶")
    
    def run(self):
        self.app.mainloop()

if __name__ == "__main__":
    app = AlgorithmVisualizerApp()
    app.run()
