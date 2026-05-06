/**
 * Ítem de texto corto — input de una línea.
 * answer = { valueText: string } o null
 */
export default function ShortTextItem({ item, answer, onChange }) {
  const text = answer?.valueText ?? ''

  return (
    <input
      type="text"
      className="profile-input w-full"
      placeholder={item.placeholder || 'Escribe tu respuesta'}
      value={text}
      onChange={(e) =>
        onChange({ valueNumeric: null, valueText: e.target.value, valueOther: null })
      }
      maxLength={200}
    />
  )
}
