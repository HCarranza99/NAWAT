import { Footprints } from 'lucide-react'

/**
 * La tarea cierra la lección y saca la lengua de la pantalla.
 *
 * Es lo que distingue un curso de un juego de vocabulario: el estudiante tiene
 * que hacer algo con el náhuat en el mundo. No se corrige ni se puntúa —no hay
 * forma de verificarla y fingir que la hay sería peor que no pedirla.
 */
export default function TaskCard({ item, onContinue }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#6d756e]">
        Antes de cerrar
      </p>

      <div className="rounded-lg border border-[#1f7a57]/25 bg-[#eef8f2] p-4">
        <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.08em] text-[#1f7a57]">
          <Footprints className="h-4 w-4" />
          Tu tarea
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-[#1f4d3a]">{item.body}</p>
      </div>

      <p className="px-1 text-xs leading-relaxed text-[#6d756e]">
        Nadie la va a revisar. La lengua se sostiene por quien la usa, no por quien la aprueba.
      </p>

      <button
        onClick={onContinue}
        className="w-full rounded-lg bg-[#1f7a57] py-3.5 text-sm font-black uppercase tracking-[0.08em] text-white shadow-sm transition active:scale-[0.98]"
      >
        Terminar la lección
      </button>
    </div>
  )
}
