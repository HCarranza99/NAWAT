/**
 * Unit tests — useGameStore (Zustand)
 *
 * Tests section progress tracking, XP, lives,
 * and reset logic without rendering React components.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import useGameStore from '../store/useGameStore'

// Reset store between tests
beforeEach(() => {
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

describe('useGameStore — section progress', () => {

  it('starts with empty sectionProgress', () => {
    expect(useGameStore.getState().sectionProgress).toEqual({})
  })

  it('completeSectionLesson stores score, stars, and adds XP', () => {
    const { completeSectionLesson } = useGameStore.getState()
    completeSectionLesson(1, 's1-l1', 0.9, 50)

    const state = useGameStore.getState()
    expect(state.xp).toBe(50)
    expect(state.sectionProgress[1].lessonsCompleted['s1-l1']).toEqual({
      completed: true,
      score: 0.9,
      stars: 3,
    })
  })

  it('assigns correct star tiers', () => {
    const { completeSectionLesson } = useGameStore.getState()

    completeSectionLesson(1, 'a', 0.95, 10) // 3 stars
    completeSectionLesson(1, 'b', 0.75, 10) // 2 stars
    completeSectionLesson(1, 'c', 0.55, 10) // 1 star
    completeSectionLesson(1, 'd', 0.3, 10)  // 0 stars

    const prog = useGameStore.getState().sectionProgress[1].lessonsCompleted
    expect(prog['a'].stars).toBe(3)
    expect(prog['b'].stars).toBe(2)
    expect(prog['c'].stars).toBe(1)
    expect(prog['d'].stars).toBe(0)
    expect(prog['d'].completed).toBe(false)
  })

  it('completeSectionBoss marks boss as completed', () => {
    const { completeSectionBoss } = useGameStore.getState()
    completeSectionBoss(1, 0.8, 100)

    const state = useGameStore.getState()
    expect(state.xp).toBe(100)
    expect(state.sectionProgress[1].bossCompleted).toBe(true)
    expect(state.sectionProgress[1].bossScore).toBe(0.8)
    expect(state.sectionProgress[1].bossStars).toBe(2)
  })

  it('boss with score < 0.5 is not completed', () => {
    const { completeSectionBoss } = useGameStore.getState()
    completeSectionBoss(1, 0.3, 20)

    const state = useGameStore.getState()
    expect(state.sectionProgress[1].bossCompleted).toBe(false)
  })

  it('accumulates XP across multiple lessons', () => {
    const { completeSectionLesson, completeSectionBoss } = useGameStore.getState()
    completeSectionLesson(1, 's1-l1', 0.9, 50)
    completeSectionLesson(1, 's1-l2', 0.8, 50)
    completeSectionBoss(1, 0.7, 100)

    expect(useGameStore.getState().xp).toBe(200)
  })
})

describe('useGameStore — lives', () => {

  it('starts with 3 lives', () => {
    expect(useGameStore.getState().lives).toBe(3)
  })

  it('loseLife decrements by 1', () => {
    useGameStore.getState().loseLife()
    expect(useGameStore.getState().lives).toBe(2)
  })

  it('lives cannot go below 0', () => {
    const { loseLife } = useGameStore.getState()
    loseLife(); loseLife(); loseLife(); loseLife()
    expect(useGameStore.getState().lives).toBe(0)
  })

  it('sets livesLastLostAt when lives reach 0', () => {
    const { loseLife } = useGameStore.getState()
    loseLife(); loseLife(); loseLife()
    expect(useGameStore.getState().livesLastLostAt).toBeTruthy()
  })

  it('resetLives restores to 3', () => {
    const { loseLife, resetLives } = useGameStore.getState()
    loseLife(); loseLife(); loseLife()
    resetLives()
    const state = useGameStore.getState()
    expect(state.lives).toBe(3)
    expect(state.livesLastLostAt).toBeNull()
  })
})

describe('useGameStore — XP', () => {

  it('addXP increases XP', () => {
    useGameStore.getState().addXP(42)
    expect(useGameStore.getState().xp).toBe(42)
  })
})

describe('useGameStore — resetProgress', () => {

  it('clears all progress but preserves identity', () => {
    const state = useGameStore.getState()
    state.setParticipant('test-id', 'Test User')
    state.addXP(500)
    state.completeSectionLesson(1, 's1-l1', 0.9, 50)
    state.resetProgress()

    const after = useGameStore.getState()
    expect(after.xp).toBe(0)
    expect(after.lives).toBe(3)
    expect(after.lessonProgress).toEqual({})
    expect(after.sectionProgress).toEqual({})
    // Identity preserved
    expect(after.participantId).toBe('test-id')
    expect(after.participantName).toBe('Test User')
  })
})
