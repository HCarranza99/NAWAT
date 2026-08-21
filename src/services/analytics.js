/**
 * analytics.js
 *
 * Todas las operaciones de escritura hacia Supabase.
 * Cada función tiene try/catch silencioso: si Supabase falla,
 * la app sigue funcionando con normalidad y retorna null.
 */

import { supabase } from '../lib/supabase'
import { logError } from '../lib/logger'
import useGameStore, { DEMO_MODE } from '../store/useGameStore'
import { MIN_SCORE_TO_PASS } from '../data/gameConfig'

// ── Participantes ────────────────────────────────────────────────

/**
 * Crea un participante en Supabase y retorna su UUID.
 * Si falla, genera un UUID local para no bloquear el onboarding.
 *
 * El registro de entrada (edad y residencia) viaja en el MISMO insert y no en
 * un update posterior: `participants` solo concede INSERT a la clave anónima
 * (ver 20260517_fix_lesson_telemetry.sql), justamente para que nadie pueda
 * reescribir filas ajenas con la clave que va pública en el bundle.
 *
 * @param {string|null} firstName
 * @param {string|null} lastName
 * @param {'study'|'free'} cohort - 'study' = entró por /estudio y consintió;
 *        'free' = uso general de la población (sin protocolo).
 * @param {{ age?, residence?, district?, country? }} [registro]
 */
export async function createParticipant(firstName, lastName, cohort = 'free', registro = {}) {
  if (DEMO_MODE) return 'demo-user'
  const participantId = crypto.randomUUID()
  try {
    const { error } = await supabase
      .from('participants')
      .insert({
        id: participantId,
        first_name: firstName ?? null,
        last_name: lastName ?? null,
        cohort,
        age: registro.age ?? null,
        residence: registro.residence ?? null,
        district: registro.district ?? null,
        country: registro.country ?? null,
      })

    if (error) throw error
    return participantId
  } catch (e) {
    logError('createParticipant', e)
    // NO devolver un UUID que no llegó a entrar en `participants`: quedaría
    // huérfano y rompería la FK de user_profiles/sessions (Postgres 23503) en
    // cada guardado. Sin participante, la app sigue en modo offline (App.jsx y
    // startSession ya omiten la telemetría cuando participantId es null).
    return null
  }
}

/**
 * Envía el registro de un participante que YA existe: quien venía usando la
 * app desde antes de que se pidieran estos datos, quien los omitió, o quien
 * quiere corregirlos.
 *
 * Va a `participant_registration_updates` y no a un UPDATE de `participants`
 * porque esa tabla solo concede INSERT a la app: con permiso de UPDATE,
 * cualquiera con la clave del bundle podría reescribir filas ajenas. Cada
 * envío es una fila nueva y la vista v_participantes_registro resuelve cuál
 * es la vigente (la más reciente). Ver la migración
 * 20260815_participant_registration_updates.sql.
 *
 * @param {string} participantId
 * @param {{ name?, age?, residence?, district?, country? }} registro
 * @returns {Promise<boolean>} true si quedó guardado
 */
export async function saveParticipantRegistration(
  participantId,
  { name, age, residence, district, country } = {},
) {
  if (!participantId || DEMO_MODE) return false
  try {
    const { error } = await supabase
      .from('participant_registration_updates')
      .insert({
        participant_id: participantId,
        first_name: name ?? null,
        age: age ?? null,
        residence: residence ?? null,
        district: district ?? null,
        country: country ?? null,
      })

    if (error) throw error
    return true
  } catch (e) {
    logError('saveParticipantRegistration', e)
    return false
  }
}

// ── Recuperación de un participante que ya no existe ─────────────

/** Evita que dos llamadas simultáneas creen dos participantes. */
let recuperando = null

/**
 * El participante guardado en este dispositivo ya no está en la base.
 *
 * PASA DE VERDAD: el 20-ago-2026 se limpiaron 306 participantes de prueba
 * anteriores al lanzamiento. Quien vuelva con uno de esos identificadores
 * guardado se queda mudo — cada escritura choca contra la llave foránea y la
 * app no guarda nada suyo, sin que se note desde su lado. Se detectó porque
 * `error_log` acumuló 27 fallos de una misma persona en día y medio.
 *
 * La salida es crear un participante nuevo con los datos que sí siguen en el
 * dispositivo (nombre, edad, residencia) y seguir de largo. Se pierde el
 * historial viejo —que ya no existe— pero el nombre vuelve solo, porque nunca
 * se fue del teléfono: solo de nuestra base.
 *
 * @returns {Promise<string|null>} el id nuevo, o null si tampoco se pudo crear
 */
async function recuperarParticipanteHuerfano() {
  if (recuperando) return recuperando

  recuperando = (async () => {
    try {
      const s = useGameStore.getState()
      const id = await createParticipant(s.participantName, null, 'free', {
        age: s.participantAge,
        residence: s.participantResidence,
        district: s.participantDistrict,
        country: s.participantCountry,
      })
      if (id) s.setParticipant(id, s.participantName)
      return id
    } finally {
      recuperando = null
    }
  })()

  return recuperando
}

/** Postgres 23503: llave foránea. Acá siempre significa participante ausente. */
const esParticipanteAusente = (e) => e?.code === '23503'

// ── Sesiones ─────────────────────────────────────────────────────

/**
 * Crea una sesión nueva y retorna su ID.
 */
export async function startSession(participantId, reintento = false) {
  if (DEMO_MODE) return null
  const sessionId = crypto.randomUUID()
  try {
    const { error } = await supabase
      .from('sessions')
      .insert({ id: sessionId, participant_id: participantId })

    if (error) throw error
    return sessionId
  } catch (e) {
    // Es la PRIMERA escritura de cada apertura de la app, así que es donde
    // conviene detectar el identificador huérfano: recuperarlo acá deja
    // arreglado todo lo que venga después en esa sesión.
    if (esParticipanteAusente(e) && !reintento) {
      const nuevoId = await recuperarParticipanteHuerfano()
      // Un solo reintento. Si el participante nuevo también falla, algo más
      // está roto y hay que verlo en error_log, no seguir insistiendo.
      if (nuevoId) return startSession(nuevoId, true)
    }
    logError('startSession', e)
    return null
  }
}

/**
 * Cierra una sesión calculando la duración total.
 * @param {string} sessionId - UUID de la sesión
 * @param {number} startedAtMs - Date.now() del momento de inicio
 */
// Set para evitar llamadas duplicadas al mismo sessionId
const endedSessions = new Set()

export async function endSession(sessionId, startedAtMs) {
  if (!sessionId || DEMO_MODE) return
  if (endedSessions.has(sessionId)) return
  endedSessions.add(sessionId)
  try {
    const durationSeconds = Math.round((Date.now() - startedAtMs) / 1000)

    const { error } = await supabase.rpc('end_session', {
      p_session_id: sessionId,
      p_duration_seconds: durationSeconds,
    })

    if (error) throw error
  } catch (e) {
    logError('endSession', e)
  }
}

// ── Intentos de lección ──────────────────────────────────────────

/**
 * Registra el inicio de un intento de lección y retorna su ID.
 * @param {string} participantId
 * @param {string|null} sessionId
 * @param {{ id: string|number, title: string }} lesson
 */
export async function startLessonAttempt(participantId, sessionId, lesson) {
  if (DEMO_MODE) return null
  const attemptId = crypto.randomUUID()
  try {
    const { error } = await supabase
      .from('lesson_attempts')
      .insert({
        id: attemptId,
        participant_id: participantId,
        session_id: sessionId,
        lesson_id: String(lesson.id),
        lesson_title: lesson.title,
        started_at: new Date().toISOString(),
      })

    if (error) throw error
    return attemptId
  } catch (e) {
    logError('startLessonAttempt', e)
    return null
  }
}

/**
 * Completa un intento de lección con métricas finales.
 * @param {string|null} attemptId
 * @param {number} startedAtMs - Date.now() del inicio de la fase 'playing'
 * @param {number} score - 0.0 a 1.0
 * @param {number} stars - 1, 2 o 3
 * @param {number} xpEarned
 */
export async function completeLessonAttempt(attemptId, startedAtMs, score, stars, xpEarned) {
  if (!attemptId || DEMO_MODE) return
  try {
    const durationSeconds = Math.round((Date.now() - startedAtMs) / 1000)

    const { error } = await supabase.rpc('complete_lesson_attempt', {
      p_attempt_id: attemptId,
      p_duration_seconds: durationSeconds,
      p_score: score,
      p_stars: stars,
      p_xp_earned: xpEarned,
      p_passed: score >= MIN_SCORE_TO_PASS,
    })

    if (error) throw error
  } catch (e) {
    logError('completeLessonAttempt', e)
  }
}

// ── Respuestas por ejercicio ──────────────────────────────────────

/**
 * Registra la respuesta a un ejercicio individual.
 * @param {string} participantId
 * @param {string|null} sessionId
 * @param {string|null} lessonAttemptId
 * @param {{ id: string, type: string }} exercise
 * @param {boolean} isCorrect
 * @param {number} exerciseStartedAtMs - Date.now() de cuando apareció el ejercicio
 */
export async function logExerciseResponse(
  participantId,
  sessionId,
  lessonAttemptId,
  exercise,
  isCorrect,
  exerciseStartedAtMs
) {
  if (!participantId || DEMO_MODE) return
  try {
    const responseTimeSec = parseFloat(
      ((Date.now() - exerciseStartedAtMs) / 1000).toFixed(2)
    )

    const { error } = await supabase.from('exercise_responses').insert({
      participant_id: participantId,
      session_id: sessionId,
      lesson_attempt_id: lessonAttemptId,
      exercise_id: exercise.id,
      exercise_type: exercise.type,
      is_correct: isCorrect,
      response_time_sec: responseTimeSec,
    })

    if (error) throw error
  } catch (e) {
    logError('logExerciseResponse', e)
  }
}

// ── Consentimiento ───────────────────────────────────────────────

/**
 * Hash de auditoría con SHA-256.
 */
async function hashText(text) {
  const buf = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Registra que el participante aceptó el consentimiento.
 * @param {string} participantId
 * @param {string} consentVersion
 * @param {string} consentText - texto mostrado, para calcular hash de auditoría
 */
export async function saveConsent(participantId, consentVersion, consentText) {
  if (DEMO_MODE) return
  try {
    const hashedText = await hashText(consentText)
    const { error } = await supabase.from('consent_records').insert({
      participant_id: participantId,
      consent_version: consentVersion,
      consent_text_hash: hashedText,
    })

    if (error) throw error
  } catch (e) {
    logError('saveConsent', e)
  }
}

// ── Respuestas de cuestionario ───────────────────────────────────

/**
 * Guarda la respuesta a un item de cuestionario (pretest o postest).
 * Usa upsert sobre (participant_id, phase, item_code) para permitir que el
 * participante corrija una respuesta antes de enviar.
 *
 * @param {string} participantId
 * @param {string|null} sessionId
 * @param {'pretest'|'posttest'} phase
 * @param {string} itemCode
 * @param {object} values - { valueNumeric?, valueText?, valueOther?, responseTimeMs? }
 */
export async function saveQuestionnaireResponse(
  participantId,
  sessionId,
  phase,
  itemCode,
  { valueNumeric = null, valueText = null, valueOther = null, responseTimeMs = null } = {}
) {
  if (DEMO_MODE) return
  try {
    const { error } = await supabase.rpc('save_questionnaire_response', {
      p_participant_id: participantId,
      p_session_id: sessionId,
      p_phase: phase,
      p_item_code: itemCode,
      p_value_numeric: valueNumeric,
      p_value_text: valueText,
      p_value_other: valueOther,
      p_response_time_ms: responseTimeMs,
    })

    if (error) throw error
  } catch (e) {
    logError('saveQuestionnaireResponse', e)
  }
}

// ── Timeline de intervención ─────────────────────────────────────

/**
 * Marca un hito en intervention_timeline — un solo row por participante.
 *
 * El nombre del hito es un valor cerrado que la función valida en la base: el
 * cliente no elige qué columna se escribe. La marca de tiempo la pone Postgres
 * con now(), no el reloj del dispositivo, que puede venir corrido.
 */
async function markMilestone(participantId, milestone) {
  if (DEMO_MODE) return
  try {
    const { error } = await supabase.rpc('mark_intervention_milestone', {
      p_participant_id: participantId,
      p_milestone: milestone,
    })

    if (error) throw error
  } catch (e) {
    logError('markMilestone', e)
  }
}

export async function markPretestCompleted(participantId) {
  await markMilestone(participantId, 'pretest_completed')
}

export async function markPosttestUnlocked(participantId) {
  await markMilestone(participantId, 'posttest_unlocked')
}

export async function markPosttestCompleted(participantId) {
  await markMilestone(participantId, 'posttest_completed')
}
