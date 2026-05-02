import { useState } from 'react'
import { useTextToSpeech } from '../../hooks/useTextToSpeech'

function SpeakButton({ text, pronunciationText, light = false }) {
  // Use pronunciationText for TTS if available (closer to real pronunciation)
  const { speak, isSpeaking, isSupported } = useTextToSpeech(pronunciationText || text)
  if (!isSupported) return null

  return (
    <button
      className={`speak-btn ${isSpeaking ? 'speaking' : ''} ${light ? 'speak-btn-light' : ''}`}
      onClick={(e) => { e.stopPropagation(); speak() }}
      disabled={isSpeaking}
      aria-label="Escuchar pronunciación"
      title="Escuchar pronunciación"
    >
      🔊
    </button>
  )
}

export default function Flashcard({ item, onKnew, onDidntKnow }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="flashcard-exercise">
      <p className="exercise-instruction">¿Conoces esta palabra?</p>

      <div
        className={`flashcard ${flipped ? 'flipped' : ''}`}
        onClick={() => { if (!flipped) setFlipped(true) }}
        role="button"
        tabIndex={0}
        aria-label="Toca para voltear la tarjeta"
      >
        <div className="flashcard-inner">
          {/* FRENTE */}
          <div className="flashcard-front">
            {item.pronunciation && (
              <span className="word-pronunciation">/{item.pronunciation}/</span>
            )}
            <div className="word-with-speaker">
              <h2 className="word-nahuat">{item.nahuat_word}</h2>
              <SpeakButton text={item.nahuat_word} pronunciationText={item.pronunciationText} light />
            </div>
            <p className="tap-hint">Toca la tarjeta para ver</p>
          </div>

          {/* REVERSO */}
          <div className="flashcard-back">
            <div className="word-with-speaker">
              <h2 className="word-nahuat">{item.nahuat_word}</h2>
              <SpeakButton text={item.nahuat_word} pronunciationText={item.pronunciationText} />
            </div>
            <div className="card-divider" />
            <p className="word-spanish">{item.spanish_translation}</p>
            {item.example_sentence && (
              <div className="card-example">
                <p className="example-nahuat">"{item.example_sentence}"</p>
                <p className="example-spanish">{item.example_translation}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {flipped && (
        <div className="flashcard-actions">
          <button className="btn btn-wrong-outline" onClick={onDidntKnow}>
            ✗ No lo sabía
          </button>
          <button className="btn btn-correct-outline" onClick={onKnew}>
            ✓ Lo sabía
          </button>
        </div>
      )}
    </div>
  )
}
