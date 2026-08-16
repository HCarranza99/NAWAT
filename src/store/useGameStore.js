import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { z } from 'zod'
import { gradeCard } from '../lib/srs'
import { computeStars, MIN_SCORE_TO_PASS } from '../data/gameConfig'

/**
 * Demo mode has a canonical /demo route. The explicit ?demo=true entry
 * supports shared links that point at the deployment root.
 */
export function resolveDemoLocation(location = window.location) {
  const url = new URL(location.href)
  const demoPath = url.pathname.match(/^\/demo(?=\/|$)/i)
  const demoQuery = url.searchParams.get('demo') === 'true'

  if (!demoPath && !demoQuery) {
    return { enabled: false, canonicalUrl: null }
  }

  const suffix = demoPath
    ? url.pathname.slice(demoPath[0].length)
    : url.pathname === '/' ? '' : url.pathname

  url.pathname = `/demo${suffix}`
  if (demoQuery) url.searchParams.delete('demo')

  return {
    enabled: true,
    canonicalUrl: `${url.pathname}${url.search}${url.hash}`,
  }
}

const demoLocation = resolveDemoLocation()

if (demoLocation.enabled) {
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (currentUrl !== demoLocation.canonicalUrl) {
    window.history.replaceState(window.history.state, '', demoLocation.canonicalUrl)
  }
}

/**
 * A separate localStorage key keeps demo progress out of study data.
 */
export const DEMO_MODE = demoLocation.enabled

/**
 * Interruptor maestro del estudio. ABIERTO: entrar por `/estudio` (o
 * `?estudio=true`) inicia el protocolo en CONSENT y marca el dispositivo como
 * participante (cohorte 'study'); quien entra por `/` va a modo libre. Con el
 * estudio abierto la fase de protocolo persistida se respeta entre cargas, de
 * modo que un participante reanuda donde quedó (ver `onRehydrateStorage`).
 * Para volver a cerrarlo basta con poner esto en `false`: `/estudio` deja de
 * iniciar el protocolo y `onRehydrateStorage` libera a modo libre a cualquier
 * dispositivo retenido en una fase de protocolo.
 */
export const STUDY_OPEN = false

/**
 * El estudio se reparte como aprendenawat.com/estudio (o ?estudio=true para
 * enlaces que apuntan a la raíz). Entrar por ahí marca el dispositivo como
 * participante del estudio. El reconocimiento posterior desde el enlace normal
 * (aprendenawat.com) se basa en el flag persistido `enrolledInStudy`.
 */
export function resolveStudyEntry(location = window.location) {
  const url = new URL(location.href)
  const pathMatch = url.pathname.match(/^\/estudio(?=\/|$)/i)
  const queryFlag = url.searchParams.get('estudio') === 'true'
  return { enrollNow: Boolean(pathMatch || queryFlag) }
}

// Con el estudio cerrado, ninguna entrada inscribe (enrollNow siempre false).
const studyEntry = (DEMO_MODE || !STUDY_OPEN) ? { enrollNow: false } : resolveStudyEntry()

/** Verdadero si esta carga llegó por el enlace del estudio (/estudio). */
export const STUDY_LINK_ENTRY = studyEntry.enrollNow

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

const GameStateSchema = z.object({
  participantId: z.string().nullable().catch(null),
  participantName: z.string().nullable().catch(null),
  participantAge: z.number().nullable().catch(null),
  participantResidence: z.string().nullable().catch(null),
  participantDistrict: z.string().nullable().catch(null),
  participantCountry: z.string().nullable().catch(null),
  registrationCompletedAt: z.string().nullable().catch(null),
  registrationSkipped: z.boolean().catch(false),
  registrationPromptDismissed: z.boolean().catch(false),
  entrySurveyCompletedAt: z.string().nullable().catch(null),
  entrySurveyDismissed: z.boolean().catch(false),
  authUserId: z.string().nullable().catch(null),
  isGuestMode: z.boolean().catch(true),
  studyPhase: z.string().catch(PHASES.FREE),
  consentAcceptedAt: z.string().nullable().catch(null),
  pretestCompletedAt: z.string().nullable().catch(null),
  posttestCompletedAt: z.string().nullable().catch(null),
  enrolledInStudy: z.boolean().catch(false),
  xp: z.number().min(0).catch(0),
  lives: z.number().min(0).max(3).catch(3),
  livesLastLostAt: z.string().nullable().catch(null),
  streak: z.number().min(0).catch(0),
  lastPlayedDate: z.union([z.string(), z.number()]).nullable().catch(null),
  lessonProgress: z.record(z.any()).catch({}),
  sectionProgress: z.record(z.any()).catch({}),
  srs: z.record(z.any()).catch({}),
  onboardingSeen: z.boolean().catch(false),
}).passthrough()

const useGameStore = create(
  persist(
    (set) => ({
      participantId: DEMO_MODE ? 'demo-user' : null,
      participantName: DEMO_MODE ? 'Demo' : null,
      // Registro de entrada (nombre / edad / residencia). Se piden una sola vez,
      // antes de la primera lección, y viajan al participante que ancla toda la
      // telemetría. En demo nunca se preguntan.
      participantAge: null,
      participantResidence: null,
      // Excluyentes: distrito para quien vive en el país, país para la diáspora.
      participantDistrict: null,
      participantCountry: null,
      registrationCompletedAt: DEMO_MODE ? new Date().toISOString() : null,
      registrationSkipped: false,
      // El aviso de "completa tu perfil" se pide una vez y no insiste.
      registrationPromptDismissed: false,
      // Encuesta de entrada: se ofrece al terminar la primera lección, una vez.
      entrySurveyCompletedAt: null,
      entrySurveyDismissed: false,
      authUserId: null,
      isGuestMode: true,
      currentSessionId: null,
      // Por defecto la app es de acceso libre. Con el estudio abierto, solo quien
      // entra por /estudio arranca el protocolo en CONSENT; cerrado, siempre FREE
      // (STUDY_LINK_ENTRY ya es false). Ver STUDY_OPEN.
      studyPhase: DEMO_MODE ? PHASES.FREE : (STUDY_LINK_ENTRY ? PHASES.CONSENT : PHASES.FREE),
      enrolledInStudy: !DEMO_MODE && STUDY_LINK_ENTRY,
      studyThanks: false,
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
      srs: {},
      onboardingSeen: false,

      setParticipant: (id, fullName) => set({ participantId: id, participantName: fullName }),
      setSessionId: (id) => set({ currentSessionId: id }),

      /**
       * Cierra el registro de entrada. Solo toca el estado local: el insert en
       * Supabase lo hace App.jsx al ver `registrationCompletedAt`, de modo que
       * un fallo de red se reintente solo en la siguiente carga en vez de
       * dejar al usuario atorado en el formulario.
       * @param {{ name: string, age: number, residence: string }} datos
       */
      completeRegistration: ({ name, age, residence, district = null, country = null }) => set({
        participantName: name?.trim() || null,
        participantAge: Number.isFinite(age) ? age : null,
        participantResidence: residence || null,
        participantDistrict: district || null,
        participantCountry: country || null,
        registrationCompletedAt: new Date().toISOString(),
        registrationSkipped: false,
      }),

      /**
       * El usuario prefirió no dar sus datos. Se marca igual como registro
       * cerrado (con `registrationSkipped`) para que entre a la app y siga
       * generando telemetría anónima: perder al usuario es peor que perder
       * tres campos, y el omitido es un dato en sí mismo.
       */
      skipRegistration: () => set({
        registrationCompletedAt: new Date().toISOString(),
        registrationSkipped: true,
      }),

      /** Oculta para siempre el aviso de completar el perfil. */
      dismissRegistrationPrompt: () => set({ registrationPromptDismissed: true }),

      /**
       * Deja el dispositivo como recién instalado, tras cerrar sesión.
       *
       * Antes esto solo borraba `authUserId`: el progreso, el nombre y el
       * participante de quien se iba se quedaban ahí. Dos problemas. El de
       * enfrente es que el siguiente en agarrar el teléfono veía el avance
       * ajeno con su nombre; el de atrás es peor: al entrar OTRA cuenta, el
       * merge por XP podía llevarse ese progreso prestado a la cuenta nueva.
       *
       * Borrar es seguro porque lo que se borra está en la nube: quien vuelva
       * a entrar recupera todo con `adoptCloudIdentity`. Por eso ProfileScreen
       * sincroniza ANTES de cerrar sesión.
       *
       * También se limpia `enrolledInStudy`: sin eso, un dispositivo que un día
       * entró por /estudio quedaría sin registro y sin participante, y por lo
       * tanto sin telemetría y sin puerta para volver a iniciar sesión. El
       * historial del estudio vive en Supabase, no en este localStorage.
       */
      signOutLocal: () => set({
        authUserId: null,
        isGuestMode: true,
        currentSessionId: null,
        participantId: null,
        participantName: null,
        participantAge: null,
        participantResidence: null,
        participantDistrict: null,
        participantCountry: null,
        registrationCompletedAt: null,
        registrationSkipped: false,
        registrationPromptDismissed: false,
        entrySurveyCompletedAt: null,
        entrySurveyDismissed: false,
        enrolledInStudy: false,
        studyPhase: PHASES.FREE,
        xp: 0,
        lives: 3,
        livesLastLostAt: null,
        streak: 0,
        lastPlayedDate: null,
        lessonProgress: {},
        sectionProgress: {},
        srs: {},
        onboardingSeen: false,
      }),

      /**
       * Cierra la encuesta de entrada, se haya respondido o no. En ambos casos
       * no se vuelve a ofrecer: preguntar dos veces molesta y además duplicaría
       * las respuestas de quien sí contestó.
       */
      finishEntrySurvey: ({ dismissed = false } = {}) => set({
        entrySurveyCompletedAt: dismissed ? null : new Date().toISOString(),
        entrySurveyDismissed: true,
      }),
      setAuthUser: (userId) => set({ authUserId: userId, isGuestMode: userId === null }),
      setOnboardingSeen: (seen) => set({ onboardingSeen: seen }),

      /**
       * Adopta la identidad guardada en la cuenta al iniciar sesión.
       *
       * Va aparte de `mergeCloudProgress` porque aquel decide por XP (gana el
       * que más progreso trae) y saber QUIÉN es el usuario no depende de eso.
       *
       * Dos reglas:
       *  1. Lo local nunca se pisa. Si alguien acaba de registrarse en este
       *     teléfono y luego inicia sesión, mandan los datos que acaba de
       *     escribir, no los de un perfil viejo.
       *  2. Tener cuenta cuenta como registro hecho. Aunque el perfil sea
       *     anterior a estos campos y venga vacío, a quien ya entró alguna vez
       *     no se le vuelve a poner el formulario enfrente.
       *
       * Adoptar `participantId` es lo que evita que iniciar sesión en un
       * teléfono nuevo parta la telemetría de una persona en dos participantes.
       */
      adoptCloudIdentity: (cloudState) => set((state) => {
        if (!cloudState) return {}
        const patch = {}
        if (!state.participantId && cloudState.participantId) {
          patch.participantId = cloudState.participantId
        }
        if (!state.participantName && cloudState.participantName) {
          patch.participantName = cloudState.participantName
        }
        if (state.participantAge == null && cloudState.participantAge != null) {
          patch.participantAge = cloudState.participantAge
        }
        if (!state.participantResidence && cloudState.participantResidence) {
          patch.participantResidence = cloudState.participantResidence
        }
        if (!state.participantDistrict && cloudState.participantDistrict) {
          patch.participantDistrict = cloudState.participantDistrict
        }
        if (!state.participantCountry && cloudState.participantCountry) {
          patch.participantCountry = cloudState.participantCountry
        }
        if (!state.registrationCompletedAt) {
          patch.registrationCompletedAt =
            cloudState.registrationCompletedAt ?? new Date().toISOString()
        }
        return patch
      }),

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
            srs: cloudState.srs ?? state.srs,
            studyPhase: cloudState.studyPhase ?? state.studyPhase,
            pretestCompletedAt: cloudState.pretestCompletedAt ?? state.pretestCompletedAt,
            posttestCompletedAt: cloudState.posttestCompletedAt ?? state.posttestCompletedAt,
            onboardingSeen: cloudState.onboardingSeen ?? state.onboardingSeen,
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

      // Inscribe el dispositivo en el estudio. Si aún no empezó, arranca el
      // consentimiento; si ya está en curso, conserva la fase actual (reanuda).
      enrollInStudy: () => set((state) => {
        if (state.posttestCompletedAt) return { enrolledInStudy: true, studyThanks: true }
        const alreadyStarted = state.enrolledInStudy || state.consentAcceptedAt
        return {
          enrolledInStudy: true,
          ...(alreadyStarted ? {} : { studyPhase: PHASES.CONSENT }),
        }
      }),
      dismissStudyThanks: () => set({ studyThanks: false }),

      addXP: (amount) => set((state) => ({ xp: state.xp + amount })),

      /** Registra el resultado de un ejercicio en el planificador SRS. */
      recordReview: (key, correct) => {
        if (!key) return
        set((state) => ({
          srs: { ...state.srs, [key]: gradeCard(state.srs[key], correct, Date.now()) },
        }))
      },
      loseLife: () => set((state) => {
        const newLives = Math.max(0, state.lives - 1)
        return {
          lives: newLives,
          livesLastLostAt: newLives === 0 ? new Date().toISOString() : state.livesLastLostAt,
        }
      }),
      resetLives: () => set({ lives: 3, livesLastLostAt: null }),
      gainLife: (amount = 1) => set((state) => {
        const newLives = Math.min(3, state.lives + amount)
        return {
          lives: newLives,
          livesLastLostAt: newLives > 0 ? null : state.livesLastLostAt,
        }
      }),

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

      completeLesson: (lessonId, score, xpEarned) => set((state) => {
        const prev = state.lessonProgress[lessonId] || {}
        return {
          xp: state.xp + xpEarned,
          lessonProgress: {
            ...state.lessonProgress,
            // Nunca degradar: repetir y fallar una lección ya aprobada no la desbloquea.
            [lessonId]: {
              completed: prev.completed || score >= MIN_SCORE_TO_PASS,
              score: Math.max(prev.score || 0, score),
              stars: Math.max(prev.stars || 0, computeStars(score)),
            },
          },
        }
      }),

      completeSectionLesson: (sectionId, lessonId, score, xpEarned) => set((state) => {
        const prev = state.sectionProgress[sectionId] || { lessonsCompleted: {}, bossCompleted: false }
        const prevLesson = prev.lessonsCompleted?.[lessonId] || {}
        return {
          xp: state.xp + xpEarned,
          sectionProgress: {
            ...state.sectionProgress,
            [sectionId]: {
              ...prev,
              lessonsCompleted: {
                ...prev.lessonsCompleted,
                // Nunca degradar: repetir y fallar una lección ya aprobada no la bloquea.
                [lessonId]: {
                  completed: prevLesson.completed || score >= MIN_SCORE_TO_PASS,
                  score: Math.max(prevLesson.score || 0, score),
                  stars: Math.max(prevLesson.stars || 0, computeStars(score)),
                },
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
              bossCompleted: prev.bossCompleted || score >= MIN_SCORE_TO_PASS,
              bossScore: Math.max(prev.bossScore || 0, score),
              bossStars: Math.max(prev.bossStars || 0, computeStars(score)),
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
        srs: {},
        onboardingSeen: false,
      }),
    }),
    {
      name: DEMO_MODE ? 'nahuat-demo-v1' : 'nahuat-game-v1',
      version: 3,
      migrate: (state) => {
        // Compatibilidad: los usuarios previos (sin el flag) se consideran
        // inscritos en el estudio si ya habían aceptado el consentimiento.
        if (state && state.enrolledInStudy === undefined) {
          state.enrolledInStudy = state.consentAcceptedAt != null
        }
        const parsed = GameStateSchema.safeParse(state)
        return parsed.success ? parsed.data : state
      },
      onRehydrateStorage: () => (state, err) => {
        if (err && state) { state.resetProgress(); return }
        // Estudio cerrado (STUDY_OPEN=false): en CADA carga se libera cualquier
        // fase de protocolo persistida, de modo que ningún dispositivo quede
        // retenido en el estudio (p. ej. atascado en consentimiento o postest).
        // Es robusto: no depende de una migración de versión de una sola vez.
        // Se conservan los datos de inscripción (enrolledInStudy y marcas de
        // tiempo) por si el estudio se reabre.
        if (!STUDY_OPEN && state && state.studyPhase !== PHASES.FREE) {
          state.goFree()
        }
      },
      partialize: (state) => {
        // currentSessionId y studyThanks son transitorios: no se persisten.
        // eslint-disable-next-line no-unused-vars
        const { currentSessionId, studyThanks, ...rest } = state
        return rest
      },
    }
  )
)

// ── Entrada por el enlace del estudio (/estudio) ──────────────────────
// Marca o reanuda la inscripción y normaliza la URL a la raíz para que el
// router corra en '/'. El reconocimiento desde el enlace normal (/) ocurre
// solo, porque `enrolledInStudy` y `studyPhase` quedan persistidos.
if (STUDY_LINK_ENTRY) {
  useGameStore.getState().enrollInStudy()

  const url = new URL(window.location.href)
  url.pathname = url.pathname.replace(/^\/estudio(?=\/|$)/i, '') || '/'
  url.searchParams.delete('estudio')
  const target = `${url.pathname || '/'}${url.search}${url.hash}`
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (current !== target) {
    window.history.replaceState(window.history.state, '', target)
  }
}

export default useGameStore
