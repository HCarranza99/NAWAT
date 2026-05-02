import { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useGameStore, { PHASES } from './store/useGameStore'
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
import BottomNav from './components/ui/BottomNav'
import { startSession, endSession } from './services/analytics'
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

  // Inicializar observador de sesión de Supabase Auth
  const { isLoading: authLoading } = useAuth()

  // Guardamos el ms de inicio para calcular duración al cerrar
  const sessionStartRef = useRef(null)
  // Ref para acceder al sessionId actualizado en el listener de beforeunload
  const sessionIdRef = useRef(currentSessionId)

  useEffect(() => {
    sessionIdRef.current = currentSessionId
  }, [currentSessionId])

  // Inicia sesión cuando el participante está identificado
  useEffect(() => {
    if (!participantId) return

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
  useEffect(() => {
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
  useEffect(() => {
    if (!authUserId) return
    const state = useGameStore.getState()
    saveProgressToCloud(state)
  }, [authUserId, studyPhase])

  useEffect(() => {
    if (!authUserId) return
    const id = setInterval(() => {
      const state = useGameStore.getState()
      saveProgressToCloud(state)
    }, 60_000)
    return () => clearInterval(id)
  }, [authUserId])

  // ── Routing por fase del estudio ─────────────────────────────
  const renderByPhase = () => {
    // Esperar a que Supabase resuelva la sesión antes de mostrar cualquier pantalla
    // (evita flash de ConsentScreen para usuarios ya autenticados)
    if (authLoading) return null

    if (studyPhase === PHASES.CONSENT) return <ConsentScreen />
    if (studyPhase === PHASES.ABOUT) return <AboutScreen />
    if (studyPhase === PHASES.PRACTICE) return <PracticeScreen />
    if (studyPhase === PHASES.PRETEST) return <PretestScreen />
    if (studyPhase === PHASES.POSTTEST) return <PosttestScreen />
    if (studyPhase === PHASES.ACCOUNT_PROMPT) return <AccountPromptScreen />

    // 'playing' o 'free' → app con router normal
    return (
      <BrowserRouter>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BottomNav />
      </BrowserRouter>
    )
  }

  return (
    <ErrorBoundary>
      <div className="app-shell">{renderByPhase()}</div>
    </ErrorBoundary>
  )
}
