import LikertItem from './LikertItem'
import SingleChoiceItem from './SingleChoiceItem'
import ShortTextItem from './ShortTextItem'
import LongTextItem from './LongTextItem'

/**
 * Tarjeta de pregunta — encabezado + input según item_type.
 * Renderiza una sola pregunta por pantalla (coherente con el ritmo de las lecciones).
 */
export default function QuestionCard({ item, answer, onChange, sectionLabel }) {
  return (
    <div className="flex flex-col gap-5" data-testid="question-card">
      <div className="flex flex-col gap-1.5">
        {sectionLabel && (
          <span
            className="text-[0.7rem] font-bold uppercase tracking-[0.8px] text-primary mb-0.5"
            data-testid="section-label"
          >
            {sectionLabel}
          </span>
        )}
        <p className="text-[0.72rem] font-bold text-muted-foreground tabular-nums" data-testid="question-code">
          {item.display_code ?? item.code}.
        </p>
        <h2 className="text-[1.1rem] font-bold text-foreground leading-[1.35] tracking-[-0.2px]">
          {item.question_text}
        </h2>
        {!item.is_required && (
          <span className="self-start text-[0.7rem] font-bold uppercase text-muted-foreground bg-border rounded-md px-2 py-0.5 mt-1">
            Opcional
          </span>
        )}
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
