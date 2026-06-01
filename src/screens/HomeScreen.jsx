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

function formatClock(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function Metric({ icon: Icon, label, value, tone = 'text-foreground' }) {
  return (
    <div className="flex items-center gap-2.5 rounded-md border border-white/12 bg-white/10 px-3 py-2 backdrop-blur">
      <Icon className={`h-4 w-4 ${tone}`} />
      <div className="min-w-0">
        <p className="text-[0.62rem] font-bold uppercase leading-none tracking-[0.16em] text-white/55">{label}</p>
        <p className="mt-1 text-sm font-extrabold leading-none text-white">{value}</p>
      </div>
    </div>
  )
}

function ProgressRail({ value }) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-[#e8ece6]">
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

export default function HomeScreen() {
  const navigate = useNavigate()
  const { xp, lives, streak, sectionProgress, resetLives, participantName, onboardingSeen, setOnboardingSeen } = useGameStore()

  const firstName = participantName ? participantName.split(' ')[0] : 'Estudiante'

  const studyPhase = useGameStore((s) => s.studyPhase)
  const pretestCompletedAt = useGameStore((s) => s.pretestCompletedAt)

  const [showTutorial, setShowTutorial] = useState(false)
  const [greeting] = useState(() => TOROGOZ_GREETINGS[Math.floor(Math.random() * TOROGOZ_GREETINGS.length)])

  useEffect(() => {
    const activeLearningPhase = studyPhase === PHASES.PLAYING || studyPhase === PHASES.FREE
    if (activeLearningPhase && !onboardingSeen) {
      setShowTutorial(true)
    }
  }, [studyPhase, onboardingSeen])

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
      className="min-h-[100svh] bg-[#f7f5ef] pb-28 text-foreground"
    >
      <header className="relative overflow-hidden bg-[#102f29] px-5 pb-6 pt-5 text-white">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TorogozBadge size={50} />
            <div>
              <p className="flex items-center gap-1.5 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9ddfc6]">
                <Sparkles className="h-3 w-3" />
                Aprendizaje diario
              </p>
              <h1 className="mt-1 text-[2rem] font-black leading-none tracking-normal">Náhuat</h1>
            </div>
          </div>
          <div className="rounded-md border border-white/12 bg-white/10 px-3 py-2 text-right backdrop-blur">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/55">Nivel</p>
            <p className="text-xl font-black leading-none">{level}</p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.07] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white/68">Hola, {firstName}</p>
              <p className="mt-2 text-[2.45rem] font-black leading-none tracking-normal">{xpInLevel}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/50">de {xpPerLevel} XP</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#f4a261] text-[#102f29]">
              <Trophy className="h-8 w-8" />
            </div>
          </div>
          <div className="mt-5">
            <ProgressRail value={levelPct} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Metric icon={Heart} label="Vidas" value={lives} tone="text-[#ff8b8b]" />
          <Metric icon={Flame} label="Racha" value={`${streak} d`} tone="text-[#ffb15f]" />
          {msLeft != null && (
            <div className="col-span-2">
              <Metric icon={Clock3} label="Tiempo de estudio" value={formatClock(msLeft)} tone="text-[#9ddfc6]" />
            </div>
          )}
        </div>
      </header>

      <main className="space-y-3 px-5 pt-4">
        {lives === 0 && (
          <section className="grid grid-cols-[1fr_86px] items-center gap-3 rounded-lg border border-[#e63946]/25 bg-[#fff0f1] px-4 py-3">
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
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-[#6d756e]">Continuar</p>
              <h2 className="text-xl font-black tracking-normal text-[#17211d]">Tu próxima práctica</h2>
            </div>
            <button
              onClick={() => navigate('/sections')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d8ddd5] bg-white text-[#1f7a57] shadow-sm transition hover:bg-[#eef8f2]"
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
              className="group relative w-full overflow-hidden rounded-[2rem] border border-white/10 p-5 text-left shadow-[0_20px_45px_rgba(16,47,41,0.25)] transition-all duration-300 hover:border-[#f4a261]/35 hover:shadow-[0_20px_50px_rgba(244,162,97,0.15),0_20px_45px_rgba(16,47,41,0.3)] disabled:cursor-not-allowed disabled:opacity-65"
            >
              <div className="grid grid-cols-[1fr_100px] items-center gap-4">
                <div className="z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4a261]/18 border border-[#f4a261]/25 px-3 py-1 text-[0.6rem] font-black uppercase tracking-[0.16em] text-[#f4a261]">
                    {nextLessonData.isBoss ? <ShieldCheck className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
                    {nextLessonData.isBoss ? 'RETO FINAL' : 'SIGUIENTE LECCIÓN'}
                    <span className="relative flex h-1.5 w-1.5 ml-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f4a261] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#f4a261]"></span>
                    </span>
                  </span>
                  
                  <h3 className="mt-3.5 text-[1.4rem] font-black leading-tight tracking-normal text-white drop-shadow-xs">
                    {nextLessonData.lesson.title}
                  </h3>
                  
                  <p className="mt-1.5 text-xs font-semibold leading-relaxed text-white/60 line-clamp-2 max-w-[230px]">
                    {nextLessonData.lesson.description}
                  </p>
                  
                  <div className="mt-5 flex items-center gap-3.5">
                    <span className="text-xs font-black uppercase tracking-[0.14em] text-[#9ddfc6]">
                      +{nextLessonData.lesson.xpReward} XP
                    </span>
                    <div className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f4a261] px-6 py-3 text-xs font-black text-[#102f29] shadow-[0_4px_0_#c47330,0_8px_20px_rgba(244,162,97,0.35)] transition-all duration-150 transform group-hover:scale-[1.03] group-active:translate-y-[4px] group-active:shadow-[0_0px_0_#c47330,0_4px_10px_rgba(244,162,97,0.2)]">
                      ¡APRENDER AHORA!
                      <Play className="h-3 w-3 fill-current" />
                    </div>
                  </div>
                </div>

                {/* Globo de diálogo (Speech Bubble) del Torogoz */}
                <div className="absolute right-4 top-4 z-20 max-w-[155px] rounded-2xl border border-white/10 bg-white/95 px-3.5 py-2 text-left shadow-[0_8px_25px_rgba(0,0,0,0.22)] backdrop-blur-sm transition-all duration-300 scale-95 origin-top-right group-hover:scale-100">
                  <p className="text-[0.62rem] font-black uppercase tracking-wider text-[#102f29]">
                    {greeting.nahuat}
                  </p>
                  <p className="mt-0.5 text-[0.68rem] font-bold leading-tight text-[#2d4d44]">
                    {greeting.spanish}
                  </p>
                  {/* Flechita del globo apuntando hacia abajo al Torogoz */}
                  <div className="absolute bottom-[-5px] right-[24px] h-2.5 w-2.5 rotate-45 bg-white/95 border-b border-r border-white/10"></div>
                </div>

                {/* Integración del Torogoz 3D asomándose de forma espectacular */}
                <div className="absolute -right-3 -bottom-1 drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] pointer-events-none transition group-hover:translate-y-1">
                  <Torogoz emotion={nextLessonData.isBoss ? 'proud' : 'explaining'} size={135} />
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

        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-[#e3ded2] bg-white p-4 shadow-sm">
            <BookOpen className="h-5 w-5 text-[#1f7a57]" />
            <p className="mt-4 text-2xl font-black leading-none text-[#17211d]">{completedLessons}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#6d756e]">de {totalLessons} lecciones</p>
          </div>
          <div className="rounded-lg border border-[#e3ded2] bg-white p-4 shadow-sm">
            <Trophy className="h-5 w-5 text-[#c77918]" />
            <p className="mt-4 text-2xl font-black leading-none text-[#17211d]">{xp}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#6d756e]">XP total</p>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {showTutorial && (
          <MascotTutorial
            onClose={() => {
              setOnboardingSeen(true)
              setShowTutorial(false)
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
