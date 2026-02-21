import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { playBubble } from '../../utils/SoundEngine';
import { useAppStore } from '../../store/useAppStore';

const TypewriterText = React.memo(({ text, speed = 30, className = "", onComplete }) => {
    const [displayedText, setDisplayedText] = useState("");
    const indexRef = useRef(0);
    const textRef = useRef(text);

    // Select strictly the boolean to avoid component re-rendering on other store changes
    const soundEnabled = useAppStore(state => state.soundEnabled);

    // Stable reference to onComplete
    const onCompleteRef = useRef(onComplete);
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        // Reset when text changes
        setDisplayedText("");
        indexRef.current = 0;
        textRef.current = text;

        if (!text) return;

        const intervalId = setInterval(() => {
            if (indexRef.current < textRef.current.length) {
                const char = textRef.current.charAt(indexRef.current);
                setDisplayedText(prev => prev + char);

                // Play soft bubble blip for non-space characters if sound is enabled
                // Added a modulo check to prevent the sound from triggering on every single character 
                // which can be overwhelming when typing fast.
                if (soundEnabled && char !== ' ' && indexRef.current % 3 === 0) {
                    playBubble();
                }

                indexRef.current++;
            } else {
                clearInterval(intervalId);
                // Fire completion handler exactly once
                if (onCompleteRef.current) {
                    onCompleteRef.current();
                }
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [text, speed, soundEnabled]); // Omitting onComplete prevents dependency loops

    return (
        <span className={className} style={{ display: 'inline', whiteSpace: 'pre-wrap' }}>
            {displayedText}

            {/* Blinking cursor */}
            <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="inline-block ml-1 bg-current align-middle rounded-sm"
                style={{ height: '1.1em', width: '6px' }}
            />
        </span>
    );
});

export default TypewriterText;
