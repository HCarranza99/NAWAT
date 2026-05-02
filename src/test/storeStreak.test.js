/**
 * Unit tests — recordPlay (daily streak) and mergeCloudProgress
 *
 * recordPlay:
 *   - sets lastPlayedDate = today (local day number)
 *   - if previous lastPlayedDate was yesterday → streak += 1
 *   - if it was today → no-op
 *   - otherwise → streak = 1
 *
 * mergeCloudProgress:
 *   - cloud xp > local xp → cloud state replaces local
 *   - otherwise → no change
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import useGameStore, { PHASES } from '../store/useGameStore'

const dayNumber = (d) => Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000)

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
    studyPhase: PHASES.PLAYING,
    pretestCompletedAt: null,
    posttestCompletedAt: null,
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useGameStore — recordPlay (streak)', () => {

  it('sets streak to 1 on first play', () => {
    const d = new Date('2026-04-28T10:00:00')
    vi.setSystemTime(d)
    useGameStore.getState().recordPlay()
    expect(useGameStore.getState().streak).toBe(1)
    expect(useGameStore.getState().lastPlayedDate).toBe(dayNumber(d))
  })

  it('does NOT increment streak twice on the same day', () => {
    vi.setSystemTime(new Date('2026-04-28T10:00:00'))
    useGameStore.getState().recordPlay()
    useGameStore.getState().recordPlay()
    useGameStore.getState().recordPlay()
    expect(useGameStore.getState().streak).toBe(1)
  })

  it('continues streak when played yesterday', () => {
    vi.setSystemTime(new Date('2026-04-27T10:00:00'))
    useGameStore.getState().recordPlay() // streak = 1

    vi.setSystemTime(new Date('2026-04-28T10:00:00'))
    useGameStore.getState().recordPlay() // streak = 2

    expect(useGameStore.getState().streak).toBe(2)
  })

  it('resets streak to 1 when a day was skipped', () => {
    vi.setSystemTime(new Date('2026-04-25T10:00:00'))
    useGameStore.getState().recordPlay()

    vi.setSystemTime(new Date('2026-04-28T10:00:00')) // skipped 26, 27
    useGameStore.getState().recordPlay()

    expect(useGameStore.getState().streak).toBe(1)
  })

  it('uses local date — not UTC — at midnight boundary', () => {
    // 23:30 local on 2026-04-28
    const d = new Date(2026, 3, 28, 23, 30, 0)
    vi.setSystemTime(d)
    useGameStore.getState().recordPlay()
    expect(useGameStore.getState().lastPlayedDate).toBe(dayNumber(d))
  })
})

describe('useGameStore — mergeCloudProgress', () => {

  it('cloud xp > local xp → adopts cloud state', () => {
    useGameStore.setState({ xp: 50, streak: 1 })
    const cloud = {
      xp: 200,
      lives: 2,
      streak: 5,
      lastPlayedDate: dayNumber(new Date('2026-04-27T10:00:00')),
      sectionProgress: { 1: { lessonsCompleted: { 'a': { completed: true, score: 1, stars: 3 } }, bossCompleted: false } },
      lessonProgress: {},
      studyPhase: PHASES.FREE,
      pretestCompletedAt: '2026-04-20T00:00:00Z',
      posttestCompletedAt: '2026-04-25T00:00:00Z',
    }

    useGameStore.getState().mergeCloudProgress(cloud)
    const state = useGameStore.getState()
    expect(state.xp).toBe(200)
    expect(state.streak).toBe(5)
    expect(state.studyPhase).toBe(PHASES.FREE)
    expect(state.posttestCompletedAt).toBe('2026-04-25T00:00:00Z')
  })

  it('cloud xp <= local xp → keeps local state untouched', () => {
    useGameStore.setState({ xp: 300, streak: 7, studyPhase: PHASES.PLAYING })
    const cloud = {
      xp: 50,
      lives: 1,
      streak: 1,
      studyPhase: PHASES.FREE,
      posttestCompletedAt: '2026-04-25T00:00:00Z',
    }

    useGameStore.getState().mergeCloudProgress(cloud)
    const state = useGameStore.getState()
    expect(state.xp).toBe(300)
    expect(state.streak).toBe(7)
    expect(state.studyPhase).toBe(PHASES.PLAYING)
  })

  it('null cloud state is a no-op', () => {
    useGameStore.setState({ xp: 100 })
    useGameStore.getState().mergeCloudProgress(null)
    expect(useGameStore.getState().xp).toBe(100)
  })
})

describe('useGameStore — phase transitions', () => {

  it('acceptConsent moves consent → about and stamps timestamp', () => {
    useGameStore.setState({ studyPhase: PHASES.CONSENT, consentAcceptedAt: null })
    useGameStore.getState().acceptConsent()
    const state = useGameStore.getState()
    expect(state.studyPhase).toBe(PHASES.ABOUT)
    expect(state.consentAcceptedAt).toBeTruthy()
  })

  it('completePretest sets phase=playing and stamps pretestCompletedAt', () => {
    useGameStore.setState({ studyPhase: PHASES.PRETEST })
    useGameStore.getState().completePretest()
    const state = useGameStore.getState()
    expect(state.studyPhase).toBe(PHASES.PLAYING)
    expect(state.pretestCompletedAt).toBeTruthy()
  })

  it('completePosttest moves to account_prompt and stamps timestamp', () => {
    useGameStore.setState({ studyPhase: PHASES.POSTTEST })
    useGameStore.getState().completePosttest()
    const state = useGameStore.getState()
    expect(state.studyPhase).toBe(PHASES.ACCOUNT_PROMPT)
    expect(state.posttestCompletedAt).toBeTruthy()
  })

  it('goFree marks studyPhase=free', () => {
    useGameStore.getState().goFree()
    expect(useGameStore.getState().studyPhase).toBe(PHASES.FREE)
  })

  it('setAuthUser toggles isGuestMode', () => {
    useGameStore.getState().setAuthUser('user-123')
    expect(useGameStore.getState().isGuestMode).toBe(false)
    expect(useGameStore.getState().authUserId).toBe('user-123')

    useGameStore.getState().setAuthUser(null)
    expect(useGameStore.getState().isGuestMode).toBe(true)
    expect(useGameStore.getState().authUserId).toBeNull()
  })
})

describe('useGameStore — completeLesson (legacy)', () => {

  it('grants 3 stars at score >= 0.9', () => {
    useGameStore.getState().completeLesson('lesson-1', 0.95, 50)
    const prog = useGameStore.getState().lessonProgress['lesson-1']
    expect(prog.stars).toBe(3)
    expect(prog.completed).toBe(true)
  })

  it('grants 0 stars and completed=false when score < 0.5', () => {
    useGameStore.getState().completeLesson('lesson-2', 0.3, 5)
    const prog = useGameStore.getState().lessonProgress['lesson-2']
    expect(prog.stars).toBe(0)
    expect(prog.completed).toBe(false)
  })
})
