/**
 * Encuesta de entrada — las cuatro preguntas de después de la primera lección.
 *
 * Lo que protegen estos tests es el MOMENTO y la INSISTENCIA: que aparezca al
 * salir de la primera lección aprobada, que no interrumpa a quien reprobó, y
 * que no se vuelva a ofrecer nunca —ni al que respondió ni al que dijo que no—.
 * Preguntar dos veces molesta y además duplicaría respuestas.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import useGameStore, { PHASES } from '../store/useGameStore'
import { ENTRY_SURVEY_ITEMS } from '../data/questionnaires'

const saveQuestionnaireResponse = vi.fn().mockResolvedValue(undefined)

vi.mock('../services/analytics', () => ({
  saveQuestionnaireResponse: (...args) => saveQuestionnaireResponse(...args),
  createParticipant: vi.fn().mockResolvedValue('mock-participant'),
  saveParticipantRegistration: vi.fn().mockResolvedValue(true),
  startSession: vi.fn().mockResolvedValue('mock-session'),
  endSession: vi.fn(),
  logExerciseResponse: vi.fn(),
  startLessonAttempt: vi.fn().mockResolvedValue('mock-attempt'),
  completeLessonAttempt: vi.fn(),
  markPretestCompleted: vi.fn(),
  markPosttestUnlocked: vi.fn(),
  markPosttestCompleted: vi.fn(),
}))

const { default: ResultScreen } = await import('../screens/ResultScreen')
const { default: EntrySurveyScreen } = await import('../screens/EntrySurveyScreen')

/** Resultado de una lección, tal como lo entrega LessonRunner. */
const RESULTADO_APROBADO = {
  lessonTitle: 'Los saludos', score: 0.9, xpEarned: 40, returnTo: '/sections',
}

function renderDesdeResultado(state = RESULTADO_APROBADO) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/result', state }]}>
      <Routes>
        <Route path="/result" element={<ResultScreen />} />
        <Route path="/encuesta" element={<EntrySurveyScreen />} />
        <Route path="/" element={<div>Pantalla de inicio</div>} />
        <Route path="/sections" element={<div>Módulos</div>} />
        <Route path="*" element={<div>Otra pantalla</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  saveQuestionnaireResponse.mockClear()
  useGameStore.setState({
    studyPhase: PHASES.FREE,
    participantId: 'participante-1',
    currentSessionId: 'sesion-1',
    entrySurveyCompletedAt: null,
    entrySurveyDismissed: false,
    sectionProgress: {},
    streak: 0,
  })
})

describe('Encuesta de entrada — cuándo aparece', () => {
  it('se ofrece al salir de la primera lección aprobada', async () => {
    renderDesdeResultado()

    // Primero la celebración: la encuesta no le roba el momento.
    expect(screen.getByText('Lección completada')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Volver al inicio'))

    await waitFor(() => {
      expect(screen.getByText('¿Nos cuentas algo?')).toBeInTheDocument()
    })
  })

  it('no interrumpe a quien reprobó la lección', async () => {
    renderDesdeResultado({ ...RESULTADO_APROBADO, score: 0.3 })

    expect(screen.getByText('Sigue practicando')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Volver al inicio'))

    await waitFor(() => {
      expect(screen.getByText('Pantalla de inicio')).toBeInTheDocument()
    })
    expect(screen.queryByText('¿Nos cuentas algo?')).not.toBeInTheDocument()
  })

  it('no se le vuelve a ofrecer a quien ya pasó por ella', async () => {
    useGameStore.setState({ entrySurveyDismissed: true })
    renderDesdeResultado()

    fireEvent.click(screen.getByText('Volver al inicio'))

    await waitFor(() => {
      expect(screen.getByText('Pantalla de inicio')).toBeInTheDocument()
    })
  })

  it('sin participante no se ofrece: las respuestas quedarían huérfanas', async () => {
    useGameStore.setState({ participantId: null })
    renderDesdeResultado()

    fireEvent.click(screen.getByText('Volver al inicio'))

    await waitFor(() => {
      expect(screen.getByText('Pantalla de inicio')).toBeInTheDocument()
    })
  })
})

describe('Encuesta de entrada — responder', () => {
  it('guarda cada respuesta con la fase "entrada" y termina donde iba el usuario', async () => {
    renderDesdeResultado()
    fireEvent.click(screen.getByText('Volver al inicio'))
    await waitFor(() => expect(screen.getByText('¿Nos cuentas algo?')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Responder (1 minuto)'))
    await waitFor(() => {
      expect(screen.getByText('¿Cuánto náhuat sabías antes de abrir esta app?')).toBeInTheDocument()
    })

    // Pregunta 1 de 4
    fireEvent.click(screen.getByText('Algunas palabras sueltas'))
    fireEvent.click(screen.getByTestId('questionnaire-next'))

    await waitFor(() => {
      expect(saveQuestionnaireResponse).toHaveBeenCalledWith(
        'participante-1', 'sesion-1', 'entrada', 'ent_1',
        expect.objectContaining({ valueText: 'palabras' }),
      )
    })

    // Las tres restantes
    await waitFor(() => {
      expect(screen.getByText('¿Alguien de tu familia habla o hablaba náhuat?')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Sí, y todavía lo habla'))
    fireEvent.click(screen.getByTestId('questionnaire-next'))

    await waitFor(() => expect(screen.getByText('¿Por qué quieres aprender náhuat?')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Por mis raíces y mi identidad'))
    fireEvent.click(screen.getByTestId('questionnaire-next'))

    await waitFor(() => expect(screen.getByText('¿Cómo llegaste a esta app?')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Alguien me la recomendó'))
    fireEvent.click(screen.getByTestId('questionnaire-next'))

    await waitFor(() => {
      expect(screen.getByText('Pantalla de inicio')).toBeInTheDocument()
    })
    expect(saveQuestionnaireResponse).toHaveBeenCalledTimes(4)

    const s = useGameStore.getState()
    expect(s.entrySurveyCompletedAt).not.toBeNull()
    expect(s.entrySurveyDismissed).toBe(true)
  })

  it('"Ahora no" entra a la app y no vuelve a preguntar', async () => {
    renderDesdeResultado()
    fireEvent.click(screen.getByText('Volver al inicio'))
    await waitFor(() => expect(screen.getByText('¿Nos cuentas algo?')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Ahora no'))

    await waitFor(() => expect(screen.getByText('Pantalla de inicio')).toBeInTheDocument())
    expect(saveQuestionnaireResponse).not.toHaveBeenCalled()

    const s = useGameStore.getState()
    expect(s.entrySurveyDismissed).toBe(true)
    // No respondió: no se marca como completada, y así se distingue en el análisis.
    expect(s.entrySurveyCompletedAt).toBeNull()
  })

  it('se puede dejar en blanco: ninguna pregunta es obligatoria', async () => {
    renderDesdeResultado()
    fireEvent.click(screen.getByText('Volver al inicio'))
    await waitFor(() => expect(screen.getByText('¿Nos cuentas algo?')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Responder (1 minuto)'))

    await waitFor(() => expect(screen.getByTestId('questionnaire-next')).toBeEnabled())
    // Avanzar sin marcar nada no guarda respuestas vacías.
    fireEvent.click(screen.getByTestId('questionnaire-next'))

    await waitFor(() => {
      expect(screen.getByText('¿Alguien de tu familia habla o hablaba náhuat?')).toBeInTheDocument()
    })
    expect(saveQuestionnaireResponse).not.toHaveBeenCalled()
  })

  it('no enseña códigos internos ni el banner del estudio', async () => {
    renderDesdeResultado()
    fireEvent.click(screen.getByText('Volver al inicio'))
    await waitFor(() => expect(screen.getByText('¿Nos cuentas algo?')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Responder (1 minuto)'))

    await waitFor(() => expect(screen.getByTestId('questionnaire-screen')).toBeInTheDocument())
    expect(screen.queryByTestId('study-progress-banner')).not.toBeInTheDocument()
    // 'ent_1' es el código del codebook, no una numeración que le sirva a nadie.
    expect(screen.queryByTestId('question-code')).not.toBeInTheDocument()
    expect(screen.queryByText(/ent_\d/)).not.toBeInTheDocument()
    expect(screen.queryByTestId('section-label')).not.toBeInTheDocument()
  })
})

describe('Encuesta de entrada — contrato con el codebook', () => {
  // Los códigos y valores tienen que ser idénticos a los del seed de
  // 20260816_encuesta_entrada.sql, o la exportación no cuadra.
  it('son cuatro preguntas de la fase entrada, todas opcionales', () => {
    expect(ENTRY_SURVEY_ITEMS).toHaveLength(4)
    for (const item of ENTRY_SURVEY_ITEMS) {
      expect(item.phase).toBe('entrada')
      expect(item.is_required).toBe(false)
      expect(item.code).toMatch(/^ent_\d$/)
      expect(item.options.length).toBeGreaterThan(1)
      for (const opcion of item.options) {
        expect(opcion.value).toMatch(/^[a-z_]+$/)
      }
    }
  })

  it('los códigos no se repiten y el orden es el declarado', () => {
    const codes = ENTRY_SURVEY_ITEMS.map((i) => i.code)
    expect(new Set(codes).size).toBe(codes.length)
    expect(ENTRY_SURVEY_ITEMS.map((i) => i.order_index)).toEqual([1, 2, 3, 4])
  })
})
