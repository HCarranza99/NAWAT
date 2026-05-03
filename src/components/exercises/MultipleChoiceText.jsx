import { useState } from 'react'
import { useTextToSpeech } from '../../hooks/useTextToSpeech'
import WordHint from '../ui/WordHint'

const optionBase =
  'rounded-sm px-3 py-4 text-[0.9rem] font-semibold border-2 min-h-[68px] leading-[1.3] transition-all active:translate-y-0.5 active:shadow-none disabled:active:translate-y-0 disabled:active:shadow-[0_2px_0_var(--border)]'

export default function MultipleChoiceText({ item, onCorrect, onWrong }) {
  const [selected, setSelected] = useState(null)
  const { speak, isSpeaking, isSupported } = useTextToSpeech(item.pronunciationText || item.nahuat_word)

  const handleSelect = (option) => {
    if (selected) return
    setSelected(option)
    if (option.correct) {
      onCorrect()
    } else {
      onWrong()
    }
  }

  const getOptionClass = (option) => {
    if (!selected) {
      return `${optionBase} bg-card text-foreground border-border shadow-[0_2px_0_var(--border)]`
    }
    if (option.correct) {
      return `${optionBase} bg-nahuat-correct-bg text-primary border-nahuat-correct shadow-[0_2px_0_var(--nahuat-correct)] animate-bounce-in`
    }
    if (option.id === selected.id) {
      return `${optionBase} bg-nahuat-wrong-bg text-destructive border-destructive shadow-[0_2px_0_var(--destructive)] animate-shake`
    }
    return `${optionBase} bg-card text-foreground border-border shadow-[0_2px_0_var(--border)] opacity-45`
  }

  return (
    <div className="flex flex-col">
      <p className="exercise-instruction">{item.instruction || '¿Qué significa en español?'}</p>

      <div className="text-center mb-7">
        <div className="word-with-speaker">
          <h2 className="word-nahuat">
            <WordHint word={item.nahuat_word} translation={item.spanish_translation} />
          </h2>
          {isSupported && (
            <button
              className={`speak-btn ${isSpeaking ? 'speaking' : ''}`}
              onClick={speak}
              disabled={isSpeaking}
              aria-label="Escuchar pronunciación"
              title="Escuchar pronunciación"
            >
              🔊
            </button>
          )}
        </div>
        {item.pronunciation && (
          <span className="word-pronunciation">/{item.pronunciation}/</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {item.options.map((option) => (
          <button
            key={option.id}
            className={getOptionClass(option)}
            onClick={() => handleSelect(option)}
            disabled={!!selected}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  )
}
