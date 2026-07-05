import { useState } from 'react'
import { Check, X } from 'lucide-react'

/**
 * Verdadero / Falso: muestra una palabra náhuat y una traducción propuesta
 * (real o falsa); el usuario decide si el par es correcto.
 * item: { nahuat_word, pronunciation, shown_translation, is_true, spanish_translation }
 */
export default function TrueFalse({ item, onCorrect, onWrong }) {
  const [answered, setAnswered] = useState(null) // 'right' | 'wrong'

  const answer = (choice) => {
    if (answered) return
    const correct = choice === item.is_true
    setAnswered(correct ? 'right' : 'wrong')
    if (correct) onCorrect()
    else onWrong()
  }

  return (
    <div className="flex flex-1 flex-col">
      <p className="exercise-instruction">¿Es correcta esta traducción?</p>

      <section className="my-6 rounded-lg border border-[#e3ded2] bg-white p-6 text-center shadow-[0_12px_32px_rgba(37,48,42,0.06)]">
        <h2 className="word-nahuat text-[#17211d]">{item.nahuat_word}</h2>
        {item.pronunciation && (
          <span className="word-pronunciation">/{item.pronunciation}/</span>
        )}
        <div className="my-4 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-[#e8ece6]" />
          <span className="text-[0.7rem] font-black uppercase tracking-[0.14em] text-[#9aa39c]">significa</span>
          <span className="h-px w-8 bg-[#e8ece6]" />
        </div>
        <p className={`text-2xl font-black leading-tight transition ${
          answered
            ? item.is_true ? 'text-[#1f7a57]' : 'text-[#b91c1c] line-through decoration-2'
            : 'text-[#17211d]'
        }`}>
          {item.shown_translation}
        </p>
        {answered === 'wrong' && !item.is_true && (
          <p className="mt-3 text-sm font-bold text-[#6d756e]">
            En realidad significa: <span className="text-[#1f7a57]">{item.spanish_translation}</span>
          </p>
        )}
      </section>

      <div className="mt-auto grid grid-cols-2 gap-3">
        <button
          disabled={!!answered}
          onClick={() => answer(false)}
          className="flex items-center justify-center gap-2 rounded-lg border-2 border-[#e63946]/35 bg-[#fff0f1] px-4 py-5 text-base font-black text-[#b91c1c] shadow-sm transition active:scale-[0.98] disabled:opacity-60"
        >
          <X className="h-6 w-6" /> Falso
        </button>
        <button
          disabled={!!answered}
          onClick={() => answer(true)}
          className="flex items-center justify-center gap-2 rounded-lg border-2 border-[#52b788]/40 bg-[#f0fbf4] px-4 py-5 text-base font-black text-[#1f7a57] shadow-sm transition active:scale-[0.98] disabled:opacity-60"
        >
          <Check className="h-6 w-6" /> Verdadero
        </button>
      </div>
    </div>
  )
}
