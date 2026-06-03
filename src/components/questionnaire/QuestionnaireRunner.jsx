import { useState, useRef, useEffect, useMemo } from 'react'
import useGameStore from '../../store/useGameStore'
import { saveQuestionnaireResponse } from '../../services/analytics'
import ProgressBar from '../ui/ProgressBar'
import QuestionCard from './QuestionCard'

const SECTION_LABELS = {
  A: 'Sección A. Datos generales',
  B: 'Sección B. Conocimiento previo y hábitos',
  C: 'Sección C. Percepción del uso de herramientas TIC interactivas (VI)',
  D: 'Sección D. Interés por aprender náhuat (VD)',
  E: 'Sección E. Preferencias y barreras',
  G: 'Sección G. Valor cultural e identitario',
}

const POSTTEST_SECTION_LABELS = {
  B: 'Sección B. Comparación directa con el pretest',
  C: 'Sección C. Evaluación de Usabilidad (Modelo SUS Estandarizado)',
  D: 'Sección D. Retroalimentación Abierta (Opcional)',
}

function SusInstructionCard() {
  return (
    <div className="flex flex-col gap-4" data-testid="sus-instruction">
      <div className="rounded-xl border border-[#e3ded2] bg-white p-4 shadow-sm">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.8px] text-primary">
          Sección C. Evaluación de usabilidad
        </p>
        <h2 className="mt-2 text-[1.25rem] font-black leading-tight text-foreground">
          Instrucción para responder esta sección
        </h2>
        <div className="mt-3 space-y-3 text-[0.9rem] font-medium leading-relaxed text-muted-foreground">
          <p>
            A continuación encontrarás afirmaciones sobre tu experiencia usando la aplicación. Algunas están escritas en sentido positivo y otras en sentido negativo.
          </p>
          <p>
            Lee cada afirmación con atención y responde según tu experiencia real. No todas las preguntas deben responderse igual.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#d8ddd5] bg-[#fbfaf7] p-4 shadow-sm">
        <p className="text-[0.78rem] font-black uppercase tracking-[0.12em] text-[#6d756e]">
          Escala de respuesta
        </p>
        <div className="mt-3 grid gap-2 text-sm font-bold text-[#17211d]">
          <p><span className="text-primary">1</span> = Totalmente en desacuerdo</p>
          <p><span className="text-primary">2</span> = En desacuerdo</p>
          <p><span className="text-primary">3</span> = Ni de acuerdo ni en desacuerdo</p>
          <p><span className="text-primary">4</span> = De acuerdo</p>
          <p><span className="text-primary">5</span> = Totalmente de acuerdo</p>
        </div>
      </div>

      <div className="rounded-xl border border-[#f4d7ad] bg-[#fff8ec] p-4 text-[#8a4b12] shadow-sm">
        <p className="text-sm font-bold leading-relaxed">
          Por ejemplo, si una afirmación dice que la aplicación fue difícil o confusa, estar de acuerdo significa que sí encontraste esa dificultad.
        </p>
        <p className="mt-3 text-sm font-black leading-relaxed">
          Importante: no respondas automáticamente. Algunas afirmaciones expresan aspectos negativos de la aplicación.
        </p>
      </div>
    </div>
  )
}

function isAnswerValid(item, answer) {
  if (!item.is_required) return true
  if (!answer) return false

  switch (item.item_type) {
    case 'likert_5':
      return typeof answer.valueNumeric === 'number' && answer.valueNumeric >= 1 && answer.valueNumeric <= 5
    case 'single_choice': {
      if (!answer.valueText) return false
      const opt = item.options.find((o) => o.value === answer.valueText)
      if (opt?.allow_custom) return (answer.valueOther ?? '').trim().length >= 2
      return true
    }
    case 'short_text':
      return (answer.valueText ?? '').trim().length >= 2
    case 'long_text':
      return (answer.valueText ?? '').trim().length > 0
    default:
      return false
  }
}

export default function QuestionnaireRunner({ items, phase, onComplete }) {
  const participantId = useGameStore((s) => s.participantId)
  const currentSessionId = useGameStore((s) => s.currentSessionId)

  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [susIntroSeen, setSusIntroSeen] = useState(false)

  const itemStartRef = useRef(null)

  const item = items[index]
  const answer = answers[item.code] ?? null
  const isLast = index === items.length - 1
  const progress = index / items.length
  const valid = isAnswerValid(item, answer)
  const showSusIntro = phase === 'posttest' && item.code === 'sus_c1' && !susIntroSeen

  const sectionLabel = useMemo(() => {
    const map = phase === 'pretest' ? SECTION_LABELS : POSTTEST_SECTION_LABELS
    return map[item.section] ?? null
  }, [item.section, phase])

  useEffect(() => {
    itemStartRef.current = Date.now()
  }, [index])

  const handleChange = (newAnswer) => {
    setAnswers((prev) => ({ ...prev, [item.code]: newAnswer }))
  }

  const handleNext = async () => {
    if (submitting) return
    if (!valid && item.is_required) return

    setSubmitting(true)
    const responseTimeMs = Date.now() - itemStartRef.current

    const hasData =
      answer?.valueNumeric != null ||
      (answer?.valueText ?? '').length > 0 ||
      (answer?.valueOther ?? '').length > 0

    if (hasData) {
      await saveQuestionnaireResponse(participantId, currentSessionId, phase, item.code, {
        valueNumeric: answer.valueNumeric,
        valueText: answer.valueText,
        valueOther: answer.valueOther,
        responseTimeMs,
      })
    }

    setSubmitting(false)

    if (isLast) {
      onComplete()
    } else {
      setIndex((i) => i + 1)
    }
  }

  const handleBack = () => {
    if (index > 0 && !submitting) setIndex((i) => i - 1)
  }

  const handleSusIntroContinue = () => {
    setSusIntroSeen(true)
    itemStartRef.current = Date.now()
  }

  return (
    <div className="screen justify-between bg-background" data-testid="questionnaire-screen">
      <div className="flex items-center gap-3 px-4 pt-3.5 pb-2">
        <button
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-border bg-card text-[1.3rem] font-bold text-muted-foreground transition-all not-disabled:active:scale-[0.94] disabled:cursor-not-allowed disabled:opacity-35"
          onClick={handleBack}
          disabled={index === 0 || submitting}
          aria-label="Pregunta anterior"
        >
          ←
        </button>
        <ProgressBar value={progress} />
        <span className="min-w-12 text-right text-[0.82rem] font-bold tabular-nums text-muted-foreground">
          {index + 1}/{items.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pt-2 pb-4">
        {showSusIntro ? (
          <SusInstructionCard />
        ) : (
          <QuestionCard
            key={item.code}
            item={item}
            answer={answer}
            onChange={handleChange}
            sectionLabel={sectionLabel}
          />
        )}
      </div>

      <div className="flex flex-col gap-2 px-5 pt-4 pb-7">
        <button
          className="btn btn-primary"
          data-testid="questionnaire-next"
          onClick={showSusIntro ? handleSusIntroContinue : handleNext}
          disabled={showSusIntro ? submitting : ((!valid && item.is_required) || submitting)}
        >
          {showSusIntro ? 'Entendido, continuar' : submitting ? 'Guardando...' : isLast ? 'Finalizar' : 'Siguiente →'}
        </button>
        {!showSusIntro && !item.is_required && (
          <p className="text-center text-[0.78rem] italic text-muted-foreground">
            Esta pregunta es opcional - puedes dejarla en blanco.
          </p>
        )}
      </div>
    </div>
  )
}
