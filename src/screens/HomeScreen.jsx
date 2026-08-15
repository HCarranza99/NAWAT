import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Clock3, UserRoundPen, X } from 'lucide-react'

import useGameStore, { PHASES } from '../store/useGameStore'
import { INTERVENTION_MS } from '../data/questionnaires'
import { faltanDatosDeRegistro } from '../data/registro'
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

/**
 * Los saludos del Torogoz. Es el PRIMER náhuat que ve cualquiera que abre la
 * app, así que va con su fuente, igual que el contenido de las lecciones.
 *
 * Corregidos el 14-ago-2026. Los que había antes no aparecían en el diccionario:
 * «Piyali», «Tikweli», «Nawat tiwelli» y «Ximomachti» dan CERO coincidencias, y
 * esta última además está escrita en ortografía del náhuatl mexicano (x-, mo-),
 * que no es la de Witzapan. «Yawi» sí existe pero significa "va", no "vamos".
 *
 * Es el mismo problema que Héctor encontró en «Yek tunal»: material de otras
 * variantes colándose por parecerse. Ahora todas salen de las lecciones ya
 * verificadas — no hay náhuat en la app que no se pueda rastrear.
 */
const M = 'Diccionario YULTAJTAKETZALIS (Pérez & Martínez, 2023)'
const TOROGOZ_GREETINGS = [
  { nahuat: '¡Yek peyna!', spanish: '¡Buena mañana!', source: 'Héctor Martínez, hablante de Witzapan, 14-ago-2026' },
  { nahuat: '¿Ken tinemi?', spanish: '¿Cómo estás?', source: 'Curso Timumachtikan (King), p.19' },
  { nahuat: '¡Yek, padiush!', spanish: '¡Bien, gracias!', source: 'Curso Timumachtikan (King), p.24' },
  { nahuat: '¡Nemi pal timumachtia!', spanish: '¡Hay que estudiar!', source: `${M}, l.12838 — "Nemi pal nimumachtia: Tengo que estudiar"` },
  { nahuat: '¡Chujchupika!', spanish: '¡Poco a poco!', source: `${M}, l.40276 — "Naja nimumachtia nawat chujchupika"` },
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

/**
 * Aviso para quien usa la app desde antes de que se pidieran estos datos —o
 * los omitió—. Es la única forma de que se enteren: casi nadie entra a Perfil
 * por su cuenta. Se puede cerrar, y cerrado no vuelve (registrationPromptDismissed).
 */
function CompletarPerfilBanner({ onDismiss }) {
  const navigate = useNavigate()

  return (
    <div className="px-4 pt-4 lg:px-8 lg:pt-6" data-testid="banner-completar-perfil">
      <div className="flex items-center gap-3 rounded-2xl border border-[#1f7a57]/25 bg-[#eef8f2] px-3.5 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#52b788] to-[#1f7a57] text-white">
          <UserRoundPen className="h-[18px] w-[18px]" />
        </span>
        <button
          className="min-w-0 flex-1 text-left"
          onClick={() => navigate('/profile?completar=1')}
        >
          <span className="block text-[0.84rem] font-black leading-tight text-[#17211d]">
            Cuéntanos quién eres
          </span>
          <span className="mt-0.5 block text-[0.72rem] font-semibold leading-snug text-[#6d756e]">
            Tres datos, menos de un minuto.
          </span>
        </button>
        <button
          className="shrink-0 rounded-lg p-1.5 text-[#6d756e] transition hover:bg-black/5"
          onClick={onDismiss}
          aria-label="Ahora no"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
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

  const participantName = useGameStore((s) => s.participantName)
  const participantAge = useGameStore((s) => s.participantAge)
  const participantResidence = useGameStore((s) => s.participantResidence)
  const participantDistrict = useGameStore((s) => s.participantDistrict)
  const participantCountry = useGameStore((s) => s.participantCountry)
  const registrationPromptDismissed = useGameStore((s) => s.registrationPromptDismissed)
  const dismissRegistrationPrompt = useGameStore((s) => s.dismissRegistrationPrompt)

  const activeLearningPhase = studyPhase === PHASES.PLAYING || studyPhase === PHASES.FREE
  const showTutorial = activeLearningPhase && !onboardingSeen && !tutorialDismissed
  // Nunca los dos a la vez: el tutorial de la mascota es lo primero.
  const showCompletarPerfil =
    activeLearningPhase && !showTutorial && !registrationPromptDismissed &&
    faltanDatosDeRegistro({
      participantName, participantAge, participantResidence,
      participantDistrict, participantCountry,
    })

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
      {showCompletarPerfil && <CompletarPerfilBanner onDismiss={dismissRegistrationPrompt} />}

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
