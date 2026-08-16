/**
 * Sesión — cerrar, volver a entrar, y el aviso de que sin cuenta se pierde.
 *
 * REGRESIÓN QUE FIJA ESTO
 * Cerrar sesión era un callejón sin salida: solo borraba `authUserId`, así que
 * el progreso, el nombre y el participante de quien se iba se quedaban en el
 * dispositivo — y como la pantalla de login únicamente era alcanzable desde el
 * registro (que a un dispositivo ya registrado nunca se le muestra), no había
 * ninguna forma de volver a entrar.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import useGameStore, { PHASES } from '../store/useGameStore'

// Quién devuelve Supabase al montar. useAuth escucha esto y manda: si aquí no
// hay usuario, deja el store en modo invitado por más que el test lo monte con
// sesión.
const sesionSupabase = { usuario: null }
const signOut = vi.fn().mockResolvedValue({ error: null })
const saveProgressToCloud = vi.fn().mockResolvedValue(undefined)
const signInWithEmail = vi.fn().mockResolvedValue({ user: { id: 'auth-1' }, error: null })
const signInWithGoogle = vi.fn().mockResolvedValue({ error: null })

vi.mock('../services/analytics', () => ({
  createParticipant: vi.fn().mockResolvedValue('participante-nuevo'),
  saveParticipantRegistration: vi.fn().mockResolvedValue(true),
  startSession: vi.fn().mockResolvedValue('sesion'),
  endSession: vi.fn(),
  logExerciseResponse: vi.fn(),
  startLessonAttempt: vi.fn().mockResolvedValue('intento'),
  completeLessonAttempt: vi.fn(),
  saveQuestionnaireResponse: vi.fn(),
  markPretestCompleted: vi.fn(),
  markPosttestUnlocked: vi.fn(),
  markPosttestCompleted: vi.fn(),
}))

vi.mock('../services/auth', () => ({
  onAuthStateChange: (cb) => { queueMicrotask(() => cb(sesionSupabase.usuario)); return () => {} },
  loadProgressFromCloud: vi.fn().mockResolvedValue(null),
  saveProgressToCloud: (...a) => saveProgressToCloud(...a),
  signOut: (...a) => signOut(...a),
  signInWithEmail: (...a) => signInWithEmail(...a),
  signInWithGoogle: (...a) => signInWithGoogle(...a),
  signUpWithEmail: vi.fn(),
  getCurrentUser: vi.fn().mockResolvedValue(null),
}))

vi.mock('../data/questionnaires', () => ({
  INTERVENTION_MS: 999999999,
  INTERVENTION_MINUTES: 999999999,
  PRETEST_ITEMS: [], POSTTEST_ITEMS: [], ENTRY_SURVEY_ITEMS: [],
  PRACTICE_ITEM: { code: 'p', item_type: 'likert_5', question_text: 'q', polarity: 'positive', is_required: true, order_index: 0 },
  CONSENT_VERSION: '1.0.0', CONSENT_TEXT: '',
  LIKERT_5_LABELS: {}, LIKERT_5_SHORT_LABELS: {},
}))

const { default: App } = await import('../App')

/** Alguien con cuenta y progreso, con la sesión iniciada. */
function conSesion() {
  sesionSupabase.usuario = { id: 'auth-1' }
  useGameStore.setState({
    studyPhase: PHASES.FREE,
    authUserId: 'auth-1',
    isGuestMode: false,
    participantId: 'participante-1',
    participantName: 'María',
    participantAge: 24,
    participantResidence: 'sonsonate',
    participantDistrict: 'sonsonate-nahuizalco',
    registrationCompletedAt: '2026-08-16T00:00:00.000Z',
    registrationPromptDismissed: true,
    onboardingSeen: true,
    enrolledInStudy: false,
    xp: 340,
    streak: 3,
    sectionProgress: { m0: { lessonsCompleted: { 'm0-l1': { completed: true } } } },
  })
}

/** Igual, pero sin cuenta: el avance solo vive en este dispositivo. */
function sinCuenta() {
  conSesion()
  sesionSupabase.usuario = null
  useGameStore.setState({ authUserId: null, isGuestMode: true })
}

async function irAPerfil() {
  await waitFor(() => {
    expect(screen.queryByLabelText('Navegación principal')).toBeInTheDocument()
  })
  const nav = screen.queryByLabelText('Navegación principal')
  fireEvent.click(within(nav).getByLabelText('Perfil'))
}

beforeEach(() => {
  sesionSupabase.usuario = null
  signOut.mockClear()
  saveProgressToCloud.mockClear()
  signInWithEmail.mockClear()
  window.history.replaceState({}, '', '/')
})

describe('Cerrar sesión', () => {
  it('avisa antes de cerrar que el dispositivo queda en blanco', async () => {
    conSesion()
    render(<App />)
    await irAPerfil()

    await waitFor(() => expect(screen.getByTestId('cerrar-sesion')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('cerrar-sesion'))

    expect(screen.getByText('¿Cerrar sesión?')).toBeInTheDocument()
    expect(screen.getByText(/Tu progreso queda guardado en tu cuenta/)).toBeInTheDocument()
    // Todavía no cerró nada: solo preguntó.
    expect(signOut).not.toHaveBeenCalled()
  })

  it('sincroniza antes de cerrar y deja el dispositivo limpio', async () => {
    conSesion()
    render(<App />)
    await irAPerfil()

    await waitFor(() => expect(screen.getByTestId('cerrar-sesion')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('cerrar-sesion'))
    fireEvent.click(screen.getByTestId('confirmar-cerrar-sesion'))

    await waitFor(() => expect(signOut).toHaveBeenCalled())
    // El orden importa: lo que no había subido, sube antes de borrarse.
    expect(saveProgressToCloud).toHaveBeenCalled()

    await waitFor(() => {
      const s = useGameStore.getState()
      expect(s.authUserId).toBeNull()
      expect(s.participantId).toBeNull()
      expect(s.participantName).toBeNull()
      expect(s.xp).toBe(0)
      expect(s.sectionProgress).toEqual({})
      expect(s.registrationCompletedAt).toBeNull()
    })
  })

  it('tras cerrar sesión se puede volver a entrar', async () => {
    // El callejón sin salida: el dispositivo quedaba registrado y sin cuenta, y
    // la única puerta al login vivía en una pantalla que ya no se mostraba.
    conSesion()
    render(<App />)
    await irAPerfil()

    await waitFor(() => expect(screen.getByTestId('cerrar-sesion')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('cerrar-sesion'))
    fireEvent.click(screen.getByTestId('confirmar-cerrar-sesion'))

    // Al quedar limpio, la app vuelve al registro, que sí ofrece iniciar sesión.
    await waitFor(() => {
      expect(screen.getByText('Antes de empezar')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('¿Ya tienes cuenta? Iniciar sesión'))
    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument()
  })
})

describe('Volver a iniciar sesión desde Perfil', () => {
  it('quien no tiene cuenta ve la puerta para entrar', async () => {
    sinCuenta()
    render(<App />)
    await irAPerfil()

    await waitFor(() => expect(screen.getByTestId('iniciar-sesion')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('iniciar-sesion'))

    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByText('Continuar con Google')).toBeInTheDocument()
  })

  it('con correo y contraseña entra y regresa al perfil', async () => {
    // Sin esto el usuario se quedaba viendo el formulario ya autenticado: en
    // Perfil nada cambia de ruta al iniciar sesión.
    sinCuenta()
    render(<App />)
    await irAPerfil()

    await waitFor(() => expect(screen.getByTestId('iniciar-sesion')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('iniciar-sesion'))

    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'maria@correo.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secreta123' } })
    fireEvent.click(screen.getByText('Iniciar sesión →'))

    await waitFor(() => {
      expect(signInWithEmail).toHaveBeenCalledWith('maria@correo.com', 'secreta123')
    })
    await waitFor(() => {
      expect(screen.getByTestId('sesion-en-nube')).toBeInTheDocument()
    })
    expect(useGameStore.getState().authUserId).toBe('auth-1')
  })

  it('un correo o contraseña mal no cierra el formulario', async () => {
    signInWithEmail.mockResolvedValueOnce({ user: null, error: 'Invalid login credentials' })
    sinCuenta()
    render(<App />)
    await irAPerfil()

    await waitFor(() => expect(screen.getByTestId('iniciar-sesion')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('iniciar-sesion'))
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'maria@correo.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'equivocada' } })
    fireEvent.click(screen.getByText('Iniciar sesión →'))

    await waitFor(() => {
      expect(screen.getByText('Correo o contraseña incorrectos.')).toBeInTheDocument()
    })
    expect(useGameStore.getState().authUserId).toBeNull()
  })
})

describe('Aviso de sesión local', () => {
  it('a quien no tiene cuenta se le dice que el avance puede perderse', async () => {
    sinCuenta()
    render(<App />)
    await irAPerfil()

    await waitFor(() => expect(screen.getByTestId('sesion-local')).toBeInTheDocument())
    const aviso = screen.getByTestId('sesion-local')
    expect(within(aviso).getByText('Tu avance está solo en este dispositivo')).toBeInTheDocument()
    // Lo que la gente no anticipa no es dónde queda, sino cómo se pierde.
    expect(within(aviso).getByText(/cambias de teléfono/)).toBeInTheDocument()
    expect(screen.queryByTestId('sesion-en-nube')).not.toBeInTheDocument()
  })

  it('a quien sí tiene cuenta no se le advierte nada', async () => {
    conSesion()
    render(<App />)
    await irAPerfil()

    await waitFor(() => expect(screen.getByTestId('sesion-en-nube')).toBeInTheDocument())
    expect(screen.queryByTestId('sesion-local')).not.toBeInTheDocument()
    expect(screen.queryByTestId('iniciar-sesion')).not.toBeInTheDocument()
  })
})
