import customtkinter as ctk
import random
import time
from utils import COLORS, FONTS, Statistics, get_speed_label

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("green")

class SortingVisualizer:
    def __init__(self):
        self.app = ctk.CTk()
        self.app.title("📊 Sorting Algorithm Visualizer")
        self.app.geometry("1400x800")
        self.app.configure(fg_color=COLORS['bg_dark'])
        
        # State variables
        self.array = []
        self.array_size = 50
        self.speed = 0.01
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
            text="📊 Sorting Algorithm Visualizer",
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
                "Bubble Sort",
                "Selection Sort",
                "Insertion Sort",
                "Merge Sort",
                "Quick Sort",
                "Heap Sort"
            ],
            font=FONTS['body'],
            dropdown_font=FONTS['body'],
            fg_color=COLORS['accent'],
            button_color=COLORS['accent'],
            button_hover_color=COLORS['button_secondary_hover'],
            width=280
        )
        self.algo_dropdown.set("Bubble Sort")
        self.algo_dropdown.pack(pady=(0, 15))
        
        # Array Size Control
        size_label = ctk.CTkLabel(
            control_panel,
            text="Array Size",
            font=FONTS['subheading'],
            text_color=COLORS['text']
        )
        size_label.pack(pady=(10, 5))
        
        self.size_value_label = ctk.CTkLabel(
            control_panel,
            text=f"{self.array_size} elements",
            font=FONTS['body'],
            text_color=COLORS['button_primary']
        )
        self.size_value_label.pack(pady=(0, 5))
        
        self.size_slider = ctk.CTkSlider(
            control_panel,
            from_=10,
            to=100,
            command=self.update_size,
            width=280,
            progress_color=COLORS['button_primary'],
            button_color=COLORS['button_primary'],
            button_hover_color=COLORS['button_hover']
        )
        self.size_slider.set(self.array_size)
        self.size_slider.pack(pady=(0, 15))
        
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
            from_=0.001,
            to=0.2,
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
        
        self.sort_btn = ctk.CTkButton(
            control_panel,
            text="▶️ Start Sorting",
            command=self.start_sorting,
            font=FONTS['button'],
            fg_color=COLORS['accent'],
            hover_color=COLORS['button_secondary_hover'],
            height=40,
            width=280,
            corner_radius=10
        )
        self.sort_btn.pack(pady=8)
        
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
        
        self.stats_swaps = ctk.CTkLabel(
            stats_frame,
            text="Swaps: 0",
            font=FONTS['body'],
            text_color=COLORS['text']
        )
        self.stats_swaps.pack(pady=2)
        
        self.stats_time = ctk.CTkLabel(
            stats_frame,
            text="Time: 0.00s",
            font=FONTS['body'],
            text_color=COLORS['text']
        )
        self.stats_time.pack(pady=(2, 10))
    
    def update_size(self, value):
        if not self.is_running:
            self.array_size = int(value)
            self.size_value_label.configure(text=f"{self.array_size} elements")
            self.generate_array()
    
    def update_speed(self, value):
        self.speed = float(value)
        self.speed_value_label.configure(text=get_speed_label(self.speed))
    
    def generate_array(self):
        if self.is_running:
            return
        self.array = [random.randint(10, 500) for _ in range(self.array_size)]
        self.stats.reset()
        self.update_stats_display()
        self.draw_array()
    
    def draw_array(self, color_array=None):
        """Draw the array as bars"""
        self.canvas.delete("all")
        
        canvas_width = self.canvas.winfo_width() or 1000
        canvas_height = self.canvas.winfo_height() or 600
        
        bar_width = (canvas_width - 40) / len(self.array)
        max_height = canvas_height - 60
        max_value = max(self.array) if self.array else 1
        
        for i, value in enumerate(self.array):
            x0 = 20 + i * bar_width
            height = (value / max_value) * max_height
            y0 = canvas_height - 30 - height
            x1 = x0 + bar_width - 2
            y1 = canvas_height - 30
            
            # Determine color
            if color_array and i < len(color_array):
                color = color_array[i]
            else:
                color = COLORS['path']
            
            self.canvas.create_rectangle(
                x0, y0, x1, y1,
                fill=color,
                outline=COLORS['bg_dark']
            )
        
        self.app.update()
    
    def update_stats_display(self):
        self.stats_comparisons.configure(text=f"Comparisons: {self.stats.comparisons}")
        self.stats_swaps.configure(text=f"Swaps: {self.stats.swaps}")
        self.stats_time.configure(text=f"Time: {self.stats.time_elapsed:.2f}s")
    
    def start_sorting(self):
        if self.is_running:
            return
        
        self.is_running = True
        self.sort_btn.configure(state="disabled")
        self.generate_btn.configure(state="disabled")
        
        algo = self.algo_dropdown.get()
        start_time = time.time()
        
        try:
            if algo == "Bubble Sort":
                self.bubble_sort()
            elif algo == "Selection Sort":
                self.selection_sort()
            elif algo == "Insertion Sort":
                self.insertion_sort()
            elif algo == "Merge Sort":
                self.merge_sort(0, len(self.array) - 1)
            elif algo == "Quick Sort":
                self.quick_sort(0, len(self.array) - 1)
            elif algo == "Heap Sort":
                self.heap_sort()
            
            self.stats.time_elapsed = time.time() - start_time
            self.update_stats_display()
            
            # Show final sorted array in green
            self.draw_array([COLORS['sorted']] * len(self.array))
            
        finally:
            self.is_running = False
            self.sort_btn.configure(state="normal")
            self.generate_btn.configure(state="normal")
    
    # Sorting Algorithms
    
    def bubble_sort(self):
        n = len(self.array)
        for i in range(n):
            for j in range(0, n - i - 1):
                self.stats.increment_comparisons()
                
                # Highlight comparing elements
                colors = [COLORS['path']] * len(self.array)
                colors[j] = COLORS['comparing']
                colors[j + 1] = COLORS['comparing']
                for k in range(n - i, n):
                    colors[k] = COLORS['sorted']
                self.draw_array(colors)
                time.sleep(self.speed)
                
                if self.array[j] > self.array[j + 1]:
                    self.stats.increment_swaps()
                    self.array[j], self.array[j + 1] = self.array[j + 1], self.array[j]
                    
                    # Highlight swapping
                    colors[j] = COLORS['swapping']
                    colors[j + 1] = COLORS['swapping']
                    self.draw_array(colors)
                    time.sleep(self.speed)
                
                self.update_stats_display()
    
    def selection_sort(self):
        n = len(self.array)
        for i in range(n):
            min_idx = i
            
            for j in range(i + 1, n):
                self.stats.increment_comparisons()
                
                # Highlight comparing elements
                colors = [COLORS['path']] * len(self.array)
                for k in range(i):
                    colors[k] = COLORS['sorted']
                colors[min_idx] = COLORS['current']
                colors[j] = COLORS['comparing']
                self.draw_array(colors)
                time.sleep(self.speed)
                
                if self.array[j] < self.array[min_idx]:
                    min_idx = j
                
                self.update_stats_display()
            
            if min_idx != i:
                self.stats.increment_swaps()
                self.array[i], self.array[min_idx] = self.array[min_idx], self.array[i]
                
                # Highlight swap
                colors = [COLORS['path']] * len(self.array)
                for k in range(i):
                    colors[k] = COLORS['sorted']
                colors[i] = COLORS['swapping']
                colors[min_idx] = COLORS['swapping']
                self.draw_array(colors)
                time.sleep(self.speed)
    
    def insertion_sort(self):
        for i in range(1, len(self.array)):
            key = self.array[i]
            j = i - 1
            
            while j >= 0:
                self.stats.increment_comparisons()
                
                # Highlight comparing
                colors = [COLORS['path']] * len(self.array)
                for k in range(i + 1):
                    colors[k] = COLORS['sorted']
                colors[j] = COLORS['comparing']
                colors[i] = COLORS['current']
                self.draw_array(colors)
                time.sleep(self.speed)
                
                if self.array[j] > key:
                    self.stats.increment_swaps()
                    self.array[j + 1] = self.array[j]
                    j -= 1
                else:
                    break
                
                self.update_stats_display()
            
            self.array[j + 1] = key
    
    def merge_sort(self, left, right):
        if left < right:
            mid = (left + right) // 2
            self.merge_sort(left, mid)
            self.merge_sort(mid + 1, right)
            self.merge(left, mid, right)
    
    def merge(self, left, mid, right):
        left_part = self.array[left:mid + 1]
        right_part = self.array[mid + 1:right + 1]
        
        i = j = 0
        k = left
        
        while i < len(left_part) and j < len(right_part):
            self.stats.increment_comparisons()
            
            # Highlight merging
            colors = [COLORS['path']] * len(self.array)
            for idx in range(left, right + 1):
                colors[idx] = COLORS['comparing']
            colors[k] = COLORS['current']
            self.draw_array(colors)
            time.sleep(self.speed)
            
            if left_part[i] <= right_part[j]:
                self.array[k] = left_part[i]
                i += 1
            else:
                self.array[k] = right_part[j]
                j += 1
            
            self.stats.increment_swaps()
            k += 1
            self.update_stats_display()
        
        while i < len(left_part):
            self.array[k] = left_part[i]
            i += 1
            k += 1
            self.stats.increment_swaps()
        
        while j < len(right_part):
            self.array[k] = right_part[j]
            j += 1
            k += 1
            self.stats.increment_swaps()
    
    def quick_sort(self, low, high):
        if low < high:
            pi = self.partition(low, high)
            self.quick_sort(low, pi - 1)
            self.quick_sort(pi + 1, high)
    
    def partition(self, low, high):
        pivot = self.array[high]
        i = low - 1
        
        for j in range(low, high):
            self.stats.increment_comparisons()
            
            # Highlight comparison
            colors = [COLORS['path']] * len(self.array)
            colors[high] = COLORS['pivot']
            colors[j] = COLORS['comparing']
            if i >= 0:
                colors[i] = COLORS['current']
            self.draw_array(colors)
            time.sleep(self.speed)
            
            if self.array[j] < pivot:
                i += 1
                self.stats.increment_swaps()
                self.array[i], self.array[j] = self.array[j], self.array[i]
                
                # Highlight swap
                colors[i] = COLORS['swapping']
                colors[j] = COLORS['swapping']
                self.draw_array(colors)
                time.sleep(self.speed)
            
            self.update_stats_display()
        
        self.stats.increment_swaps()
        self.array[i + 1], self.array[high] = self.array[high], self.array[i + 1]
        return i + 1
    
    def heap_sort(self):
        n = len(self.array)
        
        # Build max heap
        for i in range(n // 2 - 1, -1, -1):
            self.heapify(n, i)
        
        # Extract elements from heap
        for i in range(n - 1, 0, -1):
            self.stats.increment_swaps()
            self.array[0], self.array[i] = self.array[i], self.array[0]
            
            # Highlight swap
            colors = [COLORS['path']] * len(self.array)
            colors[0] = COLORS['swapping']
            colors[i] = COLORS['swapping']
            for k in range(i + 1, n):
                colors[k] = COLORS['sorted']
            self.draw_array(colors)
            time.sleep(self.speed)
            
            self.heapify(i, 0)
            self.update_stats_display()
    
    def heapify(self, n, i):
        largest = i
        left = 2 * i + 1
        right = 2 * i + 2
        
        if left < n:
            self.stats.increment_comparisons()
            if self.array[left] > self.array[largest]:
                largest = left
        
        if right < n:
            self.stats.increment_comparisons()
            if self.array[right] > self.array[largest]:
                largest = right
        
        if largest != i:
            self.stats.increment_swaps()
            self.array[i], self.array[largest] = self.array[largest], self.array[i]
            
            # Highlight heapify
            colors = [COLORS['path']] * len(self.array)
            colors[i] = COLORS['swapping']
            colors[largest] = COLORS['swapping']
            self.draw_array(colors)
            time.sleep(self.speed)
            
            self.heapify(n, largest)
    
    def run(self):
        self.app.mainloop()

if __name__ == "__main__":
    visualizer = SortingVisualizer()
    visualizer.run()
