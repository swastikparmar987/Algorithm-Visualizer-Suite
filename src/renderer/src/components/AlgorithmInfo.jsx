import React, { useState } from 'react'
import { Info, Code, Zap } from 'lucide-react'
import { ALGORITHM_INFO } from '../utils/algorithm_info'

function AlgorithmInfo({ algoName }) {
    const info = ALGORITHM_INFO[algoName] || {}
    const [view, setView] = useState('info') // info, code

    return (
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)' }}>
                <button
                    onClick={() => setView('info')}
                    style={{ flex: 1, padding: '12px', background: view === 'info' ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    <Info size={16} /> Details
                </button>
                <button
                    onClick={() => setView('code')}
                    style={{ flex: 1, padding: '12px', background: view === 'code' ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    <Code size={16} /> Code
                </button>
            </div>

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                {view === 'info' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{info.description || 'No description available for this algorithm.'}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Time Complexity</span>
                                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{info.complexity?.time || 'N/A'}</span>
                            </div>
                            <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Space Complexity</span>
                                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{info.complexity?.space || 'N/A'}</span>
                            </div>
                        </div>
                        <div>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}><Zap size={14} color="var(--primary)" /> Features</h4>
                            <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                                {(info.features || []).map((f, i) => <li key={i}>{f}</li>)}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {info.code ? (
                            <>
                                <div style={{ background: '#1e1e1e', padding: '15px', borderRadius: '10px', position: 'relative' }}>
                                    <span style={{ position: 'absolute', right: '10px', top: '5px', fontSize: '0.7rem', color: '#555' }}>C++</span>
                                    <pre style={{ margin: 0, fontSize: '0.85rem', color: '#d4d4d4', overflowX: 'auto' }}><code>{info.code.cpp}</code></pre>
                                </div>
                                {info.code.python && (
                                    <div style={{ background: '#1e1e1e', padding: '15px', borderRadius: '10px', position: 'relative' }}>
                                        <span style={{ position: 'absolute', right: '10px', top: '5px', fontSize: '0.7rem', color: '#555' }}>Python</span>
                                        <pre style={{ margin: 0, fontSize: '0.85rem', color: '#d4d4d4', overflowX: 'auto' }}><code>{info.code.python}</code></pre>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p style={{ color: 'var(--text-muted)' }}>Code snippets not yet available.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AlgorithmInfo
