import Torogoz from './Torogoz'

export default function FeedbackModal({ type, correctAnswer, onContinue, noLives = false }) {
  const isCorrect = type === 'correct'
  const showNoLives = noLives && !isCorrect
  const emotion = isCorrect ? 'celebrate' : 'sad'

  const barTone = isCorrect
    ? 'bg-nahuat-correct-bg border-nahuat-correct text-primary'
    : 'bg-nahuat-wrong-bg border-destructive text-destructive'

  const continueTone = isCorrect
    ? 'bg-nahuat-correct text-white'
    : 'bg-destructive text-white'

  return (
    <div
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-5 pt-5 pb-7 rounded-t-[20px] z-50 border-t-[3px] animate-feedback-slide-up ${barTone}`}
    >
      <div className="flex items-start gap-3 mb-1">
        <div className="flex justify-center items-center my-2">
          <Torogoz emotion={emotion} size={72} />
        </div>
        <div>
          {isCorrect ? (
            <p className="text-[1.05rem] font-bold">¡Correcto!</p>
          ) : showNoLives ? (
            <>
              <p className="text-[1.05rem] font-bold">¡Sin vidas!</p>
              <p className="text-[0.95rem] font-semibold mt-[3px]">Descansa y vuelve a intentarlo</p>
            </>
          ) : (
            <>
              <p className="text-[1.05rem] font-bold">Respuesta correcta:</p>
              <p className="text-[0.95rem] font-semibold mt-[3px]">{correctAnswer}</p>
            </>
          )}
        </div>
      </div>
      <button
        className={`w-full px-3.5 py-3.5 text-base font-bold rounded-sm mt-3.5 transition-all active:scale-[0.97] disabled:opacity-45 disabled:cursor-not-allowed ${continueTone}`}
        onClick={onContinue}
      >
        {showNoLives ? 'Volver al inicio' : 'Continuar'}
      </button>
    </div>
  )
}
