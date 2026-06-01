import { useState, useEffect } from 'react'
import { CheckCircle2, Volume2, XCircle } from 'lucide-react'
import { useTextToSpeech } from '../../hooks/useTextToSpeech'

const optionBase =
  'group min-h-[74px] rounded-lg border px-4 py-4 text-left text-sm font-black leading-snug transition active:scale-[0.99] disabled:cursor-not-allowed'

export default function MultipleChoiceImage({ item, onCorrect, onWrong }) {
  const [selected, setSelected] = useState(null)
  
  // TTS para la palabra correcta de la imagen (se reproduce al acertar)
  const { speak, isSpeaking, isSupported } = useTextToSpeech(item.pronunciationText || item.nahuat_word)

  const handleSelect = (option) => {
    if (selected) return
    setSelected(option)
    if (option.correct) {
      onCorrect()
      // Hablar la palabra correcta al seleccionar para reforzar aprendizaje auditivo
      setTimeout(() => {
        speak(false)
      }, 100)
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
      <p className="exercise-instruction">{item.instruction || '¿Cómo se dice esta imagen en Náhuat?'}</p>

      {/* Contenedor central premium de la imagen 3D */}
      <section className="my-5 flex flex-col items-center justify-center rounded-2xl border border-[#e3ded2] bg-[#fbfaf7] p-5 shadow-inner">
        <div className="relative flex min-h-[170px] w-full items-center justify-center overflow-hidden">
          <img
            src={item.image_url}
            alt="Ilustración del ejercicio"
            className="max-h-[160px] w-auto object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-transform duration-300 hover:scale-105"
          />
        </div>
        
        {/* Si ya respondió correcto, mostrar botón de pronunciación y texto del IPA */}
        {selected?.correct && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#52b788]/20 bg-white px-4 py-2 shadow-xs animate-fade-in">
            <span className="text-sm font-black text-[#102f29]">{item.nahuat_word}</span>
            {item.pronunciation && (
              <span className="text-xs font-semibold text-[#6d756e]">/{item.pronunciation}/</span>
            )}
            {isSupported && (
              <button
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d8ddd5] bg-white text-[#1f7a57] transition hover:bg-[#eef8f2] active:scale-95 disabled:cursor-not-allowed ${isSpeaking ? 'animate-pulse' : ''}`}
                onClick={() => speak(false)}
                disabled={isSpeaking}
                aria-label="Escuchar pronunciación"
                title="Escuchar pronunciación"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </section>

      {/* Opciones de respuesta en Náhuat */}
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
