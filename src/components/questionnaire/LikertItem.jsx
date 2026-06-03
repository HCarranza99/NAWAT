import { LIKERT_5_LABELS, LIKERT_5_SHORT_LABELS } from '../../data/questionnaires'

/**
 * Item Likert 1-5.
 *
 * Default: compact 5-column scale used in most questionnaires.
 * Vertical: full-label options used for SUS, where careful reading matters.
 */
const gridButtonBase =
  'flex min-h-[82px] flex-col items-center justify-center gap-1 rounded-sm border-2 px-0.5 pt-2.5 pb-2 transition-all active:translate-y-0.5 active:shadow-none'

const verticalButtonBase =
  'flex min-h-[54px] w-full items-center gap-3 rounded-md border-2 px-3 py-2.5 text-left transition-all active:translate-y-0.5 active:shadow-none'

export default function LikertItem({ answer, onChange, layout = 'grid' }) {
  const selected = answer?.valueNumeric ?? null
  const isVertical = layout === 'vertical'

  return (
    <div
      className={isVertical ? 'flex flex-col gap-2' : 'grid grid-cols-5 gap-1.5'}
      role="radiogroup"
      aria-label="Selecciona una opcion del 1 al 5"
    >
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
            aria-label={`${n} - ${LIKERT_5_LABELS[n]}`}
            className={`${isVertical ? verticalButtonBase : gridButtonBase} ${tone}`}
            onClick={() => onChange({ valueNumeric: n, valueText: null, valueOther: null })}
          >
            {isVertical ? (
              <>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-white/70 text-[1rem] font-extrabold leading-none tabular-nums">
                  {n}
                </span>
                <span
                  className={`text-[0.9rem] font-bold leading-snug ${
                    isSelected ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {LIKERT_5_LABELS[n]}
                </span>
              </>
            ) : (
              <>
                <span className="text-[1.2rem] font-extrabold leading-none tabular-nums">{n}</span>
                <span
                  className={`whitespace-pre-line text-center text-[0.64rem] font-semibold leading-[1.2] tracking-[0.1px] ${
                    isSelected ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {LIKERT_5_SHORT_LABELS[n]}
                </span>
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}
