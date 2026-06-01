import LikertItem from './LikertItem'
import SingleChoiceItem from './SingleChoiceItem'
import ShortTextItem from './ShortTextItem'
import LongTextItem from './LongTextItem'
import Torogoz from '../ui/Torogoz'

function getMascotEmotion(item) {
  if (!item.is_required) return 'thinking'
  if (item.item_type === 'long_text' || item.item_type === 'short_text') return 'thinking'
  if (item.item_type === 'likert_5') return 'reading'
  return 'explaining'
}

/**
 * Tarjeta de pregunta — encabezado + input según item_type.
 * Renderiza una sola pregunta por pantalla (coherente con el ritmo de las lecciones).
 */
export default function QuestionCard({ item, answer, onChange, sectionLabel }) {
  const mascotEmotion = getMascotEmotion(item)

  return (
    <div className="flex flex-col gap-5" data-testid="question-card">
      <div className="rounded-xl border border-[#e3ded2] bg-white p-4 shadow-sm">
        <div className="grid grid-cols-[1fr_82px] items-start gap-3">
          <div className="min-w-0">
            {sectionLabel && (
              <span
                className="text-[0.7rem] font-bold uppercase tracking-[0.8px] text-primary mb-0.5"
                data-testid="section-label"
              >
                {sectionLabel}
              </span>
            )}
            <p className="mt-1 text-[0.72rem] font-bold text-muted-foreground tabular-nums" data-testid="question-code">
              {item.display_code ?? item.code}.
            </p>
            <h2 className="mt-1.5 text-[1.1rem] font-bold text-foreground leading-[1.35] tracking-[-0.2px]">
              {item.question_text}
            </h2>
            {!item.is_required && (
              <span className="mt-2 inline-flex text-[0.7rem] font-bold uppercase text-muted-foreground bg-border rounded-md px-2 py-0.5">
                Opcional
              </span>
            )}
          </div>

          <div className="relative flex min-h-[78px] items-end justify-center overflow-visible">
            <div className="absolute bottom-1 h-10 w-16 rounded-full bg-[#102f29]/8 blur-md" />
            <Torogoz emotion={mascotEmotion} size={84} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {item.item_type === 'likert_5' && (
          <LikertItem answer={answer} onChange={onChange} />
        )}
        {item.item_type === 'single_choice' && (
          <SingleChoiceItem item={item} answer={answer} onChange={onChange} />
        )}
        {item.item_type === 'short_text' && (
          <ShortTextItem item={item} answer={answer} onChange={onChange} />
        )}
        {item.item_type === 'long_text' && (
          <LongTextItem item={item} answer={answer} onChange={onChange} />
        )}
      </div>
    </div>
  )
}
