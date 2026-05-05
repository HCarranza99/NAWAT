import { useState, useEffect } from 'react'
import useGameStore from '../store/useGameStore'
import { POSTTEST_ITEMS } from '../data/questionnaires'
import { markPosttestUnlocked, markPosttestCompleted } from '../services/analytics'
import QuestionnaireRunner from '../components/questionnaire/QuestionnaireRunner'

export default function PosttestScreen() {
  const [phase, setPhase] = useState('gate') // 'gate' → 'running' → 'done'
  const participantId = useGameStore((s) => s.participantId)
  const completePosttest = useGameStore((s) => s.completePosttest)

  // Registrar el momento en que el postest se desbloqueó (entró a esta pantalla)
  useEffect(() => {
    if (participantId) markPosttestUnlocked(participantId)
  }, [participantId])

  const handleComplete = async () => {
    await markPosttestCompleted(participantId)
    setPhase('done')
  }

  const handleFinish = () => {
    completePosttest()
    // El router en App.jsx detecta studyPhase === 'free' y muestra HomeScreen sin restricciones
  }

  if (phase === 'gate') {
    return (
      <div className="screen px-7 pt-12 pb-10 justify-between bg-background">
        <div className="onboarding-body-wrap">
          <div className="onboarding-slide">
            <span className="onboarding-icon">⏱️</span>
            <h1 className="onboarding-title">¡Tiempo cumplido!</h1>
            <p className="onboarding-text">
              Para continuar utilizando la app, responde este cuestionario final sobre tu experiencia.
            </p>
            <p className="onboarding-text">
              <strong>{POSTTEST_ITEMS.length} preguntas</strong> — toma unos 3 minutos.
            </p>
          </div>
        </div>

        <div className="onboarding-actions">
          <button className="btn btn-primary" onClick={() => setPhase('running')}>
            Empezar cuestionario
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="screen px-7 pt-12 pb-10 justify-between bg-background">
        <div className="onboarding-body-wrap">
          <div className="onboarding-slide">
            <span className="onboarding-icon">🎉</span>
            <h1 className="onboarding-title">¡Gracias por participar!</h1>
            <p className="onboarding-text">
              Has completado el estudio. A partir de ahora la app queda libre para que sigas aprendiendo náhuat a tu ritmo.
            </p>
          </div>
        </div>

        <div className="onboarding-actions">
          <button className="btn btn-primary" onClick={handleFinish}>
            Abrir la app
          </button>
        </div>
      </div>
    )
  }

  return (
    <QuestionnaireRunner
      items={POSTTEST_ITEMS}
      phase="posttest"
      onComplete={handleComplete}
    />
  )
}
