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
  B: 'Sección B. Evaluación de Usabilidad (Modelo SUS Estandarizado)',
  C: 'Sección C. Impacto en la Motivación y el Interés',
  D: 'Sección D. Retroalimentación Abierta (Opcional)',
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

/**
 * Ejecuta un cuestionario (pretest o postest). Una pregunta por pantalla.
 * Guarda cada respuesta al avanzar.
 *
 * Props:
 *   items        → array de items de questionnaires.js (ordenados)
 *   phase        → 'pretest' | 'posttest'
 *   onComplete   → callback cuando el usuario termina el último item
 */
export default function QuestionnaireRunner({ items, phase, onComplete }) {
  const participantId = useGameStore((s) => s.participantId)
  const currentSessionId = useGameStore((s) => s.currentSessionId)

  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})   // { [code]: { valueNumeric, valueText, valueOther } }
  const [submitting, setSubmitting] = useState(false)

  const itemStartRef = useRef(null)

  const item = items[index]
  const answer = answers[item.code] ?? null
  const isLast = index === items.length - 1
  const progress = index / items.length
  const valid = isAnswerValid(item, answer)

  const sectionLabel = useMemo(() => {
    const map = phase === 'pretest' ? SECTION_LABELS : POSTTEST_SECTION_LABELS
    return map[item.section] ?? null
  }, [item.section, phase])

  // Reset timer cuando cambia de ítem (incluye el montaje inicial)
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

    // Persistir respuesta en Supabase (si hay datos; items opcionales vacíos se saltan)
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

  return (
    <div className="screen bg-background justify-between" data-testid="questionnaire-screen">
      {/* ── Barra superior con progreso ── */}
      <div className="flex items-center gap-3 px-4 pt-3.5 pb-2">
        <button
          className="w-9 h-9 flex items-center justify-center text-[1.3rem] font-bold text-muted-foreground bg-card border-[1.5px] border-border rounded-full shrink-0 transition-all not-disabled:active:scale-[0.94] disabled:opacity-35 disabled:cursor-not-allowed"
          onClick={handleBack}
          disabled={index === 0 || submitting}
          aria-label="Pregunta anterior"
        >
          ←
        </button>
        <ProgressBar value={progress} />
        <span className="text-[0.82rem] font-bold text-muted-foreground tabular-nums min-w-12 text-right">
          {index + 1}/{items.length}
        </span>
      </div>

      {/* ── Tarjeta de pregunta ── */}
      <div className="flex-1 flex flex-col px-5 pt-2 pb-4">
        <QuestionCard
          key={item.code}
          item={item}
          answer={answer}
          onChange={handleChange}
          sectionLabel={sectionLabel}
        />
      </div>

      {/* ── CTA ── */}
      <div className="flex flex-col gap-2 px-5 pt-4 pb-7">
        <button
          className="btn btn-primary"
          data-testid="questionnaire-next"
          onClick={handleNext}
          disabled={(!valid && item.is_required) || submitting}
        >
          {submitting ? 'Guardando…' : isLast ? 'Finalizar' : 'Siguiente →'}
        </button>
        {!item.is_required && (
          <p className="text-center text-[0.78rem] text-muted-foreground italic">
            Esta pregunta es opcional — puedes dejarla en blanco.
          </p>
        )}
      </div>
    </div>
  )
}
