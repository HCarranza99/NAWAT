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

const faceBase =
  'absolute inset-0 backface-hidden rounded-lg flex flex-col items-center justify-center px-6 py-7 shadow-[0_4px_24px_rgba(0,0,0,0.12)]'

const outlineBtnBase =
  'btn flex-1 transition-all active:shadow-none'

export default function Flashcard({ item, onKnew, onDidntKnow }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="flex flex-col items-stretch gap-5">
      <p className="exercise-instruction">¿Conoces esta palabra?</p>

      <div
        className="perspective-[1200px] h-[280px] cursor-pointer shrink-0"
        onClick={() => { if (!flipped) setFlipped(true) }}
        role="button"
        tabIndex={0}
        aria-label="Toca para voltear la tarjeta"
      >
        <div
          className={`relative w-full h-full transition-transform duration-[450ms] ease-in-out transform-3d ${
            flipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRENTE */}
          <div className={`${faceBase} bg-primary text-white`}>
            {item.pronunciation && (
              <span className="word-pronunciation text-white/70">/{item.pronunciation}/</span>
            )}
            <div className="word-with-speaker">
              <h2 className="word-nahuat text-white text-[2.4rem]">{item.nahuat_word}</h2>
              <SpeakButton text={item.nahuat_word} pronunciationText={item.pronunciationText} light />
            </div>
            <p className="mt-4 text-[0.8rem] text-white/60 border border-white/30 px-3 py-1 rounded-[20px]">
              Toca la tarjeta para ver
            </p>
          </div>

          {/* REVERSO */}
          <div className={`${faceBase} bg-card border-2 border-border rotate-y-180 gap-2.5`}>
            <div className="word-with-speaker">
              <h2 className="word-nahuat">{item.nahuat_word}</h2>
              <SpeakButton text={item.nahuat_word} pronunciationText={item.pronunciationText} />
            </div>
            <div className="w-10 h-[3px] bg-border rounded-[2px] my-1.5" />
            <p className="text-[1.5rem] font-semibold text-primary">{item.spanish_translation}</p>
            {item.example_sentence && (
              <div className="mt-3 text-center bg-secondary rounded-sm px-3.5 py-2.5 w-full">
                <p className="text-[0.9rem] font-semibold text-primary">"{item.example_sentence}"</p>
                <p className="text-[0.8rem] text-muted-foreground mt-[3px]">{item.example_translation}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {flipped && (
        <div className="flex gap-3">
          <button
            className={`${outlineBtnBase} bg-nahuat-wrong-bg text-destructive border-2 border-destructive shadow-[0_2px_0_#b02031]`}
            onClick={onDidntKnow}
          >
            ✗ No lo sabía
          </button>
          <button
            className={`${outlineBtnBase} bg-nahuat-correct-bg text-primary border-2 border-nahuat-correct shadow-[0_2px_0_var(--nahuat-correct)]`}
            onClick={onKnew}
          >
            ✓ Lo sabía
          </button>
        </div>
      )}
    </div>
  )
}
