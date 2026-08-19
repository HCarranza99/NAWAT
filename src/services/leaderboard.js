/**
 * leaderboard.js
 *
 * Tabla de clasificación. Todo pasa por funciones SECURITY DEFINER: la lectura
 * directa de `participants` y `lesson_attempts` está cerrada desde el 17-ago
 * (ver 20260817_cierra_lectura_anonima.sql) y así debe seguir. La base devuelve
 * exactamente diez filas con nombre y XP, nada más.
 *
 * Quién aparece se decide EN LA BASE, no acá: solo la cohorte 'free', con
 * nombre, con XP y sin haberse salido. Los 84 del estudio quedan fuera por
 * diseño. Ver la cabecera de 20260819_tabla_clasificacion.sql.
 */

import { supabase } from '../lib/supabase'
import { logError } from '../lib/logger'
import { DEMO_MODE } from '../store/useGameStore'

/** Cuántos puestos muestra la tabla. La base también corta en 10. */
export const PUESTOS = 10

/**
 * El top 10.
 * @returns {Promise<Array<{posicion:number, nombre:string, xp:number}>>}
 *          Lista vacía si falla: la pantalla muestra su estado vacío y ya.
 */
export async function fetchTop10() {
  if (DEMO_MODE) return []
  try {
    const { data, error } = await supabase.rpc('leaderboard_top10')
    if (error) throw error
    return data ?? []
  } catch (e) {
    logError('fetchTop10', e)
    return []
  }
}

/**
 * En qué puesto va esta persona, para quien no entra en el top 10.
 * @param {string|null} participantId
 * @returns {Promise<{posicion:number, xp:number, total:number}|null>}
 */
export async function fetchMiPosicion(participantId) {
  if (!participantId || DEMO_MODE) return null
  try {
    const { data, error } = await supabase.rpc('leaderboard_mi_posicion', {
      p_participant_id: participantId,
    })
    if (error) throw error
    return data?.[0] ?? null
  } catch (e) {
    logError('fetchMiPosicion', e)
    return null
  }
}

/**
 * Salirse de la tabla, o volver a entrar.
 *
 * Nadie eligió aparecer —la tabla se pobló con los nombres que ya estaban—,
 * así que esto es lo que hace reversible esa decisión.
 *
 * @param {string} participantId
 * @param {boolean} optOut
 * @returns {Promise<boolean>} true si quedó guardado
 */
export async function setLeaderboardOptOut(participantId, optOut) {
  if (!participantId || DEMO_MODE) return false
  try {
    const { error } = await supabase.rpc('set_leaderboard_opt_out', {
      p_participant_id: participantId,
      p_opt_out: optOut,
    })
    if (error) throw error
    return true
  } catch (e) {
    logError('setLeaderboardOptOut', e)
    return false
  }
}
