import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Clock3 } from 'lucide-react'

import useGameStore, { PHASES } from '../store/useGameStore'
import { INTERVENTION_MS } from '../data/questionnaires'
import MascotTutorial from '../components/ui/MascotTutorial'
import { useIsDesktop } from '../hooks/useMediaQuery'
import HomeDesktop from './HomeDesktop'
import HomeMobile from './HomeMobile'

function formatClock(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const TOROGOZ_GREETINGS = [
  { nahuat: '¡Yawi!', spanish: '¡Vamos a aprender!' },
  { nahuat: '¡Tikweli!', spanish: '¡Tú puedes hacerlo!' },
  { nahuat: '¡Ximomachti!', spanish: '¡A estudiar se ha dicho!' },
  { nahuat: '¡Nawat tiwelli!', spanish: '¿Vamos a practicar?' },
  { nahuat: '¡Piyali!', spanish: '¡Hola! ¿Listo para aprender?' },
]

function StudyTimerBubble({ msLeft }) {
  const [expanded, setExpanded] = useState(false)
  const minutesLeft = Math.max(1, Math.ceil(msLeft / 60000))

  return (
    <motion.button
      type="button"
      drag
      dragConstraints={{ left: -260, right: 0, top: -560, bottom: 0 }}
      dragElastic={0.08}
      dragMomentum={false}
      whileTap={{ scale: 0.96 }}
      onTap={() => setExpanded((value) => !value)}
      className="fixed bottom-24 right-4 z-40 max-w-[calc(100vw-32px)] touch-none rounded-full border border-[#9ddfc6]/40 bg-[#102f29] px-3 py-2 text-left text-white shadow-[0_14px_34px_rgba(16,47,41,0.28)] lg:bottom-6"
      aria-label={`Tiempo restante de estudio: ${formatClock(msLeft)}`}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#9ddfc6]/18 text-[#9ddfc6]">
          <Clock3 className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[0.56rem] font-black uppercase leading-none tracking-[0.14em] text-white/55">
            Estudio 1/3
          </p>
          <p className="mt-1 text-sm font-black leading-none tabular-nums">{formatClock(msLeft)}</p>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.p
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="max-w-[220px] overflow-hidden text-xs font-bold leading-snug text-white/80"
          >
            Sigue usando la app por {minutesLeft} min más. Al terminar se abrirá el cuestionario final.
          </motion.p>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export default function HomeScreen() {
  const isDesktop = useIsDesktop()
  const onboardingSeen = useGameStore((s) => s.onboardingSeen)
  const setOnboardingSeen = useGameStore((s) => s.setOnboardingSeen)
  const studyPhase = useGameStore((s) => s.studyPhase)
  const pretestCompletedAt = useGameStore((s) => s.pretestCompletedAt)

  const [tutorialDismissed, setTutorialDismissed] = useState(false)
  const [greeting] = useState(() => TOROGOZ_GREETINGS[Math.floor(Math.random() * TOROGOZ_GREETINGS.length)])

  const activeLearningPhase = studyPhase === PHASES.PLAYING || studyPhase === PHASES.FREE
  const showTutorial = activeLearningPhase && !onboardingSeen && !tutorialDismissed

  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (studyPhase !== PHASES.PLAYING) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [studyPhase])

  const msLeft =
    studyPhase === PHASES.PLAYING && pretestCompletedAt
      ? Math.max(0, INTERVENTION_MS - (now - Date.parse(pretestCompletedAt)))
      : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-svh bg-[#f7f5ef] text-foreground"
    >
      {isDesktop ? <HomeDesktop greeting={greeting} /> : <HomeMobile greeting={greeting} />}

      {msLeft != null && <StudyTimerBubble msLeft={msLeft} />}

      <AnimatePresence>
        {showTutorial && (
          <MascotTutorial
            onClose={() => {
              setOnboardingSeen(true)
              setTutorialDismissed(true)
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
