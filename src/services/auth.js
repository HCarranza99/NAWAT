/**
 * auth.js
 *
 * Capa de servicio para Supabase Auth y sincronización de progreso.
 * Todas las funciones tienen try/catch: si Supabase falla, retornan
 * null/false y la app sigue funcionando en modo invitado.
 */

import { supabase } from '../lib/supabase'
import { logError } from '../lib/logger'
import { PHASES, STUDY_OPEN } from '../store/useGameStore'

// ── Autenticación ─────────────────────────────────────────────────

/**
 * Inicia sesión con email y contraseña.
 * @returns {{ user, error }}
 */
export async function signInWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { user: null, error: error.message }
    return { user: data.user, error: null }
  } catch (e) {
    logError('signInWithEmail', e)
    return { user: null, error: 'Error de conexión. Verifica tu internet.' }
  }
}

/**
 * Inicia sesión con Google (OAuth popup).
 * Requiere que Google esté configurado en el dashboard de Supabase.
 * @returns {{ error }}
 */
export async function signInWithGoogle() {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) {
      // validation_failed = Google no está activado en Supabase
      if (error.message?.includes('validation_failed') || error.status === 400) {
        return { error: 'El inicio de sesión con Google no está disponible aún. Usa correo y contraseña.' }
      }
      return { error: error.message }
    }
    return { error: null }
  } catch (e) {
    logError('signInWithGoogle', e)
    return { error: 'No se pudo iniciar sesión con Google. Intenta con correo y contraseña.' }
  }
}

/**
 * Registra un nuevo usuario con email y contraseña.
 * @returns {{ user, error }}
 */
export async function signUpWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { user: null, error: error.message }
    return { user: data.user, error: null }
  } catch (e) {
    logError('signUpWithEmail', e)
    return { user: null, error: 'Error de conexión. Verifica tu internet.' }
  }
}

/**
 * Cierra la sesión del usuario actual.
 * @returns {{ error }}
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) return { error: error.message }
    return { error: null }
  } catch (e) {
    logError('signOut', e)
    return { error: 'No se pudo cerrar sesión.' }
  }
}

/**
 * Retorna el usuario autenticado actualmente (o null si no hay sesión).
 */
export async function getCurrentUser() {
  try {
    const { data } = await supabase.auth.getUser()
    return data?.user ?? null
  } catch (e) {
    logError('getCurrentUser', e)
    return null
  }
}

/**
 * Suscribe un callback a los cambios de sesión (login/logout).
 * Retorna la función para cancelar la suscripción.
 * @param {(user: object|null) => void} callback
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
      callback(session?.user ?? null)
    }
  })
  return () => subscription.unsubscribe()
}

// ── Sincronización de progreso ────────────────────────────────────

/**
 * Mapea el estado de useGameStore al esquema de user_profiles en Supabase.
 */
function gameStateToProfile(userId, state) {
  return {
    id: userId,
    participant_id: state.participantId ?? null,
    xp: state.xp,
    lives: state.lives,
    lives_last_lost_at: state.livesLastLostAt ?? null,
    streak: state.streak,
    last_played_date: state.lastPlayedDate ?? null,
    section_progress: state.sectionProgress ?? {},
    lesson_progress: state.lessonProgress ?? {},
    srs: state.srs ?? {},
    study_phase: state.studyPhase,
    consent_accepted_at: state.consentAcceptedAt ?? null,
    pretest_completed_at: state.pretestCompletedAt ?? null,
    posttest_completed_at: state.posttestCompletedAt ?? null,
  }
}

/**
 * Mapea una fila de user_profiles al formato que espera mergeCloudProgress.
 */
function profileToGameState(row) {
  if (!row) return null
  return {
    xp: row.xp ?? 0,
    lives: row.lives ?? 3,
    livesLastLostAt: row.lives_last_lost_at ?? null,
    streak: row.streak ?? 0,
    lastPlayedDate: row.last_played_date ?? null,
    sectionProgress: row.section_progress ?? {},
    lessonProgress: row.lesson_progress ?? {},
    srs: row.srs ?? {},
    // Estudio cerrado: la nube nunca re-atasca a un usuario en una fase de
    // protocolo (ver STUDY_OPEN). Con el estudio abierto se respeta la fase guardada.
    studyPhase: STUDY_OPEN ? (row.study_phase ?? PHASES.CONSENT) : PHASES.FREE,
    pretestCompletedAt: row.pretest_completed_at ?? null,
    posttestCompletedAt: row.posttest_completed_at ?? null,
  }
}

/**
 * Guarda (upsert) el progreso completo del juego en Supabase.
 * Silencioso: si falla, el progreso local sigue intacto.
 * @param {object} gameState - snapshot del useGameStore
 */
export async function saveProgressToCloud(gameState) {
  try {
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) return
    const profile = gameStateToProfile(user.id, gameState)
    let result = await supabase
      .from('user_profiles')
      .upsert(profile, { onConflict: 'id' })

    // Si el participant_id persistido no existe en `participants` (FK, 23503) —
    // p. ej. estado local heredado de un build anterior — reintenta sin el
    // enlace: lo importante es no perder el progreso del usuario (xp, secciones, srs).
    if (result.error?.code === '23503') {
      result = await supabase
        .from('user_profiles')
        .upsert({ ...profile, participant_id: null }, { onConflict: 'id' })
    }

    if (result.error) throw result.error
  } catch (e) {
    logError('saveProgressToCloud', e)
    // silencioso — el usuario sigue jugando offline
  }
}

/**
 * Carga el progreso guardado en Supabase para un usuario.
 * @param {string} userId - auth.users.id
 * @returns {object|null} — objeto en formato de useGameStore, o null si no existe
 */
export async function loadProgressFromCloud(userId) {
  if (!userId) return null
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) return null
    return profileToGameState(data)
  } catch (e) {
    logError('loadProgressFromCloud', e)
    return null
  }
}
