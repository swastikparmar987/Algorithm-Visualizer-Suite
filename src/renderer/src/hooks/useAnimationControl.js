import { useState, useRef, useCallback } from 'react'

export function useAnimationControl() {
    const [isPaused, setIsPaused] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [totalSteps, setTotalSteps] = useState(0)
    const pauseRef = useRef(false)

    const waitWhilePaused = useCallback(() => {
        return new Promise((resolve) => {
            const check = () => {
                if (!pauseRef.current) {
                    resolve()
                } else {
                    requestAnimationFrame(check)
                }
            }
            check()
        })
    }, [])

    const pause = useCallback(() => {
        pauseRef.current = true
        setIsPaused(true)
    }, [])

    const resume = useCallback(() => {
        pauseRef.current = false
        setIsPaused(false)
    }, [])

    const togglePause = useCallback(() => {
        if (pauseRef.current) resume()
        else pause()
    }, [pause, resume])

    const stepForward = useCallback(() => {
        setCurrentStep((s) => Math.min(s + 1, totalSteps))
    }, [totalSteps])

    return {
        isPaused,
        currentStep,
        setCurrentStep,
        totalSteps,
        setTotalSteps,
        pauseRef,
        waitWhilePaused,
        pause,
        resume,
        togglePause,
        stepForward
    }
}
