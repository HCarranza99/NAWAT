/**
 * analyticsRpc.test.js
 *
 * POR QUÉ EXISTE ESTE ARCHIVO
 *
 * Del 4 al 27 de junio de 2026 la app no guardó ni una respuesta de
 * cuestionario. Nadie se dio cuenta en 23 días. La causa fue una migración que
 * quitó una policy que el `.upsert()` necesitaba; el error 42501 cayó en el
 * catch mudo de cada función de analytics.js y la app siguió como si nada. Se
 * perdieron 70 participantes.
 *
 * La razón de fondo por la que pasó desapercibido: TODAS las demás pruebas
 * mockean `services/analytics` entero, así que nadie mira nunca la forma real
 * de la llamada a Supabase. Este archivo es el único que sí lo hace.
 *
 * QUÉ CUBRE Y QUÉ NO
 *
 * Cubre el lado del cliente: que se llame a la RPC correcta con los nombres de
 * parámetro que la base espera (ver 20260817_cierra_lectura_anonima.sql). Un
 * `p_score` mal escrito revienta acá y no en producción.
 *
 * NO cubre que la función exista en la base ni que el SQL corra. Eso solo se
 * comprueba aplicando la migración y jugando una lección — la prueba de humo
 * que documenta esa migración al final. Si cambia el contrato SQL, hay que
 * cambiar este archivo con él: son dos mitades de la misma cosa.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

const rpc = vi.fn()
const insert = vi.fn()

vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: (...a) => rpc(...a),
    from: () => ({ insert: (...a) => insert(...a) }),
  },
}))
vi.mock('../lib/logger', () => ({ logError: vi.fn() }))
vi.mock('../store/useGameStore', () => ({ DEMO_MODE: false }))

const {
  endSession,
  completeLessonAttempt,
  saveQuestionnaireResponse,
  markPretestCompleted,
  markPosttestUnlocked,
  markPosttestCompleted,
} = await import('../services/analytics')

beforeEach(() => {
  rpc.mockReset().mockResolvedValue({ error: null })
  insert.mockReset().mockResolvedValue({ error: null })
})

/** Los nombres que la migración concede a anon. Si cambian, cambia la base. */
const RPC_ESPERADAS = [
  'end_session',
  'complete_lesson_attempt',
  'save_questionnaire_response',
  'mark_intervention_milestone',
]

describe('el cliente llama a las RPC con el contrato de la base', () => {
  it('endSession manda id y duración en segundos', async () => {
    await endSession('sesion-1', Date.now() - 5000)

    expect(rpc).toHaveBeenCalledTimes(1)
    const [nombre, params] = rpc.mock.calls[0]
    expect(nombre).toBe('end_session')
    expect(Object.keys(params).sort()).toEqual(['p_duration_seconds', 'p_session_id'])
    expect(params.p_session_id).toBe('sesion-1')
    // 5 s de diferencia, con holgura por lo que tarde el test en correr.
    expect(params.p_duration_seconds).toBeGreaterThanOrEqual(5)
    expect(params.p_duration_seconds).toBeLessThan(60)
  })

  it('completeLessonAttempt manda las seis métricas del intento', async () => {
    await completeLessonAttempt('intento-1', Date.now() - 1000, 0.9, 3, 40)

    const [nombre, params] = rpc.mock.calls[0]
    expect(nombre).toBe('complete_lesson_attempt')
    expect(Object.keys(params).sort()).toEqual([
      'p_attempt_id', 'p_duration_seconds', 'p_passed',
      'p_score', 'p_stars', 'p_xp_earned',
    ])
    expect(params.p_attempt_id).toBe('intento-1')
    expect(params.p_score).toBe(0.9)
    expect(params.p_stars).toBe(3)
    expect(params.p_xp_earned).toBe(40)
    // `passed` lo decide el cliente comparando con MIN_SCORE_TO_PASS.
    expect(typeof params.p_passed).toBe('boolean')
  })

  it('saveQuestionnaireResponse manda los ocho campos del item', async () => {
    await saveQuestionnaireResponse('p-1', 's-1', 'entrada', 'ITEM_1', {
      valueNumeric: 4,
      valueText: 'porque sí',
      valueOther: null,
      responseTimeMs: 1200,
    })

    const [nombre, params] = rpc.mock.calls[0]
    expect(nombre).toBe('save_questionnaire_response')
    expect(Object.keys(params).sort()).toEqual([
      'p_item_code', 'p_participant_id', 'p_phase', 'p_response_time_ms',
      'p_session_id', 'p_value_numeric', 'p_value_other', 'p_value_text',
    ])
    expect(params.p_participant_id).toBe('p-1')
    expect(params.p_phase).toBe('entrada')
    expect(params.p_item_code).toBe('ITEM_1')
    expect(params.p_value_numeric).toBe(4)
    expect(params.p_value_text).toBe('porque sí')
  })

  it('no manda answered_at: la hora la pone Postgres, no el reloj del teléfono', async () => {
    await saveQuestionnaireResponse('p-1', 's-1', 'entrada', 'ITEM_1', { valueNumeric: 1 })

    const [, params] = rpc.mock.calls[0]
    expect(params).not.toHaveProperty('p_answered_at')
    expect(params).not.toHaveProperty('answered_at')
  })

  it('los hitos van como valor cerrado, no como nombre de columna', async () => {
    await markPretestCompleted('p-1')
    await markPosttestUnlocked('p-1')
    await markPosttestCompleted('p-1')

    const hitos = rpc.mock.calls.map(([nombre, params]) => {
      expect(nombre).toBe('mark_intervention_milestone')
      expect(params.p_participant_id).toBe('p-1')
      return params.p_milestone
    })

    // Exactamente los tres que la función valida con un IN (...).
    expect(hitos).toEqual(['pretest_completed', 'posttest_unlocked', 'posttest_completed'])
  })

  it('solo se usan las RPC que la migración concede a anon', async () => {
    await endSession('s', Date.now())
    await completeLessonAttempt('i', Date.now(), 1, 3, 10)
    await saveQuestionnaireResponse('p', 's', 'entrada', 'I', {})
    await markPretestCompleted('p')

    const usadas = [...new Set(rpc.mock.calls.map(([nombre]) => nombre))]
    expect(usadas.sort()).toEqual([...RPC_ESPERADAS].sort())
  })
})

describe('lo que se escribe directo sigue siendo INSERT plano', () => {
  it('la telemetría de escritura pura no pasa por RPC', async () => {
    // Estas tablas conservan su policy de INSERT: son filas nuevas, no tocan
    // ajenas, y un insert plano no necesita SELECT. Si alguna migrara a RPC
    // sin actualizar esta prueba, el conteo de abajo lo delata.
    const { logExerciseResponse } = await import('../services/analytics')
    await logExerciseResponse('p-1', 's-1', 'i-1', { id: 'e1', type: 'flashcard' }, true, Date.now())

    expect(insert).toHaveBeenCalledTimes(1)
    expect(rpc).not.toHaveBeenCalled()
  })
})
