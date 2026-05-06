import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { z } from 'zod'

/**
 * Demo mode is activated when the URL starts with /demo.
 * It uses a separate localStorage key so demo progress never
 * touches the real study data.
 */
export const DEMO_MODE = window.location.pathname.startsWith('/demo')

export const PHASES = Object.freeze({
  CONSENT: 'consent',
  ABOUT: 'about',
  PRACTICE: 'practice',
  PRETEST: 'pretest',
  PLAYING: 'playing',
  POSTTEST: 'posttest',
  ACCOUNT_PROMPT: 'account_prompt',
  FREE: 'free',
})

const computeStars = (score) => score >= 0.9 ? 3 : score >= 0.7 ? 2 : score >= 0.5 ? 1 : 0

const GameStateSchema = z.object({
  participantId: z.string().nullable().catch(null),
  participantName: z.string().nullable().catch(null),
  authUserId: z.string().nullable().catch(null),
  isGuestMode: z.boolean().catch(true),
  studyPhase: z.string().catch(PHASES.CONSENT),
  consentAcceptedAt: z.string().nullable().catch(null),
  pretestCompletedAt: z.string().nullable().catch(null),
  posttestCompletedAt: z.string().nullable().catch(null),
  xp: z.number().min(0).catch(0),
  lives: z.number().min(0).max(3).catch(3),
  livesLastLostAt: z.string().nullable().catch(null),
  streak: z.number().min(0).catch(0),
  lastPlayedDate: z.union([z.string(), z.number()]).nullable().catch(null),
  lessonProgress: z.record(z.any()).catch({}),
  sectionProgress: z.record(z.any()).catch({}),
}).passthrough()

const useGameStore = create(
  persist(
    (set) => ({
      participantId: DEMO_MODE ? 'demo-user' : null,
      participantName: DEMO_MODE ? 'Demo' : null,
      authUserId: null,
      isGuestMode: true,
      currentSessionId: null,
      studyPhase: DEMO_MODE ? PHASES.FREE : PHASES.CONSENT,
      consentAcceptedAt: null,
      pretestCompletedAt: null,
      posttestCompletedAt: null,
      xp: 0,
      lives: 3,
      livesLastLostAt: null,
      streak: 0,
      lastPlayedDate: null,
      lessonProgress: {},
      sectionProgress: {},

      setParticipant: (id, fullName) => set({ participantId: id, participantName: fullName }),
      setSessionId: (id) => set({ currentSessionId: id }),
      setAuthUser: (userId) => set({ authUserId: userId, isGuestMode: userId === null }),

      mergeCloudProgress: (cloudState) => set((state) => {
        if (!cloudState) return {}
        if (cloudState.xp > state.xp) {
          return {
            xp: cloudState.xp,
            lives: cloudState.lives ?? state.lives,
            livesLastLostAt: cloudState.livesLastLostAt ?? state.livesLastLostAt,
            streak: cloudState.streak ?? state.streak,
            lastPlayedDate: cloudState.lastPlayedDate ?? state.lastPlayedDate,
            sectionProgress: cloudState.sectionProgress ?? state.sectionProgress,
            lessonProgress: cloudState.lessonProgress ?? state.lessonProgress,
            studyPhase: cloudState.studyPhase ?? state.studyPhase,
            pretestCompletedAt: cloudState.pretestCompletedAt ?? state.pretestCompletedAt,
            posttestCompletedAt: cloudState.posttestCompletedAt ?? state.posttestCompletedAt,
          }
        }
        return {}
      }),

      acceptConsent: () => set({ studyPhase: PHASES.ABOUT, consentAcceptedAt: new Date().toISOString() }),
      finishAbout: () => set({ studyPhase: PHASES.PRACTICE }),
      finishPractice: () => set({ studyPhase: PHASES.PRETEST }),
      completePretest: () => set({ studyPhase: PHASES.PLAYING, pretestCompletedAt: new Date().toISOString() }),
      triggerPosttest: () => set({ studyPhase: PHASES.POSTTEST }),
      completePosttest: () => set({ studyPhase: PHASES.ACCOUNT_PROMPT, posttestCompletedAt: new Date().toISOString() }),
      goFree: () => set({ studyPhase: PHASES.FREE }),

      addXP: (amount) => set((state) => ({ xp: state.xp + amount })),
      loseLife: () => set((state) => {
        const newLives = Math.max(0, state.lives - 1)
        return {
          lives: newLives,
          livesLastLostAt: newLives === 0 ? new Date().toISOString() : state.livesLastLostAt,
        }
      }),
      resetLives: () => set({ lives: 3, livesLastLostAt: null }),

      recordPlay: () => set((state) => {
        const dayNumber = (d) => Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000)
        const today = dayNumber(new Date())

        let lastPlayed = state.lastPlayedDate
        if (typeof lastPlayed === 'string') {
          const parts = lastPlayed.split('-')
          if (parts.length === 3) {
            lastPlayed = dayNumber(new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)))
          }
        }

        if (lastPlayed === today) return {}

        const yesterday = today - 1
        const newStreak = lastPlayed === yesterday ? state.streak + 1 : 1

        return { streak: newStreak, lastPlayedDate: today }
      }),

      completeLesson: (lessonId, score, xpEarned) => set((state) => ({
        xp: state.xp + xpEarned,
        lessonProgress: {
          ...state.lessonProgress,
          [lessonId]: {
            completed: score >= 0.5,
            score,
            stars: computeStars(score),
          },
        },
      })),

      completeSectionLesson: (sectionId, lessonId, score, xpEarned) => set((state) => {
        const prev = state.sectionProgress[sectionId] || { lessonsCompleted: {}, bossCompleted: false }
        return {
          xp: state.xp + xpEarned,
          sectionProgress: {
            ...state.sectionProgress,
            [sectionId]: {
              ...prev,
              lessonsCompleted: {
                ...prev.lessonsCompleted,
                [lessonId]: { completed: score >= 0.5, score, stars: computeStars(score) },
              },
            },
          },
        }
      }),

      completeSectionBoss: (sectionId, score, xpEarned) => set((state) => {
        const prev = state.sectionProgress[sectionId] || { lessonsCompleted: {}, bossCompleted: false }
        return {
          xp: state.xp + xpEarned,
          sectionProgress: {
            ...state.sectionProgress,
            [sectionId]: {
              ...prev,
              bossCompleted: score >= 0.5,
              bossScore: score,
              bossStars: computeStars(score),
            },
          },
        }
      }),

      resetProgress: () => set({
        xp: 0,
        lives: 3,
        livesLastLostAt: null,
        streak: 0,
        lastPlayedDate: null,
        lessonProgress: {},
        sectionProgress: {},
      }),
    }),
    {
      name: DEMO_MODE ? 'nahuat-demo-v1' : 'nahuat-game-v1',
      version: 1,
      migrate: (state) => {
        const parsed = GameStateSchema.safeParse(state)
        return parsed.success ? parsed.data : state
      },
      onRehydrateStorage: () => (state, err) => {
        if (err && state) state.resetProgress()
      },
      partialize: (state) => {
        // eslint-disable-next-line no-unused-vars
        const { currentSessionId, ...rest } = state
        return rest
      },
    }
  )
)

export default useGameStore
