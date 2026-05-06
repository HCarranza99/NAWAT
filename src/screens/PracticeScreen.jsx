import { useState } from 'react'
import useGameStore from '../store/useGameStore'
import { PRACTICE_ITEM } from '../data/questionnaires'
import LikertItem from '../components/questionnaire/LikertItem'

export default function PracticeScreen() {
  const [answer, setAnswer] = useState(null)
  const finishPractice = useGameStore((s) => s.finishPractice)

  const answered = answer?.valueNumeric != null

  return (
    <div className="screen px-[22px] pt-9 pb-7 justify-between bg-background">
      <div className="flex-1 flex flex-col gap-7">
        <div className="onboarding-slide">
          <span className="onboarding-icon">✍️</span>
          <h1 className="onboarding-title">Practiquemos primero</h1>
          <p className="onboarding-text">
            A lo largo del cuestionario verás escalas del <strong>1 al 5</strong>. Selecciona el número que mejor refleje tu opinión. No hay respuestas correctas ni incorrectas — esta respuesta es solo de práctica y no se guardará.
          </p>
        </div>

        <div className="bg-card border-[1.5px] border-border rounded-lg px-[18px] py-5 shadow-[0_2px_12px_rgba(0,0,0,0.08)] flex flex-col gap-4">
          <span className="text-[0.7rem] font-bold uppercase tracking-[0.8px] text-primary mb-0.5">
            Ejemplo
          </span>
          <h2 className="text-[1.1rem] font-bold text-foreground leading-[1.35] tracking-[-0.2px]">
            {PRACTICE_ITEM.question_text}
          </h2>
          <LikertItem answer={answer} onChange={setAnswer} />
          {answered && (
            <p className="text-[0.85rem] text-primary font-semibold text-center bg-secondary rounded-sm px-3 py-2.5 animate-practice-hint-fade">
              ¡Listo! Así es como funciona la escala. Continúa cuando estés listo/a.
            </p>
          )}
        </div>
      </div>

      <div className="onboarding-actions">
        <button
          className="btn btn-primary"
          onClick={finishPractice}
          disabled={!answered}
        >
          Empezar el cuestionario →
        </button>
      </div>
    </div>
  )
}
