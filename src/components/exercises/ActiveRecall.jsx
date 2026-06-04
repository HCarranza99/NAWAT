import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { CheckCircle2, HelpCircle, Volume2, XCircle } from 'lucide-react'
import { useTextToSpeech } from '../../hooks/useTextToSpeech'

function normalizeText(str = '') {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar diacríticos/acentos
    .replace(/[’']/g, '') // Normalizar el saltillo/apóstrofe
    .replace(/[.,;:!?]/g, '') // Quitar signos de puntuación menores
    .replace(/\s+/g, ' ') // Colapsar espacios múltiples
}

export default function ActiveRecall({ item, onCorrect, onWrong }) {
  const [value, setValue] = useState('')
  const [verified, setVerified] = useState(false)
  const [isCorrect, setIsCorrect] = useState(null)
  const [showHint, setShowHint] = useState(false)

  const inputRef = useRef(null)

  const { speak, isSpeaking, isSupported } = useTextToSpeech(item.pronunciationText || item.nahuat_word)

  // Foco automático en el input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleVerify = () => {
    if (verified || !value.trim()) return

    const inputClean = normalizeText(value)
    const targetClean = normalizeText(item.nahuat_word)
    const correct = inputClean === targetClean

    setIsCorrect(correct)
    setVerified(true)

    if (correct) {
      onCorrect()
    } else {
      onWrong()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim() && !verified) {
      handleVerify()
    }
  }

  const areaTone = !verified
    ? 'border-[#e3ded2] bg-white'
    : isCorrect
      ? 'animate-bounce-in border-[#52b788] bg-[#f0fbf4] text-[#1f7a57]'
      : 'animate-shake border-[#e63946] bg-[#fff0f1] text-[#b91c1c]'

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div>
        <p className="exercise-instruction">{item.instruction || 'Escribe la traducción exacta en Náhuat'}</p>
        <div className="relative mt-3">
          <p className="rounded-lg border border-[#e3ded2] bg-white px-4 py-4 text-center text-lg font-black italic text-[#46524a] shadow-sm">
            "{item.spanish_translation}"
          </p>
          {item.pronunciation && (
            <button
              className="absolute right-3.5 top-3.5 inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d8ddd5] bg-[#fbfaf7] text-[#1f7a57] active:scale-95 shadow-xs transition"
              onClick={() => setShowHint((s) => !s)}
              aria-label="Pista de pronunciación"
              title="Pista de pronunciación"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          )}
        </div>
        {showHint && item.pronunciation && (
          <p className="mt-2.5 rounded-lg border border-[#f4d7ad] bg-[#fff8ec] px-3.5 py-2.5 text-center text-xs font-semibold leading-relaxed text-[#8a4b12] animate-practice-hint-fade">
            💡 Pista de pronunciación: <span className="italic">/{item.pronunciation}/</span>
          </p>
        )}
      </div>

      <div className={`flex flex-col gap-2 rounded-xl border-2 p-4 transition-colors ${areaTone}`}>
        <label htmlFor="active-recall-input" className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#6d756e]">
          Tu respuesta en Náhuat:
        </label>
        <input
          id="active-recall-input"
          ref={inputRef}
          type="text"
          className="w-full border-none bg-transparent py-1 text-lg font-black text-foreground outline-none placeholder:text-[#8b938c]/45"
          placeholder="Escribe la palabra aquí..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={verified}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>

      {verified && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3.5 rounded-xl border p-4 shadow-xs ${
            isCorrect ? 'border-[#52b788]/25 bg-[#f0fbf4]' : 'border-[#e63946]/25 bg-[#fff0f1]'
          }`}
        >
          {isCorrect ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#1f7a57]" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0 text-[#b91c1c]" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#6d756e]">
              {isCorrect ? '¡Excelente!' : 'Respuesta correcta:'}
            </p>
            <div className="mt-1 flex items-center gap-2.5">
              <span className="text-base font-black text-foreground">{item.nahuat_word}</span>
              {isSupported && (
                <div className="flex gap-1.5">
                  <button
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#d8ddd5] bg-white text-[#1f7a57] shadow-xs hover:bg-[#eef8f2] active:scale-95"
                    onClick={() => speak(false)}
                    disabled={isSpeaking}
                    aria-label="Escuchar"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#d8ddd5] bg-[#fff8ec] text-[#b95a18] shadow-xs hover:bg-[#fff1de] active:scale-95"
                    onClick={() => speak(true)}
                    disabled={isSpeaking}
                    aria-label="Escuchar despacio"
                  >
                    <span className="text-sm">🐢</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <button
        className="mt-auto rounded-xl bg-[#1f7a57] py-4 text-base font-black text-white shadow-[0_10px_22px_rgba(31,122,87,0.18)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#b8c3bc] disabled:shadow-none"
        onClick={handleVerify}
        disabled={!value.trim() || verified}
      >
        Verificar respuesta
      </button>
    </div>
  )
}
