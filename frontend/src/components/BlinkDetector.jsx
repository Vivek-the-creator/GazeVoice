import { useEffect, useRef } from 'react'

const BlinkDetector = ({ isActive, onDoubleBlink }) => {
  const blinkCountRef = useRef(0)
  const lastBlinkTimeRef = useRef(0)
  const blinkResetTimerRef = useRef(null)
  
  const DOUBLE_BLINK_WINDOW = 1200 // 1.2 seconds for double blink
  const BLINK_RESET_DELAY = 2500 // Reset after 2.5 seconds

  useEffect(() => {
    if (!isActive) return

    const handleBlink = (currentTime) => {
      blinkCountRef.current++
      lastBlinkTimeRef.current = currentTime
      
      console.log(`Blink ${blinkCountRef.current} detected!`)
      
      if (blinkCountRef.current === 2) {
        console.log('🎯 DOUBLE BLINK DETECTED! Triggering selection...')
        onDoubleBlink?.()
        resetBlinkCount()
      } else {
        // Reset count after delay if no second blink
        if (blinkResetTimerRef.current) {
          clearTimeout(blinkResetTimerRef.current)
        }
        blinkResetTimerRef.current = setTimeout(resetBlinkCount, BLINK_RESET_DELAY)
      }
    }

    const resetBlinkCount = () => {
      if (blinkCountRef.current > 0) {
        console.log('Blink count reset')
      }
      blinkCountRef.current = 0
      if (blinkResetTimerRef.current) {
        clearTimeout(blinkResetTimerRef.current)
        blinkResetTimerRef.current = null
      }
    }

    // Keyboard simulation for testing (B key for blink)
    const handleKeyPress = (e) => {
      if (e.code === 'KeyB' && !e.repeat) {
        e.preventDefault()
        handleBlink(Date.now())
      }
    }

    // Simple eye closure detection using WebGazer
    const detectRealBlinks = () => {
      try {
        if (window.webgazer && window.webgazer.getTracker) {
          const tracker = window.webgazer.getTracker()
          if (tracker && tracker.clm && tracker.clm.getCurrentPosition) {
            const positions = tracker.clm.getCurrentPosition()
            if (positions && positions.length > 40) {
              // Simple blink detection: check if eye landmarks are very close
              const leftEyeClosed = isEyeClosed(positions, [27, 28, 29, 30]) // Left eye
              const rightEyeClosed = isEyeClosed(positions, [32, 33, 34, 35]) // Right eye
              
              if (leftEyeClosed && rightEyeClosed) {
                const now = Date.now()
                if (now - lastBlinkTimeRef.current > 300) { // Minimum 300ms between blinks
                  handleBlink(now)
                }
              }
            }
          }
        }
      } catch (error) {
        // Ignore errors
      }
    }

    const isEyeClosed = (positions, eyePoints) => {
      try {
        if (eyePoints.every(i => positions[i])) {
          const topY = positions[eyePoints[0]][1]
          const bottomY = positions[eyePoints[2]][1]
          const eyeHeight = Math.abs(topY - bottomY)
          return eyeHeight < 3 // Very small threshold for closed eye
        }
      } catch (error) {
        return false
      }
      return false
    }

    console.log('👁️ Blink detector active. Press B key twice to test, or blink your eyes twice.')
    
    document.addEventListener('keydown', handleKeyPress)
    const interval = setInterval(detectRealBlinks, 100)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      clearInterval(interval)
      resetBlinkCount()
    }
  }, [isActive, onDoubleBlink])

  return null
}

export default BlinkDetector