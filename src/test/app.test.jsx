/**
 * Integration / E2E tests — Full app navigation flows
 *
 * Uses React Testing Library to render the actual App component
 * and test user journeys through the section system.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import useGameStore, { PHASES } from '../store/useGameStore'
// La ruta de aprendizaje que la app muestra: los módulos del currículo v2.
// Desde el 14-ago-2026 es el único contenido — las secciones 1–5 y la capa
// generada se borraron.
import sections from '../data/curriculum/asSections'

// Mock analytics to prevent real Supabase calls
vi.mock('../services/analytics', () => ({
  createParticipant: vi.fn().mockResolvedValue('mock-participant-id'),
  startSession: vi.fn().mockResolvedValue('mock-session-id'),
  endSession: vi.fn(),
  markPretestCompleted: vi.fn(),
  markPosttestUnlocked: vi.fn(),
  markPosttestCompleted: vi.fn(),
  logExerciseResponse: vi.fn(),
  startLessonAttempt: vi.fn().mockResolvedValue('mock-attempt-id'),
  completeLessonAttempt: vi.fn(),
}))

// Mock Supabase auth service so useAuth doesn't hang in jsdom
// (real onAuthStateChange never fires INITIAL_SESSION in our test env,
// which leaves App stuck in `authLoading=true` and renders null).
vi.mock('../services/auth', () => ({
  onAuthStateChange: (cb) => {
    // Fire immediately with no user (guest mode) so isLoading flips to false
    queueMicrotask(() => cb(null))
    return () => {}
  },
  loadProgressFromCloud: vi.fn().mockResolvedValue(null),
  saveProgressToCloud: vi.fn().mockResolvedValue(undefined),
  signInWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  signUpWithEmail: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn().mockResolvedValue(null),
}))

vi.mock('../data/questionnaires', () => ({
  INTERVENTION_MS: 999999999,
  INTERVENTION_MINUTES: 999999999,
  PRETEST_ITEMS: [],
  POSTTEST_ITEMS: [],
  PRACTICE_ITEM: { code: 'practice', item_type: 'likert_5', question_text: 'q', polarity: 'positive', is_required: true, order_index: 0 },
  CONSENT_VERSION: '1.0.0',
  CONSENT_TEXT: '',
  LIKERT_5_LABELS: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' },
  LIKERT_5_SHORT_LABELS: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' },
}))

const { default: App } = await import('../App')

function setStoreToPlaying() {
  useGameStore.setState({
    studyPhase: PHASES.PLAYING,
    participantId: 'test-participant',
    participantName: 'Tester',
    currentSessionId: 'test-session',
    consentAcceptedAt: new Date().toISOString(),
    pretestCompletedAt: new Date().toISOString(),
    xp: 0,
    lives: 5,
    livesLastLostAt: null,
    streak: 0,
    lastPlayedDate: null,
    lessonProgress: {},
    sectionProgress: {},
  })
}

beforeEach(() => {
  setStoreToPlaying()
})

// Helper: click a BottomNav tab by aria-label
async function clickNavTab(label) {
  // Wait for BottomNav to render (App is gated on async useAuth)
  await waitFor(() => {
    expect(screen.queryByLabelText('Navegación principal')).toBeInTheDocument()
  })
  const nav = screen.queryByLabelText('Navegación principal')
  const btn = within(nav).getByLabelText(label)
  fireEvent.click(btn)
}

describe('Navigation — Home Screen', () => {

  it('renders HomeScreen at root path', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('Nawat')).toBeInTheDocument()
    })
  })

  it('shows BottomNav with 3 tabs', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.queryByLabelText('Navegación principal')).toBeInTheDocument()
    })
    const nav = screen.queryByLabelText('Navegación principal')
    expect(within(nav).getByLabelText('Módulos')).toBeInTheDocument()
    expect(within(nav).getByLabelText('Inicio')).toBeInTheDocument()
    expect(within(nav).getByLabelText('Perfil')).toBeInTheDocument()
  })
})

describe('Navigation — Sections Screen', () => {

  it('navigates to sections screen via BottomNav', async () => {
    render(<App />)
    await clickNavTab('Módulos')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Módulos' })).toBeInTheDocument()
      expect(screen.getByText('Tu camino para aprender náhuat')).toBeInTheDocument()
    })
  })

  it('muestra una tarjeta por cada módulo del currículo', async () => {
    render(<App />)
    await clickNavTab('Módulos')

    await waitFor(() => {
      const cards = document.querySelectorAll('[data-testid="section-card"]')
      expect(cards.length).toBe(sections.length)
    })
    expect(sections.length).toBeGreaterThan(1)
  })

  it('first section is unlocked', async () => {
    render(<App />)
    await clickNavTab('Módulos')

    await waitFor(() => {
      const cards = document.querySelectorAll('[data-testid="section-card"]')
      expect(cards[0]).not.toHaveClass('opacity-35')
    })
  })
})

describe('Navigation — Profile Screen', () => {

  it('navigates to profile and shows stats', async () => {
    useGameStore.setState({ xp: 150 })
    render(<App />)
    await clickNavTab('Perfil')

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument()
    })
  })
})

describe('Study flow — Phase gating', () => {

  it('shows ConsentScreen when studyPhase is consent', () => {
    useGameStore.setState({ studyPhase: PHASES.CONSENT })
    render(<App />)
    // ConsentScreen should NOT have the BottomNav
    expect(screen.queryByLabelText('Navegación principal')).not.toBeInTheDocument()
  })

  it('does NOT show BottomNav during posttest', () => {
    useGameStore.setState({ studyPhase: PHASES.POSTTEST })
    render(<App />)
    expect(screen.queryByLabelText('Navegación principal')).not.toBeInTheDocument()
  })
})

describe('Section unlocking logic', () => {
  /** Marca todas las lecciones de un módulo como aprobadas. */
  const modulaTerminado = (modulo) => ({
    [modulo.id]: {
      lessonsCompleted: Object.fromEntries(
        modulo.lessons.map((l) => [l.id, { completed: true, score: 0.9, stars: 3 }]),
      ),
      bossCompleted: false,
    },
  })

  // El currículo v2 no tiene examen final: un módulo se abre cuando se
  // terminan las lecciones del anterior. Antes esto pedía `bossCompleted`, y
  // como ningún módulo tiene boss, la ruta quedaba trabada en el primero.
  it('terminar las lecciones del primer módulo abre el segundo', async () => {
    useGameStore.setState({ sectionProgress: modulaTerminado(sections[0]) })

    render(<App />)
    await clickNavTab('Módulos')

    await waitFor(() => {
      const cards = document.querySelectorAll('[data-testid="section-card"]')
      expect(cards[1]).not.toHaveClass('opacity-35')
    })
  })

  it('los módulos siguientes siguen cerrados', async () => {
    useGameStore.setState({ sectionProgress: modulaTerminado(sections[0]) })

    render(<App />)
    await clickNavTab('Módulos')

    await waitFor(() => {
      const cards = document.querySelectorAll('[data-testid="section-card"]')
      for (let i = 2; i < sections.length; i++) {
        expect(cards[i], `el módulo ${sections[i].id} no debería estar abierto`).toHaveClass('opacity-35')
      }
    })
  })

  // El progreso viejo se guardaba con claves numéricas (1..5). Los módulos usan
  // 'm0'..'m5' justamente para que no se herede: quien jugó las secciones no
  // debe aparecer con módulos ya aprobados.
  it('el progreso del contenido viejo no desbloquea nada', async () => {
    useGameStore.setState({
      sectionProgress: {
        1: { lessonsCompleted: { 's1-l1': { completed: true } }, bossCompleted: true },
        2: { lessonsCompleted: { 's2-l1': { completed: true } }, bossCompleted: true },
      },
    })

    render(<App />)
    await clickNavTab('Módulos')

    await waitFor(() => {
      const cards = document.querySelectorAll('[data-testid="section-card"]')
      expect(cards[1]).toHaveClass('opacity-35')
    })
  })
})
