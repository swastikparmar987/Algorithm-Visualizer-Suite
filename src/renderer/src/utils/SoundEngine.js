
// Singleton AudioContext to prevent "too many internal nodes" error and ensure smoothness
let audioCtx = null
let masterGain = null

const initAudio = () => {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        audioCtx = new AudioContext()

        // Master Gain aimed at preventing clipping
        masterGain = audioCtx.createGain()
        masterGain.gain.value = 0.3
        masterGain.connect(audioCtx.destination)

        // Resume context on user interaction (browser policy)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume()
        }
    } else if (audioCtx.state === 'suspended') {
        audioCtx.resume()
    }
    return audioCtx
}

// Global toggle for muting everything
let isMuted = false

export const setGlobalMute = (muted) => {
    isMuted = muted
    if (audioCtx && masterGain) {
        // Smooth fade out/in
        const now = audioCtx.currentTime
        masterGain.gain.cancelScheduledValues(now)
        masterGain.gain.setValueAtTime(masterGain.gain.value, now)
        masterGain.gain.linearRampToValueAtTime(muted ? 0 : 0.3, now + 0.1)
    }
}

export const stopAllSounds = () => {
    if (audioCtx) {
        // Suspending immediately stops all audio processing
        // We catch errors just in case, though suspend is usually safe
        audioCtx.suspend().catch(e => console.error("Error stopping audio:", e))
    }
}

// Better synth engine with ADSR envelope
export const playTone = (freq = 440, duration = 100, type = 'sine', vol = 1.0) => {
    if (isMuted) return
    try {
        const ctx = initAudio()
        if (!ctx) return

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.frequency.value = freq
        osc.type = type

        // Connect to Master
        osc.connect(gain)
        gain.connect(masterGain)

        const now = ctx.currentTime
        const durSec = duration / 1000

        // ADSR Envelope
        // Attack: fast but not instant to avoid clicks (0.01s)
        // Decay: to sustain level
        // Release: short fade out

        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(vol, now + 0.01) // Attack
        gain.gain.exponentialRampToValueAtTime(0.001, now + durSec) // Decay/Release

        osc.start(now)
        osc.stop(now + durSec + 0.1) // Stop after release equivalent

        // Remove nodes after playing to avoid memory leaks
        setTimeout(() => {
            osc.disconnect()
            gain.disconnect()
        }, duration + 200)

    } catch (e) {
        console.error('Audio play failed', e)
    }
}

// Pre-defined sounds for consistent UI feedback
export const playClick = () => playTone(1200, 50, 'sine', 0.2) // High, short blip
export const playHover = () => playTone(400, 30, 'triangle', 0.1) // Subtle low blip
export const playBubble = () => playTone(800, 15, 'sine', 0.05) // Soft, fast typing blip

export const playSuccess = () => {
    // Cyberpunk "Objective Complete" sound
    const now = 0
    setTimeout(() => playTone(440, 100, 'square', 0.3), now)
    setTimeout(() => playTone(880, 100, 'square', 0.3), now + 100)
    setTimeout(() => playTone(1760, 400, 'sine', 0.5), now + 200)
}

export const playBattleStart = () => {
    playTone(300, 200, 'sawtooth', 0.4)
    setTimeout(() => playTone(400, 400, 'sawtooth', 0.5), 200)
}

export const playVictory = () => {
    playSuccess()
}

export const playError = () => {
    playTone(150, 300, 'sawtooth', 0.5)
}

export const playAchievement = () => {
    playTone(600, 100, 'sine', 0.3)
    setTimeout(() => playTone(800, 300, 'sine', 0.4), 100)
}

// Algorithm Steps - Smoother, less jarring
export const playStep = (val = null, maxVal = 100) => {
    // Map value to frequency if provided, else default
    // Using Pentatonic scale mapping or just a constrained range helps musicality
    // Range: 200Hz to 1200Hz

    let freq = 600
    if (val !== null) {
        // Normalize val 0-1
        const norm = Math.max(0, Math.min(1, val / maxVal))
        // Map to frequency range
        freq = 200 + (norm * 1000)
    }

    playTone(freq, 80, 'sine', 0.3)
}

export const playCompare = (val1, val2) => {
    // Play two tones to represent comparison
    // Slightly panned if we had stereo, but just quick sequence for now
    playTone(200 + (val1 * 5), 40, 'triangle', 0.2)
    setTimeout(() => playTone(200 + (val2 * 5), 40, 'triangle', 0.2), 50)
}

export const playNavigate = () => {
    playTone(300, 100, 'sawtooth', 0.1)
    setTimeout(() => playTone(600, 200, 'sine', 0.1), 50)
}

export const playSwap = () => {
    // "Whoosh" effect simulation using slide
    // Basic tone for now, complex synthesis is hard in raw Web Audio without worklets
    playTone(150, 100, 'sawtooth', 0.4)
}

// Initialize on load interact
document.addEventListener('click', () => {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume()
    }
}, { once: true })
