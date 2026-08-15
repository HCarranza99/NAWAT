/**
 * EntrySurveyScreen.jsx
 *
 * Cuatro preguntas opcionales, una sola vez, al salir de la primera lección.
 *
 * El momento no es casual: antes de la primera lección nadie ha invertido nada
 * y cualquier pregunta de más es una razón para cerrar la app; después de
 * terminarla ya hubo recompensa, y quien llegó hasta ahí es justo el que vale
 * la pena describir.
 *
 * Responde lo que la telemetría no puede: si el náhuat se hablaba en su casa,
 * por qué quiere aprenderlo y cómo llegó aquí. Ver ENTRY_SURVEY_ITEMS.
 */
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import useGameStore from '../store/useGameStore'
import { ENTRY_SURVEY_ITEMS } from '../data/questionnaires'
import QuestionnaireRunner from '../components/questionnaire/QuestionnaireRunner'
import Torogoz from '../components/ui/Torogoz'

export default function EntrySurveyScreen() {
  const [empezada, setEmpezada] = useState(false)
  const navigate = useNavigate()
  const { state } = useLocation()
  const finishEntrySurvey = useGameStore((s) => s.finishEntrySurvey)

  /** A dónde iba el usuario cuando se le interpuso la encuesta. */
  const volverA = state?.volverA ?? '/'

  const salir = ({ dismissed }) => {
    finishEntrySurvey({ dismissed })
    navigate(volverA, { replace: true })
  }

  if (empezada) {
    return (
      <QuestionnaireRunner
        items={ENTRY_SURVEY_ITEMS}
        phase="entrada"
        onComplete={() => salir({ dismissed: false })}
      />
    )
  }

  return (
    <div className="screen justify-between bg-background px-7 pb-10 pt-12">
      <div className="onboarding-body-wrap">
        <div className="onboarding-slide">
          <Torogoz emotion="explaining" size={120} />
          <h1 className="onboarding-title">¿Nos cuentas algo?</h1>
          <p className="onboarding-text">
            Cuatro preguntas rápidas sobre ti y el náhuat. Nos sirven para saber a
            quién le está hablando esta app.
          </p>
          <p className="onboarding-text">
            Son opcionales y no se vuelven a preguntar.
          </p>
        </div>
      </div>

      <div className="onboarding-actions">
        <button className="btn-3d btn-3d-primary" onClick={() => setEmpezada(true)}>
          Responder (1 minuto)
        </button>
        <button
          className="py-2 text-[0.88rem] font-semibold text-muted-foreground underline"
          onClick={() => salir({ dismissed: true })}
        >
          Ahora no
        </button>
      </div>
    </div>
  )
}
