#!/usr/bin/env python3
"""
Quick test to verify theme switching works
"""
import customtkinter as ctk
from utils import COLORS, ThemeManager

# Start with dark theme
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("green")

app = ctk.CTk()
app.title("Theme Test")
app.geometry("600x400")
app.configure(fg_color=COLORS['bg_dark'])

def toggle_theme():
    ThemeManager.toggle_theme()
    current = ThemeManager.get_current_theme()
    ctk.set_appearance_mode(current)
    
    # Update all widgets
    app.configure(fg_color=COLORS['bg_dark'])
    frame.configure(fg_color=COLORS['bg_medium'])
    label.configure(text=f"Current theme: {current}")
    btn.configure(text="☀️" if current == 'dark' else "🌙")
    
    print(f"Theme changed to: {current}")
    print(f"bg_dark color: {COLORS['bg_dark']}")
    print(f"bg_medium color: {COLORS['bg_medium']}")

frame = ctk.CTkFrame(app, fg_color=COLORS['bg_medium'], width=400, height=200)
frame.pack(pady=50)

label = ctk.CTkLabel(frame, text=f"Current theme: {ThemeManager.get_current_theme()}", 
                     font=("Arial", 20), text_color=COLORS['text'])
label.pack(pady=20)

btn = ctk.CTkButton(frame, text="🌙", command=toggle_theme, 
                    font=("Arial", 30), width=100, height=50)
btn.pack(pady=20)

info = ctk.CTkLabel(frame, text="Click button to toggle theme", 
                    font=("Arial", 12), text_color=COLORS['text_secondary'])
info.pack()

app.mainloop()
