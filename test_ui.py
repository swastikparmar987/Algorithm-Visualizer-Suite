#!/usr/bin/env python3
"""
Simple test to verify the application works
"""

import customtkinter as ctk
from utils import COLORS, FONTS

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("green")

# Test 1: Can we create a simple window?
print("Test 1: Creating simple window...")
app = ctk.CTk()
app.title("Test Window")
app.geometry("800x600")
app.configure(fg_color=COLORS['bg_dark'])

# Test 2: Can we add a frame?
print("Test 2: Adding frame...")
frame = ctk.CTkFrame(app, fg_color=COLORS['bg_medium'])
frame.pack(fill="both", expand=True, padx=20, pady=20)

# Test 3: Can we add a label?
print("Test 3: Adding label...")
label = ctk.CTkLabel(
    frame,
    text="✅ If you see this, basic UI works!",
    font=("SF Pro Display", 24, "bold"),
    text_color=COLORS['text']
)
label.pack(pady=50)

# Test 4: Can we add a button?
print("Test 4: Adding button...")
def on_click():
    label.configure(text="✅ Button clicked! UI is responsive!")
    print("Button clicked successfully!")

button = ctk.CTkButton(
    frame,
    text="Click Me to Test Responsiveness",
    command=on_click,
    font=("SF Pro Display", 16, "bold"),
    fg_color=COLORS['button_primary'],
    hover_color=COLORS['button_hover'],
    height=50,
    width=300
)
button.pack(pady=20)

# Test 5: Add status
status = ctk.CTkLabel(
    frame,
    text="Status: Ready for testing",
    font=("SF Pro Display", 14),
    text_color=COLORS['text_secondary']
)
status.pack(pady=10)

print("\n" + "="*50)
print("✅ All tests passed! Window should be visible.")
print("="*50)
print("\nIf you see the window with a button:")
print("  - Click the button to test responsiveness")
print("  - If text changes instantly = UI is working")
print("\nClose the window when done testing.")
print("="*50 + "\n")

app.mainloop()
