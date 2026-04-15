import Torogoz from './Torogoz'

export default function FeedbackModal({ type, correctAnswer, onContinue, noLives = false }) {
  const isCorrect = type === 'correct'
  const showNoLives = noLives && !isCorrect
  const emotion = isCorrect ? 'celebrate' : 'sad'

  return (
    <div className={`feedback-bar ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
      <div className="feedback-content">
        <div className="torogoz-wrap">
          <Torogoz emotion={emotion} size={72} />
        </div>
        <div className="feedback-text">
          {isCorrect ? (
            <p className="feedback-headline">¡Correcto!</p>
          ) : showNoLives ? (
            <>
              <p className="feedback-headline">¡Sin vidas!</p>
              <p className="feedback-answer">Descansa y vuelve a intentarlo</p>
            </>
          ) : (
            <>
              <p className="feedback-headline">Respuesta correcta:</p>
              <p className="feedback-answer">{correctAnswer}</p>
            </>
          )}
        </div>
      </div>
      <button className="btn btn-continue" onClick={onContinue}>
        {showNoLives ? 'Volver al inicio' : 'Continuar'}
      </button>
    </div>
  )
}
