import { LIKERT_5_LABELS, LIKERT_5_SHORT_LABELS } from '../../data/questionnaires'

/**
 * Ítem Likert 1–5 — fila segmentada con número y etiqueta breve en cada botón.
 * Las etiquetas textuales bajo cada número reemplazan un gradiente de color
 * para evitar sesgar al usuario en ítems con polaridad alternada (SUS).
 *
 * answer = { valueNumeric: 1|2|3|4|5 } o null
 */
const btnBase =
  'flex flex-col items-center justify-center gap-1 px-0.5 pt-2.5 pb-2 rounded-sm border-2 transition-all min-h-[82px] active:translate-y-0.5 active:shadow-none'

export default function LikertItem({ answer, onChange }) {
  const selected = answer?.valueNumeric ?? null

  return (
    <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Selecciona una opción del 1 al 5">
      {[1, 2, 3, 4, 5].map((n) => {
        const isSelected = selected === n
        const tone = isSelected
          ? 'border-primary bg-secondary text-primary shadow-[0_2px_0_var(--primary)]'
          : 'border-border bg-card text-foreground shadow-[0_2px_0_var(--border)]'

        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${n} — ${LIKERT_5_LABELS[n]}`}
            className={`${btnBase} ${tone}`}
            onClick={() => onChange({ valueNumeric: n, valueText: null, valueOther: null })}
          >
            <span className="text-[1.2rem] font-extrabold leading-none tabular-nums">{n}</span>
            <span
              className={`text-[0.64rem] font-semibold leading-[1.2] text-center whitespace-pre-line tracking-[0.1px] ${
                isSelected ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {LIKERT_5_SHORT_LABELS[n]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
