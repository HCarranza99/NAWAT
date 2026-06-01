import { useState, useEffect } from 'react'
import useGameStore from '../store/useGameStore'
import { GAME_CONFIG } from '../data/gameConfig'

function getTimeLeftStr(lives, livesLastLostAt, now) {
  if (lives > 0 || !livesLastLostAt) return null

  const elapsedMs = now - new Date(livesLastLostAt).getTime()
  const remainingMs = GAME_CONFIG.lives.rechargeMinutes * 60_000 - elapsedMs
  if (remainingMs <= 0) return null

  const m = Math.floor(remainingMs / 60000)
  const s = Math.floor((remainingMs % 60000) / 1000)
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * useLivesRecharge()
 *
 * Observa el timestamp livesLastLostAt y, cuando han pasado
 * GAME_CONFIG.lives.rechargeMinutes, llama a resetLives() automaticamente.
 *
 * Retorna { timeLeftStr } - null cuando las vidas estan llenas.
 */
export function useLivesRecharge() {
  const { lives, livesLastLostAt, resetLives } = useGameStore()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (lives > 0 || !livesLastLostAt) return

    const tick = () => {
      const elapsedMs = Date.now() - new Date(livesLastLostAt).getTime()
      const remainingMs = GAME_CONFIG.lives.rechargeMinutes * 60_000 - elapsedMs

      if (remainingMs <= 0) {
        resetLives()
      } else {
        setNow(Date.now())
      }
    }

    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [lives, livesLastLostAt, resetLives])

  return { timeLeftStr: getTimeLeftStr(lives, livesLastLostAt, now) }
}
