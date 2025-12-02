import customtkinter as ctk
import time
from collections import deque
from utils import COLORS, FONTS, get_speed_label

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("green")

class DataStructuresVisualizer:
    def __init__(self):
        self.app = ctk.CTk()
        self.app.title("📦 Data Structures Visualizer")
        self.app.geometry("1400x800")
        self.app.configure(fg_color=COLORS['bg_dark'])
        
        # State variables
        self.stack = []
        self.queue = deque()
        self.linked_list = []
        self.speed = 0.3
        self.is_running = False
        self.current_structure = "Stack"
        
        self.setup_ui()
        self.draw_structure()
    
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
        
        self.ds_dropdown = ctk.CTkOptionMenu(
            control_panel,
            values=["Stack (LIFO)", "Queue (FIFO)", "Linked List"],
            command=self.change_structure,
            font=FONTS['body'],
            dropdown_font=FONTS['body'],
            fg_color=COLORS['accent'],
            button_color=COLORS['accent'],
            button_hover_color=COLORS['button_secondary_hover'],
            width=280
        )
        self.ds_dropdown.set("Stack (LIFO)")
        self.ds_dropdown.pack(pady=(0, 15))
        
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
        self.speed_slider.pack(pady=(0, 15))
        
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
    
    def update_speed(self, value):
        self.speed = float(value)
        self.speed_value_label.configure(text=get_speed_label(self.speed))
    
    def change_structure(self, choice):
        if "Stack" in choice:
            self.current_structure = "Stack"
        elif "Queue" in choice:
            self.current_structure = "Queue"
        else:
            self.current_structure = "Linked List"
        
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
        else:  # Linked List
            self.linked_list.append(value)
            self.info_operation.configure(text=f"Last Operation: Add({value})")
        
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
            else:  # Linked List
                if self.linked_list:
                    removed = self.linked_list.pop(0)
                    self.info_operation.configure(text=f"Last Operation: Remove() = {removed}")
            
            if removed:
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
        else:
            self.draw_linked_list(highlight_last, highlight_removed)
        
        # Update size info
        if self.current_structure == "Stack":
            size = len(self.stack)
        elif self.current_structure == "Queue":
            size = len(self.queue)
        else:
            size = len(self.linked_list)
        
        self.info_size.configure(text=f"Size: {size}")
        self.app.update()
    
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
        self.app.mainloop()

if __name__ == "__main__":
    visualizer = DataStructuresVisualizer()
    visualizer.run()
