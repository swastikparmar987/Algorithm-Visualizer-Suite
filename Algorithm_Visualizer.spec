# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['main_menu.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('ai_service.py', '.'),
        ('ai_explanation_panel.py', '.'),
        ('utils.py', '.'),
        ('sorting_visualizer_embedded.py', '.'),
        ('searching_visualizer_embedded.py', '.'),
        ('graph_visualizer_embedded.py', '.'),
        ('tree_visualizer_embedded.py', '.'),
        ('maze_visualizer_embedded.py', '.'),
        ('data_structures_visualizer_embedded.py', '.'),
        ('.env.example', '.'),  # Include example, not actual .env
        ('README.md', '.'),
        ('USER_GUIDE.md', '.'),
        ('QUICK_REFERENCE.md', '.'),
        ('AI_SETUP_GUIDE.md', '.'),
    ],
    hiddenimports=[
        'customtkinter',
        'google.generativeai',
        'dotenv',
        'PIL',
        'PIL._tkinter_finder',
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
    [],
    exclude_binaries=True,
    name='Algorithm Visualizer',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='icon.icns' if os.path.exists('icon.icns') else None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='Algorithm Visualizer',
)

app = BUNDLE(
    coll,
    name='Algorithm Visualizer.app',
    icon='icon.icns' if os.path.exists('icon.icns') else None,
    bundle_identifier='com.algorithmvisualizer.app',
    info_plist={
        'NSPrincipalClass': 'NSApplication',
        'NSHighResolutionCapable': 'True',
        'CFBundleName': 'Algorithm Visualizer',
        'CFBundleDisplayName': 'Algorithm Visualizer',
        'CFBundleVersion': '1.0.0',
        'CFBundleShortVersionString': '1.0.0',
        'NSHumanReadableCopyright': 'Copyright © 2024',
        'LSMinimumSystemVersion': '10.13.0',
    },
)
