import { FlaskConical } from 'lucide-react'

import { REVIEW_EXPLANATION, REVIEW_LABEL } from '../../lib/verification'

/**
 * Marca de "en revisión" para el contenido generado que ningún hablante ha
 * verificado todavía (ver src/lib/verification.js).
 *
 * Tono deliberadamente NEUTRO, no de alerta: no se usa rojo ni iconos de
 * advertencia. "Sin revisar" no es "incorrecto", y asustar al usuario con el
 * 88% del vocabulario sería peor que no decir nada.
 *
 * Variantes:
 *   - 'chip'  → píldora mínima, para listas de lecciones
 *   - 'light' → píldora sobre fondo oscuro (cabecera de lección)
 *   - 'note'  → bloque con la explicación completa, donde hay espacio
 */
export default function ReviewBadge({ variant = 'chip', className = '' }) {
  if (variant === 'note') {
    return (
      <div
        className={`rounded-md border border-[#cfd8e3] bg-[#f4f7fa] p-3 ${className}`}
        role="note"
      >
        <p className="flex items-center gap-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#4a6076]">
          <FlaskConical className="h-3.5 w-3.5" />
          {REVIEW_LABEL}
        </p>
        <p className="mt-1.5 text-[0.8rem] font-semibold leading-snug text-[#5a6b7a]">
          {REVIEW_EXPLANATION}
        </p>
      </div>
    )
  }

  if (variant === 'light') {
    return (
      <span
        title={REVIEW_EXPLANATION}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/15 bg-white/10 px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-[0.12em] text-white/70 ${className}`}
      >
        <FlaskConical className="h-3 w-3" />
        {REVIEW_LABEL}
      </span>
    )
  }

  return (
    <span
      title={REVIEW_EXPLANATION}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-[#cfd8e3] bg-[#eef2f7] px-2 py-0.5 text-[0.52rem] font-black uppercase tracking-[0.1em] text-[#5a6b7a] ${className}`}
    >
      <FlaskConical className="h-2.5 w-2.5" />
      {REVIEW_LABEL}
    </span>
  )
}
