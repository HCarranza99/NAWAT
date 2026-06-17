import { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import useGameStore, { PHASES, DEMO_MODE } from './store/useGameStore'
import ErrorBoundary from './components/ErrorBoundary'
import ConsentScreen from './screens/ConsentScreen'
import AboutScreen from './screens/AboutScreen'
import PracticeScreen from './screens/PracticeScreen'
import PretestScreen from './screens/PretestScreen'
import PosttestScreen from './screens/PosttestScreen'
import AccountPromptScreen from './screens/AccountPromptScreen'
import HomeScreen from './screens/HomeScreen'
import LessonScreen from './screens/LessonScreen'
import ResultScreen from './screens/ResultScreen'
import SectionsScreen from './screens/SectionsScreen'
import SectionLessonScreen from './screens/SectionLessonScreen'
import ProfileScreen from './screens/ProfileScreen'
import LogrosScreen from './screens/LogrosScreen'
import BottomNav from './components/ui/BottomNav'
import DesktopSidebar from './components/ui/DesktopSidebar'
import { useIsDesktop } from './hooks/useMediaQuery'
import { startSession, endSession, createParticipant } from './services/analytics'
import { saveProgressToCloud } from './services/auth'
import { useAuth } from './hooks/useAuth'
import { INTERVENTION_MS } from './data/questionnaires'

export default function App() {
  const studyPhase = useGameStore((s) => s.studyPhase)
  const participantId = useGameStore((s) => s.participantId)
  const currentSessionId = useGameStore((s) => s.currentSessionId)
  const setSessionId = useGameStore((s) => s.setSessionId)
  const pretestCompletedAt = useGameStore((s) => s.pretestCompletedAt)
  const triggerPosttest = useGameStore((s) => s.triggerPosttest)
  const authUserId = useGameStore((s) => s.authUserId)
  const enrolledInStudy = useGameStore((s) => s.enrolledInStudy)
  const setParticipant = useGameStore((s) => s.setParticipant)
  const studyThanks = useGameStore((s) => s.studyThanks)
  const dismissStudyThanks = useGameStore((s) => s.dismissStudyThanks)

  // Modo libre: crea un participante anónimo (cohorte 'free') para registrar
  // telemetría de la población general. Los participantes del estudio obtienen
  // su participante en el consentimiento (cohorte 'study'), así que aquí se omiten.
  useEffect(() => {
    if (DEMO_MODE || participantId || enrolledInStudy) return
    let cancelled = false
    createParticipant(null, null, 'free').then((id) => {
      if (!cancelled && id) setParticipant(id, null)
    })
    return () => { cancelled = true }
  }, [participantId, enrolledInStudy, setParticipant])

  // Inicializar observador de sesión de Supabase Auth (skip in demo mode)
  const { isLoading: authLoading } = useAuth()

  // Guardamos el ms de inicio para calcular duración al cerrar
  const sessionStartRef = useRef(null)
  // Ref para acceder al sessionId actualizado en el listener de beforeunload
  const sessionIdRef = useRef(currentSessionId)

  useEffect(() => {
    sessionIdRef.current = currentSessionId
  }, [currentSessionId])

  // Inicia sesión cuando el participante está identificado (skip in demo)
  useEffect(() => {
    if (!participantId || DEMO_MODE) return

    let cancelled = false
    sessionStartRef.current = Date.now()

    startSession(participantId).then((sessionId) => {
      if (!cancelled && sessionId) setSessionId(sessionId)
    })

    const closeSession = () => {
      endSession(sessionIdRef.current, sessionStartRef.current)
    }

    // beforeunload: funciona en desktop
    window.addEventListener('beforeunload', closeSession)

    // visibilitychange: funciona en móvil cuando el usuario cambia de app o cierra pestaña
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') closeSession()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // pagehide: fallback para Safari iOS
    window.addEventListener('pagehide', closeSession)

    return () => {
      cancelled = true
      window.removeEventListener('beforeunload', closeSession)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('pagehide', closeSession)
      closeSession()
    }
  }, [participantId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger global del postest cuando se cumplen los 15 min (wall-clock).
  // Corre aunque el usuario esté dentro de una lección.
  // No aplica en demo mode.
  useEffect(() => {
    if (DEMO_MODE) return
    if (studyPhase !== PHASES.PLAYING || !pretestCompletedAt) return

    const start = Date.parse(pretestCompletedAt)
    const check = () => {
      if (Date.now() - start >= INTERVENTION_MS) {
        triggerPosttest()
      }
    }
    check() // por si al montar ya se cumplió el tiempo (recarga de página)
    const id = setInterval(check, 1000)
    return () => clearInterval(id)
  }, [studyPhase, pretestCompletedAt, triggerPosttest])

  // Auto-sincronizar progreso a la nube cuando el usuario tiene cuenta
  // Se ejecuta cada vez que el studyPhase cambia (hitos clave del protocolo)
  // y también cada 60 segundos mientras está jugando
  // No aplica en demo mode.
  useEffect(() => {
    if (!authUserId || DEMO_MODE) return
    const state = useGameStore.getState()
    saveProgressToCloud(state)
  }, [authUserId, studyPhase])

  useEffect(() => {
    if (!authUserId || DEMO_MODE) return
    const id = setInterval(() => {
      const state = useGameStore.getState()
      saveProgressToCloud(state)
    }, 60_000)
    return () => clearInterval(id)
  }, [authUserId])

  // Rutas compartidas entre demo y modo de estudio
  const appRoutes = (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      {/* Legacy lesson routes */}
      <Route path="/lesson/:id" element={<LessonScreen />} />
      <Route path="/result" element={<ResultScreen />} />
      {/* Section-based routes */}
      <Route path="/sections" element={<SectionsScreen />} />
      <Route path="/section/:sectionId/lesson/:lessonId" element={<SectionLessonScreen />} />
      <Route path="/section/:sectionId/boss" element={<SectionLessonScreen />} />
      <Route path="/profile" element={<ProfileScreen />} />
      <Route path="/logros" element={<LogrosScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )

  // ── Routing por fase del estudio ─────────────────────────────
  const renderByPhase = () => {
    // In demo mode, skip straight to the app
    if (DEMO_MODE) {
      return (
        <BrowserRouter basename="/demo">
          <AppChrome>{appRoutes}</AppChrome>
          <DemoBanner />
          <BottomNav />
        </BrowserRouter>
      )
    }

    // Esperar a que Supabase resuelva la sesión antes de mostrar cualquier pantalla
    // (evita flash de ConsentScreen para usuarios ya autenticados)
    if (authLoading) return null

    // Fases de onboarding: flujo de una sola columna (marco móvil centrado)
    const onboarding =
      studyPhase === PHASES.CONSENT ? <ConsentScreen /> :
      studyPhase === PHASES.ABOUT ? <AboutScreen /> :
      studyPhase === PHASES.PRACTICE ? <PracticeScreen /> :
      studyPhase === PHASES.PRETEST ? <PretestScreen /> :
      studyPhase === PHASES.POSTTEST ? <PosttestScreen /> :
      studyPhase === PHASES.ACCOUNT_PROMPT ? <AccountPromptScreen /> :
      null

    if (onboarding) return <div className="app-shell">{onboarding}</div>

    // 'playing' o 'free' → app con router normal + chrome responsivo
    return (
      <BrowserRouter>
        <AppChrome>{appRoutes}</AppChrome>
        <BottomNav />
      </BrowserRouter>
    )
  }

  return (
    <ErrorBoundary>
      {renderByPhase()}
      {studyThanks && <StudyThanksNotice onClose={dismissStudyThanks} />}
    </ErrorBoundary>
  )
}

/* ── Aviso: el participante ya completó el estudio ────────────────── */
function StudyThanksNotice({ onClose }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/45 p-5 backdrop-blur-sm">
      <div className="w-full max-w-[360px] rounded-[1.6rem] border border-hairline bg-white p-6 text-center shadow-[0_24px_60px_rgba(16,47,41,0.3)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#52b788] to-[#1f7a57] text-white shadow-[0_10px_22px_rgba(31,122,87,0.3)]">
          <span className="text-3xl">🌿</span>
        </div>
        <h2 className="mt-4 text-xl font-black text-[#17211d]">¡Ya completaste el estudio!</h2>
        <p className="mt-2 text-sm font-medium leading-snug text-[#6d756e]">
          Gracias por tu participación. Tus respuestas ya fueron registradas; no necesitas
          volver a contestar. Puedes seguir aprendiendo náhuat con total libertad.
        </p>
        <button
          onClick={onClose}
          className="btn-3d btn-3d-primary mt-5"
        >
          Seguir aprendiendo
        </button>
      </div>
    </div>
  )
}

/* ── Marco responsivo: móvil (columna) vs escritorio (sidebar) ──── */
function AppChrome({ children }) {
  const location = useLocation()
  const isDesktop = useIsDesktop()
  // Modo enfocado: durante lecciones/resultado se oculta todo el chrome
  const focused = location.pathname.startsWith('/section/') ||
    location.pathname.startsWith('/lesson/') ||
    location.pathname === '/result'

  const showSidebar = isDesktop && !focused

  return (
    <div className="mx-auto flex w-full max-w-[480px] bg-surface-cream shadow-[0_0_60px_rgba(0,0,0,0.18)] lg:min-h-svh lg:max-w-[1440px] lg:shadow-[0_0_80px_rgba(0,0,0,0.4)]">
      {showSidebar && <DesktopSidebar />}
      <div
        className={`min-w-0 flex-1 ${
          focused ? 'lg:min-h-svh' : 'lg:h-svh lg:overflow-y-auto'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

/* ── Demo Banner ───────────────────────────────────────────────── */
function DemoBanner() {
  const location = useLocation()
  const hidden = location.pathname.startsWith('/section/') ||
    location.pathname.startsWith('/lesson/') ||
    location.pathname === '/result'

  if (hidden) return null

  return (
    <div className="fixed bottom-[76px] left-1/2 -translate-x-1/2 z-[200] pointer-events-none">
      <div className="px-4 py-1 bg-[#F4A261] text-white text-[0.7rem] font-extrabold uppercase tracking-[1.5px] rounded-full shadow-lg pointer-events-auto">
        MODO DEMO
      </div>
    </div>
  )
}
