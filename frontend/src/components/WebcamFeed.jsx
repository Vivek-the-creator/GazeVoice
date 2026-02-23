import { useState, useRef, useEffect } from 'react'
import GazeTracker from './GazeTracker'
import CommunicationBoard from './CommunicationBoard'

const WebcamFeed = () => {
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState('')
  const [gazePosition, setGazePosition] = useState({ x: 0, y: 0 })
  const [lockPosition, setLockPosition] = useState(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const startCamera = async () => {
    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      })

      streamRef.current = stream
      setIsActive(true)
      
      // Auto-scroll to communication board after camera starts
      setTimeout(() => {
        const boardElement = document.querySelector('.communication-board')
        if (boardElement) {
          boardElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 1000)
    } catch (err) {
      setError('Camera access denied or not available')
      console.error('Camera error:', err)
    }
  }

  // Enable picture-in-picture when video loads
  const enablePiP = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        await videoRef.current.requestPictureInPicture()
      } catch (err) {
        console.log('PiP not supported or failed:', err)
      }
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsActive(false)
  }

  useEffect(() => {
    if (isActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play()
        // Enable PiP after video starts
        setTimeout(enablePiP, 500)
      }
    }
  }, [isActive])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="webcam-feed">
      <GazeTracker 
        isActive={isActive} 
        onGazeUpdate={setGazePosition}
        lockPosition={lockPosition}
      />
      {!isActive ? (
        <div className="camera-placeholder">
          <button onClick={startCamera}>Start Camera</button>
          {error && <p className="error">{error}</p>}
        </div>
      ) : (
        <div className="camera-active">
          <div className="video-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '320px', height: '240px', display: 'block', background: 'black' }}
            />
            <button onClick={stopCamera}>Stop Camera</button>
          </div>
          
          <CommunicationBoard 
            gazePosition={gazePosition}
            isActive={isActive}
            onCursorLock={setLockPosition}
          />
        </div>
      )}
    </div>
  )
}

export default WebcamFeed
