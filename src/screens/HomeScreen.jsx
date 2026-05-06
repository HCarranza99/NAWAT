import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Flame,
  Heart,
  Layers3,
  ShieldCheck,
  Sparkles,
  Trophy,
} from 'lucide-react'

import sections from '../data/sections'
import useGameStore, { PHASES } from '../store/useGameStore'
import { GAME_CONFIG } from '../data/gameConfig'
import { INTERVENTION_MS } from '../data/questionnaires'
import { useLivesRecharge } from '../hooks/useLivesRecharge'
import TorogozBadge from '../components/ui/TorogozBadge'

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

export default function HomeScreen() {
  const navigate = useNavigate()
  const { xp, lives, streak, sectionProgress, resetLives, participantName } = useGameStore()
  const { timeLeftStr } = useLivesRecharge()

  const firstName = participantName ? participantName.split(' ')[0] : 'Estudiante'

  const studyPhase = useGameStore((s) => s.studyPhase)
  const pretestCompletedAt = useGameStore((s) => s.pretestCompletedAt)

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
          <Metric icon={Heart} label="Vidas" value={lives === 0 && timeLeftStr ? timeLeftStr : lives} tone="text-[#ff8b8b]" />
          <Metric icon={Flame} label="Racha" value={`${streak} d`} tone="text-[#ffb15f]" />
          {msLeft != null && (
            <div className="col-span-2">
              <Metric icon={Clock3} label="Tiempo de estudio" value={formatClock(msLeft)} tone="text-[#9ddfc6]" />
            </div>
          )}
        </div>
      </header>

      <main className="space-y-5 px-5 pt-5">
        {lives === 0 && (
          <section className="flex items-center justify-between gap-3 rounded-lg border border-[#e63946]/25 bg-[#fff0f1] px-4 py-3">
            <div>
              <p className="text-sm font-extrabold text-[#b91c1c]">Sin vidas</p>
              <p className="text-xs font-medium text-[#b91c1c]/70">
                {timeLeftStr ? `Recarga en ${timeLeftStr}` : 'Recuperando pronto'}
              </p>
            </div>
            <button
              className="rounded-md bg-[#b91c1c] px-4 py-2 text-sm font-extrabold text-white transition active:scale-95"
              onClick={resetLives}
            >
              Recuperar
            </button>
          </section>
        )}

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
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
              whileTap={lives > 0 ? { scale: 0.985 } : {}}
              onClick={() => {
                if (lives === 0) return
                navigate(`/section/${nextLessonData.section.id}/${nextLessonData.isBoss ? 'boss' : `lesson/${nextLessonData.lesson.id}`}`)
              }}
              disabled={lives === 0}
              className="group w-full overflow-hidden rounded-lg border border-[#e3ded2] bg-white text-left shadow-[0_14px_35px_rgba(37,48,42,0.08)] transition disabled:cursor-not-allowed disabled:opacity-65"
            >
              <div className="grid grid-cols-[94px_1fr]">
                <div className="relative min-h-[142px] bg-[#f0ede5]">
                  <img
                    src={`/assets/images/section${nextLessonData.section.id}.png`}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                </div>
                <div className="flex min-w-0 flex-col justify-between p-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#fff1de] px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#b95a18]">
                      {nextLessonData.isBoss ? <ShieldCheck className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
                      {nextLessonData.isBoss ? 'Reto final' : 'Siguiente lección'}
                    </span>
                    <h3 className="mt-3 text-2xl font-black leading-[1.05] tracking-normal text-[#17211d]">
                      {nextLessonData.lesson.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-[#6d756e]">
                      {nextLessonData.lesson.description}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#6d756e]">
                      +{nextLessonData.lesson.xpReward} XP
                    </span>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#1f7a57] text-white shadow-[0_8px_18px_rgba(31,122,87,0.25)] transition group-hover:translate-x-1">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </div>
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
    </motion.div>
  )
}
