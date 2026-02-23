import { useState, useRef, useEffect } from 'react'
import BlinkDetector from './BlinkDetector'

const CommunicationBoard = ({ gazePosition, isActive, onCursorLock }) => {
  const [dwellingCard, setDwellingCard] = useState(null)
  const [dwellProgress, setDwellProgress] = useState(0)
  const dwellTimerRef = useRef(null)
  const progressIntervalRef = useRef(null)

  const DWELL_TIME = 2000 // 2 seconds
  const PROGRESS_INTERVAL = 50 // Update progress every 50ms

  // Communication cards data with speech phrases
  const cards = [
    { id: 'water', text: 'Water', color: '#4A90E2', speech: 'I need water' },
    { id: 'help', text: 'Help', color: '#E94B3C', speech: 'I need help' },
    { id: 'pain', text: 'Pain', color: '#F5A623', speech: 'I am in pain' },
    { id: 'food', text: 'Food', color: '#7ED321', speech: 'I need food' },
    { id: 'bathroom', text: 'Bathroom', color: '#9013FE', speech: 'I need to use the bathroom' },
    { id: 'tired', text: 'Tired', color: '#50E3C2', speech: 'I am tired' }
  ]

  // Text-to-speech function
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
  }

  // Get card center position for cursor locking
  const getCardCenter = (cardId) => {
    const cardElement = document.getElementById(`card-${cardId}`)
    if (!cardElement) return null
    
    const rect = cardElement.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    }
  }

  // Handle double blink selection
  const handleDoubleBlink = () => {
    if (dwellingCard) {
      console.log('Double blink detected while dwelling on:', dwellingCard)
      selectCard(dwellingCard)
    }
  }

  // Check if gaze is inside a card's bounding box
  const isGazeInCard = (cardElement, gazeX, gazeY) => {
    if (!cardElement) return false
    
    const rect = cardElement.getBoundingClientRect()
    return (
      gazeX >= rect.left &&
      gazeX <= rect.right &&
      gazeY >= rect.top &&
      gazeY <= rect.bottom
    )
  }

  // Start dwell timer for a card
  const startDwelling = (cardId) => {
    if (dwellingCard === cardId) return // Already dwelling on this card
    
    stopDwelling() // Stop any existing dwell
    setDwellingCard(cardId)
    setDwellProgress(0)

    // Lock cursor to card center
    const cardCenter = getCardCenter(cardId)
    if (cardCenter) {
      onCursorLock?.(cardCenter)
    }

    let progress = 0
    progressIntervalRef.current = setInterval(() => {
      progress += (PROGRESS_INTERVAL / DWELL_TIME) * 100
      setDwellProgress(progress)
      
      if (progress >= 100) {
        selectCard(cardId)
      }
    }, PROGRESS_INTERVAL)
  }

  // Stop dwell timer
  const stopDwelling = () => {
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current)
      dwellTimerRef.current = null
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    
    // Unlock cursor
    onCursorLock?.(null)
    
    setDwellingCard(null)
    setDwellProgress(0)
  }

  // Handle card selection
  const selectCard = (cardId) => {
    const card = cards.find(c => c.id === cardId)
    console.log(`Selected: ${card.text}`)
    
    // Speak the phrase
    speak(card.speech)
    
    // Visual feedback
    stopDwelling()
    
    // Brief highlight effect
    setTimeout(() => {
      // Reset any visual effects
    }, 300)
  }

  // Check gaze position against all cards
  useEffect(() => {
    if (!isActive || !gazePosition) return

    const { x, y } = gazePosition
    let foundCard = null

    // Check each card
    cards.forEach(card => {
      const cardElement = document.getElementById(`card-${card.id}`)
      if (isGazeInCard(cardElement, x, y)) {
        foundCard = card.id
      }
    })

    if (foundCard) {
      startDwelling(foundCard)
    } else {
      stopDwelling()
    }
  }, [gazePosition, isActive])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDwelling()
    }
  }, [])

  if (!isActive) return null

  return (
    <div className="communication-board">
      <BlinkDetector 
        isActive={isActive} 
        onDoubleBlink={handleDoubleBlink}
      />
      <h2>Communication Board</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
        Gaze at a card for 2 seconds OR double-blink while gazing (Press B key twice to test)
      </p>
      <div className="cards-grid">
        {cards.map(card => (
          <div
            key={card.id}
            id={`card-${card.id}`}
            className={`communication-card ${dwellingCard === card.id ? 'dwelling' : ''}`}
            style={{
              backgroundColor: card.color,
              position: 'relative'
            }}
          >
            <span className="card-text">{card.text}</span>
            
            {/* Progress indicator */}
            {dwellingCard === card.id && (
              <div className="dwell-progress">
                <div 
                  className="progress-fill"
                  style={{ width: `${dwellProgress}%` }}
                />
              </div>
            )}
            
            {/* Blink indicator */}
            {dwellingCard === card.id && (
              <div className="blink-hint">
                Double-blink to select
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CommunicationBoard