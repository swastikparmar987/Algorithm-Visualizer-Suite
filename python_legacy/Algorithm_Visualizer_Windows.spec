# -*- mode: python ; coding: utf-8 -*-
# PyInstaller spec file for Windows .exe build

import os

block_cipher = None

a = Analysis(
    ['main_menu.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('utils.py', '.'),
        ('sorting_visualizer_embedded.py', '.'),
        ('searching_visualizer_embedded.py', '.'),
        ('graph_visualizer_embedded.py', '.'),
        ('tree_visualizer_embedded.py', '.'),
        ('maze_visualizer_embedded.py', '.'),
        ('data_structures_visualizer_embedded.py', '.'),
        ('algorithm_info.py', '.'),
        ('info_panel.py', '.'),
        ('README.md', '.'),
        ('USER_GUIDE.md', '.'),
    ],
    hiddenimports=[
        'customtkinter',
        'PIL',
        'PIL._tkinter_finder',
        'tkinter',
        'tkinter.ttk',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='AlgorithmVisualizer',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,  # Set to False for GUI app (no console window)
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='icon.png' if os.path.exists('icon.png') else None,
)
