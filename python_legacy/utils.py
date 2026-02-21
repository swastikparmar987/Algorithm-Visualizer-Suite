"""
Shared utilities and constants for algorithm visualizers
"""

# Theme System
THEMES = {
    'dark': {
        # Backgrounds
        'bg_dark': '#0a0e27',
        'bg_medium': '#1a1f3a',
        'bg_light': '#2d3250',
        
        # UI Elements
        'wall': '#2d3250',
        'path': '#f0f0f0',
        'text': '#ffffff',
        'text_secondary': '#a0aec0',
        'border': '#000000',            # Black borders
        'border_width': 3,              # 3px borders
        
        # Algorithm-specific
        'start': '#00ff88',
        'end': '#ff3366',
        'bfs_explore': '#ffd700',
        'dfs_explore': '#9d4edd',
        'astar_explore': '#00b4d8',
        'final_path': '#00ff88',
        
        # Sorting colors
        'comparing': '#ffd700',
        'swapping': '#ff3366',
        'sorted': '#00ff88',
        'pivot': '#9d4edd',
        'current': '#00b4d8',
        
        # Graph colors
        'node_default': '#4a5568',
        'node_visited': '#00b4d8',
        'node_current': '#ffd700',
        'edge_default': '#718096',
        'edge_active': '#00ff88',
        'edge_mst': '#ff3366',
        
        # Buttons
        'button_primary': '#00ff88',
        'button_hover': '#00cc6a',
        'button_secondary': '#7c3aed',
        'button_secondary_hover': '#6d28d9',
        'button_danger': '#ff3366',
        'button_danger_hover': '#cc2952',
        'accent': '#7c3aed',
        
        # Gradients (for cards)
        'gradient_1_start': '#667eea',
        'gradient_1_end': '#764ba2',
        'gradient_2_start': '#f093fb',
        'gradient_2_end': '#f5576c',
        'gradient_3_start': '#4facfe',
        'gradient_3_end': '#00f2fe',
        'gradient_4_start': '#43e97b',
        'gradient_4_end': '#38f9d7',
        'gradient_5_start': '#fa709a',
        'gradient_5_end': '#fee140',
        'gradient_6_start': '#30cfd0',
        'gradient_6_end': '#330867',
    }
}

# Current theme (default to dark)
_current_theme = 'dark'
COLORS = THEMES[_current_theme].copy()

class ThemeManager:
    """Manages theme switching across the application"""
    _callbacks = []
    
    @staticmethod
    def get_current_theme():
        global _current_theme
        return _current_theme
    
    @staticmethod
    def set_theme(theme_name):
        global _current_theme, COLORS
        if theme_name in THEMES:
            _current_theme = theme_name
            COLORS.clear()
            COLORS.update(THEMES[theme_name])
            # Notify all registered callbacks
            for callback in ThemeManager._callbacks:
                callback(theme_name)
            return True
        return False
    
    @staticmethod
    def toggle_theme():
        current = ThemeManager.get_current_theme()
        new_theme = 'light' if current == 'dark' else 'dark'
        return ThemeManager.set_theme(new_theme)
    
    @staticmethod
    def register_callback(callback):
        """Register a callback to be called when theme changes"""
        ThemeManager._callbacks.append(callback)
    
    @staticmethod
    def unregister_callback(callback):
        """Unregister a theme change callback"""
        if callback in ThemeManager._callbacks:
            ThemeManager._callbacks.remove(callback)

# Font configurations
FONTS = {
    'title': ('SF Pro Display', 24, 'bold'),
    'heading': ('SF Pro Display', 18, 'bold'),
    'subheading': ('SF Pro Display', 14, 'bold'),
    'body': ('SF Pro Display', 12),
    'small': ('SF Pro Display', 10),
    'button': ('SF Pro Display', 14, 'bold'),
}

# Speed presets
SPEED_PRESETS = {
    'instant': {'value': 0.001, 'label': 'Instant ⚡⚡', 'emoji': '⚡⚡'},
    'fast': {'value': 0.01, 'label': 'Fast 🚀', 'emoji': '🚀'},
    'medium': {'value': 0.05, 'label': 'Medium ⏱️', 'emoji': '⏱️'},
    'slow': {'value': 0.1, 'label': 'Slow 🐢', 'emoji': '🐢'},
}

# Animation speeds (legacy support)
SPEEDS = {
    'very_fast': 0.001,
    'fast': 0.01,
    'medium': 0.05,
    'slow': 0.1,
    'very_slow': 0.2,
}

class Statistics:
    """Helper class to track algorithm statistics"""
    def __init__(self):
        self.reset()
    
    def reset(self):
        self.comparisons = 0
        self.swaps = 0
        self.operations = 0
        self.time_elapsed = 0
        self.path_length = 0
        self.nodes_explored = 0
    
    def increment_comparisons(self):
        self.comparisons += 1
    
    def increment_swaps(self):
        self.swaps += 1
    
    def increment_operations(self):
        self.operations += 1
    
    def set_time(self, time_val):
        self.time_elapsed = time_val
    
    def set_path_length(self, length):
        self.path_length = length
    
    def increment_nodes_explored(self):
        self.nodes_explored += 1

def get_speed_label(speed_value):
    """Convert speed value to human-readable label"""
    if speed_value <= 0.005:
        return "Very Fast ⚡"
    elif speed_value <= 0.03:
        return "Fast 🚀"
    elif speed_value <= 0.08:
        return "Medium ⏱️"
    elif speed_value <= 0.15:
        return "Slow 🐢"
    else:
        return "Very Slow 🐌"

def interpolate_color(color1, color2, factor):
    """Interpolate between two hex colors"""
    # Convert hex to RGB
    c1 = tuple(int(color1.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
    c2 = tuple(int(color2.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
    
    # Interpolate
    r = int(c1[0] + (c2[0] - c1[0]) * factor)
    g = int(c1[1] + (c2[1] - c1[1]) * factor)
    b = int(c1[2] + (c2[2] - c1[2]) * factor)
    
    # Convert back to hex
    return f'#{r:02x}{g:02x}{b:02x}'

def take_screenshot(widget, filename="screenshot.png"):
    """
    Take a screenshot of a widget and save it as PNG
    
    Args:
        widget: The tkinter widget to capture
        filename: Output filename (default: screenshot.png)
    
    Returns:
        str: Path to saved screenshot or None if failed
    """
    try:
        from PIL import ImageGrab
        import os
        from datetime import datetime
        
        # Get widget position and size
        x = widget.winfo_rootx()
        y = widget.winfo_rooty()
        width = widget.winfo_width()
        height = widget.winfo_height()
        
        # Capture the area
        screenshot = ImageGrab.grab(bbox=(x, y, x + width, y + height))
        
        # Generate filename with timestamp if not specified
        if filename == "screenshot.png":
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"visualizer_screenshot_{timestamp}.png"
        
        # Save the screenshot
        screenshot.save(filename)
        print(f"✅ Screenshot saved: {filename}")
        return filename
    except Exception as e:
        print(f"❌ Screenshot failed: {e}")
        return None
