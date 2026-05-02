/**
 * Unit tests — useLivesRecharge
 *
 * Validates the auto-recharge of lives after `rechargeMinutes`.
 * Uses fake timers to fast-forward the wall clock.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLivesRecharge } from '../hooks/useLivesRecharge'
import useGameStore from '../store/useGameStore'
import { GAME_CONFIG } from '../data/gameConfig'

beforeEach(() => {
  vi.useFakeTimers()
  useGameStore.setState({
    xp: 0,
    lives: 3,
    livesLastLostAt: null,
    streak: 0,
    lastPlayedDate: null,
    lessonProgress: {},
    sectionProgress: {},
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useLivesRecharge', () => {

  it('returns null timeLeftStr when lives are full', () => {
    const { result } = renderHook(() => useLivesRecharge())
    expect(result.current.timeLeftStr).toBeNull()
  })

  it('returns null when livesLastLostAt is missing even if lives=0', () => {
    useGameStore.setState({ lives: 0, livesLastLostAt: null })
    const { result } = renderHook(() => useLivesRecharge())
    expect(result.current.timeLeftStr).toBeNull()
  })

  it('renders MM:SS countdown when lives are 0', () => {
    const now = new Date('2026-04-28T12:00:00Z')
    vi.setSystemTime(now)
    useGameStore.setState({ lives: 0, livesLastLostAt: now.toISOString() })

    const { result } = renderHook(() => useLivesRecharge())

    // Right after losing → full rechargeMinutes left
    const expected = `${GAME_CONFIG.lives.rechargeMinutes}:00`
    expect(result.current.timeLeftStr).toBe(expected)
  })

  it('auto-resets lives to 3 when recharge time elapses', () => {
    const now = new Date('2026-04-28T12:00:00Z')
    vi.setSystemTime(now)
    useGameStore.setState({ lives: 0, livesLastLostAt: now.toISOString() })

    renderHook(() => useLivesRecharge())

    // Advance past rechargeMinutes
    act(() => {
      vi.setSystemTime(new Date(now.getTime() + (GAME_CONFIG.lives.rechargeMinutes + 1) * 60_000))
      vi.advanceTimersByTime(1000)
    })

    const state = useGameStore.getState()
    expect(state.lives).toBe(3)
    expect(state.livesLastLostAt).toBeNull()
  })

  it('countdown decrements over time', () => {
    const now = new Date('2026-04-28T12:00:00Z')
    vi.setSystemTime(now)
    useGameStore.setState({ lives: 0, livesLastLostAt: now.toISOString() })

    const { result } = renderHook(() => useLivesRecharge())
    const initial = result.current.timeLeftStr

    act(() => {
      vi.setSystemTime(new Date(now.getTime() + 60_000))
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.timeLeftStr).not.toBe(initial)
  })
})
