import customtkinter as ctk
import random
import time
from collections import deque
import heapq
from typing import Dict, Tuple, Optional, Set
from utils import COLORS, FONTS, SPEED_PRESETS, take_screenshot, ThemeManager

# Constants
ROWS = COLS = 25
CELL = 24

ctk.set_default_color_theme("green")

class MazeVisualizerFrame(ctk.CTkFrame):
    def __init__(self, parent, back_callback):
        super().__init__(parent, fg_color=COLORS["bg_dark"])
        self.back_callback = back_callback        
        # State variables
        self.maze = [[1 for _ in range(COLS)] for _ in range(ROWS)]
        self.start = (1, 1)
        self.end = (ROWS-2, COLS-2)
        self.speed = 0.01
        self.is_running = False
        self.should_stop = False
        self.is_paused = False
        self.stats = {'explored': 0, 'path_length': 0, 'time': 0}
        
        # Register theme change callback
        ThemeManager.register_callback(self.on_theme_change)
        
        self.setup_ui()
        self.draw_maze()
    
    def destroy(self):
        """Override destroy to safely stop operations before cleanup"""
        self.should_stop = True
        ThemeManager.unregister_callback(self.on_theme_change)
        super().destroy()
    
    def on_theme_change(self, theme_name):
        """Callback when theme changes - refresh all colors"""
        if not self.winfo_exists():
            return
        try:
            self.configure(fg_color=COLORS['bg_dark'])
            if not self.is_running:
                self.draw_maze()
        except Exception:
            pass
        
    def setup_ui(self):
        # Main container
        main_container = ctk.CTkFrame(self, fg_color=COLORS['bg_dark'])
        main_container.pack(fill="both", expand=True, padx=10, pady=10)
        
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
        back_btn.pack(side="left")
        
        # Left side - Canvas
        canvas_frame = ctk.CTkFrame(main_container, fg_color=COLORS['bg_medium'], corner_radius=15)
        canvas_frame.pack(side="left", padx=(0, 10), pady=0)
        
        # Title above canvas
        title_label = ctk.CTkLabel(
            canvas_frame, 
            text="🎯 Maze Pathfinding Visualizer",
            font=("SF Pro Display", 20, "bold"),
            text_color=COLORS['text']
        )
        title_label.pack(pady=(10, 5))
        
        self.canvas = ctk.CTkCanvas(
            canvas_frame, 
            width=COLS*CELL, 
            height=ROWS*CELL,
            bg=COLORS['bg_dark'], 
            highlightthickness=0
        )
        self.canvas.pack(padx=10, pady=(5, 10))
        
        # Right side - Control Panel
        control_panel = ctk.CTkFrame(main_container, fg_color=COLORS['bg_medium'], corner_radius=15, width=280)
        control_panel.pack(side="right", fill="y", padx=0, pady=0)
        control_panel.pack_propagate(False)
        
        # Control Panel Title
        panel_title = ctk.CTkLabel(
            control_panel,
            text="⚙️ Control Panel",
            font=("SF Pro Display", 18, "bold"),
            text_color=COLORS['text']
        )
        panel_title.pack(pady=(20, 10))
        
        # Algorithm Selection
        algo_label = ctk.CTkLabel(
            control_panel,
            text="Select Algorithm",
            font=("SF Pro Display", 14, "bold"),
            text_color=COLORS['text']
        )
        algo_label.pack(pady=(10, 5))
        
        self.dropdown = ctk.CTkOptionMenu(
            control_panel,
            values=["BFS - Breadth First Search", "DFS - Depth First Search", "A* - A Star Search"],
            font=("SF Pro Display", 13),
            dropdown_font=("SF Pro Display", 12),
            fg_color=COLORS['accent'],
            button_color=COLORS['accent'],
            button_hover_color=COLORS['button_hover'],
            width=240
        )
        self.dropdown.set("BFS - Breadth First Search")
        self.dropdown.pack(pady=(0, 15))
        
        # Buttons
        self.generate_btn = ctk.CTkButton(
            control_panel,
            text="🎲 Generate New Maze",
            command=self.btn_generate,
            font=("SF Pro Display", 14, "bold"),
            fg_color=COLORS['button_primary'],
            hover_color=COLORS['button_hover'],
            height=40,
            width=240,
            corner_radius=10
        )
        self.generate_btn.pack(pady=8)
        
        self.visualize_btn = ctk.CTkButton(
            control_panel,
            text="▶️ Start Visualization",
            command=self.btn_visualize,
            font=("SF Pro Display", 14, "bold"),
            fg_color=COLORS['accent'],
            hover_color="#6d28d9",
            height=40,
            width=240,
            corner_radius=10
        )
        self.visualize_btn.pack(pady=8)
        
        self.reset_btn = ctk.CTkButton(
            control_panel,
            text="🔄 Reset View",
            command=self.draw_maze,
            font=("SF Pro Display", 14, "bold"),
            fg_color="#374151",
            hover_color="#4b5563",
            height=40,
            width=240,
            corner_radius=10
        )
        self.reset_btn.pack(pady=8)
        
        # Speed Control
        speed_label = ctk.CTkLabel(
            control_panel,
            text="⚡ Animation Speed",
            font=("SF Pro Display", 14, "bold"),
            text_color=COLORS['text']
        )
        speed_label.pack(pady=(20, 5))
        
        self.speed_value_label = ctk.CTkLabel(
            control_panel,
            text="Medium",
            font=("SF Pro Display", 12),
            text_color=COLORS['button_primary']
        )
        self.speed_value_label.pack(pady=(0, 5))
        
        self.speed_slider = ctk.CTkSlider(
            control_panel,
            from_=0.001,
            to=0.05,
            command=self.update_speed,
            width=240,
            progress_color=COLORS['button_primary'],
            button_color=COLORS['button_primary'],
            button_hover_color=COLORS['button_hover']
        )
        self.speed_slider.set(0.01)
        self.speed_slider.pack(pady=(0, 15))
        
        # Statistics Panel
        stats_frame = ctk.CTkFrame(control_panel, fg_color=COLORS['bg_dark'], corner_radius=10)
        stats_frame.pack(pady=(10, 0), padx=20, fill="x")
        
        stats_title = ctk.CTkLabel(
            stats_frame,
            text="📊 Statistics",
            font=("SF Pro Display", 14, "bold"),
            text_color=COLORS['text']
        )
        stats_title.pack(pady=(10, 5))
        
        self.stats_explored = ctk.CTkLabel(
            stats_frame,
            text="Cells Explored: 0",
            font=("SF Pro Display", 12),
            text_color=COLORS['text']
        )
        self.stats_explored.pack(pady=2)
        
        self.stats_path = ctk.CTkLabel(
            stats_frame,
            text="Path Length: 0",
            font=("SF Pro Display", 12),
            text_color=COLORS['text']
        )
        self.stats_path.pack(pady=2)
        
        self.stats_time = ctk.CTkLabel(
            stats_frame,
            text="Time: 0.00s",
            font=("SF Pro Display", 12),
            text_color=COLORS['text']
        )
        self.stats_time.pack(pady=(2, 10))
        
        # Legend
        legend_frame = ctk.CTkFrame(control_panel, fg_color=COLORS['bg_dark'], corner_radius=10)
        legend_frame.pack(pady=(15, 20), padx=20, fill="x")
        
        legend_title = ctk.CTkLabel(
            legend_frame,
            text="🎨 Legend",
            font=("SF Pro Display", 14, "bold"),
            text_color=COLORS['text']
        )
        legend_title.pack(pady=(10, 8))
        
        legends = [
            ("Start Point", COLORS['start']),
            ("End Point", COLORS['end']),
            ("Explored (BFS)", COLORS['bfs_explore']),
            ("Explored (DFS)", COLORS['dfs_explore']),
            ("Explored (A*)", COLORS['astar_explore']),
            ("Final Path", COLORS['final_path'])
        ]
        
        for text, color in legends:
            legend_item = ctk.CTkFrame(legend_frame, fg_color="transparent")
            legend_item.pack(pady=2)
            
            color_box = ctk.CTkLabel(
                legend_item,
                text="  ",
                fg_color=color,
                width=15,
                height=15,
                corner_radius=3
            )
            color_box.pack(side="left", padx=(10, 8))
            
            label = ctk.CTkLabel(
                legend_item,
                text=text,
                font=("SF Pro Display", 11),
                text_color=COLORS['text']
            )
            label.pack(side="left")
        
        ctk.CTkLabel(legend_frame, text="").pack(pady=5)  # Spacing
    
    def update_speed(self, value):
        self.speed = float(value)
        if value < 0.015:
            speed_text = "Very Fast"
        elif value < 0.025:
            speed_text = "Fast"
        elif value < 0.035:
            speed_text = "Medium"
        else:
            speed_text = "Slow"
        self.speed_value_label.configure(text=speed_text)
    
    def draw_maze(self):
        self.canvas.update_idletasks()  # Ensure canvas is ready
        self.canvas.delete("all")
        for r in range(ROWS):
            for c in range(COLS):
                color = COLORS['path'] if self.maze[r][c] == 0 else COLORS['wall']
                self.canvas.create_rectangle(
                    c*CELL, r*CELL,
                    c*CELL+CELL, r*CELL+CELL,
                    fill=color, outline=COLORS['bg_dark'], width=1
                )
        
        # Draw start with glow effect
        self.draw_special_cell(self.start, COLORS['start'])
        # Draw end with glow effect
        self.draw_special_cell(self.end, COLORS['end'])
        
        self.update()
    
    def draw_special_cell(self, pos, color):
        r, c = pos
        # Outer glow
        self.canvas.create_rectangle(
            c*CELL-1, r*CELL-1,
            c*CELL+CELL+1, r*CELL+CELL+1,
            fill=color, outline=color, width=2
        )
        # Inner cell
        self.canvas.create_rectangle(
            c*CELL+2, r*CELL+2,
            c*CELL+CELL-2, r*CELL+CELL-2,
            fill=color, outline=COLORS['bg_dark'], width=1
        )
    
    def generate_maze(self, r, c):
        self.maze[r][c] = 0
        dirs = [(2,0), (-2,0), (0,2), (0,-2)]
        random.shuffle(dirs)
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if 1 <= nr < ROWS-1 and 1 <= nc < COLS-1 and self.maze[nr][nc] == 1:
                self.maze[r + dr//2][c + dc//2] = 0
                self.generate_maze(nr, nc)
    
    def btn_generate(self):
        if self.is_running:
            return
        self.maze = [[1 for _ in range(COLS)] for _ in range(ROWS)]
        self.generate_maze(*self.start)
        self.draw_maze()
        self.reset_stats()
    
    def reset_stats(self):
        self.stats = {'explored': 0, 'path_length': 0, 'time': 0}
        self.update_stats_display()
    
    def update_stats_display(self):
        self.stats_explored.configure(text=f"Cells Explored: {self.stats['explored']}")
        self.stats_path.configure(text=f"Path Length: {self.stats['path_length']}")
        self.stats_time.configure(text=f"Time: {self.stats['time']:.2f}s")
    
    def color_cell(self, r, c, col):
        self.canvas.create_rectangle(
            c*CELL, r*CELL,
            c*CELL+CELL, r*CELL+CELL,
            fill=col, outline=COLORS['bg_dark'], width=1
        )
        self.update()
    
    def get_neighbors(self, r, c):
        neighbors = []
        for dr, dc in [(1,0), (-1,0), (0,1), (0,-1)]:
            nr, nc = r+dr, c+dc
            if 0 <= nr < ROWS and 0 <= nc < COLS and self.maze[nr][nc] == 0:
                neighbors.append((nr, nc))
        return neighbors
    
    def bfs(self, color):
        """Fixed BFS with proper visualization"""
        q = deque([self.start])
        visited = {self.start: None}
        explored_order = []
        
        while q:
            current = q.popleft()
            r, c = current
            
            if current == self.end:
                break
            
            for neighbor in self.get_neighbors(r, c):
                if neighbor not in visited:
                    visited[neighbor] = current
                    q.append(neighbor)
                    explored_order.append(neighbor)
                    
                    if neighbor != self.end:
                        self.color_cell(neighbor[0], neighbor[1], color)
                        self.stats['explored'] += 1
                        self.update_stats_display()
                        time.sleep(self.speed)
        
        return visited
    
    def dfs(self, color):
        """Fixed DFS with proper visualization"""
        stack = [self.start]
        visited = {self.start: None}
        explored_order = []
        
        while stack:
            current = stack.pop()
            
            if current == self.end:
                break
            
            # Get neighbors and reverse to maintain consistent exploration
            neighbors = self.get_neighbors(current[0], current[1])
            neighbors.reverse()  # This helps with visualization consistency
            
            for neighbor in neighbors:
                if neighbor not in visited:
                    visited[neighbor] = current
                    stack.append(neighbor)
                    explored_order.append(neighbor)
                    
                    if neighbor != self.end:
                        self.color_cell(neighbor[0], neighbor[1], color)
                        self.stats['explored'] += 1
                        self.update_stats_display()
                        time.sleep(self.speed)
        
        return visited
    
    def heuristic(self, a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])
    
    def astar(self, color):
        """A* algorithm with proper visualization"""
        pq = [(0, self.start)]
        visited = {self.start: None}
        g_score = {self.start: 0}
        
        while pq:
            _, current = heapq.heappop(pq)
            
            if current == self.end:
                break
            
            for neighbor in self.get_neighbors(current[0], current[1]):
                tentative_g = g_score[current] + 1
                
                if neighbor not in g_score or tentative_g < g_score[neighbor]:
                    g_score[neighbor] = tentative_g
                    f_score = tentative_g + self.heuristic(neighbor, self.end)
                    heapq.heappush(pq, (f_score, neighbor))
                    visited[neighbor] = current
                    
                    if neighbor != self.end:
                        self.color_cell(neighbor[0], neighbor[1], color)
                        self.stats['explored'] += 1
                        self.update_stats_display()
                        time.sleep(self.speed)
        
        return visited
    
    def reconstruct_path(self, visited):
        """Reconstruct and visualize the final path"""
        if self.end not in visited:
            return
        
        path = []
        current = self.end
        
        while current is not None and current in visited:
            path.append(current)
            current = visited[current]
        
        path.reverse()
        self.stats['path_length'] = len(path) - 1
        
        # Animate the path
        for cell in path:
            if cell != self.start and cell != self.end:
                self.color_cell(cell[0], cell[1], COLORS['final_path'])
                time.sleep(0.02)
        
        # Redraw start and end to ensure they're visible
        self.draw_special_cell(self.start, COLORS['start'])
        self.draw_special_cell(self.end, COLORS['end'])
        
        self.update_stats_display()
    
    def btn_visualize(self):
        if self.is_running:
            return
        
        self.is_running = True
        self.visualize_btn.configure(state="disabled")
        self.generate_btn.configure(state="disabled")
        
        self.draw_maze()
        self.reset_stats()
        
        algo = self.dropdown.get()
        start_time = time.time()
        
        try:
            if "BFS" in algo:
                visited = self.bfs(COLORS['bfs_explore'])
            elif "DFS" in algo:
                visited = self.dfs(COLORS['dfs_explore'])
            elif "A*" in algo:
                visited = self.astar(COLORS['astar_explore'])
            
            self.stats['time'] = time.time() - start_time
            self.reconstruct_path(visited)
            
        finally:
            self.is_running = False
            self.visualize_btn.configure(state="normal")
            self.generate_btn.configure(state="normal")
    
    def run(self):
        pass  # Not needed for embedded version

