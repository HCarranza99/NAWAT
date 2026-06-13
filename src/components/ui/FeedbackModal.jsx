import { ArrowRight, CheckCircle2, HeartCrack, XCircle } from 'lucide-react'
import Torogoz from './Torogoz'

export default function FeedbackModal({ type, correctAnswer, onContinue, noLives = false }) {
  const isCorrect = type === 'correct'
  const showNoLives = noLives && !isCorrect

  const tone = isCorrect
    ? {
        icon: CheckCircle2,
        title: '¡Correcto!',
        text: 'Muy bien. Sigamos con la siguiente.',
        mascot: 'happy',
        panel: 'border-[#52b788]/35 bg-[#f0fbf4]',
        iconWrap: 'bg-[#d8f3dc] text-[#1f7a57]',
        button: 'bg-[#1f7a57] text-white shadow-[0_10px_22px_rgba(31,122,87,0.2)]',
      }
    : showNoLives
      ? {
          icon: HeartCrack,
          title: 'Sin vidas',
          text: 'Descansa un momento y vuelve a intentarlo.',
          mascot: 'tired',
          panel: 'border-[#e63946]/30 bg-[#fff0f1]',
          iconWrap: 'bg-[#ffe0e3] text-[#b91c1c]',
          button: 'bg-[#b91c1c] text-white shadow-[0_10px_22px_rgba(185,28,28,0.18)]',
        }
      : {
          icon: XCircle,
          title: 'Respuesta correcta',
          text: correctAnswer,
          mascot: 'sad',
          panel: 'border-[#e63946]/30 bg-[#fff0f1]',
          iconWrap: 'bg-[#ffe0e3] text-[#b91c1c]',
          button: 'bg-[#b91c1c] text-white shadow-[0_10px_22px_rgba(185,28,28,0.18)]',
        }

  const Icon = tone.icon

  return (
    <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 px-4 pb-4">
      <div className={`animate-feedback-slide-up rounded-[1.6rem] border p-4 shadow-[0_-2px_0_rgba(255,255,255,0.6)_inset,0_24px_60px_rgba(37,48,42,0.28)] ${tone.panel}`}>
        <div className="flex items-start gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone.iconWrap}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-black leading-tight text-[#17211d]">{tone.title}</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-[#46524a]">{tone.text}</p>
          </div>
          <div className="-mt-7 -mr-1 shrink-0 drop-shadow-[0_8px_16px_rgba(37,48,42,0.18)]">
            <Torogoz emotion={tone.mascot} size={82} />
          </div>
        </div>

        <button
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-base font-black transition-transform duration-100 active:translate-y-0.5 ${tone.button}`}
          onClick={onContinue}
        >
          {showNoLives ? 'Volver a secciones' : 'Continuar'}
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
