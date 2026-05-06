import { useState } from 'react'
import { Check, HelpCircle, RotateCw, Volume2, X } from 'lucide-react'

import { useTextToSpeech } from '../../hooks/useTextToSpeech'

function SpeakButton({ text, pronunciationText, light = false }) {
  const { speak, isSpeaking, isSupported } = useTextToSpeech(pronunciationText || text)
  if (!isSupported) return null

  return (
    <button
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
        light
          ? 'border-white/20 bg-white/12 text-white hover:bg-white/18'
          : 'border-[#d8ddd5] bg-white text-[#1f7a57] shadow-sm hover:bg-[#eef8f2]'
      } ${isSpeaking ? 'animate-pulse-speak' : ''}`}
      onClick={(event) => { event.stopPropagation(); speak() }}
      disabled={isSpeaking}
      aria-label="Escuchar pronunciación"
      title="Escuchar pronunciación"
    >
      <Volume2 className="h-5 w-5" />
    </button>
  )
}

const faceBase =
  'absolute inset-0 backface-hidden rounded-lg flex flex-col items-center justify-center px-6 py-7 shadow-[0_16px_42px_rgba(37,48,42,0.12)]'

export default function Flashcard({ item, onKnew, onDidntKnow }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div>
        <p className="exercise-instruction">¿Conoces esta palabra?</p>
        <p className="mt-1 text-sm font-medium text-[#6d756e]">Toca la tarjeta para ver el significado.</p>
      </div>

      <div
        className="h-[300px] shrink-0 cursor-pointer outline-none perspective-[1200px] focus-visible:ring-2 focus-visible:ring-[#1f7a57] focus-visible:ring-offset-2"
        onClick={() => { if (!flipped) setFlipped(true) }}
        role="button"
        tabIndex={0}
        aria-label="Toca para voltear la tarjeta"
      >
        <div
          className={`relative h-full w-full transform-3d transition-transform duration-[450ms] ease-in-out ${
            flipped ? 'rotate-y-180' : ''
          }`}
        >
          <div className={`${faceBase} bg-[#102f29] text-white`}>
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-white/10 text-[#9ddfc6]">
              <HelpCircle className="h-7 w-7" />
            </div>
            {item.pronunciation && (
              <span className="word-pronunciation text-white/62">/{item.pronunciation}/</span>
            )}
            <div className="word-with-speaker mt-2">
              <h2 className="word-nahuat text-[2.6rem] text-white">{item.nahuat_word}</h2>
              <SpeakButton text={item.nahuat_word} pronunciationText={item.pronunciationText} light />
            </div>
            <p className="mt-6 inline-flex items-center gap-2 rounded-md border border-white/14 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/68">
              <RotateCw className="h-4 w-4" />
              Toca para revelar
            </p>
          </div>

          <div className={`${faceBase} rotate-y-180 border border-[#e3ded2] bg-white`}>
            <div className="word-with-speaker">
              <h2 className="word-nahuat text-[#17211d]">{item.nahuat_word}</h2>
              <SpeakButton text={item.nahuat_word} pronunciationText={item.pronunciationText} />
            </div>
            <div className="my-4 h-1 w-12 rounded-full bg-[#e8ece6]" />
            <p className="text-center text-2xl font-black leading-tight text-[#1f7a57]">{item.spanish_translation}</p>
            {item.example_sentence && (
              <div className="mt-5 w-full rounded-md border border-[#d8ddd5] bg-[#fbfaf7] px-4 py-3 text-center">
                <p className="text-sm font-black text-[#17211d]">"{item.example_sentence}"</p>
                <p className="mt-1 text-xs font-medium leading-snug text-[#6d756e]">{item.example_translation}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {flipped && (
        <div className="grid grid-cols-2 gap-3">
          <button
            className="flex items-center justify-center gap-2 rounded-lg border border-[#e63946]/30 bg-[#fff0f1] px-4 py-4 text-sm font-black text-[#b91c1c] transition active:scale-[0.99]"
            onClick={onDidntKnow}
          >
            <X className="h-5 w-5" />
            No lo sabía
          </button>
          <button
            className="flex items-center justify-center gap-2 rounded-lg bg-[#1f7a57] px-4 py-4 text-sm font-black text-white shadow-[0_10px_22px_rgba(31,122,87,0.18)] transition active:scale-[0.99]"
            onClick={onKnew}
          >
            <Check className="h-5 w-5" />
            Lo sabía
          </button>
        </div>
      )}
    </div>
  )
}
