import { useState, useEffect } from 'react'
import useGameStore from '../store/useGameStore'
import { POSTTEST_ITEMS } from '../data/questionnaires'
import { markPosttestUnlocked, markPosttestCompleted } from '../services/analytics'
import QuestionnaireRunner from '../components/questionnaire/QuestionnaireRunner'
import StudyProgressBanner from '../components/ui/StudyProgressBanner'

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
        <StudyProgressBanner completed={2} current="posttest" />
        <div className="onboarding-body-wrap">
          <div className="onboarding-slide">
            <span className="onboarding-icon">⏱️</span>
            <h1 className="onboarding-title">¡Tiempo cumplido!</h1>
            <p className="onboarding-text">
              Ya completaste la fase 2: usar NAWAT durante 10 minutos. Ahora empieza la fase 3: el cuestionario final.
            </p>
            <p className="onboarding-text">
              Este paso es necesario para comparar tus respuestas antes y después de usar la app. Tu participación solo será válida si completas este cuestionario.
            </p>
            <p className="onboarding-text">
              <strong>{POSTTEST_ITEMS.length} preguntas</strong> — toma unos 5 minutos.
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
        <StudyProgressBanner completed={3} current="complete" />
        <div className="onboarding-body-wrap">
          <div className="onboarding-slide">
            <span className="onboarding-icon">🎉</span>
            <h1 className="onboarding-title">¡Gracias por participar!</h1>
            <p className="onboarding-text">
              Has completado las tres fases del estudio: cuestionario inicial, uso de la app por 10 minutos y cuestionario final.
            </p>
            <p className="onboarding-text">
              Ahora tu participación queda registrada como válida. A partir de este momento la app queda libre para que sigas aprendiendo náhuat a tu ritmo.
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
