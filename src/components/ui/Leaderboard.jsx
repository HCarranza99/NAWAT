import { useEffect, useState } from 'react'
import { Crown, Medal, Trophy, Users } from 'lucide-react'

import { fetchTop10, fetchMiPosicion } from '../../services/leaderboard'
import useGameStore from '../../store/useGameStore'

/**
 * Leaderboard.jsx — el top 10 por XP.
 *
 * SOBRE EL NÚMERO QUE MUESTRA
 * El XP viene del servidor (suma de `lesson_attempts.xp_earned`), no del store.
 * Por eso NO coincide con el "XP total" que la persona ve arriba en esta misma
 * pantalla: el local incluye XP de las secciones jubiladas y de los días en que
 * el registro de intentos estuvo roto. Se rotula «XP de lecciones» justamente
 * para que la diferencia no parezca un error.
 *
 * Nunca bloquea la pantalla: si la red falla, se muestra el estado vacío y los
 * logros de abajo siguen funcionando.
 */
export default function Leaderboard() {
  const participantId = useGameStore((s) => s.participantId)
  const [top, setTop] = useState(null) // null = cargando
  const [mi, setMi] = useState(null)

  useEffect(() => {
    let cancelado = false
    fetchTop10().then((filas) => {
      if (!cancelado) setTop(filas)
    })
    return () => { cancelado = true }
  }, [])

  useEffect(() => {
    if (!participantId) return
    let cancelado = false
    fetchMiPosicion(participantId).then((p) => {
      if (!cancelado) setMi(p)
    })
    return () => { cancelado = true }
  }, [participantId])

  // Si ya sale en el top no hace falta repetir su posición abajo.
  const estoyEnElTop = mi && top?.some((f) => f.posicion === mi.posicion)

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-[#d89a1d]" />
        <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#17211d]">
          Tabla de clasificación
        </h2>
      </div>

      <div className="surface-card overflow-hidden p-0">
        {top === null && (
          <p className="px-4 py-6 text-center text-[0.82rem] font-semibold text-[#6d756e]">
            Cargando…
          </p>
        )}

        {top?.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-7 text-center">
            <Users className="h-6 w-6 text-[#a8b0a8]" />
            <p className="text-[0.85rem] font-bold text-[#3d4a44]">Todavía no hay tabla</p>
            <p className="text-[0.78rem] font-medium leading-snug text-[#6d756e]">
              En cuanto haya gente completando lecciones, aparecen acá los diez primeros.
            </p>
          </div>
        )}

        {top && top.length > 0 && (
          <ul>
            {top.map((fila) => (
              <Fila key={fila.posicion} {...fila} />
            ))}
          </ul>
        )}

        {/* Mi puesto, si no estoy entre los diez */}
        {mi && !estoyEnElTop && (
          <div className="flex items-center gap-3 border-t border-hairline bg-[#f0fbf4] px-4 py-3">
            <span className="w-7 shrink-0 text-center text-[0.9rem] font-black tabular-nums text-[#1f7a57]">
              {mi.posicion}
            </span>
            <span className="min-w-0 flex-1 text-[0.88rem] font-black text-[#17211d]">
              Vos
              <span className="ml-1.5 font-semibold text-[#6d756e]">
                de {mi.total}
              </span>
            </span>
            <span className="shrink-0 text-[0.88rem] font-black tabular-nums text-[#1f7a57]">
              {mi.xp}
            </span>
          </div>
        )}
      </div>

      <p className="mt-2 px-1 text-[0.72rem] font-medium leading-snug text-[#6d756e]">
        XP de lecciones completadas. Podés salir de la tabla desde Perfil.
      </p>
    </section>
  )
}

/* ── Una fila del podio ─────────────────────────────────────────── */
function Fila({ posicion, nombre, xp }) {
  const podio = posicion <= 3
  const colorPodio = { 1: '#d89a1d', 2: '#9aa39c', 3: '#c77918' }[posicion]

  return (
    <li className="flex items-center gap-3 border-b border-hairline px-4 py-3 last:border-b-0">
      <span className="flex w-7 shrink-0 justify-center">
        {podio ? (
          posicion === 1
            ? <Crown className="h-5 w-5" style={{ color: colorPodio }} />
            : <Medal className="h-5 w-5" style={{ color: colorPodio }} />
        ) : (
          <span className="text-[0.86rem] font-black tabular-nums text-[#6d756e]">{posicion}</span>
        )}
      </span>

      <span className="min-w-0 flex-1 truncate text-[0.9rem] font-black text-[#17211d]">
        {nombre}
      </span>

      <span className="shrink-0 text-[0.88rem] font-black tabular-nums text-[#1f7a57]">
        {xp}
      </span>
    </li>
  )
}
