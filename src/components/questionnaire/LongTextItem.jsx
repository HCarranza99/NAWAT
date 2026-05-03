/**
 * Ítem de texto largo — textarea multilínea.
 * answer = { valueText: string } o null
 */
export default function LongTextItem({ item, answer, onChange }) {
  const text = answer?.valueText ?? ''

  return (
    <textarea
      className="profile-input w-full min-h-30 resize-y leading-normal"
      placeholder={item.placeholder || 'Escribe tu respuesta'}
      value={text}
      onChange={(e) =>
        onChange({ valueNumeric: null, valueText: e.target.value, valueOther: null })
      }
      rows={5}
      maxLength={2000}
    />
  )
}
