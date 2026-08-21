/**
 * participanteHuerfano.test.js
 *
 * El 20-ago-2026 se limpiaron 306 participantes anteriores al lanzamiento.
 * Quien vuelva con uno de esos identificadores guardado en su teléfono se
 * queda mudo: cada escritura choca contra la llave foránea (23503) y no se
 * guarda nada suyo, sin que lo note. Pasó de verdad — 27 fallos de una misma
 * persona en día y medio, visitando Logros y Perfil mientras tanto.
 *
 * Estas pruebas cuidan que la app se repare sola, y que al hacerlo no cree un
 * participante por cada intento.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

const insert = vi.fn()
const from = vi.fn(() => ({ insert }))
vi.mock('../lib/supabase', () => ({ supabase: { from: (...a) => from(...a) } }))
vi.mock('../lib/logger', () => ({ logError: vi.fn() }))

const { startSession } = await import('../services/analytics')
const useGameStore = (await import('../store/useGameStore')).default

const FK = { code: '23503', message: 'violates foreign key constraint' }

beforeEach(() => {
  insert.mockReset()
  from.mockClear()
  useGameStore.setState({
    participantId: 'viejo-borrado',
    participantName: 'Daniela',
    participantAge: 30,
    participantResidence: 'sonsonate',
    participantDistrict: 'sonsonate-izalco',
    participantCountry: null,
  })
})

describe('cuando el participante guardado ya no existe', () => {
  it('crea uno nuevo y la sesión termina guardándose', async () => {
    // 1ª: sesión con el id muerto → 23503. 2ª: crear participante → ok.
    // 3ª: sesión con el id nuevo → ok.
    insert
      .mockResolvedValueOnce({ error: FK })
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: null })

    const sessionId = await startSession('viejo-borrado')

    expect(sessionId).toBeTruthy()
    expect(from.mock.calls.map((c) => c[0]))
      .toEqual(['sessions', 'participants', 'sessions'])
  })

  it('conserva el nombre y los datos del registro', async () => {
    // El nombre nunca se fue del teléfono, solo de la base: el participante
    // nuevo tiene que nacer con él.
    insert
      .mockResolvedValueOnce({ error: FK })
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: null })

    await startSession('viejo-borrado')

    const nuevoParticipante = insert.mock.calls[1][0]
    expect(nuevoParticipante.first_name).toBe('Daniela')
    expect(nuevoParticipante.age).toBe(30)
    expect(nuevoParticipante.residence).toBe('sonsonate')
    expect(nuevoParticipante.district).toBe('sonsonate-izalco')
    expect(nuevoParticipante.cohort).toBe('free')
  })

  it('deja el id nuevo en el store, para que no vuelva a pasar', async () => {
    insert
      .mockResolvedValueOnce({ error: FK })
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: null })

    await startSession('viejo-borrado')

    const idNuevo = useGameStore.getState().participantId
    expect(idNuevo).not.toBe('viejo-borrado')
    expect(idNuevo).toBeTruthy()
    expect(useGameStore.getState().participantName).toBe('Daniela')
  })

  it('reintenta UNA sola vez, aunque el id nuevo también falle', async () => {
    // El participante se crea bien, pero la sesión sigue rebotando. Algo más
    // está roto: hay que verlo en error_log, no quedarse en un bucle.
    insert.mockImplementation(async (fila) => (
      fila?.cohort ? { error: null } : { error: FK }
    ))

    const sessionId = await startSession('viejo-borrado')

    expect(sessionId).toBeNull()
    expect(from.mock.calls.map((c) => c[0]))
      .toEqual(['sessions', 'participants', 'sessions'])
  })

  it('si tampoco se puede crear el participante, se rinde sin insistir', async () => {
    // Sin red, por ejemplo. La app sigue funcionando sin telemetría.
    insert.mockResolvedValue({ error: FK })

    const sessionId = await startSession('viejo-borrado')

    expect(sessionId).toBeNull()
    expect(from.mock.calls.map((c) => c[0])).toEqual(['sessions', 'participants'])
  })

  it('dos llamadas a la vez crean UN solo participante', async () => {
    // App.jsx puede disparar dos sesiones casi juntas (StrictMode, un remonte).
    // Sin el candado saldrían dos participantes por la misma persona.
    insert.mockImplementation(async (fila) => {
      if (fila?.cohort) return { error: null }          // participants
      return { error: fila?.participant_id === 'viejo-borrado' ? FK : null }
    })

    await Promise.all([startSession('viejo-borrado'), startSession('viejo-borrado')])

    const creados = from.mock.calls.filter((c) => c[0] === 'participants').length
    expect(creados).toBe(1)
  })
})

describe('cuando el error es otro', () => {
  it('no toca al participante ni inventa uno nuevo', async () => {
    insert.mockResolvedValue({ error: { code: '23505', message: 'duplicate key' } })

    await startSession('participante-sano')

    expect(from.mock.calls.map((c) => c[0])).toEqual(['sessions'])
    expect(useGameStore.getState().participantId).toBe('viejo-borrado')
  })
})
