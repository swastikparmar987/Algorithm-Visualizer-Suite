import customtkinter as ctk
import time
from collections import deque
from utils import COLORS, FONTS, get_speed_label, SPEED_PRESETS, take_screenshot, ThemeManager

ctk.set_default_color_theme("green")

# Data structure node classes
class TreeNode:
    """Node for Binary Tree and AVL Tree"""
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
        self.height = 1  # For AVL balancing
        self.x = 0  # For visualization
        self.y = 0

class GraphNode:
    """Node for Graph"""
    def __init__(self, id, value, x=0, y=0):
        self.id = id
        self.value = value
        self.edges = []  # List of connected node IDs
        self.x = x
        self.y = y

class HeapNode:
    """Wrapper for heap visualization"""
    def __init__(self, value, index):
        self.value = value
        self.index = index

class DataStructuresVisualizerFrame(ctk.CTkFrame):
    def __init__(self, parent, back_callback):
        super().__init__(parent, fg_color=COLORS["bg_dark"])
        self.back_callback = back_callback        
        # Existing structures
        self.stack = []
        self.queue = deque()
        self.linked_list = []
        
        # New structures
        self.binary_tree_root = None
        self.avl_tree_root = None
        self.graph_nodes = {}  # Dict of id: GraphNode
        self.graph_edges = []  # List of (from_id, to_id) tuples
        self.heap = []  # Min heap by default
        self.heap_type = "Min"  # "Min" or "Max"
        
        # Custom mode
        self.custom_mode = False
        self.selected_nodes = []  # For connecting nodes
        
        self.speed = 0.3
        self.is_running = False
        self.should_stop = False
        self.current_structure = "Stack"
        
        # Register theme change callback
        ThemeManager.register_callback(self.on_theme_change)
        
        self.setup_ui()
        self.draw_structure()
    
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
                self.draw_structure()
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
            text="📦 Data Structures Visualizer",
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
        
        # Data Structure Selection
        ds_label = ctk.CTkLabel(
            control_panel,
            text="Select Data Structure",
            font=FONTS['subheading'],
            text_color=COLORS['text']
        )
        ds_label.pack(pady=(10, 5))
        
        self.structure_dropdown = ctk.CTkOptionMenu(
            control_panel,
            values=["Stack (LIFO)", "Queue (FIFO)", "Linked List",
                    "Binary Tree", "Graph", "AVL Tree", "Min Heap", "Max Heap"],
            command=self.change_structure,
            font=FONTS['body'],
            fg_color=COLORS['button_secondary'],
            button_color=COLORS['button_secondary'],
            button_hover_color=COLORS['button_secondary_hover'],
            dropdown_fg_color=COLORS['bg_medium'],
            width=280
        )
        self.structure_dropdown.set("Stack (LIFO)")
        self.structure_dropdown.pack(pady=(0, 15))
        
        # Value Input
        value_label = ctk.CTkLabel(
            control_panel,
            text="Enter Value",
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
        self.value_entry.pack(pady=(0, 15))
        
        # Operation Buttons
        self.push_btn = ctk.CTkButton(
            control_panel,
            text="➕ Push / Enqueue / Add",
            command=self.add_operation,
            font=FONTS['button'],
            fg_color=COLORS['button_primary'],
            hover_color=COLORS['button_hover'],
            height=40,
            width=280,
            corner_radius=10
        )
        self.push_btn.pack(pady=5)
        
        self.pop_btn = ctk.CTkButton(
            control_panel,
            text="➖ Pop / Dequeue / Remove",
            command=self.remove_operation,
            font=FONTS['button'],
            fg_color=COLORS['button_danger'],
            hover_color=COLORS['button_danger_hover'],
            height=40,
            width=280,
            corner_radius=10
        )
        self.pop_btn.pack(pady=5)
        
        self.clear_btn = ctk.CTkButton(
            control_panel,
            text="🗑️ Clear All",
            command=self.clear_structure,
            font=FONTS['button'],
            fg_color=COLORS['bg_light'],
            hover_color=COLORS['node_default'],
            height=40,
            width=280,
            corner_radius=10
        )
        self.clear_btn.pack(pady=5)
        
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
            from_=0.1,
            to=0.8,
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
        
        # Info Panel
        info_frame = ctk.CTkFrame(control_panel, fg_color=COLORS['bg_dark'], corner_radius=10)
        info_frame.pack(pady=(15, 20), padx=20, fill="x")
        
        info_title = ctk.CTkLabel(
            info_frame,
            text="ℹ️ Information",
            font=FONTS['subheading'],
            text_color=COLORS['text']
        )
        info_title.pack(pady=(10, 5))
        
        self.info_size = ctk.CTkLabel(
            info_frame,
            text="Size: 0",
            font=FONTS['body'],
            text_color=COLORS['text']
        )
        self.info_size.pack(pady=2)
        
        self.info_operation = ctk.CTkLabel(
            info_frame,
            text="Last Operation: None",
            font=FONTS['body'],
            text_color=COLORS['text']
        )
        self.info_operation.pack(pady=(2, 10))
    
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
    
    def change_structure(self, choice):
        if "Stack" in choice:
            self.current_structure = "Stack"
        elif "Queue" in choice:
            self.current_structure = "Queue"
        elif "Linked List" in choice:
            self.current_structure = "Linked List"
        elif "Binary Tree" in choice:
            self.current_structure = "Binary Tree"
        elif "Graph" in choice:
            self.current_structure = "Graph"
        elif "AVL Tree" in choice:
            self.current_structure = "AVL Tree"
        elif "Min Heap" in choice:
            self.current_structure = "Min Heap"
            self.heap_type = "Min"
        elif "Max Heap" in choice:
            self.current_structure = "Max Heap"
            self.heap_type = "Max"
        
        self.draw_structure()
    
    def add_operation(self):
        if self.is_running:
            return
        
        value = self.value_entry.get().strip()
        if not value:
            return
        
        self.is_running = True
        
        if self.current_structure == "Stack":
            self.stack.append(value)
            self.info_operation.configure(text=f"Last Operation: Push({value})")
        elif self.current_structure == "Queue":
            self.queue.append(value)
            self.info_operation.configure(text=f"Last Operation: Enqueue({value})")
        elif self.current_structure == "Linked List":
            self.linked_list.append(value)
            self.info_operation.configure(text=f"Last Operation: Add({value})")
        elif self.current_structure in ["Binary Tree", "AVL Tree"]:
            try:
                val = int(value)
                self.insert_tree_node(val)
                self.info_operation.configure(text=f"Last Operation: Insert({val})")
            except ValueError:
                self.info_operation.configure(text="Error: Enter a number")
        elif self.current_structure == "Graph":
            self.add_graph_node(value)
            self.info_operation.configure(text=f"Last Operation: Add Node({value})")
        elif self.current_structure in ["Min Heap", "Max Heap"]:
            try:
                val = int(value)
                self.heap_insert(val)
                self.info_operation.configure(text=f"Last Operation: Insert({val})")
            except ValueError:
                self.info_operation.configure(text="Error: Enter a number")
        
        self.value_entry.delete(0, 'end')
        self.draw_structure(highlight_last=True)
        time.sleep(self.speed)
        self.draw_structure()
        
        self.is_running = False
    
    def remove_operation(self):
        if self.is_running:
            return
        
        self.is_running = True
        removed = None
        
        try:
            if self.current_structure == "Stack":
                if self.stack:
                    removed = self.stack.pop()
                    self.info_operation.configure(text=f"Last Operation: Pop() = {removed}")
            elif self.current_structure == "Queue":
                if self.queue:
                    removed = self.queue.popleft()
                    self.info_operation.configure(text=f"Last Operation: Dequeue() = {removed}")
            elif self.current_structure == "Linked List":
                if self.linked_list:
                    removed = self.linked_list.pop(0)
                    self.info_operation.configure(text=f"Last Operation: Remove() = {removed}")
            elif self.current_structure in ["Binary Tree", "AVL Tree"]:
                value = self.value_entry.get().strip()
                if value:
                    try:
                        val = int(value)
                        self.delete_tree_node(val)
                        self.info_operation.configure(text=f"Last Operation: Delete({val})")
                        self.value_entry.delete(0, 'end')
                    except ValueError:
                        pass
            elif self.current_structure in ["Min Heap", "Max Heap"]:
                removed = self.heap_extract()
                if removed is not None:
                    self.info_operation.configure(text=f"Last Operation: Extract() = {removed}")
            
            if removed or self.current_structure in ["Binary Tree", "AVL Tree"]:
                self.draw_structure(highlight_removed=True)
                time.sleep(self.speed)
                self.draw_structure()
        finally:
            self.is_running = False
    
    def clear_structure(self):
        if self.is_running:
            return
        
        self.stack.clear()
        self.queue.clear()
        self.linked_list.clear()
        self.info_operation.configure(text="Last Operation: Clear()")
        self.draw_structure()
    
    def draw_structure(self, highlight_last=False, highlight_removed=False):
        """Draw the current data structure"""
        self.canvas.delete("all")
        
        if self.current_structure == "Stack":
            self.draw_stack(highlight_last, highlight_removed)
        elif self.current_structure == "Queue":
            self.draw_queue(highlight_last, highlight_removed)
        elif self.current_structure == "Linked List":
            self.draw_linked_list(highlight_last, highlight_removed)
        elif self.current_structure == "Binary Tree":
            self.draw_binary_tree()
        elif self.current_structure == "Graph":
            self.draw_graph()
        elif self.current_structure == "AVL Tree":
            self.draw_avl_tree()
        elif self.current_structure in ["Min Heap", "Max Heap"]:
            self.draw_heap()
        
        # Update size info
        if self.current_structure == "Stack":
            self.info_size.configure(text=f"Size: {len(self.stack)}")
        elif self.current_structure == "Queue":
            self.info_size.configure(text=f"Size: {len(self.queue)}")
        elif self.current_structure == "Linked List":
            self.info_size.configure(text=f"Size: {len(self.linked_list)}")
        elif self.current_structure in ["Binary Tree", "AVL Tree"]:
            count = self._count_tree_nodes(self.binary_tree_root if self.current_structure == "Binary Tree" else self.avl_tree_root)
            self.info_size.configure(text=f"Nodes: {count}")
        elif self.current_structure == "Graph":
            self.info_size.configure(text=f"Nodes: {len(self.graph_nodes)}")
        elif self.current_structure in ["Min Heap", "Max Heap"]:
            self.info_size.configure(text=f"Size: {len(self.heap)}")
        
        self.update()
    
    def draw_stack(self, highlight_last, highlight_removed):
        """Draw stack visualization"""
        if not self.stack:
            self.canvas.create_text(
                500, 300,
                text="Empty Stack\nPush elements to visualize",
                font=FONTS['heading'],
                fill=COLORS['text_secondary']
            )
            return
        
        box_width = 200
        box_height = 60
        start_x = 400
        start_y = 500
        
        # Draw stack from bottom to top
        for i, value in enumerate(self.stack):
            y = start_y - i * (box_height + 10)
            
            # Determine color
            if highlight_last and i == len(self.stack) - 1:
                color = COLORS['sorted']
            else:
                color = COLORS['node_default']
            
            # Draw box
            self.canvas.create_rectangle(
                start_x, y,
                start_x + box_width, y + box_height,
                fill=color,
                outline=COLORS['path'],
                width=2
            )
            
            # Draw value
            self.canvas.create_text(
                start_x + box_width // 2,
                y + box_height // 2,
                text=str(value),
                font=FONTS['heading'],
                fill=COLORS['text']
            )
        
        # Draw "TOP" indicator
        top_y = start_y - len(self.stack) * (box_height + 10) + box_height // 2
        self.canvas.create_text(
            start_x - 50,
            top_y,
            text="TOP →",
            font=FONTS['subheading'],
            fill=COLORS['button_primary']
        )
    
    def draw_queue(self, highlight_last, highlight_removed):
        """Draw queue visualization"""
        if not self.queue:
            self.canvas.create_text(
                500, 300,
                text="Empty Queue\nEnqueue elements to visualize",
                font=FONTS['heading'],
                fill=COLORS['text_secondary']
            )
            return
        
        box_width = 120
        box_height = 80
        start_x = 100
        start_y = 250
        
        # Draw queue from left to right
        for i, value in enumerate(self.queue):
            x = start_x + i * (box_width + 10)
            
            # Determine color
            if highlight_last and i == len(self.queue) - 1:
                color = COLORS['sorted']
            elif highlight_removed and i == 0:
                color = COLORS['swapping']
            else:
                color = COLORS['node_default']
            
            # Draw box
            self.canvas.create_rectangle(
                x, start_y,
                x + box_width, start_y + box_height,
                fill=color,
                outline=COLORS['path'],
                width=2
            )
            
            # Draw value
            self.canvas.create_text(
                x + box_width // 2,
                start_y + box_height // 2,
                text=str(value),
                font=FONTS['heading'],
                fill=COLORS['text']
            )
        
        # Draw FRONT and REAR indicators
        self.canvas.create_text(
            start_x + box_width // 2,
            start_y - 30,
            text="FRONT",
            font=FONTS['subheading'],
            fill=COLORS['button_primary']
        )
        
        rear_x = start_x + (len(self.queue) - 1) * (box_width + 10) + box_width // 2
        self.canvas.create_text(
            rear_x,
            start_y + box_height + 30,
            text="REAR",
            font=FONTS['subheading'],
            fill=COLORS['button_primary']
        )
    
    def draw_linked_list(self, highlight_last, highlight_removed):
        """Draw linked list visualization"""
        if not self.linked_list:
            self.canvas.create_text(
                500, 300,
                text="Empty Linked List\nAdd nodes to visualize",
                font=FONTS['heading'],
                fill=COLORS['text_secondary']
            )
            return
        
        node_radius = 30
        start_x = 100
        start_y = 300
        spacing = 120
        
        # Draw linked list nodes
        for i, value in enumerate(self.linked_list):
            x = start_x + i * spacing
            
            # Determine color
            if highlight_last and i == len(self.linked_list) - 1:
                color = COLORS['sorted']
            elif highlight_removed and i == 0:
                color = COLORS['swapping']
            else:
                color = COLORS['node_default']
            
            # Draw circle
            self.canvas.create_oval(
                x - node_radius, start_y - node_radius,
                x + node_radius, start_y + node_radius,
                fill=color,
                outline=COLORS['path'],
                width=2
            )
            
            # Draw value
            self.canvas.create_text(
                x, start_y,
                text=str(value),
                font=FONTS['subheading'],
                fill=COLORS['text']
            )
            
            # Draw arrow to next node
            if i < len(self.linked_list) - 1:
                arrow_start_x = x + node_radius
                arrow_end_x = start_x + (i + 1) * spacing - node_radius
                
                self.canvas.create_line(
                    arrow_start_x, start_y,
                    arrow_end_x, start_y,
                    fill=COLORS['edge_default'],
                    width=2,
                    arrow=ctk.LAST
                )
        
        # Draw HEAD indicator
        self.canvas.create_text(
            start_x,
            start_y - 60,
            text="HEAD",
            font=FONTS['subheading'],
            fill=COLORS['button_primary']
        )
    
    def run(self):
        pass  # Not needed for embedded version

    
    # ==================== NEW DATA STRUCTURE METHODS ====================
    
    # Helper method for counting tree nodes
    def _count_tree_nodes(self, root):
        """Count nodes in a tree"""
        if root is None:
            return 0
        return 1 + self._count_tree_nodes(root.left) + self._count_tree_nodes(root.right)
    
    # Binary Tree Methods
    def insert_tree_node(self, value):
        """Insert a node into the binary tree"""
        if self.current_structure == "Binary Tree":
            self.binary_tree_root = self._insert_bst(self.binary_tree_root, value)
        elif self.current_structure == "AVL Tree":
            self.avl_tree_root = self._insert_avl(self.avl_tree_root, value)
    
    def _insert_bst(self, root, value):
        """Helper to insert into BST"""
        if root is None:
            return TreeNode(value)
        if value < root.value:
            root.left = self._insert_bst(root.left, value)
        else:
            root.right = self._insert_bst(root.right, value)
        return root
    
    def delete_tree_node(self, value):
        """Delete a node from the binary tree"""
        if self.current_structure == "Binary Tree":
            self.binary_tree_root = self._delete_bst(self.binary_tree_root, value)
        elif self.current_structure == "AVL Tree":
            self.avl_tree_root = self._delete_avl(self.avl_tree_root, value)
    
    def _delete_bst(self, root, value):
        """Helper to delete from BST"""
        if root is None:
            return root
        if value < root.value:
            root.left = self._delete_bst(root.left, value)
        elif value > root.value:
            root.right = self._delete_bst(root.right, value)
        else:
            if root.left is None:
                return root.right
            elif root.right is None:
                return root.left
            min_node = self._find_min(root.right)
            root.value = min_node.value
            root.right = self._delete_bst(root.right, min_node.value)
        return root
    
    def _find_min(self, root):
        """Find minimum value node"""
        while root.left:
            root = root.left
        return root
    
    def draw_binary_tree(self):
        """Draw binary tree visualization"""
        if self.binary_tree_root is None:
            self.canvas.create_text(
                500, 300,
                text="Empty Binary Tree\nInsert nodes to visualize",
                font=FONTS['heading'],
                fill=COLORS['text_secondary']
            )
            return
        
        self._calculate_tree_positions(self.binary_tree_root, 500, 50, 200)
        self._draw_tree_recursive(self.binary_tree_root)
    
    def _calculate_tree_positions(self, node, x, y, offset):
        """Calculate x,y positions for tree nodes"""
        if node is None:
            return
        node.x = x
        node.y = y
        if node.left:
            self._calculate_tree_positions(node.left, x - offset, y + 80, offset // 2)
        if node.right:
            self._calculate_tree_positions(node.right, x + offset, y + 80, offset // 2)
    
    def _draw_tree_recursive(self, node):
        """Recursively draw tree nodes and edges"""
        if node is None:
            return
        
        if node.left:
            self.canvas.create_line(
                node.x, node.y, node.left.x, node.left.y,
                fill=COLORS['edge_default'], width=2
            )
            self._draw_tree_recursive(node.left)
        if node.right:
            self.canvas.create_line(
                node.x, node.y, node.right.x, node.right.y,
                fill=COLORS['edge_default'], width=2
            )
            self._draw_tree_recursive(node.right)
        
        radius = 25
        self.canvas.create_oval(
            node.x - radius, node.y - radius,
            node.x + radius, node.y + radius,
            fill=COLORS['node_default'],
            outline=COLORS['path'],
            width=2
        )
        self.canvas.create_text(
            node.x, node.y,
            text=str(node.value),
            font=FONTS['body'],
            fill=COLORS['text']
        )
    
    # AVL Tree Methods
    def _insert_avl(self, root, value):
        """Insert into AVL tree with balancing"""
        if root is None:
            return TreeNode(value)
        if value < root.value:
            root.left = self._insert_avl(root.left, value)
        else:
            root.right = self._insert_avl(root.right, value)
        
        root.height = 1 + max(self._get_height(root.left), self._get_height(root.right))
        balance = self._get_balance(root)
        
        if balance > 1 and value < root.left.value:
            return self._rotate_right(root)
        if balance < -1 and value > root.right.value:
            return self._rotate_left(root)
        if balance > 1 and value > root.left.value:
            root.left = self._rotate_left(root.left)
            return self._rotate_right(root)
        if balance < -1 and value < root.right.value:
            root.right = self._rotate_right(root.right)
            return self._rotate_left(root)
        
        return root
    
    def _delete_avl(self, root, value):
        """Delete from AVL tree with balancing"""
        if root is None:
            return root
        if value < root.value:
            root.left = self._delete_avl(root.left, value)
        elif value > root.value:
            root.right = self._delete_avl(root.right, value)
        else:
            if root.left is None:
                return root.right
            elif root.right is None:
                return root.left
            min_node = self._find_min(root.right)
            root.value = min_node.value
            root.right = self._delete_avl(root.right, min_node.value)
        
        root.height = 1 + max(self._get_height(root.left), self._get_height(root.right))
        balance = self._get_balance(root)
        
        if balance > 1 and self._get_balance(root.left) >= 0:
            return self._rotate_right(root)
        if balance < -1 and self._get_balance(root.right) <= 0:
            return self._rotate_left(root)
        if balance > 1 and self._get_balance(root.left) < 0:
            root.left = self._rotate_left(root.left)
            return self._rotate_right(root)
        if balance < -1 and self._get_balance(root.right) > 0:
            root.right = self._rotate_right(root.right)
            return self._rotate_left(root)
        
        return root
    
    def _get_height(self, node):
        if node is None:
            return 0
        return node.height
    
    def _get_balance(self, node):
        if node is None:
            return 0
        return self._get_height(node.left) - self._get_height(node.right)
    
    def _rotate_left(self, z):
        y = z.right
        T2 = y.left
        y.left = z
        z.right = T2
        z.height = 1 + max(self._get_height(z.left), self._get_height(z.right))
        y.height = 1 + max(self._get_height(y.left), self._get_height(y.right))
        return y
    
    def _rotate_right(self, z):
        y = z.left
        T3 = y.right
        y.right = z
        z.left = T3
        z.height = 1 + max(self._get_height(z.left), self._get_height(z.right))
        y.height = 1 + max(self._get_height(y.left), self._get_height(y.right))
        return y
    
    def draw_avl_tree(self):
        """Draw AVL tree (same as binary tree)"""
        if self.avl_tree_root is None:
            self.canvas.create_text(
                500, 300,
                text="Empty AVL Tree\nInsert nodes to visualize",
                font=FONTS['heading'],
                fill=COLORS['text_secondary']
            )
            return
        
        self._calculate_tree_positions(self.avl_tree_root, 500, 50, 200)
        self._draw_tree_recursive(self.avl_tree_root)
    
    # Graph Methods
    def add_graph_node(self, value):
        """Add a node to the graph"""
        import math
        node_id = len(self.graph_nodes)
        angle = (2 * math.pi * node_id) / max(len(self.graph_nodes) + 1, 8)
        x = 500 + 200 * math.cos(angle)
        y = 300 + 200 * math.sin(angle)
        self.graph_nodes[node_id] = GraphNode(node_id, value, x, y)
    
    def draw_graph(self):
        """Draw graph visualization"""
        if not self.graph_nodes:
            self.canvas.create_text(
                500, 300,
                text="Empty Graph\nAdd nodes to visualize",
                font=FONTS['heading'],
                fill=COLORS['text_secondary']
            )
            return
        
        for from_id, to_id in self.graph_edges:
            if from_id in self.graph_nodes and to_id in self.graph_nodes:
                from_node = self.graph_nodes[from_id]
                to_node = self.graph_nodes[to_id]
                self.canvas.create_line(
                    from_node.x, from_node.y,
                    to_node.x, to_node.y,
                    fill=COLORS['edge_default'],
                    width=2,
                    arrow=ctk.LAST
                )
        
        for node in self.graph_nodes.values():
            radius = 30
            self.canvas.create_oval(
                node.x - radius, node.y - radius,
                node.x + radius, node.y + radius,
                fill=COLORS['node_default'],
                outline=COLORS['path'],
                width=2
            )
            self.canvas.create_text(
                node.x, node.y,
                text=str(node.value),
                font=FONTS['body'],
                fill=COLORS['text']
            )
    
    # Heap Methods
    def heap_insert(self, value):
        """Insert into heap"""
        self.heap.append(value)
        self._bubble_up(len(self.heap) - 1)
    
    def _bubble_up(self, index):
        """Bubble up element in heap"""
        while index > 0:
            parent = (index - 1) // 2
            if self.heap_type == "Min":
                if self.heap[index] < self.heap[parent]:
                    self.heap[index], self.heap[parent] = self.heap[parent], self.heap[index]
                    index = parent
                else:
                    break
            else:
                if self.heap[index] > self.heap[parent]:
                    self.heap[index], self.heap[parent] = self.heap[parent], self.heap[index]
                    index = parent
                else:
                    break
    
    def heap_extract(self):
        """Extract min/max from heap"""
        if not self.heap:
            return None
        if len(self.heap) == 1:
            return self.heap.pop()
        root = self.heap[0]
        self.heap[0] = self.heap.pop()
        self._bubble_down(0)
        return root
    
    def _bubble_down(self, index):
        """Bubble down element in heap"""
        while True:
            smallest = index
            left = 2 * index + 1
            right = 2 * index + 2
            
            if self.heap_type == "Min":
                if left < len(self.heap) and self.heap[left] < self.heap[smallest]:
                    smallest = left
                if right < len(self.heap) and self.heap[right] < self.heap[smallest]:
                    smallest = right
            else:
                if left < len(self.heap) and self.heap[left] > self.heap[smallest]:
                    smallest = left
                if right < len(self.heap) and self.heap[right] > self.heap[smallest]:
                    smallest = right
            
            if smallest != index:
                self.heap[index], self.heap[smallest] = self.heap[smallest], self.heap[index]
                index = smallest
            else:
                break
    
    def draw_heap(self):
        """Draw heap as a tree"""
        if not self.heap:
            self.canvas.create_text(
                500, 300,
                text=f"Empty {self.heap_type} Heap\nInsert elements to visualize",
                font=FONTS['heading'],
                fill=COLORS['text_secondary']
            )
            return
        
        self._draw_heap_node(0, 500, 50, 200)
    
    def _draw_heap_node(self, index, x, y, offset):
        """Recursively draw heap nodes"""
        if index >= len(self.heap):
            return
        
        left = 2 * index + 1
        right = 2 * index + 2
        
        if left < len(self.heap):
            left_x = x - offset
            left_y = y + 80
            self.canvas.create_line(x, y, left_x, left_y, fill=COLORS['edge_default'], width=2)
            self._draw_heap_node(left, left_x, left_y, offset // 2)
        
        if right < len(self.heap):
            right_x = x + offset
            right_y = y + 80
            self.canvas.create_line(x, y, right_x, right_y, fill=COLORS['edge_default'], width=2)
            self._draw_heap_node(right, right_x, right_y, offset // 2)
        
        radius = 25
        self.canvas.create_oval(
            x - radius, y - radius,
            x + radius, y + radius,
            fill=COLORS['node_default'],
            outline=COLORS['path'],
            width=2
        )
        self.canvas.create_text(
            x, y,
            text=str(self.heap[index]),
            font=FONTS['body'],
            fill=COLORS['text']
        )

