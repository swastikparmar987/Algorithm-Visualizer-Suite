import customtkinter as ctk
import random
import time
from utils import COLORS, FONTS, Statistics, get_speed_label

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("green")

class SearchingVisualizer:
    def __init__(self):
        self.app = ctk.CTk()
        self.app.title("🔍 Searching Algorithm Visualizer")
        self.app.geometry("1400x800")
        self.app.configure(fg_color=COLORS['bg_dark'])
        
        # State variables
        self.array = []
        self.array_size = 30
        self.target = 0
        self.speed = 0.05
        self.is_running = False
        self.stats = Statistics()
        
        self.setup_ui()
        self.generate_array()
    
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
            width=280
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
        self.speed_slider.pack(pady=(0, 15))
        
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
        
        self.app.update()
    
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
        self.app.mainloop()

if __name__ == "__main__":
    visualizer = SearchingVisualizer()
    visualizer.run()
