import { useState } from 'react'
import { Clock3 } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import { INTERVENTION_MINUTES, PRETEST_ITEMS } from '../data/questionnaires'
import { markPretestCompleted } from '../services/analytics'
import QuestionnaireRunner from '../components/questionnaire/QuestionnaireRunner'

export default function PretestScreen() {
  const [started, setStarted] = useState(false)
  const [completed, setCompleted] = useState(false)
  const participantId = useGameStore((s) => s.participantId)
  const completePretest = useGameStore((s) => s.completePretest)

  const handleComplete = async () => {
    await markPretestCompleted(participantId)
    setCompleted(true)
  }

  if (completed) {
    return (
      <div className="screen bg-[#f7f5ef] px-6 py-8">
        <main className="flex flex-1 flex-col justify-between gap-6">
          <section className="rounded-lg border border-[#e3ded2] bg-white p-5 shadow-[0_16px_42px_rgba(37,48,42,0.08)]">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#fff1de] text-[#b95a18]">
              <Clock3 className="h-6 w-6" />
            </div>
            <p className="mt-5 text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#1f7a57]">
              Siguiente paso
            </p>
            <h1 className="mt-2 text-3xl font-black leading-none tracking-normal text-[#17211d]">
              Practica durante {INTERVENTION_MINUTES} minutos
            </h1>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-[#5f6b63]">
              Ya completaste el cuestionario inicial. Ahora usa la app para practicar lecciones y ejercicios de nahuat durante {INTERVENTION_MINUTES} minutos.
            </p>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-[#5f6b63]">
              Cuando se cumpla el tiempo, la app abrira automaticamente el cuestionario final para terminar el estudio.
            </p>
          </section>

          <button
            className="flex w-full items-center justify-center rounded-lg bg-[#1f7a57] px-5 py-4 text-base font-black text-white shadow-[0_10px_24px_rgba(31,122,87,0.22)] transition active:scale-[0.99]"
            onClick={completePretest}
          >
            Empezar practica
          </button>
        </main>
      </div>
    )
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
