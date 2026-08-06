import { motion } from 'motion/react'
import { MapPin, Target, Volume2 } from 'lucide-react'
import { useTextToSpeech, isTtsSafe } from '../../hooks/useTextToSpeech'
import AudioPendingButton from '../ui/AudioPendingButton'

/**
 * El diálogo abre la lección.
 *
 * Es lo primero que ve el estudiante: la lengua funcionando en una situación,
 * antes de cualquier lista de palabras. El vocabulario y la gramática vienen
 * después, a explicar lo que ya oyó.
 *
 * Cada turno lleva su fuente. No se muestra en pantalla —sería ruido para quien
 * estudia— pero viaja en el dato y sale en el libro de validación, que es donde
 * un hablante la necesita.
 */
export default function DialogueCard({ item, onContinue }) {
  const { situation, objective, lines = [] } = item

  // Turnos consecutivos del mismo hablante se agrupan en una sola burbuja.
  const turnos = []
  for (const linea of lines) {
    const ultimo = turnos.at(-1)
    if (ultimo && ultimo.speaker === linea.speaker) ultimo.lineas.push(linea)
    else turnos.push({ speaker: linea.speaker, lineas: [linea] })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-[#e3ded2] bg-white p-4">
        <p className="flex items-start gap-2 text-sm leading-relaxed text-[#46524a]">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1f7a57]" />
          <span>{situation}</span>
        </p>
        <p className="mt-3 flex items-start gap-2 border-t border-[#f0ece2] pt-3 text-sm font-bold leading-relaxed text-[#1f4d3a]">
          <Target className="mt-0.5 h-4 w-4 shrink-0 text-[#1f7a57]" />
          <span>{objective}</span>
        </p>
      </div>

      <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#6d756e]">
        Escuchá la conversación
      </p>

      <div className="flex flex-col gap-3">
        {turnos.map((turno, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            className={turno.speaker === 'a' ? 'flex justify-start' : 'flex justify-end'}
          >
            <div
              className={[
                'max-w-[86%] rounded-2xl px-4 py-3 shadow-sm',
                turno.speaker === 'a'
                  ? 'rounded-bl-sm border border-[#d8ddd5] bg-white'
                  : 'rounded-br-sm border border-[#1f7a57]/25 bg-[#eef8f2]',
              ].join(' ')}
            >
              {turno.lineas.map((linea, j) => (
                <Linea key={j} linea={linea} primera={j === 0} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={onContinue}
        className="mt-2 w-full rounded-lg bg-[#1f7a57] py-3.5 text-sm font-black uppercase tracking-[0.08em] text-white shadow-sm transition active:scale-[0.98]"
      >
        Ya la escuché
      </button>
    </div>
  )
}

function Linea({ linea, primera }) {
  const { speak, isSpeaking, isSupported } = useTextToSpeech(linea.nawat)

  return (
    <div className={primera ? '' : 'mt-2.5 border-t border-black/5 pt-2.5'}>
      <div className="flex items-start gap-2">
        <p className="flex-1 text-base font-black leading-snug text-[#1f4d3a]">{linea.nawat}</p>
        {/* Una línea muda sin explicación se lee como un fallo. Cuando el
            sintetizador no puede con el sonido (tz, tl, sh) se muestra el botón
            deshabilitado, igual que en el resto de la app. */}
        {!isSupported ? null : isTtsSafe(linea.nawat) ? (
          <button
            onClick={() => speak(false)}
            aria-label={`Escuchar "${linea.nawat}"`}
            className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#d8ddd5] bg-white text-[#1f7a57] transition active:scale-95"
          >
            <Volume2 className={`h-3.5 w-3.5 ${isSpeaking ? 'animate-pulse' : ''}`} />
          </button>
        ) : (
          <AudioPendingButton className="mt-0.5 h-7 w-7" iconClassName="h-3.5 w-3.5" />
        )}
      </div>
      <p className="mt-0.5 text-sm leading-snug text-[#6d756e]">{linea.es}</p>
    </div>
  )
}
