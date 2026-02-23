import { useState, useEffect } from 'react'
import './App.css'
import WebcamFeed from './components/WebcamFeed'

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...')

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => setApiStatus(data.message))
      .catch(() => setApiStatus('API not connected'))
  }, [])

  return (
    <div className="App">
      <h1>Blink-to-Speak (ALS Assist)</h1>
      <p>API Status: {apiStatus}</p>
      <WebcamFeed />
    </div>
  )
}

export default App
