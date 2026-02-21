"""
Reusable Information Panel Component
Displays algorithm/data structure information with tabbed interface
"""

import customtkinter as ctk
from utils import COLORS, FONTS

class InfoPanel(ctk.CTkFrame):
    """
    A beautiful, themed information panel with tabbed interface
    Shows: About, C++ Code, Python Code
    """
    
    def __init__(self, parent, **kwargs):
        super().__init__(parent, fg_color=COLORS['bg_dark'], corner_radius=10, 
                         border_width=3, border_color='#000000', **kwargs)
        
        self.current_tab = "about"
        self.current_info = None
        
        self.setup_ui()
    
    def setup_ui(self):
        """Setup the information panel UI"""
        # Header
        header = ctk.CTkLabel(
            self,
            text="📚 Algorithm Information",
            font=('SF Pro Display', 18, 'bold'),
            text_color=COLORS['text']
        )
        header.pack(pady=(20, 15), padx=20)
        
        # Tab buttons frame
        tab_frame = ctk.CTkFrame(self, fg_color='transparent')
        tab_frame.pack(fill='x', padx=20, pady=(0, 15))
        
        # Create tab buttons
        self.tab_buttons = {}
        tabs = [
            ('about', '📖 About'),
            ('cpp', '💻 C++'),
            ('python', '🐍 Python')
        ]
        
        for tab_id, tab_label in tabs:
            btn = ctk.CTkButton(
                tab_frame,
                text=tab_label,
                command=lambda t=tab_id: self.switch_tab(t),
                font=('SF Pro Display', 13, 'bold'),
                height=40,
                corner_radius=10
            )
            btn.pack(side='left', expand=True, fill='x', padx=3)
            self.tab_buttons[tab_id] = btn
        
        # Content area using CTkTextbox for better text display
        self.content_text = ctk.CTkTextbox(
            self,
            fg_color=COLORS['bg_medium'],
            corner_radius=10,
            border_width=0,
            font=('SF Pro Display', 13),
            text_color=COLORS['text'],
            wrap='word',
            activate_scrollbars=True
        )
        self.content_text.pack(fill='both', expand=True, padx=20, pady=(0, 20))
        
        # Insert default text
        self.content_text.insert('1.0', 'Select an algorithm to view information')
        self.content_text.configure(state='disabled')  # Make read-only
        
        # Update tab button colors
        self.update_tab_colors()
    
    def switch_tab(self, tab_id):
        """Switch to a different tab"""
        self.current_tab = tab_id
        self.update_tab_colors()
        self.update_content()
    
    def update_tab_colors(self):
        """Update tab button colors based on active tab"""
        for tab_id, btn in self.tab_buttons.items():
            if tab_id == self.current_tab:
                btn.configure(
                    fg_color=COLORS['accent'],
                    hover_color=COLORS['button_secondary_hover'],
                    text_color='#ffffff'
                )
            else:
                btn.configure(
                    fg_color=COLORS['bg_medium'],
                    hover_color=COLORS['bg_light'],
                    text_color=COLORS['text_secondary']
                )
    
    def set_algorithm(self, algorithm_info):
        """
        Set the algorithm information to display
        
        Args:
            algorithm_info: Dictionary with keys: description, how_it_works, cpp_code, python_code
        """
        self.current_info = algorithm_info
        self.update_content()
    
    def update_content(self):
        """Update the content area based on current tab and algorithm"""
        # Enable editing to update content
        self.content_text.configure(state='normal')
        self.content_text.delete('1.0', 'end')
        
        if not self.current_info:
            self.content_text.insert('1.0', 'Select an algorithm to view information')
            self.content_text.configure(
                font=('SF Pro Display', 13),
                text_color=COLORS['text_secondary']
            )
            self.content_text.configure(state='disabled')
            return
        
        if self.current_tab == 'about':
            # Show description and how it works
            content = f"{self.current_info.get('description', '')}\\n\\n"
            content += self.current_info.get('how_it_works', '')
            
            self.content_text.insert('1.0', content)
            self.content_text.configure(
                font=('SF Pro Display', 13),
                text_color=COLORS['text']
            )
        
        elif self.current_tab == 'cpp':
            # Show C++ code
            code = self.current_info.get('cpp_code', 'No C++ code available')
            
            self.content_text.insert('1.0', code)
            self.content_text.configure(
                font=('Monaco', 11),  # Monospace font for code
                text_color='#00ff88'  # Green color for code
            )
        
        elif self.current_tab == 'python':
            # Show Python code
            code = self.current_info.get('python_code', 'No Python code available')
            
            self.content_text.insert('1.0', code)
            self.content_text.configure(
                font=('Monaco', 11),  # Monospace font for code
                text_color='#00b4d8'  # Blue color for code
            )
        
        # Make read-only again
        self.content_text.configure(state='disabled')
    
    def clear(self):
        """Clear the information panel"""
        self.current_info = None
        self.update_content()
