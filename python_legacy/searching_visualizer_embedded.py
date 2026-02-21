import customtkinter as ctk
import random
import time
from utils import COLORS, FONTS, Statistics, get_speed_label, SPEED_PRESETS, take_screenshot, ThemeManager
from info_panel import InfoPanel
from algorithm_info import ALGORITHM_INFO

ctk.set_default_color_theme("green")

class SearchingVisualizerFrame(ctk.CTkFrame):
    def __init__(self, parent, back_callback):
        super().__init__(parent, fg_color=COLORS["bg_dark"])
        self.back_callback = back_callback        
        # State variables
        self.array = []
        self.array_size = 30
        self.target = 0
        self.speed = 0.05
        self.is_running = False
        self.should_stop = False
        self.stats = Statistics()
        
        # Register theme change callback
        ThemeManager.register_callback(self.on_theme_change)
        
        self.setup_ui()
        self.generate_array()
    
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
                self.draw_array()
        except Exception:
            pass
    
    def setup_ui(self):
        # Main container with grid layout
        main_container = ctk.CTkFrame(self, fg_color=COLORS['bg_dark'])
        main_container.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Configure grid: 3 rows, 2 columns (info panel at bottom)
        main_container.grid_rowconfigure(1, weight=5)  # Canvas row - more weight
        main_container.grid_rowconfigure(2, weight=1)  # Info panel row - less weight
        main_container.grid_columnconfigure(0, weight=3)  # Canvas column
        main_container.grid_columnconfigure(1, weight=1)  # Control panel column
        
        # Back button (spans both columns)
        back_btn_frame = ctk.CTkFrame(main_container, fg_color="transparent")
        back_btn_frame.grid(row=0, column=0, columnspan=2, sticky="ew", pady=(0, 10))
        
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
        
        # Canvas frame
        canvas_frame = ctk.CTkFrame(main_container, fg_color=COLORS['bg_medium'], corner_radius=15)
        canvas_frame.grid(row=1, column=0, sticky="nsew", padx=(0, 10), pady=(0, 10))
        
        # Title
        title_label = ctk.CTkLabel(
            canvas_frame,
            text="🔍 Searching Algorithm Visualizer",
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
        
        # Right column - Control Panel (scrollable)
        control_panel = ctk.CTkScrollableFrame(
            main_container, 
            fg_color=COLORS['bg_medium'], 
            corner_radius=15, 
            width=320
        )
        control_panel.grid(row=1, column=1, sticky="nsew", pady=(0, 10))
        
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
                "Linear Search",
                "Binary Search",
                "Jump Search",
                "Interpolation Search"
            ],
            font=FONTS['body'],
            dropdown_font=FONTS['body'],
            fg_color=COLORS['accent'],
            button_color=COLORS['accent'],
            button_hover_color=COLORS['button_secondary_hover'],
            width=280,
            command=self.on_algorithm_change
        )
        self.algo_dropdown.set("Linear Search")
        self.algo_dropdown.pack(pady=(0, 15))
        
        # Target Value Input
        target_label = ctk.CTkLabel(
            control_panel,
            text="Target Value",
            font=FONTS['subheading'],
            text_color=COLORS['text']
        )
        target_label.pack(pady=(10, 5))
        
        self.target_entry = ctk.CTkEntry(
            control_panel,
            width=280,
            height=40,
            font=FONTS['body'],
            fg_color=COLORS['bg_dark'],
            border_color=COLORS['accent']
        )
        self.target_entry.pack(pady=(0, 15))
        self.target_entry.insert(0, str(self.target))
        
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
            from_=0.01,
            to=0.3,
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
            text="🎲 Generate New Array",
            command=self.generate_array,
            font=FONTS['button'],
            fg_color=COLORS['button_primary'],
            hover_color=COLORS['button_hover'],
            height=40,
            width=280,
            corner_radius=10
        )
        self.generate_btn.pack(pady=8)
        
        self.search_btn = ctk.CTkButton(
            control_panel,
            text="🔍 Start Search",
            command=self.start_search,
            font=FONTS['button'],
            fg_color=COLORS['accent'],
            hover_color=COLORS['button_secondary_hover'],
            height=40,
            width=280,
            corner_radius=10
        )
        self.search_btn.pack(pady=8)
        
        # Statistics Panel
        stats_frame = ctk.CTkFrame(control_panel, fg_color=COLORS['bg_dark'], corner_radius=10)
        stats_frame.pack(pady=(15, 0), padx=20, fill="x")
        
        stats_title = ctk.CTkLabel(
            stats_frame,
            text="📊 Statistics",
            font=FONTS['subheading'],
            text_color=COLORS['text']
        )
        stats_title.pack(pady=(10, 5))
        
        self.stats_comparisons = ctk.CTkLabel(
            stats_frame,
            text="Comparisons: 0",
            font=FONTS['body'],
            text_color=COLORS['text']
        )
        self.stats_comparisons.pack(pady=2)
        
        self.stats_result = ctk.CTkLabel(
            stats_frame,
            text="Result: -",
            font=FONTS['body'],
            text_color=COLORS['text']
        )
        self.stats_result.pack(pady=2)
        
        self.stats_time = ctk.CTkLabel(
            stats_frame,
            text="Time: 0.00s",
            font=FONTS['body'],
            text_color=COLORS['text']
        )
        self.stats_time.pack(pady=(2, 10))
        
        # Information Panel (bottom row, spans both columns)
        self.info_panel = InfoPanel(main_container, height=180)
        self.info_panel.grid(row=2, column=0, columnspan=2, sticky="ew")
        
        # Set initial algorithm info
        self.update_algorithm_info("Linear Search")
    
    def on_algorithm_change(self, algorithm_name):
        """Called when user selects a different algorithm"""
        self.update_algorithm_info(algorithm_name)
    
    def update_algorithm_info(self, algorithm_name):
        """Update the information panel with selected algorithm info"""
        if algorithm_name in ALGORITHM_INFO:
            self.info_panel.set_algorithm(ALGORITHM_INFO[algorithm_name])
        else:
            self.info_panel.clear()
    
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
    
    def generate_array(self):
        if self.is_running:
            return
        # Generate sorted array for binary search
        self.array = sorted([random.randint(1, 200) for _ in range(self.array_size)])
        # Pick a random target from the array
        self.target = random.choice(self.array)
        self.target_entry.delete(0, 'end')
        self.target_entry.insert(0, str(self.target))
        
        self.stats.reset()
        self.update_stats_display()
        self.draw_array()
    
    def draw_array(self, color_array=None, highlight_index=-1, found_index=-1):
        """Draw the array as boxes with numbers"""
        self.canvas.update_idletasks()  # Ensure canvas is ready
        self.canvas.delete("all")
        
        canvas_width = self.canvas.winfo_width() or 1000
        canvas_height = self.canvas.winfo_height() or 600
        
        box_width = min(80, (canvas_width - 40) / len(self.array))
        box_height = 60
        start_y = (canvas_height - box_height) // 2
        start_x = (canvas_width - (box_width * len(self.array))) // 2
        
        for i, value in enumerate(self.array):
            x0 = start_x + i * box_width
            y0 = start_y
            x1 = x0 + box_width - 5
            y1 = y0 + box_height
            
            # Determine color
            if found_index == i:
                color = COLORS['sorted']
                border_color = COLORS['sorted']
            elif color_array and i < len(color_array):
                color = color_array[i]
                border_color = color
            else:
                color = COLORS['bg_light']
                border_color = COLORS['path']
            
            # Draw box
            self.canvas.create_rectangle(
                x0, y0, x1, y1,
                fill=color,
                outline=border_color,
                width=2
            )
            
            # Draw number
            text_color = COLORS['bg_dark'] if found_index == i else COLORS['text']
            self.canvas.create_text(
                (x0 + x1) / 2,
                (y0 + y1) / 2,
                text=str(value),
                font=FONTS['subheading'],
                fill=text_color
            )
            
            # Draw index below
            self.canvas.create_text(
                (x0 + x1) / 2,
                y1 + 20,
                text=str(i),
                font=FONTS['small'],
                fill=COLORS['text_secondary']
            )
        
        # Draw target indicator
        self.canvas.create_text(
            canvas_width // 2,
            50,
            text=f"Target: {self.target}",
            font=FONTS['heading'],
            fill=COLORS['button_primary']
        )
        
        self.update()
    
    def update_stats_display(self, result_text=""):
        self.stats_comparisons.configure(text=f"Comparisons: {self.stats.comparisons}")
        if result_text:
            self.stats_result.configure(text=f"Result: {result_text}")
        else:
            self.stats_result.configure(text="Result: -")
        self.stats_time.configure(text=f"Time: {self.stats.time_elapsed:.3f}s")
    
    def start_search(self):
        if self.is_running:
            return
        
        try:
            self.target = int(self.target_entry.get())
        except ValueError:
            self.update_stats_display("Invalid target!")
            return
        
        self.is_running = True
        self.search_btn.configure(state="disabled")
        self.generate_btn.configure(state="disabled")
        
        algo = self.algo_dropdown.get()
        start_time = time.time()
        
        try:
            if algo == "Linear Search":
                result = self.linear_search()
            elif algo == "Binary Search":
                result = self.binary_search()
            elif algo == "Jump Search":
                result = self.jump_search()
            elif algo == "Interpolation Search":
                result = self.interpolation_search()
            
            self.stats.time_elapsed = time.time() - start_time
            
            if result != -1:
                self.update_stats_display(f"Found at index {result}")
                self.draw_array(found_index=result)
            else:
                self.update_stats_display("Not found")
                self.draw_array()
            
        finally:
            self.is_running = False
            self.search_btn.configure(state="normal")
            self.generate_btn.configure(state="normal")
    
    # Searching Algorithms
    
    def linear_search(self):
        """Linear search with visualization"""
        for i in range(len(self.array)):
            self.stats.increment_comparisons()
            

            
            # Highlight current element
            colors = [COLORS['bg_light']] * len(self.array)
            colors[i] = COLORS['comparing']
            self.draw_array(colors)
            time.sleep(self.speed)
            
            self.update_stats_display()
            
            if self.array[i] == self.target:

                return i
        
        return -1
    
    def binary_search(self):
        """Binary search with visualization"""
        left, right = 0, len(self.array) - 1
        
        while left <= right:
            mid = (left + right) // 2
            self.stats.increment_comparisons()
            

            
            # Highlight search space
            colors = [COLORS['bg_light']] * len(self.array)
            for i in range(left, right + 1):
                colors[i] = COLORS['path']
            colors[mid] = COLORS['comparing']
            self.draw_array(colors)
            time.sleep(self.speed)
            
            self.update_stats_display()
            
            if self.array[mid] == self.target:
                return mid
            elif self.array[mid] < self.target:
                left = mid + 1
            else:
                right = mid - 1
        
        return -1
    
    def jump_search(self):
        """Jump search with visualization"""
        import math
        n = len(self.array)
        step = int(math.sqrt(n))
        prev = 0
        
        # Jump to find block
        while prev < n and self.array[min(step, n) - 1] < self.target:
            self.stats.increment_comparisons()
            
            # Highlight jump
            colors = [COLORS['bg_light']] * len(self.array)
            colors[min(step, n) - 1] = COLORS['comparing']
            for i in range(prev, min(step, n)):
                colors[i] = COLORS['path']
            self.draw_array(colors)
            time.sleep(self.speed)
            
            self.update_stats_display()
            
            prev = step
            step += int(math.sqrt(n))
            
            if prev >= n:
                return -1
        
        # Linear search in block
        while prev < n:
            self.stats.increment_comparisons()
            
            colors = [COLORS['bg_light']] * len(self.array)
            colors[prev] = COLORS['comparing']
            self.draw_array(colors)
            time.sleep(self.speed)
            
            self.update_stats_display()
            
            if self.array[prev] == self.target:
                return prev
            
            prev += 1
            
            if prev == min(step, n):
                break
        
        return -1
    
    def interpolation_search(self):
        """Interpolation search with visualization"""
        left, right = 0, len(self.array) - 1
        
        while left <= right and self.target >= self.array[left] and self.target <= self.array[right]:
            if left == right:
                self.stats.increment_comparisons()
                if self.array[left] == self.target:
                    return left
                return -1
            
            # Interpolation formula
            pos = left + int(((right - left) / (self.array[right] - self.array[left])) * 
                           (self.target - self.array[left]))
            
            # Ensure pos is within bounds
            pos = max(left, min(pos, right))
            
            self.stats.increment_comparisons()
            
            # Highlight search position
            colors = [COLORS['bg_light']] * len(self.array)
            for i in range(left, right + 1):
                colors[i] = COLORS['path']
            colors[pos] = COLORS['comparing']
            self.draw_array(colors)
            time.sleep(self.speed)
            
            self.update_stats_display()
            
            if self.array[pos] == self.target:
                return pos
            elif self.array[pos] < self.target:
                left = pos + 1
            else:
                right = pos - 1
        
        return -1
    
    def run(self):
        pass  # Not needed for embedded version

