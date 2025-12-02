import customtkinter as ctk
import random
import time
from collections import deque
from utils import COLORS, FONTS, Statistics, get_speed_label

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("green")

class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
        self.x = 0
        self.y = 0

class TreeVisualizer:
    def __init__(self):
        self.app = ctk.CTk()
        self.app.title("🌳 Tree Algorithm Visualizer")
        self.app.geometry("1400x800")
        self.app.configure(fg_color=COLORS['bg_dark'])
        
        # State variables
        self.root = None
        self.speed = 0.2
        self.is_running = False
        self.stats = Statistics()
        self.traversal_result = []
        
        self.setup_ui()
        self.generate_tree()
    
    def setup_ui(self):
        # Main container
        main_container = ctk.CTkFrame(self.app, fg_color=COLORS['bg_dark'])
        main_container.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Left side - Canvas
        canvas_frame = ctk.CTkFrame(main_container, fg_color=COLORS['bg_medium'], corner_radius=15)
        canvas_frame.pack(side="left", fill="both", expand=True, padx=(0, 10))
        
        # Title
        title_label = ctk.CTkLabel(
            canvas_frame,
            text="🌳 Tree Algorithm Visualizer",
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
            text="Select Traversal",
            font=FONTS['subheading'],
            text_color=COLORS['text']
        )
        algo_label.pack(pady=(10, 5))
        
        self.algo_dropdown = ctk.CTkOptionMenu(
            control_panel,
            values=[
                "Inorder Traversal",
                "Preorder Traversal",
                "Postorder Traversal",
                "Level Order (BFS)"
            ],
            font=FONTS['body'],
            dropdown_font=FONTS['body'],
            fg_color=COLORS['accent'],
            button_color=COLORS['accent'],
            button_hover_color=COLORS['button_secondary_hover'],
            width=280
        )
        self.algo_dropdown.set("Inorder Traversal")
        self.algo_dropdown.pack(pady=(0, 15))
        
        # Value Input for BST operations
        value_label = ctk.CTkLabel(
            control_panel,
            text="Insert Value",
            font=FONTS['subheading'],
            text_color=COLORS['text']
        )
        value_label.pack(pady=(10, 5))
        
        self.value_entry = ctk.CTkEntry(
            control_panel,
            width=280,
            height=40,
            font=FONTS['body'],
            fg_color=COLORS['bg_dark'],
            border_color=COLORS['accent']
        )
        self.value_entry.pack(pady=(0, 10))
        
        # Insert button
        self.insert_btn = ctk.CTkButton(
            control_panel,
            text="➕ Insert Node",
            command=self.insert_node,
            font=FONTS['button'],
            fg_color=COLORS['button_primary'],
            hover_color=COLORS['button_hover'],
            height=35,
            width=280,
            corner_radius=10
        )
        self.insert_btn.pack(pady=5)
        
        # Speed Control
        speed_label = ctk.CTkLabel(
            control_panel,
            text="⚡ Animation Speed",
            font=FONTS['subheading'],
            text_color=COLORS['text']
        )
        speed_label.pack(pady=(15, 5))
        
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
        self.speed_slider.pack(pady=(0, 15))
        
        # Buttons
        self.generate_btn = ctk.CTkButton(
            control_panel,
            text="🎲 Generate Random Tree",
            command=self.generate_tree,
            font=FONTS['button'],
            fg_color=COLORS['button_primary'],
            hover_color=COLORS['button_hover'],
            height=40,
            width=280,
            corner_radius=10
        )
        self.generate_btn.pack(pady=8)
        
        self.traverse_btn = ctk.CTkButton(
            control_panel,
            text="▶️ Start Traversal",
            command=self.start_traversal,
            font=FONTS['button'],
            fg_color=COLORS['accent'],
            hover_color=COLORS['button_secondary_hover'],
            height=40,
            width=280,
            corner_radius=10
        )
        self.traverse_btn.pack(pady=8)
        
        # Result display
        result_frame = ctk.CTkFrame(control_panel, fg_color=COLORS['bg_dark'], corner_radius=10)
        result_frame.pack(pady=(15, 20), padx=20, fill="x")
        
        result_title = ctk.CTkLabel(
            result_frame,
            text="📊 Traversal Result",
            font=FONTS['subheading'],
            text_color=COLORS['text']
        )
        result_title.pack(pady=(10, 5))
        
        self.result_text = ctk.CTkTextbox(
            result_frame,
            height=100,
            font=FONTS['body'],
            fg_color=COLORS['bg_medium'],
            wrap="word"
        )
        self.result_text.pack(pady=(5, 10), padx=10, fill="x")
    
    def update_speed(self, value):
        self.speed = float(value)
        self.speed_value_label.configure(text=get_speed_label(self.speed))
    
    def generate_tree(self):
        if self.is_running:
            return
        
        self.root = None
        values = random.sample(range(1, 100), 10)
        for val in values:
            self.root = self.insert_bst(self.root, val)
        
        self.traversal_result = []
        self.result_text.delete("1.0", "end")
        self.draw_tree()
    
    def insert_node(self):
        if self.is_running:
            return
        
        try:
            value = int(self.value_entry.get())
            self.root = self.insert_bst(self.root, value)
            self.value_entry.delete(0, 'end')
            self.draw_tree()
        except ValueError:
            pass
    
    def insert_bst(self, node, value):
        """Insert a value into BST"""
        if node is None:
            return TreeNode(value)
        
        if value < node.value:
            node.left = self.insert_bst(node.left, value)
        elif value > node.value:
            node.right = self.insert_bst(node.right, value)
        
        return node
    
    def calculate_positions(self, node, x, y, x_offset):
        """Calculate positions for tree nodes"""
        if node is None:
            return
        
        node.x = x
        node.y = y
        
        if node.left:
            self.calculate_positions(node.left, x - x_offset, y + 80, x_offset // 2)
        if node.right:
            self.calculate_positions(node.right, x + x_offset, y + 80, x_offset // 2)
    
    def draw_tree(self, highlighted_node=None):
        """Draw the tree"""
        self.canvas.delete("all")
        
        if self.root is None:
            self.canvas.create_text(
                500, 300,
                text="Empty Tree\nGenerate or Insert Nodes",
                font=FONTS['heading'],
                fill=COLORS['text_secondary']
            )
            self.app.update()
            return
        
        # Calculate positions
        self.calculate_positions(self.root, 500, 50, 200)
        
        # Draw edges first
        self.draw_edges(self.root)
        
        # Draw nodes
        self.draw_nodes(self.root, highlighted_node)
        
        self.app.update()
    
    def draw_edges(self, node):
        """Draw edges between nodes"""
        if node is None:
            return
        
        if node.left:
            self.canvas.create_line(
                node.x, node.y,
                node.left.x, node.left.y,
                fill=COLORS['edge_default'],
                width=2
            )
            self.draw_edges(node.left)
        
        if node.right:
            self.canvas.create_line(
                node.x, node.y,
                node.right.x, node.right.y,
                fill=COLORS['edge_default'],
                width=2
            )
            self.draw_edges(node.right)
    
    def draw_nodes(self, node, highlighted_node):
        """Draw tree nodes"""
        if node is None:
            return
        
        # Determine color
        if node == highlighted_node:
            color = COLORS['comparing']
            border = COLORS['comparing']
        else:
            color = COLORS['node_default']
            border = COLORS['path']
        
        # Draw circle
        radius = 25
        self.canvas.create_oval(
            node.x - radius, node.y - radius,
            node.x + radius, node.y + radius,
            fill=color,
            outline=border,
            width=2
        )
        
        # Draw value
        self.canvas.create_text(
            node.x, node.y,
            text=str(node.value),
            font=FONTS['subheading'],
            fill=COLORS['text']
        )
        
        # Recursively draw children
        if node.left:
            self.draw_nodes(node.left, highlighted_node)
        if node.right:
            self.draw_nodes(node.right, highlighted_node)
    
    def start_traversal(self):
        if self.is_running or self.root is None:
            return
        
        self.is_running = True
        self.traverse_btn.configure(state="disabled")
        self.generate_btn.configure(state="disabled")
        self.insert_btn.configure(state="disabled")
        
        self.traversal_result = []
        self.result_text.delete("1.0", "end")
        
        algo = self.algo_dropdown.get()
        
        try:
            if "Inorder" in algo:
                self.inorder(self.root)
            elif "Preorder" in algo:
                self.preorder(self.root)
            elif "Postorder" in algo:
                self.postorder(self.root)
            elif "Level Order" in algo:
                self.level_order()
            
            # Display result
            result_str = " → ".join(map(str, self.traversal_result))
            self.result_text.insert("1.0", result_str)
            
        finally:
            self.is_running = False
            self.traverse_btn.configure(state="normal")
            self.generate_btn.configure(state="normal")
            self.insert_btn.configure(state="normal")
            self.draw_tree()
    
    def inorder(self, node):
        """Inorder traversal: Left -> Root -> Right"""
        if node is None:
            return
        
        self.inorder(node.left)
        
        self.traversal_result.append(node.value)
        self.draw_tree(node)
        time.sleep(self.speed)
        
        self.inorder(node.right)
    
    def preorder(self, node):
        """Preorder traversal: Root -> Left -> Right"""
        if node is None:
            return
        
        self.traversal_result.append(node.value)
        self.draw_tree(node)
        time.sleep(self.speed)
        
        self.preorder(node.left)
        self.preorder(node.right)
    
    def postorder(self, node):
        """Postorder traversal: Left -> Right -> Root"""
        if node is None:
            return
        
        self.postorder(node.left)
        self.postorder(node.right)
        
        self.traversal_result.append(node.value)
        self.draw_tree(node)
        time.sleep(self.speed)
    
    def level_order(self):
        """Level order traversal (BFS)"""
        if self.root is None:
            return
        
        queue = deque([self.root])
        
        while queue:
            node = queue.popleft()
            
            self.traversal_result.append(node.value)
            self.draw_tree(node)
            time.sleep(self.speed)
            
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
    
    def run(self):
        self.app.mainloop()

if __name__ == "__main__":
    visualizer = TreeVisualizer()
    visualizer.run()
