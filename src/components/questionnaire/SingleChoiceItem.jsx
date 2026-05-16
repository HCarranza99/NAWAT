/**
 * Ítem de opción única — stack vertical de botones.
 * Si la opción seleccionada tiene `allow_custom`, aparece un input para texto libre.
 *
 * answer = { valueText: option.value, valueOther?: customText } o null
 */
const btnBase =
  'px-4 py-3.5 rounded-sm text-[0.95rem] font-semibold border-2 text-left transition-all leading-[1.35] active:translate-y-0.5 active:shadow-none'

export default function SingleChoiceItem({ item, answer, onChange }) {
  const selectedValue = answer?.valueText ?? null
  const otherText = answer?.valueOther ?? ''

  const selectedOption = item.options.find((o) => o.value === selectedValue) ?? null
  const needsCustom = selectedOption?.allow_custom === true

  const handleSelect = (option) => {
    onChange({
      valueNumeric: null,
      valueText: option.value,
      valueOther: option.allow_custom ? otherText : null,
    })
  }

  const handleCustomChange = (e) => {
    onChange({
      valueNumeric: null,
      valueText: selectedValue,
      valueOther: e.target.value,
    })
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-2.5">
        {item.options.map((option) => {
          const isSelected = selectedValue === option.value
          const tone = isSelected
            ? 'border-primary bg-secondary text-primary shadow-[0_2px_0_var(--primary)]'
            : 'border-border bg-card text-foreground shadow-[0_2px_0_var(--border)]'
          return (
            <button
              key={option.value}
              type="button"
              data-testid="single-choice-option"
              className={`${btnBase} ${tone}`}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {needsCustom && (
        <input
          type="text"
          data-testid="single-choice-custom"
          className="profile-input w-full mt-1"
          placeholder="Especifica cuál…"
          value={otherText}
          onChange={handleCustomChange}
          aria-label="Especificar otra opción"
        />
      )}
    </div>
  )
}
