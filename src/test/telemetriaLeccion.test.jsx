/**
 * telemetriaLeccion.test.jsx
 *
 * POR QUÉ EXISTE
 *
 * Del 15 al 18 de agosto de 2026 la app no registró NI UN intento de lección.
 * Cero filas en `lesson_attempts` con ids del currículo v2, mientras
 * `exercise_responses` seguía creciendo con normalidad — o sea que la app se
 * usaba y parecía estar midiendo, pero se perdían el puntaje, las estrellas,
 * el XP, la duración y si la persona aprobaba.
 *
 * La causa: al jubilar las secciones 1-5 se perdió el cableado. `LessonRunner`
 * ya llamaba a `onStart()` y devolvía el attemptId en `onComplete`, pero
 * `CurriculumLessonScreen` —la pantalla que las reemplazó— no pasaba `onStart`
 * y descartaba los dos últimos parámetros de `onComplete`.
 *
 * Ninguna prueba lo detectó porque todas mockean `services/analytics` entero y
 * solo miran el store local. Esta mira el cableado en sí: mockea LessonRunner
 * para capturar sus props y comprueba que la pantalla las conecte.
 *
 * Si alguien vuelve a tocar ese contrato, esto revienta antes del despliegue.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

const startLessonAttempt = vi.fn()
const completeLessonAttempt = vi.fn()

vi.mock('../services/analytics', () => ({
  startLessonAttempt: (...a) => startLessonAttempt(...a),
  completeLessonAttempt: (...a) => completeLessonAttempt(...a),
}))

/** Captura las props con que la pantalla monta el runner. */
let propsDelRunner = null
vi.mock('../components/ui/LessonRunner', () => ({
  default: (props) => {
    propsDelRunner = props
    return <div data-testid="runner" />
  },
}))

const CurriculumLessonScreen = (await import('../screens/CurriculumLessonScreen')).default
const useGameStore = (await import('../store/useGameStore')).default

const montar = (lessonId = 'm0-l1') =>
  render(
    <MemoryRouter initialEntries={[`/curriculo/${lessonId}`]}>
      <Routes>
        <Route path="/curriculo/:lessonId" element={<CurriculumLessonScreen />} />
        <Route path="/result" element={<div>resultado</div>} />
      </Routes>
    </MemoryRouter>,
  )

beforeEach(() => {
  propsDelRunner = null
  startLessonAttempt.mockReset().mockResolvedValue('intento-1')
  completeLessonAttempt.mockReset()
  useGameStore.setState({
    participantId: 'p-1',
    currentSessionId: 's-1',
    lessonProgress: {},
    sectionProgress: {},
    xp: 0,
  })
})

describe('la lección abre su intento', () => {
  it('pasa onStart al runner — sin eso no se registra nada', () => {
    montar()
    // El bug era exactamente esto: la prop no llegaba y el runner caía en su
    // default `async () => null`.
    expect(typeof propsDelRunner.onStart).toBe('function')
  })

  it('onStart llama a startLessonAttempt con participante y sesión', async () => {
    montar()
    await propsDelRunner.onStart()

    expect(startLessonAttempt).toHaveBeenCalledTimes(1)
    const [participantId, sessionId, leccion] = startLessonAttempt.mock.calls[0]
    expect(participantId).toBe('p-1')
    expect(sessionId).toBe('s-1')
    expect(leccion.id).toBe('m0-l1')
  })

  it('el título va como texto, no como el objeto {nawat, es}', async () => {
    montar()
    await propsDelRunner.onStart()

    // `startLessonAttempt` escribe esto en lesson_title. Con el objeto crudo
    // la base guardaría "[object Object]" sin que fallara nada.
    const leccion = startLessonAttempt.mock.calls[0][2]
    expect(typeof leccion.title).toBe('string')
    expect(leccion.title.length).toBeGreaterThan(0)
  })
})

describe('la lección cierra su intento', () => {
  it('onComplete cierra con puntaje, estrellas y XP', () => {
    montar()
    // Firma del runner: (ratio, xpEarned, attemptId, lessonStartMs)
    propsDelRunner.onComplete(1, 40, 'intento-1', 1000)

    expect(completeLessonAttempt).toHaveBeenCalledTimes(1)
    const [attemptId, startMs, score, stars, xp] = completeLessonAttempt.mock.calls[0]
    expect(attemptId).toBe('intento-1')
    expect(startMs).toBe(1000)
    expect(score).toBe(1)
    expect(stars).toBe(3) // ratio 1.0 → tres estrellas
    expect(xp).toBe(40)
  })

  it('las estrellas salen del puntaje, no de un valor fijo', () => {
    montar()
    propsDelRunner.onComplete(0.6, 10, 'intento-2', 1000)

    const [, , , stars] = completeLessonAttempt.mock.calls[0]
    expect(stars).toBe(0) // 0.6 no alcanza para aprobar
  })

  it('sin attemptId no intenta cerrar nada', () => {
    montar()
    // Pasa cuando no hay participante, o cuando el insert del intento falló.
    propsDelRunner.onComplete(1, 40, null, 1000)

    expect(completeLessonAttempt).not.toHaveBeenCalled()
  })

  it('el progreso local se guarda aunque la telemetría no tenga intento', () => {
    montar()
    propsDelRunner.onComplete(1, 40, null, 1000)

    // Quien está aprendiendo no puede perder su avance porque falle la
    // telemetría: son dos cosas independientes y así deben quedar.
    const { sectionProgress, xp } = useGameStore.getState()
    expect(sectionProgress.m0).toBeTruthy()
    expect(xp).toBeGreaterThan(0)
  })
})
