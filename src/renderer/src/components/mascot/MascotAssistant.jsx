import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, MessageSquare, Send } from 'lucide-react'
import AnimatedAvatar from './AnimatedAvatar'
import TypewriterText from '../common/TypewriterText'
import { useAppStore } from '../../store/useAppStore'
import { GoogleGenAI } from '@google/genai';

const MascotAssistant = () => {
    const [isVisible, setIsVisible] = useState(false)
    const [message, setMessage] = useState("Hi! I'm AlgoBot. Ready to learn some algorithms?")
    const [mood, setMood] = useState('neutral')
    const [isTyping, setIsTyping] = useState(false)
    const [inputValue, setInputValue] = useState('')

    // Store Context for NLP
    const { xp, level, dailyStreak, visitedVisualizers, unlockedAchievements } = useAppStore()

    const inputRef = useRef(null)
    const keyIndexRef = useRef(0)

    // NLP Response Engine
    const processQuery = async (query) => {
        setIsTyping(true);
        setIsVisible(true);
        setMessage(''); // Clear immediately so Typewriter triggers update
        setMood('thinking');

        try {
            const apiKeyString = import.meta.env.VITE_GEMINI_API_KEYS || import.meta.env.VITE_GEMINI_API_KEY;

            if (!apiKeyString) {
                setMood('surprised');
                setMessage("I don't have a Gemini API key yet! Please add VITE_GEMINI_API_KEYS to your .env file.");
                return;
            }

            const apiKeys = apiKeyString.split(',').map(k => k.trim()).filter(Boolean);
            const currentKey = apiKeys[keyIndexRef.current % apiKeys.length];
            keyIndexRef.current += 1;

            const ai = new GoogleGenAI({ apiKey: currentKey });

            const systemInstruction = `You are AlgoBot, a helpful, enthusiastic, and highly knowledgeable AI assistant embedded within an Algorithm Visualizer application.
Your goal is to help the user learn algorithms, data structures, and computer science concepts. Keep your answers concise, engaging, and easy to read in a small chat widget. 
If the user asks a coding or algorithm question, answer it accurately but simply.
Here is the user's current context: 
- Level: ${level}
- current XP: ${xp}
- Daily Streak: ${dailyStreak}
- Visited Modules: ${visitedVisualizers?.join(', ') || 'None yet'}
- Unlocked Achievements: ${unlockedAchievements?.length || 0}
Use this context to personalize your response if they ask about their progress, what to learn next, or if you want to motivate them.
FORMAT REQUIREMENT: You must return a JSON object with exactly two keys: "mood" and "text".
"mood" must be exactly one of these strings: "neutral", "happy", "thinking", "excited", "surprised". Choose the mood that best fits your response.
"text" must be your actual response string. Absolutely no markdown formatting like code blocks around the JSON. Return raw JSON.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: query,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.7,
                    responseMimeType: "application/json"
                }
            });

            if (response && response.text) {
                try {
                    const parsed = JSON.parse(response.text);
                    setMood(parsed.mood || 'neutral');
                    setMessage(parsed.text || 'I had trouble processing that.');
                } catch (parseError) {
                    console.error("Failed to parse Gemini JSON:", parseError);
                    setMood('surprised');
                    setMessage(response.text);
                }
            } else {
                setMood('surprised');
                setMessage("My neural link to Gemini seems down right now!");
            }
        } catch (error) {
            console.error("Gemini Error:", error);
            setMood('surprised');
            setMessage("An error occurred while thinking! Check console.");
        }
    }

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isTyping) return;

        const query = inputValue;
        setInputValue('');
        processQuery(query);
    }

    // Listen for custom events to trigger mascot messages externally
    useEffect(() => {
        const handleMascotSpeech = (e) => {
            setMessage('');
            setTimeout(() => {
                setMessage(e.detail.text)
                setMood(e.detail.mood || 'neutral')
                setIsVisible(true)
                setIsTyping(true)
            }, 100);
        }

        window.addEventListener('mascot-speech', handleMascotSpeech)

        const timer = setTimeout(() => {
            if (!isVisible) setIsVisible(true)
        }, 3000)

        return () => {
            window.removeEventListener('mascot-speech', handleMascotSpeech)
            clearTimeout(timer)
        }
    }, [])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    drag
                    dragMomentum={false}
                    initial={{ opacity: 0, y: 50, x: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    style={{
                        position: 'fixed', bottom: '30px', right: '30px',
                        zIndex: 1000, display: 'flex', flexDirection: 'column',
                        alignItems: 'flex-end', gap: '16px'
                    }}
                >
                    {/* Speech Bubble Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, originY: 1, originX: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-bg-elevated border border-border-glass rounded-2xl p-4 shadow-2xl backdrop-blur-xl w-72 relative"
                        style={{ pointerEvents: 'auto' }}
                    >
                        {/* Chat Text */}
                        <div className="text-white text-sm font-medium leading-relaxed mb-4 min-h-[60px]">
                            {message && (
                                <TypewriterText
                                    key={message}
                                    text={message}
                                    speed={30}
                                    onComplete={() => setIsTyping(false)}
                                />
                            )}
                        </div>

                        {/* Interactive Input Form */}
                        <form onSubmit={handleSend} className="relative mt-2 border-t border-white/10 pt-3">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask AlgoBot..."
                                className="w-full bg-black/30 border border-white/10 rounded-lg py-2 pl-3 pr-10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={isTyping || !inputValue.trim()}
                                className="absolute right-2 top-1/2 mt-[6px] -translate-y-1/2 text-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={14} />
                            </button>
                        </form>

                        {/* Tail pointer of the bubble */}
                        <div className="absolute -bottom-3 right-6 w-6 h-6 bg-bg-elevated border-r border-b border-border-glass transform rotate-45 z-[-1]" />
                    </motion.div>

                    {/* Animated Mascot Body */}
                    <div className="relative group cursor-pointer" onClick={() => !isTyping && setIsVisible(false)}>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative z-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                        >
                            <AnimatedAvatar mood={mood} isSpeaking={isTyping} size={70} />

                            {/* Close overlay on hover */}
                            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <X className="text-white" size={24} />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// Helper to trigger mascot speech from anywhere
export const say = (text, mood = 'neutral') => {
    window.dispatchEvent(new CustomEvent('mascot-speech', { detail: { text, mood } }))
}

export default MascotAssistant
