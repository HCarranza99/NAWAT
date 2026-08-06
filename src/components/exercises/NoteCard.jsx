import { Lightbulb } from 'lucide-react'

/**
 * La nota teórica va DESPUÉS del diálogo y del vocabulario, nunca antes.
 *
 * El estudiante ya oyó la estructura funcionando; acá se le pone nombre a lo que
 * pasó. Al revés —regla primero, ejemplo después— es como estaban las secciones
 * 1–5, y produce gente que sabe la regla y no reconoce la frase.
 */
export default function NoteCard({ item, onContinue }) {
  // `kicker`: el encabezado por defecto ("¿qué pasó ahí?") solo tiene sentido
  // después de un diálogo. Las lecciones de sonidos abren con esta misma tarjeta
  // y necesitan otro texto. Es un campo del dato, no un tipo de ítem nuevo.
  const { title, body, examples = [], kicker = 'Ahora sí, ¿qué pasó ahí?' } = item

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#6d756e]">
        {kicker}
      </p>

      <div className="rounded-lg border border-[#f4e2ad] bg-[#fffbf0] p-4">
        <h3 className="flex items-start gap-2 text-base font-black leading-snug text-[#7a5b12]">
          <Lightbulb className="mt-0.5 h-4.5 w-4.5 shrink-0" />
          {title}
        </h3>
        {body.split('\n\n').map((parrafo, i) => (
          <p key={i} className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#5c4a20]">
            {parrafo}
          </p>
        ))}
      </div>

      {examples.length > 0 && (
        <div className="rounded-lg border border-[#e3ded2] bg-white p-4">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#6d756e]">
            Como en el diálogo
          </p>
          <ul className="mt-2.5 flex flex-col gap-2.5">
            {examples.map((ej, i) => (
              <li key={i} className="border-l-2 border-[#1f7a57]/30 pl-3">
                <p className="text-sm font-black text-[#1f4d3a]">{ej.nawat}</p>
                <p className="text-sm text-[#6d756e]">{ej.es}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onContinue}
        className="w-full rounded-lg bg-[#1f7a57] py-3.5 text-sm font-black uppercase tracking-[0.08em] text-white shadow-sm transition active:scale-[0.98]"
      >
        Entendido
      </button>
    </div>
  )
}
