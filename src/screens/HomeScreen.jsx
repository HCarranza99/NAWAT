import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  BookOpen,
  Clock3,
  Flame,
  Heart,
  Layers3,
  ShieldCheck,
  Sparkles,
  Trophy,
  Play,
} from 'lucide-react'

import sections from '../data/sections'
import useGameStore, { PHASES } from '../store/useGameStore'
import { GAME_CONFIG } from '../data/gameConfig'
import { INTERVENTION_MS } from '../data/questionnaires'
import TorogozBadge from '../components/ui/TorogozBadge'
import MascotTutorial from '../components/ui/MascotTutorial'
import Torogoz from '../components/ui/Torogoz'
import { useIsDesktop } from '../hooks/useMediaQuery'
import HomeDesktop from './HomeDesktop'

function formatClock(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function Metric({ icon: Icon, label, value, tone = 'text-foreground' }) {
  return (
    <div className="glass-chip flex items-center gap-2 px-3 py-2">
      <Icon className={`h-4 w-4 ${tone}`} />
      <div className="min-w-0">
        <p className="text-[0.58rem] font-bold uppercase leading-none tracking-[0.14em] text-white/55">{label}</p>
        <p className="mt-1 text-sm font-extrabold leading-none text-white">{value}</p>
      </div>
    </div>
  )
}

function ProgressRail({ value }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#e8ece6]">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="h-full rounded-full bg-[#1f7a57]"
      />
    </div>
  )
}

const TOROGOZ_GREETINGS = [
  { nahuat: '¡Yawi!', spanish: '¡Vamos a aprender!' },
  { nahuat: '¡Tikweli!', spanish: '¡Tú puedes hacerlo!' },
  { nahuat: '¡Ximomachti!', spanish: '¡A estudiar se ha dicho!' },
  { nahuat: '¡Nawat tiweli!', spanish: '¡Puedes hablar Náhuat!' },
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
      className="fixed bottom-24 right-4 z-40 max-w-[calc(100vw-32px)] touch-none rounded-full border border-[#9ddfc6]/40 bg-[#102f29] px-3 py-2 text-left text-white shadow-[0_14px_34px_rgba(16,47,41,0.28)]"
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
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const { xp, lives, streak, sectionProgress, resetLives, participantName, onboardingSeen, setOnboardingSeen } = useGameStore()

  const firstName = participantName ? participantName.split(' ')[0] : 'Estudiante'

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

  const xpPerLevel = GAME_CONFIG.xp.perLevel
  const level = Math.floor(xp / xpPerLevel) + 1
  const xpInLevel = xp % xpPerLevel
  const levelPct = Math.min(100, Math.round((xpInLevel / xpPerLevel) * 100))

  const findNextLesson = () => {
    for (let sIdx = 0; sIdx < sections.length; sIdx++) {
      const section = sections[sIdx]
      if (sIdx > 0) {
        const prevSection = sections[sIdx - 1]
        const prevProg = sectionProgress[prevSection.id]
        if (!prevProg?.bossCompleted) continue
      }

      const prog = sectionProgress[section.id] || { lessonsCompleted: {}, bossCompleted: false }

      for (let lIdx = 0; lIdx < section.lessons.length; lIdx++) {
        const lesson = section.lessons[lIdx]
        if (lIdx > 0) {
          const prevLesson = section.lessons[lIdx - 1]
          if (!prog.lessonsCompleted?.[prevLesson.id]?.completed) break
        }
        if (!prog.lessonsCompleted?.[lesson.id]?.completed) {
          return { section, lesson, isBoss: false }
        }
      }

      const allLessonsDone = section.lessons.every(
        (l) => prog.lessonsCompleted?.[l.id]?.completed
      )
      if (allLessonsDone && !prog.bossCompleted && section.boss) {
        return { section, lesson: section.boss, isBoss: true }
      }
    }
    return null
  }

  const nextLessonData = findNextLesson()
  const completedLessons = sections.reduce((acc, section) => {
    const prog = sectionProgress[section.id]
    if (!prog?.lessonsCompleted) return acc
    return acc + Object.values(prog.lessonsCompleted).filter((lesson) => lesson.completed).length
  }, 0)
  const totalLessons = sections.reduce((acc, section) => acc + section.lessons.length, 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[100svh] bg-[#f7f5ef] pb-28 text-foreground lg:pb-0"
    >
      {!isDesktop && (
      <header className="brand-header px-4 pb-6 pt-5">
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TorogozBadge size={44} />
            <div>
              <p className="flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#9ddfc6]">
                <Sparkles className="h-3 w-3" />
                Aprendizaje diario
              </p>
              <h1 className="mt-0.5 text-[1.8rem] font-black leading-none tracking-normal">Náhuat</h1>
            </div>
          </div>
          <div className="glass-chip px-3 py-2 text-right">
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.14em] text-white/55">Nivel</p>
            <p className="text-lg font-black leading-none">{level}</p>
          </div>
        </div>

        <div className="relative z-10 mt-3 rounded-2xl border border-white/10 bg-white/[0.08] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_34px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.82rem] font-semibold text-white/68">Hola, {firstName}</p>
              <p className="mt-1 text-[2.1rem] font-black leading-none tracking-normal">{xpInLevel}</p>
              <p className="mt-0.5 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-white/50">de {xpPerLevel} XP</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f7b076] to-[#f4a261] text-[#102f29] shadow-[0_8px_18px_rgba(244,162,97,0.35)]">
              <Trophy className="h-7 w-7" />
            </div>
          </div>
          <div className="mt-3">
            <ProgressRail value={levelPct} />
          </div>
        </div>

        <div className="relative z-10 mt-3 grid grid-cols-2 gap-2">
          <Metric icon={Heart} label="Vidas" value={lives} tone="text-[#ff8b8b]" />
          <Metric icon={Flame} label="Racha" value={`${streak} d`} tone="text-[#ffb15f]" />
        </div>
      </header>
      )}

      {isDesktop && <HomeDesktop greeting={greeting} />}

      {!isDesktop && (
      <main className="space-y-2 px-4 pt-3">
        {/* Encabezado solo de escritorio */}
        {isDesktop && (
        <div className="lg:col-span-2 lg:mb-2">
          <p className="text-[0.66rem] font-black uppercase tracking-[0.2em] text-[#6d756e]">Aprendizaje diario</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-[#17211d]">
            ¡Hola, {firstName}! <span className="text-[#1f7a57]">Sigamos aprendiendo</span>
          </h1>
        </div>
        )}

        {lives === 0 && (
          <section className="grid grid-cols-[1fr_86px] items-center gap-3 rounded-lg border border-[#e63946]/25 bg-[#fff0f1] px-4 py-3 lg:col-span-2">
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-[#b91c1c]">Sin vidas</p>
              <p className="mt-1 text-xs font-medium leading-snug text-[#b91c1c]/75">
                Recupera tus vidas para seguir practicando.
              </p>
              <button
                className="mt-3 rounded-md bg-[#b91c1c] px-4 py-2 text-sm font-extrabold text-white transition active:scale-95"
                onClick={resetLives}
              >
                Recuperar vidas
              </button>
            </div>
            <div className="pointer-events-none justify-self-end">
              <Torogoz emotion="tired" size={86} />
            </div>
          </section>
        )}

        <section>
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#6d756e]">Continuar</p>
              <h2 className="text-lg font-black tracking-normal text-[#17211d]">Tu próxima práctica</h2>
            </div>
            <button
              onClick={() => navigate('/sections')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#d8ddd5] bg-white text-[#1f7a57] shadow-sm transition hover:bg-[#eef8f2]"
              aria-label="Ver secciones"
            >
              <Layers3 className="h-5 w-5" />
            </button>
          </div>

          {nextLessonData ? (
            <motion.button
              whileTap={lives > 0 ? { scale: 0.98 } : {}}
              onClick={() => {
                if (lives === 0) return
                navigate(`/section/${nextLessonData.section.id}/${nextLessonData.isBoss ? 'boss' : `lesson/${nextLessonData.lesson.id}`}`)
              }}
              disabled={lives === 0}
              style={{
                background: `radial-gradient(circle at 75% 20%, ${nextLessonData.section.color || '#f4a261'}22 0, transparent 45%), #102f29`,
              }}
              className="group relative min-h-[208px] w-full overflow-hidden rounded-[1.6rem] border border-white/10 p-4 text-left shadow-[0_16px_34px_rgba(16,47,41,0.23)] transition-all duration-300 hover:border-[#f4a261]/35 hover:shadow-[0_18px_42px_rgba(244,162,97,0.14),0_16px_34px_rgba(16,47,41,0.28)] disabled:cursor-not-allowed disabled:opacity-65"
            >
              <div className="grid grid-cols-[1fr_92px] items-center gap-3">
                <div className="z-10">
                  <span className="inline-flex max-w-[150px] items-center gap-1.5 rounded-full bg-[#f4a261]/18 border border-[#f4a261]/25 px-2.5 py-1 text-[0.54rem] font-black uppercase tracking-[0.14em] text-[#f4a261]">
                    {nextLessonData.isBoss ? <ShieldCheck className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
                    {nextLessonData.isBoss ? 'RETO FINAL' : 'SIGUIENTE LECCIÓN'}
                    <span className="relative flex h-1.5 w-1.5 ml-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f4a261] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#f4a261]"></span>
                    </span>
                  </span>
                  
                  <h3 className="mt-3 text-[1.24rem] font-black leading-tight tracking-normal text-white drop-shadow-xs">
                    {nextLessonData.lesson.title}
                  </h3>
                  
                  <p className="mt-1 text-[0.78rem] font-semibold leading-snug text-white/60 line-clamp-2 max-w-[205px]">
                    {nextLessonData.lesson.description}
                  </p>
                  
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-xs font-black uppercase tracking-[0.14em] text-[#9ddfc6]">
                      +{nextLessonData.lesson.xpReward} XP
                    </span>
                    <div className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f4a261] px-4 py-2.5 text-[0.72rem] font-black text-[#102f29] shadow-[0_3px_0_#c47330,0_7px_16px_rgba(244,162,97,0.32)] transition-all duration-150 transform group-hover:scale-[1.03] group-active:translate-y-[3px] group-active:shadow-[0_0px_0_#c47330,0_4px_10px_rgba(244,162,97,0.2)]">
                      ¡APRENDER AHORA!
                      <Play className="h-3 w-3 fill-current" />
                    </div>
                  </div>
                </div>

                {/* Globo de diálogo (Speech Bubble) del Torogoz */}
                <div className="absolute right-3 top-3 z-20 max-w-[136px] rounded-2xl border border-white/10 bg-white/95 px-3 py-2 text-left shadow-[0_8px_22px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-all duration-300 scale-95 origin-top-right group-hover:scale-100">
                  <p className="text-[0.56rem] font-black uppercase tracking-wider text-[#102f29]">
                    {greeting.nahuat}
                  </p>
                  <p className="mt-0.5 text-[0.62rem] font-bold leading-tight text-[#2d4d44]">
                    {greeting.spanish}
                  </p>
                  {/* Flechita del globo apuntando hacia abajo al Torogoz */}
                  <div className="absolute bottom-[-5px] right-[24px] h-2.5 w-2.5 rotate-45 bg-white/95 border-b border-r border-white/10"></div>
                </div>

                {/* Integración del Torogoz 3D asomándose de forma espectacular */}
                <div className="absolute -right-2 -bottom-1 drop-shadow-[0_12px_22px_rgba(0,0,0,0.34)] pointer-events-none transition group-hover:translate-y-1">
                  <Torogoz emotion={nextLessonData.isBoss ? 'proud' : 'explaining'} size={118} />
                </div>
              </div>
            </motion.button>
          ) : (
            <div className="rounded-lg border border-[#d8ddd5] bg-white p-6 text-center shadow-sm">
              <ShieldCheck className="mx-auto h-9 w-9 text-[#1f7a57]" />
              <h3 className="mt-3 text-lg font-black text-[#17211d]">Todo completado</h3>
              <p className="mt-1 text-sm text-[#6d756e]">Has terminado las lecciones disponibles.</p>
            </div>
          )}
        </section>

        <section className="grid grid-cols-2 gap-2 lg:grid-cols-1 lg:gap-3">
          <div className="surface-card flex items-center gap-2.5 p-3">
            <BookOpen className="h-[18px] w-[18px] shrink-0 text-[#1f7a57]" />
            <div className="min-w-0">
              <p className="text-lg font-black leading-none text-[#17211d]">{completedLessons}</p>
              <p className="mt-0.5 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-[#6d756e]">de {totalLessons} lecciones</p>
            </div>
          </div>
          <div className="surface-card flex items-center gap-2.5 p-3">
            <Trophy className="h-[18px] w-[18px] shrink-0 text-[#c77918]" />
            <div className="min-w-0">
              <p className="text-lg font-black leading-none text-[#17211d]">{xp}</p>
              <p className="mt-0.5 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-[#6d756e]">XP total</p>
            </div>
          </div>
        </section>
      </main>
      )}

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
