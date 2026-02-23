import { useEffect, useState, useRef } from 'react'
import webgazer from 'webgazer'

const GazeTracker = ({ isActive, onGazeUpdate, lockPosition }) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [gazePosition, setGazePosition] = useState({ x: 0, y: 0 })

  const smoothingBuffer = useRef([])
  const lastSmoothRef = useRef({ x: 0, y: 0 })

  const BUFFER_SIZE = 12
  const SMOOTHING_FACTOR = 0.08
  const CURSOR_SIZE = 15

  // -----------------------------
  // Clamp gaze inside viewport
  // -----------------------------
  const clampToViewport = (x, y) => ({
    x: Math.max(0, Math.min(window.innerWidth - CURSOR_SIZE, x)),
    y: Math.max(0, Math.min(window.innerHeight - CURSOR_SIZE, y))
  })

  // -----------------------------
  // Smooth gaze coordinates with heavy filtering
  // -----------------------------
  const smoothCoordinates = (x, y) => {
    // Moving average buffer
    smoothingBuffer.current.push({ x, y })
    if (smoothingBuffer.current.length > BUFFER_SIZE) {
      smoothingBuffer.current.shift()
    }

    // Calculate weighted moving average (recent points have more weight)
    let totalWeight = 0
    let weightedX = 0
    let weightedY = 0
    
    smoothingBuffer.current.forEach((point, index) => {
      const weight = (index + 1) / smoothingBuffer.current.length // Linear weight
      weightedX += point.x * weight
      weightedY += point.y * weight
      totalWeight += weight
    })
    
    const avgX = weightedX / totalWeight
    const avgY = weightedY / totalWeight

    // Heavy exponential smoothing
    const prev = lastSmoothRef.current
    const smoothX = prev.x + SMOOTHING_FACTOR * (avgX - prev.x)
    const smoothY = prev.y + SMOOTHING_FACTOR * (avgY - prev.y)

    lastSmoothRef.current = { x: smoothX, y: smoothY }
    return { x: smoothX, y: smoothY }
  }

  // -----------------------------
  // Initialize WebGazer
  // -----------------------------
  const initializeWebGazer = async () => {
    try {
      await webgazer
        .setRegression('ridge')
        .setTracker('clmtrackr')
        .setGazeListener((data) => {
          if (!data) return

          // Use locked position immediately if provided
          if (lockPosition) {
            setGazePosition(lockPosition)
            onGazeUpdate?.(lockPosition)
            return
          }

          const clamped = clampToViewport(data.x, data.y)
          const smoothed = smoothCoordinates(clamped.x, clamped.y)

          setGazePosition(smoothed)
          onGazeUpdate?.(smoothed) // Share gaze position with parent
          console.log(
            `Gaze: (${Math.round(smoothed.x)}, ${Math.round(smoothed.y)})`
          )
        })
        .begin()

      webgazer.showVideoPreview(false)
      webgazer.showPredictionPoints(false)

      setIsInitialized(true)
    } catch (err) {
      console.error('WebGazer init failed:', err)
    }
  }

  // -----------------------------
  // Stop WebGazer
  // -----------------------------
  const stopWebGazer = () => {
    webgazer.end()
    setIsInitialized(false)
    setGazePosition({ x: 0, y: 0 })
    smoothingBuffer.current = []
    lastSmoothRef.current = { x: 0, y: 0 }
  }

  // -----------------------------
  // Start / Stop based on isActive
  // -----------------------------
  useEffect(() => {
    if (isActive && !isInitialized) {
      initializeWebGazer()
    }
    if (!isActive && isInitialized) {
      stopWebGazer()
    }
  }, [isActive, isInitialized])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInitialized) stopWebGazer()
    }
  }, [isInitialized])

  if (!isActive || !isInitialized) return null

  // -----------------------------
  // Gaze Cursor
  // -----------------------------
  return (
    <div
      className="gaze-cursor"
      style={{
        position: 'fixed',
        left: gazePosition.x - CURSOR_SIZE / 2,
        top: gazePosition.y - CURSOR_SIZE / 2,
        width: `${CURSOR_SIZE}px`,
        height: `${CURSOR_SIZE}px`,
        backgroundColor: 'red',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 9999,
        transition: 'none',
        boxShadow: lockPosition ? '0 0 15px rgba(0,255,0,0.8)' : '0 0 10px rgba(255,0,0,0.5)'
      }}
    />
  )
}

export default GazeTracker
