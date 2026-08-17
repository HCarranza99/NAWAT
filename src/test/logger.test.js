/**
 * logger.test.js
 *
 * El logger corre justo cuando algo ya se rompió. Si él también falla, o peor,
 * si rompe la app que intentaba instrumentar, quedamos peor que con el catch
 * mudo de antes. Estas pruebas fijan las cuatro reglas de src/lib/logger.js.
 *
 * La que más importa es la del bucle: `logError` → insert falla → `logError`
 * otra vez → insert falla… contra la base de producción y sin freno.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

const insert = vi.fn()
vi.mock('../lib/supabase', () => ({
  supabase: { from: () => ({ insert: (...a) => insert(...a) }) },
}))
vi.mock('../store/useGameStore', () => ({ STORAGE_KEY: 'nahuat-game-v1' }))

const { logError, _resetTopes } = await import('../lib/logger')

/** La fila que se intentó insertar en la llamada n. */
const filaDe = (n = 0) => insert.mock.calls[n][0]

beforeEach(() => {
  _resetTopes()
  insert.mockReset().mockResolvedValue({ error: null })
  localStorage.clear()
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
})

describe('qué se manda', () => {
  it('saca code, message y details de un error de PostgREST', () => {
    logError('saveQuestionnaireResponse', {
      message: 'new row violates row-level security policy',
      code: '42501',
      details: 'la fila fue rechazada',
    })

    const fila = filaDe()
    expect(fila.scope).toBe('saveQuestionnaireResponse')
    // 42501 es EXACTAMENTE el error de junio. Es el dato que hace útil la tabla.
    expect(fila.code).toBe('42501')
    expect(fila.message).toContain('row-level security')
    expect(fila.details).toBe('la fila fue rechazada')
  })

  it('sobrevive a un error que no es de Postgres', () => {
    logError('startSession', new TypeError('Failed to fetch'))

    const fila = filaDe()
    expect(fila.scope).toBe('startSession')
    expect(fila.message).toContain('Failed to fetch')
    expect(fila.code).toBeNull()
  })

  it('usa el status cuando el error viene de Auth y no trae code', () => {
    logError('signInWithEmail', { message: 'Invalid login credentials', status: 400 })
    expect(filaDe().code).toBe('400')
  })

  it('aguanta que le pasen cualquier cosa', () => {
    expect(() => logError('raro', null)).not.toThrow()
    expect(() => logError('raro2', 'un string suelto')).not.toThrow()
    expect(() => logError('raro3', undefined)).not.toThrow()
    expect(insert).toHaveBeenCalledTimes(3)
  })

  it('recorta los textos largos para no llenar la tabla', () => {
    logError('x', { message: 'a'.repeat(2000), details: 'b'.repeat(2000) })
    const fila = filaDe()
    expect(fila.message.length).toBeLessThanOrEqual(501)
    expect(fila.details.length).toBeLessThanOrEqual(501)
  })
})

describe('lo que NO se manda', () => {
  it('no manda nada escrito por el usuario', () => {
    logError('saveQuestionnaireResponse', { message: 'falló', code: '42501' })

    // El contrato con quien usa la app (ver src/data/privacidad.js): esta tabla
    // diagnostica el sistema, no observa personas.
    const campos = Object.keys(filaDe()).sort()
    expect(campos).toEqual([
      'app_version', 'code', 'details', 'message',
      'participant_id', 'scope', 'url', 'user_agent',
    ])
  })

  it('no manda el participante falso del modo demo', () => {
    // 'demo-user' no es un uuid: el insert reventaría con 22P02, que es
    // justo el fallo silencioso que este archivo existe para evitar.
    localStorage.setItem('nahuat-game-v1', JSON.stringify({ state: { participantId: 'demo-user' } }))
    logError('x', new Error('y'))
    expect(filaDe().participant_id).toBeNull()
  })

  it('sí manda el participante cuando es un uuid de verdad', () => {
    const uuid = '05e53f0f-f3ac-41cd-9cec-926f36155d28'
    localStorage.setItem('nahuat-game-v1', JSON.stringify({ state: { participantId: uuid } }))
    logError('x', new Error('y'))
    expect(filaDe().participant_id).toBe(uuid)
  })

  it('no se cae si el localStorage tiene basura', () => {
    localStorage.setItem('nahuat-game-v1', 'esto no es json {{{')
    expect(() => logError('x', new Error('y'))).not.toThrow()
    expect(filaDe().participant_id).toBeNull()
  })
})

describe('las reglas que evitan que el logger sea el problema', () => {
  it('sin conexión no registra: offline es normal en una PWA', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    logError('endSession', new Error('Failed to fetch'))
    expect(insert).not.toHaveBeenCalled()
  })

  it('nunca lanza, aunque el insert reviente de forma síncrona', () => {
    insert.mockImplementation(() => { throw new Error('la base no responde') })
    expect(() => logError('endSession', new Error('x'))).not.toThrow()
  })

  it('un insert rechazado no genera otro registro — sin bucle', async () => {
    // El caso temido: el logger falla, se registra a sí mismo, vuelve a fallar…
    insert.mockImplementation(() => {
      logError('recursivo', new Error('el log falló'))
      return Promise.reject(new Error('rechazado'))
    })

    logError('endSession', new Error('x'))
    await new Promise((r) => setTimeout(r, 10))

    // Exactamente uno: el original. El de adentro se cortó por la guarda.
    expect(insert).toHaveBeenCalledTimes(1)
  })

  it('una promesa rechazada no queda sin capturar', async () => {
    const sinCapturar = vi.fn()
    process.on('unhandledRejection', sinCapturar)
    insert.mockRejectedValue(new Error('rechazado'))

    logError('endSession', new Error('x'))
    await new Promise((r) => setTimeout(r, 20))

    expect(sinCapturar).not.toHaveBeenCalled()
    process.off('unhandledRejection', sinCapturar)
  })

  it('tope de 3 por scope+code: una lección rota no inunda la tabla', () => {
    for (let i = 0; i < 25; i++) {
      logError('logExerciseResponse', { message: 'falló', code: '42501' })
    }
    expect(insert).toHaveBeenCalledTimes(3)
  })

  it('el tope es por clave, no global: otro fallo distinto sí se registra', () => {
    for (let i = 0; i < 10; i++) logError('logExerciseResponse', { code: '42501', message: 'a' })
    expect(insert).toHaveBeenCalledTimes(3)

    // Otro ámbito y otro código: problema distinto, tiene que verse.
    logError('createParticipant', { code: '23503', message: 'b' })
    expect(insert).toHaveBeenCalledTimes(4)
    expect(filaDe(3).scope).toBe('createParticipant')
  })
})
