import React, { useState, useRef, useEffect } from 'react'
import { Palette } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { playClick } from '../../utils/SoundEngine'

const THEMES = [
    { id: 'dark', label: 'Midnight', colors: ['#0a0b10', '#6366f1', '#22d3ee'] },
    { id: 'cyberpunk', label: 'Cyberpunk', colors: ['#0d0221', '#ff0080', '#00fff5'] },
    { id: 'nord', label: 'Nord', colors: ['#2e3440', '#88c0d0', '#8fbcbb'] },
    { id: 'dracula', label: 'Dracula', colors: ['#282a36', '#bd93f9', '#50fa7b'] },
    { id: 'solarized', label: 'Solarized', colors: ['#002b36', '#268bd2', '#b58900'] },
]

function ThemeToggle() {
    const theme = useAppStore(s => s.theme)
    const setTheme = useAppStore(s => s.setTheme)
    const soundEnabled = useAppStore(s => s.soundEnabled)
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
    }, [theme])

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSelect = (id) => {
        setTheme(id)
        if (soundEnabled) playClick()
        setOpen(false)
    }

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(!open)}
                className="theme-toggle"
                title="Change theme"
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'var(--bg-card)', color: 'var(--text-primary)',
                    border: '1px solid var(--border-glass)', cursor: 'pointer'
                }}
            >
                <Palette size={18} />
            </button>
            {open && (
                <div style={{
                    position: 'absolute', top: '44px', right: 0, zIndex: 1000,
                    background: 'var(--bg-dark)', border: '1px solid var(--border-glass)',
                    borderRadius: '14px', padding: '8px', minWidth: '180px',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
                }}>
                    {THEMES.map(t => (
                        <button
                            key={t.id}
                            onClick={() => handleSelect(t.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                width: '100%', padding: '10px 12px', borderRadius: '10px',
                                background: theme === t.id ? 'var(--primary-glow)' : 'transparent',
                                border: theme === t.id ? '1px solid var(--primary)' : '1px solid transparent',
                                color: 'var(--text-primary)', cursor: 'pointer',
                                fontSize: '0.85rem', fontWeight: theme === t.id ? 600 : 400,
                                transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => { if (theme !== t.id) e.target.style.background = 'var(--bg-elevated)' }}
                            onMouseLeave={e => { if (theme !== t.id) e.target.style.background = 'transparent' }}
                        >
                            <div style={{ display: 'flex', gap: '3px' }}>
                                {t.colors.map((c, i) => (
                                    <div key={i} style={{
                                        width: '14px', height: '14px', borderRadius: '50%',
                                        background: c, border: '1px solid rgba(255,255,255,0.15)'
                                    }} />
                                ))}
                            </div>
                            {t.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ThemeToggle
