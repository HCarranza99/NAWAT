import { useState } from 'react'
import { CheckCircle2, Volume2, XCircle } from 'lucide-react'

import { useTextToSpeech } from '../../hooks/useTextToSpeech'
import WordHint from '../ui/WordHint'

const optionBase =
  'group min-h-[74px] rounded-lg border px-4 py-4 text-left text-sm font-black leading-snug transition active:scale-[0.99] disabled:cursor-not-allowed'

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
      return `${optionBase} border-[#e3ded2] bg-white text-[#17211d] shadow-sm hover:border-[#1f7a57]/35 hover:bg-[#fbfaf7]`
    }
    if (option.correct) {
      return `${optionBase} animate-bounce-in border-[#52b788] bg-[#f0fbf4] text-[#1f7a57] shadow-sm`
    }
    if (option.id === selected.id) {
      return `${optionBase} animate-shake border-[#e63946] bg-[#fff0f1] text-[#b91c1c] shadow-sm`
    }
    return `${optionBase} border-[#e3ded2] bg-white text-[#8b938c] opacity-50 shadow-sm`
  }

  const getOptionIcon = (option) => {
    if (!selected) return null
    if (option.correct) return <CheckCircle2 className="h-5 w-5 shrink-0 text-[#1f7a57]" />
    if (option.id === selected.id) return <XCircle className="h-5 w-5 shrink-0 text-[#b91c1c]" />
    return null
  }

  return (
    <div className="flex flex-1 flex-col">
      <p className="exercise-instruction">{item.instruction || '¿Qué significa en español?'}</p>

      <section className="my-6 rounded-lg border border-[#e3ded2] bg-white p-5 text-center shadow-[0_12px_32px_rgba(37,48,42,0.06)]">
        <div className="word-with-speaker">
          <h2 className="word-nahuat text-[#17211d]">
            <WordHint word={item.nahuat_word} translation={item.spanish_translation} />
          </h2>
          {isSupported && (
            <button
              className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#d8ddd5] bg-white text-[#1f7a57] shadow-sm transition hover:bg-[#eef8f2] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${isSpeaking ? 'animate-pulse-speak' : ''}`}
              onClick={speak}
              disabled={isSpeaking}
              aria-label="Escuchar pronunciación"
              title="Escuchar pronunciación"
            >
              <Volume2 className="h-5 w-5" />
            </button>
          )}
        </div>
        {item.pronunciation && (
          <span className="word-pronunciation">/{item.pronunciation}/</span>
        )}
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {item.options.map((option) => (
          <button
            key={option.id}
            className={getOptionClass(option)}
            onClick={() => handleSelect(option)}
            disabled={!!selected}
          >
            <span className="flex items-center justify-between gap-3">
              <span>{option.text}</span>
              {getOptionIcon(option)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
