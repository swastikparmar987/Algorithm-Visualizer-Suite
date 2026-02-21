import { useState, useRef, useCallback } from 'react'

export function useVisualizerState(defaultSpeed = 500) {
    const [isRunning, setIsRunning] = useState(false)
    const [speed, setSpeed] = useState(defaultSpeed)
    const [selectedAlgo, setSelectedAlgo] = useState('')
    const stopRef = useRef(false)

    const delay = useCallback(
        (customMs) => new Promise((res) => setTimeout(res, customMs ?? speed)),
        [speed]
    )

    const reset = useCallback(() => {
        stopRef.current = true
        setIsRunning(false)
    }, [])

    const start = useCallback(() => {
        stopRef.current = false
        setIsRunning(true)
    }, [])

    const stop = useCallback(() => {
        stopRef.current = true
        setIsRunning(false)
    }, [])

    return {
        isRunning,
        setIsRunning,
        speed,
        setSpeed,
        selectedAlgo,
        setSelectedAlgo,
        stopRef,
        delay,
        reset,
        start,
        stop
    }
}
