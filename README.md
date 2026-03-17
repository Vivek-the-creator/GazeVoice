# GazeVoice (ALS Assist) 👁️

A browser-based assistive communication system designed for individuals with ALS (Amyotrophic Lateral Sclerosis) and severe motor impairments.

The system enables communication using real-time eye gaze tracking and intentional blink detection through a standard webcam — no specialized hardware required.


---

## Key Features

- Real-time eye gaze tracking via webcam
- Fully browser-based system
- Lightweight React frontend
- Node.js + Express backend
- Accessibility-focused design

---

## How It Works

1. Webcam captures live facial data.
2. Eye landmarks are detected using computer vision.
3. Gaze direction is calculated.
4. Prolonged gaze (1-2 sec) at a point is detected.
5. User selects icons or words on screen.
6. Selected icon contains a text which is converted into speech using Text-to-Speech.

---

## Tech Stack

### Frontend
- React (Vite)
- WebRTC (Webcam access)
- MediaPipe / TensorFlow.js (Planned)
- Web Speech API (Text-to-Speech)

### Backend
- Node.js
- Express.js
- REST API architecture

---

## Project Structure

```
Gaze-to-Speak-ALS-Assist/
├── frontend/          # React + Vite
├── backend/           # Node.js + Express
└── package.json       # Root scripts
```

---

## Setup & Installation

### 1. Install all dependencies

```bash
npm run install-all
```

### 2. Start both frontend and backend

```bash
npm run dev
```

### 3. Run individually

```bash
# Frontend (http://localhost:5173)
npm run frontend

# Backend (http://localhost:5000)
npm run backend
```

---

## URLs

- Frontend: http://localhost:5173  
- Backend API: http://localhost:5000/api/health  

---

## Future Enhancements

- Adaptive dwell-time selection
- Implementing intentional blink logic
- Customizable communication boards
- Multi-language support
- User profile saving
- Mobile browser optimization

---

## Privacy & Ethics

- All webcam processing will be performed locally in the browser.
- No video data will be stored without user consent.
- Designed with accessibility-first principles.
- Focused on preserving patient dignity and independence.

---

## Vision

To build a low-cost, accessible, and scalable assistive communication system that empowers individuals with severe motor disabilities to regain their voice — using just a webcam and a browser.
