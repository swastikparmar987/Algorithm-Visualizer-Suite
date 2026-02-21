import customtkinter as ctk
import random
import time
import math
from collections import deque
import heapq
from utils import COLORS, FONTS, Statistics, get_speed_label, SPEED_PRESETS, take_screenshot, ThemeManager

ctk.set_default_color_theme("green")

class GraphVisualizerFrame(ctk.CTkFrame):
    def __init__(self, parent, back_callback):
        super().__init__(parent, fg_color=COLORS["bg_dark"])
        self.back_callback = back_callback        
        # State variables
        self.nodes = []
        self.edges = []
        self.num_nodes = 10
        self.edge_density = 0.3
        self.weighted = True
        self.speed = 0.1
        self.is_running = False
        self.should_stop = False
        self.stats = Statistics()
        
        # Register theme change callback
        ThemeManager.register_callback(self.on_theme_change)
        
        self.setup_ui()
        self.generate_graph()
    
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
                self.draw_graph()
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
        canvas_frame.pack(side="left", fill="both", expand=True, padx=(0, 10))
        
        # Title
        title_label = ctk.CTkLabel(
            canvas_frame,
            text="🕸️ Graph Algorithm Visualizer",
            font=FONTS['title'],
            text_color=COLORS['text']
        )
        title_label.pack(pady=(15, 10))
        
        # Canvas
        self.canvas = ctk.CTkCanvas(
            canvas_frame,
            width=1000,
            height=600,
            bg=COLORS['bg_dark'],
            highlightthickness=0
        )
        self.canvas.pack(padx=15, pady=(5, 15), fill="both", expand=True)
        
        # Right side - Control Panel
        control_panel = ctk.CTkFrame(main_container, fg_color=COLORS['bg_medium'], corner_radius=15, width=320)
        control_panel.pack(side="right", fill="y")
        control_panel.pack_propagate(False)
        
        # Control Panel Title
        panel_title = ctk.CTkLabel(
            control_panel,
            text="⚙️ Control Panel",
            font=FONTS['heading'],
            text_color=COLORS['text']
        )
        panel_title.pack(pady=(20, 15))
        
        # Algorithm Selection
        algo_label = ctk.CTkLabel(
            control_panel,
            text="Select Algorithm",
            font=FONTS['subheading'],
            text_color=COLORS['text']
        )
        algo_label.pack(pady=(10, 5))
        
        self.algo_dropdown = ctk.CTkOptionMenu(
            control_panel,
            values=[
                "BFS - Breadth First",
                "DFS - Depth First",
                "Dijkstra's Shortest Path",
                "Prim's MST",
                "Kruskal's MST"
            ],
            font=FONTS['body'],
            dropdown_font=FONTS['body'],
            fg_color=COLORS['accent'],
            button_color=COLORS['accent'],
            button_hover_color=COLORS['button_secondary_hover'],
            width=280
        )
        self.algo_dropdown.set("BFS - Breadth First")
        self.algo_dropdown.pack(pady=(0, 15))
        
        # Number of Nodes
        nodes_label = ctk.CTkLabel(
            control_panel,
            text="Number of Nodes",
            font=FONTS['subheading'],
            text_color=COLORS['text']
        )
        nodes_label.pack(pady=(10, 5))
        
        self.nodes_value_label = ctk.CTkLabel(
            control_panel,
            text=f"{self.num_nodes} nodes",
            font=FONTS['body'],
            text_color=COLORS['button_primary']
        )
        self.nodes_value_label.pack(pady=(0, 5))
        
        self.nodes_slider = ctk.CTkSlider(
            control_panel,
            from_=5,
            to=15,
            command=self.update_nodes,
            width=280,
            progress_color=COLORS['button_primary'],
            button_color=COLORS['button_primary'],
            button_hover_color=COLORS['button_hover']
        )
        self.nodes_slider.set(self.num_nodes)
        self.nodes_slider.pack(pady=(0, 15))
        
        # Edge Density
        density_label = ctk.CTkLabel(
            control_panel,
            text="Edge Density",
            font=FONTS['subheading'],
            text_color=COLORS['text']
        )
        density_label.pack(pady=(10, 5))
        
        self.density_value_label = ctk.CTkLabel(
            control_panel,
            text=f"{int(self.edge_density * 100)}%",
            font=FONTS['body'],
            text_color=COLORS['button_primary']
        )
        self.density_value_label.pack(pady=(0, 5))
        
        self.density_slider = ctk.CTkSlider(
            control_panel,
            from_=0.2,
            to=0.7,
            command=self.update_density,
            width=280,
            progress_color=COLORS['button_primary'],
            button_color=COLORS['button_primary'],
            button_hover_color=COLORS['button_hover']
        )
        self.density_slider.set(self.edge_density)
        self.density_slider.pack(pady=(0, 15))
        
        # Speed Control
        speed_label = ctk.CTkLabel(
            control_panel,
            text="⚡ Animation Speed",
            font=FONTS['subheading'],
            text_color=COLORS['text']
        )
        speed_label.pack(pady=(10, 5))
        
        self.speed_value_label = ctk.CTkLabel(
            control_panel,
            text=get_speed_label(self.speed),
            font=FONTS['body'],
            text_color=COLORS['button_primary']
        )
        self.speed_value_label.pack(pady=(0, 5))
        
        self.speed_slider = ctk.CTkSlider(
            control_panel,
            from_=0.05,
            to=0.5,
            command=self.update_speed,
            width=280,
            progress_color=COLORS['button_primary'],
            button_color=COLORS['button_primary'],
            button_hover_color=COLORS['button_hover']
        )
        self.speed_slider.set(self.speed)
        self.speed_slider.pack(pady=(0, 10))
        
        # Speed preset buttons
        speed_presets_frame = ctk.CTkFrame(control_panel, fg_color="transparent")
        speed_presets_frame.pack(pady=(0, 15))
        
        for preset_key in ['instant', 'fast', 'medium', 'slow']:
            preset = SPEED_PRESETS[preset_key]
            btn = ctk.CTkButton(
                speed_presets_frame,
                text=preset['emoji'],
                width=60,
                height=30,
                command=lambda v=preset['value']: self.set_speed_preset(v),
                font=FONTS['body'],
                fg_color=COLORS['bg_dark'],
                hover_color=COLORS['accent']
            )
            btn.pack(side="left", padx=2)
        
        # Screenshot button
        screenshot_btn = ctk.CTkButton(
            control_panel,
            text="📸 Screenshot",
            command=self.take_screenshot,
            font=FONTS['button'],
            fg_color=COLORS['bg_dark'],
            hover_color=COLORS['bg_light'],
            height=35,
            width=280,
            corner_radius=10
        )
        screenshot_btn.pack(pady=(0, 15))
        
        # Buttons
        self.generate_btn = ctk.CTkButton(
            control_panel,
            text="🎲 Generate New Graph",
            command=self.generate_graph,
            font=FONTS['button'],
            fg_color=COLORS['button_primary'],
            hover_color=COLORS['button_hover'],
            height=40,
            width=280,
            corner_radius=10
        )
        self.generate_btn.pack(pady=8)
        
        self.visualize_btn = ctk.CTkButton(
            control_panel,
            text="▶️ Start Visualization",
            command=self.start_visualization,
            font=FONTS['button'],
            fg_color=COLORS['accent'],
            hover_color=COLORS['button_secondary_hover'],
            height=40,
            width=280,
            corner_radius=10
        )
        self.visualize_btn.pack(pady=8)
        
        # Statistics Panel
        stats_frame = ctk.CTkFrame(control_panel, fg_color=COLORS['bg_dark'], corner_radius=10)
        stats_frame.pack(pady=(15, 20), padx=20, fill="x")
        
        stats_title = ctk.CTkLabel(
            stats_frame,
            text="📊 Statistics",
            font=FONTS['subheading'],
            text_color=COLORS['text']
        )
        stats_title.pack(pady=(10, 5))
        
        self.stats_nodes = ctk.CTkLabel(
            stats_frame,
            text="Nodes Visited: 0",
            font=FONTS['body'],
            text_color=COLORS['text']
        )
        self.stats_nodes.pack(pady=2)
        
        self.stats_edges = ctk.CTkLabel(
            stats_frame,
            text="Edges Used: 0",
            font=FONTS['body'],
            text_color=COLORS['text']
        )
        self.stats_edges.pack(pady=2)
        
        self.stats_time = ctk.CTkLabel(
            stats_frame,
            text="Time: 0.00s",
            font=FONTS['body'],
            text_color=COLORS['text']
        )
        self.stats_time.pack(pady=(2, 10))
    
    def update_nodes(self, value):
        if not self.is_running:
            self.num_nodes = int(value)
            self.nodes_value_label.configure(text=f"{self.num_nodes} nodes")
            self.generate_graph()
    
    def update_density(self, value):
        if not self.is_running:
            self.edge_density = float(value)
            self.density_value_label.configure(text=f"{int(self.edge_density * 100)}%")
            self.generate_graph()
    
    def set_speed_preset(self, speed_value):
        """Set speed from preset button"""
        self.speed = speed_value
        self.speed_slider.set(speed_value)
        self.speed_value_label.configure(text=get_speed_label(self.speed))
    
    def take_screenshot(self):
        """Take screenshot of the canvas"""
        take_screenshot(self.canvas)
    
    def update_speed(self, value):
        self.speed = float(value)
        self.speed_value_label.configure(text=get_speed_label(self.speed))
    
    def generate_graph(self):
        if self.is_running:
            return
        
        self.nodes = []
        self.edges = []
        
        # Generate node positions in a circle
        canvas_width = 1000
        canvas_height = 600
        center_x = canvas_width // 2
        center_y = canvas_height // 2
        radius = min(canvas_width, canvas_height) // 2 - 80
        
        for i in range(self.num_nodes):
            angle = 2 * math.pi * i / self.num_nodes
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)
            self.nodes.append({'id': i, 'x': x, 'y': y})
        
        # Generate edges
        for i in range(self.num_nodes):
            for j in range(i + 1, self.num_nodes):
                if random.random() < self.edge_density:
                    weight = random.randint(1, 20)
                    self.edges.append({'from': i, 'to': j, 'weight': weight})
        
        # Ensure graph is connected
        self.ensure_connected()
        
        self.stats.reset()
        self.update_stats_display()
        self.draw_graph()
    
    def ensure_connected(self):
        """Ensure the graph is connected by adding edges if needed"""
        if not self.nodes:
            return
        
        # Simple check: ensure each node has at least one edge
        connected = set()
        if self.edges:
            for edge in self.edges:
                connected.add(edge['from'])
                connected.add(edge['to'])
        
        # Connect isolated nodes
        for i in range(self.num_nodes):
            if i not in connected:
                # Connect to a random connected node or node 0
                target = random.choice(list(connected)) if connected else 0
                if target != i:
                    weight = random.randint(1, 20)
                    self.edges.append({'from': i, 'to': target, 'weight': weight})
                    connected.add(i)
    
    def draw_graph(self, visited_nodes=None, visited_edges=None, current_node=None):
        """Draw the graph"""
        self.canvas.update_idletasks()  # Ensure canvas is ready
        self.canvas.delete("all")
        
        visited_nodes = visited_nodes or set()
        visited_edges = visited_edges or set()
        
        # Draw edges
        for edge in self.edges:
            from_node = self.nodes[edge['from']]
            to_node = self.nodes[edge['to']]
            
            edge_key = tuple(sorted([edge['from'], edge['to']]))
            if edge_key in visited_edges:
                color = COLORS['edge_active']
                width = 3
            else:
                color = COLORS['edge_default']
                width = 2
            
            # Draw line
            self.canvas.create_line(
                from_node['x'], from_node['y'],
                to_node['x'], to_node['y'],
                fill=color,
                width=width
            )
            
            # Draw weight
            mid_x = (from_node['x'] + to_node['x']) / 2
            mid_y = (from_node['y'] + to_node['y']) / 2
            self.canvas.create_text(
                mid_x, mid_y,
                text=str(edge['weight']),
                font=FONTS['small'],
                fill=COLORS['text_secondary'],
                tags='weight'
            )
        
        # Draw nodes
        for node in self.nodes:
            node_id = node['id']
            
            if node_id == current_node:
                color = COLORS['comparing']
                border = COLORS['comparing']
            elif node_id in visited_nodes:
                color = COLORS['node_visited']
                border = COLORS['node_visited']
            else:
                color = COLORS['node_default']
                border = COLORS['path']
            
            # Draw circle
            radius = 25
            self.canvas.create_oval(
                node['x'] - radius, node['y'] - radius,
                node['x'] + radius, node['y'] + radius,
                fill=color,
                outline=border,
                width=2
            )
            
            # Draw node ID
            self.canvas.create_text(
                node['x'], node['y'],
                text=str(node_id),
                font=FONTS['subheading'],
                fill=COLORS['text']
            )
        
        self.update()
    
    def update_stats_display(self):
        self.stats_nodes.configure(text=f"Nodes Visited: {self.stats.nodes_explored}")
        self.stats_edges.configure(text=f"Edges Used: {self.stats.operations}")
        self.stats_time.configure(text=f"Time: {self.stats.time_elapsed:.2f}s")
    
    def start_visualization(self):
        if self.is_running:
            return
        
        self.is_running = True
        self.visualize_btn.configure(state="disabled")
        self.generate_btn.configure(state="disabled")
        
        algo = self.algo_dropdown.get()
        start_time = time.time()
        
        try:
            if "BFS" in algo:
                self.bfs()
            elif "DFS" in algo:
                self.dfs()
            elif "Dijkstra" in algo:
                self.dijkstra()
            elif "Prim" in algo:
                self.prim_mst()
            elif "Kruskal" in algo:
                self.kruskal_mst()
            
            self.stats.time_elapsed = time.time() - start_time
            self.update_stats_display()
            
        finally:
            self.is_running = False
            self.visualize_btn.configure(state="normal")
            self.generate_btn.configure(state="normal")
    
    def get_adjacency_list(self):
        """Build adjacency list from edges"""
        adj = {i: [] for i in range(self.num_nodes)}
        for edge in self.edges:
            adj[edge['from']].append((edge['to'], edge['weight']))
            adj[edge['to']].append((edge['from'], edge['weight']))
        return adj
    
    def bfs(self):
        """BFS traversal"""
        adj = self.get_adjacency_list()
        visited = set()
        queue = deque([0])
        visited.add(0)
        
        while queue:
            current = queue.popleft()
            self.stats.increment_nodes_explored()
            
            self.draw_graph(visited, set(), current)
            time.sleep(self.speed)
            self.update_stats_display()
            
            for neighbor, _ in adj[current]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        
        self.draw_graph(visited)
    
    def dfs(self):
        """DFS traversal"""
        adj = self.get_adjacency_list()
        visited = set()
        
        def dfs_helper(node):
            visited.add(node)
            self.stats.increment_nodes_explored()
            
            self.draw_graph(visited, set(), node)
            time.sleep(self.speed)
            self.update_stats_display()
            
            for neighbor, _ in adj[node]:
                if neighbor not in visited:
                    dfs_helper(neighbor)
        
        dfs_helper(0)
        self.draw_graph(visited)
    
    def dijkstra(self):
        """Dijkstra's shortest path from node 0"""
        adj = self.get_adjacency_list()
        distances = {i: float('inf') for i in range(self.num_nodes)}
        distances[0] = 0
        visited = set()
        pq = [(0, 0)]  # (distance, node)
        
        while pq:
            dist, current = heapq.heappop(pq)
            
            if current in visited:
                continue
            
            visited.add(current)
            self.stats.increment_nodes_explored()
            
            self.draw_graph(visited, set(), current)
            time.sleep(self.speed)
            self.update_stats_display()
            
            for neighbor, weight in adj[current]:
                if neighbor not in visited:
                    new_dist = dist + weight
                    if new_dist < distances[neighbor]:
                        distances[neighbor] = new_dist
                        heapq.heappush(pq, (new_dist, neighbor))
        
        self.draw_graph(visited)
    
    def prim_mst(self):
        """Prim's Minimum Spanning Tree"""
        adj = self.get_adjacency_list()
        visited = set([0])
        mst_edges = set()
        pq = []
        
        # Add all edges from node 0
        for neighbor, weight in adj[0]:
            heapq.heappush(pq, (weight, 0, neighbor))
        
        while pq and len(visited) < self.num_nodes:
            weight, from_node, to_node = heapq.heappop(pq)
            
            if to_node in visited:
                continue
            
            visited.add(to_node)
            edge_key = tuple(sorted([from_node, to_node]))
            mst_edges.add(edge_key)
            self.stats.increment_nodes_explored()
            self.stats.increment_operations()
            
            self.draw_graph(visited, mst_edges, to_node)
            time.sleep(self.speed)
            self.update_stats_display()
            
            # Add edges from new node
            for neighbor, weight in adj[to_node]:
                if neighbor not in visited:
                    heapq.heappush(pq, (weight, to_node, neighbor))
        
        self.draw_graph(visited, mst_edges)
    
    def kruskal_mst(self):
        """Kruskal's Minimum Spanning Tree"""
        # Sort edges by weight
        sorted_edges = sorted(self.edges, key=lambda e: e['weight'])
        
        # Union-Find data structure
        parent = list(range(self.num_nodes))
        
        def find(x):
            if parent[x] != x:
                parent[x] = find(parent[x])
            return parent[x]
        
        def union(x, y):
            px, py = find(x), find(y)
            if px != py:
                parent[px] = py
                return True
            return False
        
        mst_edges = set()
        visited_nodes = set()
        
        for edge in sorted_edges:
            if union(edge['from'], edge['to']):
                edge_key = tuple(sorted([edge['from'], edge['to']]))
                mst_edges.add(edge_key)
                visited_nodes.add(edge['from'])
                visited_nodes.add(edge['to'])
                self.stats.increment_operations()
                
                self.draw_graph(visited_nodes, mst_edges)
                time.sleep(self.speed)
                self.update_stats_display()
                
                if len(mst_edges) == self.num_nodes - 1:
                    break
        
        self.stats.nodes_explored = len(visited_nodes)
        self.draw_graph(visited_nodes, mst_edges)
    
    def run(self):
        pass  # Not needed for embedded version

