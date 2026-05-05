import { useState } from 'react'
import useGameStore from '../store/useGameStore'
import { PRETEST_ITEMS } from '../data/questionnaires'
import { markPretestCompleted } from '../services/analytics'
import QuestionnaireRunner from '../components/questionnaire/QuestionnaireRunner'

export default function PretestScreen() {
  const [started, setStarted] = useState(false)
  const participantId = useGameStore((s) => s.participantId)
  const completePretest = useGameStore((s) => s.completePretest)

  const handleComplete = async () => {
    await markPretestCompleted(participantId)
    completePretest()
    // El router en App.jsx detecta studyPhase === 'playing' y muestra HomeScreen
  }

  if (!started) {
    return (
      <div className="screen px-7 pt-12 pb-10 justify-between bg-background">
        <div className="onboarding-body-wrap">
          <div className="onboarding-slide">
            <span className="onboarding-icon">📝</span>
            <h1 className="onboarding-title">Cuestionario inicial</h1>
            <p className="onboarding-text">
              Antes de usar la app, responde este cuestionario sobre tu experiencia con herramientas digitales y tu interés por aprender náhuat.
            </p>
            <p className="onboarding-text">
              <strong>{PRETEST_ITEMS.length} preguntas</strong> — toma unos 5 minutos.
            </p>
          </div>
        </div>

        <div className="onboarding-actions">
          <button className="btn btn-primary" onClick={() => setStarted(true)}>
            Empezar cuestionario
          </button>
        </div>
      </div>
    )
  }

  return (
    <QuestionnaireRunner
      items={PRETEST_ITEMS}
      phase="pretest"
      onComplete={handleComplete}
    />
  )
}
