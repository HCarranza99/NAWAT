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

const { startSession, startLessonAttempt, logExerciseResponse } = await import('../services/analytics')
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

/**
 * LO QUE NUNCA DEBE PASAR
 *
 * La recuperación crea un participante nuevo. Si se disparara cuando no debe,
 * o si de paso tocara el progreso, alguien perdería su avance sin motivo. Estas
 * pruebas fijan las tres propiedades que lo hacen imposible.
 */
describe('la recuperación no puede costarle el avance a nadie', () => {
  it('NO toca el progreso local: XP, lecciones, racha y repaso quedan igual', async () => {
    useGameStore.setState({
      xp: 1200,
      streak: 9,
      sectionProgress: { m1: { lessonsCompleted: { 'm1-l1': { completed: true, stars: 3 } } } },
      lessonProgress: { 'm1-l1': true },
      srs: { 'tzaput': { ease: 2.5 } },
    })

    insert
      .mockResolvedValueOnce({ error: FK })
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: null })

    await startSession('viejo-borrado')

    const s = useGameStore.getState()
    expect(s.xp).toBe(1200)
    expect(s.streak).toBe(9)
    expect(s.sectionProgress.m1.lessonsCompleted['m1-l1'].completed).toBe(true)
    expect(s.lessonProgress['m1-l1']).toBe(true)
    expect(s.srs.tzaput.ease).toBe(2.5)
  })

  it('NO se dispara por un fallo de red', async () => {
    // Sin señal el error es un TypeError, no un código de Postgres. Si la
    // recuperación se activara acá, cada bajón de red crearía un participante.
    insert.mockRejectedValue(new TypeError('Failed to fetch'))

    await startSession('participante-sano')

    expect(from.mock.calls.map((c) => c[0])).toEqual(['sessions'])
    expect(useGameStore.getState().participantId).toBe('viejo-borrado')
  })

  it('NO se dispara por un rechazo de RLS', async () => {
    // 42501 significa que la policy bloqueó la escritura, no que falte el
    // participante. Crear uno nuevo no arreglaría nada y ensuciaría la base.
    insert.mockResolvedValue({ error: { code: '42501', message: 'row-level security' } })

    await startSession('participante-sano')

    expect(from.mock.calls.map((c) => c[0])).toEqual(['sessions'])
  })
})

describe('una recuperación, una sola sesión', () => {
  it('ocho llamadas fallando juntas abren UNA sesión, no ocho', async () => {
    // Pasó de verdad el 21-ago: ocho sesiones en nueve segundos por una sola
    // recuperación. El conteo de sesiones es una métrica del análisis.
    insert.mockImplementation(async (fila) => {
      if (fila?.cohort) return { error: null }                        // participants
      return { error: fila?.participant_id === 'viejo-borrado' ? FK : null }
    })

    const resultados = await Promise.all(
      Array.from({ length: 8 }, () => startSession('viejo-borrado')),
    )

    const sesionesCreadas = from.mock.calls.filter((c) => c[0] === 'sessions').length
    // 8 intentos fallidos + 1 sola sesión buena
    expect(sesionesCreadas).toBe(9)

    // Y todas las llamadas reciben la MISMA sesión.
    const unicas = new Set(resultados.filter(Boolean))
    expect(unicas.size).toBe(1)
  })
})

/**
 * Red de seguridad en los otros dos puntos de escritura.
 *
 * Lo normal es que `startSession` repare el participante al abrir la app. Pero
 * el 21-ago los errores llegaron por los tres caminos a la vez, así que si esa
 * primera llamada no repara —no llegó a correr, o falló por red en ese
 * instante— la lección se pierde igual. Con 305 identificadores huérfanos que
 * pueden volver, conviene cubrir los tres.
 */
describe('el intento de lección también se repara', () => {
  it('salva la lección con un participante nuevo', async () => {
    insert
      .mockResolvedValueOnce({ error: FK })      // intento con el id muerto
      .mockResolvedValueOnce({ error: null })    // participante nuevo
      .mockResolvedValueOnce({ error: null })    // intento otra vez

    const id = await startLessonAttempt('viejo-borrado', 'sesion-muerta',
      { id: 'm1-l1', title: 'Saludar' })

    expect(id).toBeTruthy()
    expect(from.mock.calls.map((c) => c[0]))
      .toEqual(['lesson_attempts', 'participants', 'lesson_attempts'])
  })

  it('suelta la sesión muerta en vez de perder el intento', async () => {
    // La sesión vieja murió con el participante. Reintentar con ella daría
    // otro 23503 y se perdería la lección entera.
    insert
      .mockResolvedValueOnce({ error: FK })
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: null })

    await startLessonAttempt('viejo-borrado', 'sesion-muerta',
      { id: 'm1-l1', title: 'Saludar' })

    const reintento = insert.mock.calls[2][0]
    expect(reintento.session_id).toBeNull()
    expect(reintento.participant_id).not.toBe('viejo-borrado')
    expect(reintento.lesson_id).toBe('m1-l1')
  })
})

describe('la respuesta de ejercicio también se repara', () => {
  it('conserva acierto y tiempo, que es lo que alimenta el análisis', async () => {
    insert
      .mockResolvedValueOnce({ error: FK })
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: null })

    await logExerciseResponse('viejo-borrado', 'sesion-muerta', 'intento-muerto',
      { id: 'ej-1', type: 'active_recall' }, true, Date.now() - 5000)

    const reintento = insert.mock.calls[2][0]
    expect(reintento.session_id).toBeNull()
    expect(reintento.lesson_attempt_id).toBeNull()
    expect(reintento.is_correct).toBe(true)
    expect(reintento.exercise_type).toBe('active_recall')
    expect(reintento.response_time_sec).toBeGreaterThan(4)
  })

  it('tampoco insiste más de una vez', async () => {
    insert.mockImplementation(async (fila) => (
      fila?.cohort ? { error: null } : { error: FK }
    ))

    await logExerciseResponse('viejo-borrado', null, null,
      { id: 'ej-1', type: 'matching' }, false, Date.now())

    expect(from.mock.calls.map((c) => c[0]))
      .toEqual(['exercise_responses', 'participants', 'exercise_responses'])
  })
})
