/**
 * Integration / E2E tests — Full app navigation flows
 *
 * Uses React Testing Library to render the actual App component
 * and test user journeys through the section system.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import useGameStore, { PHASES } from '../store/useGameStore'
import sections from '../data/sections'

// Mock analytics to prevent real Supabase calls
vi.mock('../services/analytics', () => ({
  startSession: vi.fn().mockResolvedValue('mock-session-id'),
  endSession: vi.fn(),
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
    lives: 3,
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
    expect(document.querySelector('.bottom-nav')).toBeInTheDocument()
  })
  const nav = document.querySelector('.bottom-nav')
  const btn = within(nav).getByLabelText(label)
  fireEvent.click(btn)
}

describe('Navigation — Home Screen', () => {

  it('renders HomeScreen at root path', async () => {
    render(<App />)
    await waitFor(() => {
      expect(document.querySelector('.home-screen')).toBeInTheDocument()
    })
  })

  it('shows BottomNav with 3 tabs', async () => {
    render(<App />)
    await waitFor(() => {
      expect(document.querySelector('.bottom-nav')).toBeInTheDocument()
    })
    const nav = document.querySelector('.bottom-nav')
    expect(within(nav).getByLabelText('Secciones')).toBeInTheDocument()
    expect(within(nav).getByLabelText('Inicio')).toBeInTheDocument()
    expect(within(nav).getByLabelText('Perfil')).toBeInTheDocument()
  })
})

describe('Navigation — Sections Screen', () => {

  it('navigates to sections screen via BottomNav', async () => {
    render(<App />)
    await clickNavTab('Secciones')

    await waitFor(() => {
      expect(document.querySelector('.sections-screen')).toBeInTheDocument()
    })
  })

  it('displays all 5 sections', async () => {
    render(<App />)
    await clickNavTab('Secciones')

    await waitFor(() => {
      const cards = document.querySelectorAll('.section-card')
      expect(cards.length).toBe(sections.length)
    })
  })

  it('first section is unlocked', async () => {
    render(<App />)
    await clickNavTab('Secciones')

    await waitFor(() => {
      const cards = document.querySelectorAll('.section-card')
      expect(cards[0]).not.toHaveClass('section-locked')
    })
  })
})

describe('Navigation — Profile Screen', () => {

  it('navigates to profile and shows stats', async () => {
    useGameStore.setState({ xp: 150 })
    render(<App />)
    await clickNavTab('Perfil')

    await waitFor(() => {
      expect(document.querySelector('.profile-screen')).toBeInTheDocument()
      expect(screen.getByText('150')).toBeInTheDocument()
    })
  })
})

describe('Study flow — Phase gating', () => {

  it('shows ConsentScreen when studyPhase is consent', () => {
    useGameStore.setState({ studyPhase: PHASES.CONSENT })
    render(<App />)
    // ConsentScreen should NOT have the BottomNav
    expect(document.querySelector('.bottom-nav')).not.toBeInTheDocument()
  })

  it('does NOT show BottomNav during posttest', () => {
    useGameStore.setState({ studyPhase: PHASES.POSTTEST })
    render(<App />)
    expect(document.querySelector('.bottom-nav')).not.toBeInTheDocument()
  })
})

describe('Section unlocking logic', () => {

  it('completing all S1 lessons + boss unlocks S2', async () => {
    const s1 = sections[0]
    const progress = { lessonsCompleted: {}, bossCompleted: true, bossScore: 0.9, bossStars: 3 }
    s1.lessons.forEach((l) => {
      progress.lessonsCompleted[l.id] = { completed: true, score: 0.9, stars: 3 }
    })
    useGameStore.setState({ sectionProgress: { 1: progress } })

    render(<App />)
    await clickNavTab('Secciones')

    await waitFor(() => {
      const cards = document.querySelectorAll('.section-card')
      // Section 2 (index 1) should not be locked
      expect(cards[1]).not.toHaveClass('section-locked')
    })
  })

  it('sections after S2 remain locked if only S1 is done', async () => {
    const s1 = sections[0]
    const progress = { lessonsCompleted: {}, bossCompleted: true, bossScore: 0.9, bossStars: 3 }
    s1.lessons.forEach((l) => {
      progress.lessonsCompleted[l.id] = { completed: true, score: 0.9, stars: 3 }
    })
    useGameStore.setState({ sectionProgress: { 1: progress } })

    render(<App />)
    await clickNavTab('Secciones')

    await waitFor(() => {
      const cards = document.querySelectorAll('.section-card')
      // Sections 3, 4, 5 should still be locked
      expect(cards[2]).toHaveClass('section-locked')
      expect(cards[3]).toHaveClass('section-locked')
      expect(cards[4]).toHaveClass('section-locked')
    })
  })
})
