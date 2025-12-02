#!/usr/bin/env python3
"""
Debug script to test button responsiveness
"""

import customtkinter as ctk
from utils import COLORS, FONTS

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("green")

app = ctk.CTk()
app.title("Button Response Test")
app.geometry("600x400")
app.configure(fg_color=COLORS['bg_dark'])

frame = ctk.CTkFrame(app, fg_color=COLORS['bg_medium'])
frame.pack(fill="both", expand=True, padx=20, pady=20)

label = ctk.CTkLabel(
    frame,
    text="Click counter: 0",
    font=("SF Pro Display", 24, "bold"),
    text_color=COLORS['text']
)
label.pack(pady=50)

click_count = [0]

def on_click():
    click_count[0] += 1
    label.configure(text=f"Click counter: {click_count[0]}")
    print(f"Button clicked! Count: {click_count[0]}")
    app.update()  # Force immediate update

button = ctk.CTkButton(
    frame,
    text="Click Me - Should Respond Instantly",
    command=on_click,
    font=("SF Pro Display", 16, "bold"),
    fg_color=COLORS['button_primary'],
    hover_color=COLORS['button_hover'],
    height=50,
    width=300
)
button.pack(pady=20)

info = ctk.CTkLabel(
    frame,
    text="If counter updates on FIRST click = buttons work\nIf it takes 2+ clicks = there's a problem",
    font=("SF Pro Display", 12),
    text_color=COLORS['text_secondary']
)
info.pack(pady=20)

print("\n" + "="*50)
print("BUTTON RESPONSE TEST")
print("="*50)
print("Click the button and watch:")
print("1. Does the counter update on FIRST click?")
print("2. Check terminal - does it print immediately?")
print("="*50 + "\n")

app.mainloop()
