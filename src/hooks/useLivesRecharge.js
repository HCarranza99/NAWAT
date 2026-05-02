import { useState, useEffect } from 'react'
import useGameStore from '../store/useGameStore'
import { GAME_CONFIG } from '../data/gameConfig'

/**
 * useLivesRecharge()
 *
 * Observa el timestamp livesLastLostAt y, cuando han pasado
 * GAME_CONFIG.lives.rechargeMinutes, llama a resetLives() automáticamente.
 *
 * Retorna { timeLeftStr } — null cuando las vidas están llenas.
 */
export function useLivesRecharge() {
  const { lives, livesLastLostAt, resetLives } = useGameStore()
  const [timeLeftStr, setTimeLeftStr] = useState(null)

  useEffect(() => {
    if (lives > 0 || !livesLastLostAt) {
      setTimeLeftStr(null)
      return
    }

    const tick = () => {
      const elapsedMs = Date.now() - new Date(livesLastLostAt).getTime()
      const remainingMs = GAME_CONFIG.lives.rechargeMinutes * 60_000 - elapsedMs

      if (remainingMs <= 0) {
        resetLives()
        setTimeLeftStr(null)
      } else {
        const m = Math.floor(remainingMs / 60000)
        const s = Math.floor((remainingMs % 60000) / 1000)
        setTimeLeftStr(`${m}:${String(s).padStart(2, '0')}`)
      }
    }

    tick()
    const id = setInterval(tick, 1000) // re-evalúa cada 1 segundo
    return () => clearInterval(id)
  }, [lives, livesLastLostAt, resetLives])

  return { timeLeftStr }
}
