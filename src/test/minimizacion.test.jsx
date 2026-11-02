/**
 * minimizacion.test.jsx — registro apagado y tabla de clasificación oculta.
 *
 * La tesis terminó y la app dejó de pedir nombre, edad y lugar (ver
 * src/data/funciones.js). Estas pruebas cuidan tres cosas:
 *   1. Quien llega por primera vez entra directo a aprender, sin formulario y
 *      sin que se cree un participante.
 *   2. Lo que quedó guardado en el dispositivo se borra al abrir la app, para
 *      que la sincronización no lo vuelva a subir a Supabase.
 *   3. Ni Perfil ni Logros muestran el formulario ni la tabla de clasificación.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import useGameStore, { PHASES, STORAGE_KEY } from '../store/useGameStore'

const createParticipant = vi.fn().mockResolvedValue('participante-nuevo')
const fetchTop10 = vi.fn().mockResolvedValue([])

vi.mock('../services/analytics', () => ({
  createParticipant: (...a) => createParticipant(...a),
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
  onAuthStateChange: (cb) => { queueMicrotask(() => cb(null)); return () => {} },
  loadProgressFromCloud: vi.fn().mockResolvedValue(null),
  saveProgressToCloud: vi.fn().mockResolvedValue(undefined),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  signInWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  signUpWithEmail: vi.fn(),
  getCurrentUser: vi.fn().mockResolvedValue(null),
}))

vi.mock('../services/leaderboard', () => ({
  PUESTOS: 10,
  fetchTop10: (...a) => fetchTop10(...a),
  fetchMiPosicion: vi.fn().mockResolvedValue(null),
  setLeaderboardOptOut: vi.fn().mockResolvedValue(true),
}))

const { default: App } = await import('../App')

/** Un dispositivo que nunca abrió la app. */
function dispositivoNuevo() {
  useGameStore.setState({
    studyPhase: PHASES.FREE,
    participantId: null,
    participantName: null,
    participantAge: null,
    participantResidence: null,
    participantDistrict: null,
    participantCountry: null,
    registrationCompletedAt: null,
    registrationSkipped: false,
    enrolledInStudy: false,
    onboardingSeen: true,
  })
}

/** Alguien que se registró antes de apagar el registro. */
function registradoAntes() {
  useGameStore.setState({
    studyPhase: PHASES.FREE,
    participantId: 'participante-1',
    participantName: 'María',
    participantAge: 24,
    participantResidence: 'sonsonate',
    participantDistrict: 'sonsonate-nahuizalco',
    participantCountry: null,
    registrationCompletedAt: '2026-08-16T00:00:00.000Z',
    registrationPromptDismissed: false,
    enrolledInStudy: false,
    onboardingSeen: true,
  })
}

async function irA(etiqueta) {
  await waitFor(() => {
    expect(screen.queryByLabelText('Navegación principal')).toBeInTheDocument()
  })
  const nav = screen.getByLabelText('Navegación principal')
  fireEvent.click(within(nav).getByLabelText(etiqueta))
}

beforeEach(() => {
  createParticipant.mockClear()
  fetchTop10.mockClear()
  window.history.replaceState({}, '', '/')
})

describe('Registro apagado', () => {
  it('un dispositivo nuevo entra directo a la app', async () => {
    dispositivoNuevo()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByLabelText('Navegación principal')).toBeInTheDocument()
    })
    expect(screen.queryByText('Antes de empezar')).not.toBeInTheDocument()
  })

  it('no crea participante para quien llega por primera vez', async () => {
    dispositivoNuevo()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByLabelText('Navegación principal')).toBeInTheDocument()
    })
    expect(createParticipant).not.toHaveBeenCalled()
  })

  it('el inicio no invita a completar el perfil', async () => {
    registradoAntes()
    useGameStore.setState({ participantName: null, participantAge: null })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByLabelText('Navegación principal')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('banner-completar-perfil')).not.toBeInTheDocument()
  })

  it('Perfil no ofrece ni muestra datos del registro', async () => {
    registradoAntes()
    render(<App />)
    await irA('Perfil')

    await waitFor(() => expect(screen.getByText('XP total')).toBeInTheDocument())
    expect(screen.queryByTestId('completar-registro')).not.toBeInTheDocument()
    expect(screen.queryByTestId('editar-registro')).not.toBeInTheDocument()
  })

  it('/profile?completar=1 ya no abre el formulario', async () => {
    registradoAntes()
    window.history.replaceState({}, '', '/profile?completar=1')
    render(<App />)

    await waitFor(() => expect(screen.getByText('XP total')).toBeInTheDocument())
    expect(screen.queryByRole('dialog', { name: 'Tus datos' })).not.toBeInTheDocument()
  })
})

describe('Datos que quedaron en el dispositivo', () => {
  it('se borran al abrir la app, sin tocar el avance', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 3,
      state: {
        participantId: 'participante-1',
        participantName: 'María',
        participantAge: 24,
        participantResidence: 'sonsonate',
        participantDistrict: 'sonsonate-nahuizalco',
        participantCountry: null,
        registrationCompletedAt: '2026-08-16T00:00:00.000Z',
        studyPhase: PHASES.FREE,
        xp: 340,
        streak: 3,
      },
    }))

    await useGameStore.persist.rehydrate()

    const s = useGameStore.getState()
    expect(s.participantName).toBeNull()
    expect(s.participantAge).toBeNull()
    expect(s.participantResidence).toBeNull()
    expect(s.participantDistrict).toBeNull()
    expect(s.participantCountry).toBeNull()
    // Lo que sostiene el aprendizaje se queda.
    expect(s.participantId).toBe('participante-1')
    expect(s.xp).toBe(340)
    expect(s.streak).toBe(3)

    // Y lo persistido también queda limpio.
    const guardado = JSON.parse(localStorage.getItem(STORAGE_KEY)).state
    expect(guardado.participantName).toBeNull()
    expect(guardado.participantAge).toBeNull()
  })

  it('iniciar sesión no trae de vuelta el nombre desde la nube', () => {
    dispositivoNuevo()
    useGameStore.getState().adoptCloudIdentity({
      participantId: 'participante-nube',
      participantName: 'María',
      participantAge: 24,
      participantResidence: 'sonsonate',
      participantDistrict: 'sonsonate-nahuizalco',
      participantCountry: null,
      registrationCompletedAt: '2026-08-16T00:00:00.000Z',
    })

    const s = useGameStore.getState()
    expect(s.participantId).toBe('participante-nube')
    expect(s.participantName).toBeNull()
    expect(s.participantAge).toBeNull()
    expect(s.participantResidence).toBeNull()
    expect(s.participantDistrict).toBeNull()
  })
})

describe('Tabla de clasificación oculta', () => {
  it('Logros no la muestra ni la consulta', async () => {
    registradoAntes()
    render(<App />)
    await irA('Logros')

    await waitFor(() => expect(screen.getAllByText('XP total').length).toBeGreaterThan(0))
    expect(screen.queryByText('Tabla de clasificación')).not.toBeInTheDocument()
    expect(fetchTop10).not.toHaveBeenCalled()
  })

  it('Perfil no muestra el interruptor para salir de ella', async () => {
    registradoAntes()
    render(<App />)
    await irA('Perfil')

    await waitFor(() => expect(screen.getByText('XP total')).toBeInTheDocument())
    expect(
      screen.queryByRole('switch', { name: 'Aparecer en la tabla de clasificación' }),
    ).not.toBeInTheDocument()
  })
})
