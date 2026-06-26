import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowRight, BookOpen, Calendar, Check, ChevronRight, Clock3, Crown,
  Flag, Flame, Heart, Lock, Sparkles, Star, Trophy,
} from 'lucide-react'

import sections from '../data/sections'
import useGameStore from '../store/useGameStore'
import { GAME_CONFIG } from '../data/gameConfig'
import Torogoz from '../components/ui/Torogoz'
import { findNextLesson, globalLessonIndex } from '../lib/lessonPath'

function StatCard({ icon: Icon, label, value, iconWrap, extra }) {
  return (
    <div className="surface-card flex items-center gap-3 p-3.5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconWrap}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[#6d756e]">{label}</p>
        <p className="mt-0.5 text-xl font-black leading-none text-[#17211d] tabular-nums">{value}</p>
        {extra}
      </div>
    </div>
  )
}

export default function HomeDesktop({ greeting }) {
  const navigate = useNavigate()
  const { xp, lives, streak, sectionProgress, participantName } = useGameStore()
  const firstName = participantName ? participantName.split(' ')[0] : 'Estudiante'

  const xpPerLevel = GAME_CONFIG.xp.perLevel
  const level = Math.floor(xp / xpPerLevel) + 1
  const xpInLevel = xp % xpPerLevel
  const levelPct = Math.min(100, Math.round((xpInLevel / xpPerLevel) * 100))

  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0)
  const completedLessons = sections.reduce((acc, s) => {
    const prog = sectionProgress[s.id]
    if (!prog?.lessonsCompleted) return acc
    return acc + Object.values(prog.lessonsCompleted).filter((l) => l.completed).length
  }, 0)
  const lessonsPct = Math.round((completedLessons / totalLessons) * 100)

  const next = findNextLesson(sectionProgress)

  // Sección a mostrar en la ruta (la de la próxima lección, o la última)
  const pathSection = next ? next.section : sections[sections.length - 1]
  const pathProg = sectionProgress[pathSection.id] || { lessonsCompleted: {} }
  const steps = pathSection.lessons.slice(0, 4).map((lesson) => {
    const lp = pathProg.lessonsCompleted?.[lesson.id]
    const completed = lp?.completed === true
    const isCurrent = next && !next.isBoss && lesson.id === next.lesson.id
    return { lesson, completed, isCurrent, stars: lp?.stars || 0, locked: !completed && !isCurrent }
  })

  const heroXp = next ? next.lesson.xpReward : 0
  const heroMinutes = next ? Math.max(2, Math.round((next.lesson.items?.length || 6) * 0.6)) : 0
  const heroIndex = next && !next.isBoss ? globalLessonIndex(next.lesson) : null

  const goNext = () => {
    if (!next) { navigate('/sections'); return }
    navigate(`/section/${next.section.id}/${next.isBoss ? 'boss' : `lesson/${next.lesson.id}`}`)
  }

  const dailyDots = [0, 1, 2].map((i) => i < Math.min(streak, 3))

  return (
    <div className="min-h-svh bg-[#f7f5ef] px-8 py-8 text-foreground xl:px-10">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1fr)_332px]">

        {/* ════ COLUMNA PRINCIPAL ════ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="min-w-0 space-y-6"
        >
          {/* Saludo */}
          <header>
            <p className="flex items-center gap-2 text-sm font-bold text-[#6d756e]">
              <Sparkles className="h-4 w-4 text-[#f4a261]" /> ¡Hola, {firstName}!
            </p>
            <h1 className="mt-1 text-[2.6rem] font-black leading-[1.05] tracking-tight text-[#17211d]">
              Tu aventura <span className="text-[#1f7a57]">Nawat</span> continúa
            </h1>
          </header>

          {/* Hero — lección actual */}
          {next ? (
            <motion.button
              whileHover={{ y: -3 }}
              onClick={goNext}
              disabled={lives === 0}
              style={{ background: `radial-gradient(circle at 82% 16%, ${pathSection.color || '#f4a261'}26 0, transparent 46%), linear-gradient(160deg, #16463a 0%, #102f29 72%)` }}
              className="group relative block w-full overflow-hidden rounded-[2rem] border border-white/10 p-7 text-left shadow-[0_22px_50px_rgba(16,47,41,0.26)] transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="relative z-10 max-w-[62%]">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#f4a261]/25 bg-[#f4a261]/15 px-3 py-1.5 text-[0.6rem] font-black uppercase tracking-[0.16em] text-[#f4a261]">
                  {next.isBoss ? <Crown className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
                  {next.isBoss ? 'Reto final' : 'Lección actual'}
                </span>
                <h2 className="mt-4 text-[2rem] font-black leading-tight tracking-tight text-white">
                  {next.lesson.title}
                </h2>
                <p className="mt-1.5 text-sm font-semibold leading-snug text-white/60">
                  {next.lesson.description}
                </p>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#f7b076] to-[#f4a261] px-7 py-3.5 text-base font-black text-[#102f29] shadow-[0_5px_0_#c47330,0_12px_24px_rgba(244,162,97,0.32)] transition-transform duration-150 group-hover:scale-[1.02] group-active:translate-y-[4px] group-active:shadow-[0_1px_0_#c47330]">
                  {next.isBoss ? 'Empezar reto' : 'Aprender ahora'}
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#102f29]/15">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  <HeroChip icon={Star} text={`+${heroXp} XP`} />
                  <HeroChip icon={Clock3} text={`${heroMinutes} min`} />
                  {heroIndex && <HeroChip icon={BookOpen} text={`Lección ${heroIndex}/${totalLessons}`} />}
                </div>
              </div>

              {/* Globo + mascota */}
              <div className="pointer-events-none absolute right-6 top-7 z-20 max-w-[190px] rounded-2xl border border-black/5 bg-white px-4 py-2.5 shadow-[0_10px_26px_rgba(0,0,0,0.22)]">
                <p className="text-[0.7rem] font-black text-[#102f29]">{greeting?.nahuat || '¡Nawat tiwelli!'}</p>
                <p className="mt-0.5 text-[0.72rem] font-semibold leading-tight text-[#2d4d44]">{greeting?.spanish || '¿Listo para practicar?'}</p>
                <span className="absolute -bottom-1.5 right-10 h-3 w-3 rotate-45 border-b border-r border-black/5 bg-white" />
              </div>
              <div className="pointer-events-none absolute -bottom-2 right-2 z-10 drop-shadow-[0_14px_26px_rgba(0,0,0,0.34)] transition group-hover:translate-y-1">
                <Torogoz emotion={next.isBoss ? 'proud' : 'explaining'} size={188} />
              </div>
            </motion.button>
          ) : (
            <div className="rounded-[2rem] border border-hairline bg-white p-10 text-center shadow-[var(--elev-2)]">
              <Trophy className="mx-auto h-10 w-10 text-[#c77918]" />
              <h2 className="mt-3 text-2xl font-black text-[#17211d]">¡Todo completado!</h2>
              <p className="mt-1 text-sm text-[#6d756e]">Has terminado las lecciones disponibles. ¡Increíble trabajo!</p>
            </div>
          )}

          {/* Ruta de aprendizaje — stepper */}
          <section className="surface-card-lg p-6">
            <div className="mb-5 flex items-center gap-2">
              <span className="text-lg">🌱</span>
              <h3 className="text-lg font-black tracking-tight text-[#17211d]">Tu camino de aprendizaje</h3>
            </div>
            <div className="flex items-start">
              {steps.map((step, i) => (
                <div key={step.lesson.id} className="flex min-w-0 flex-1 items-start">
                  <button
                    onClick={() => !step.locked && navigate(`/section/${pathSection.id}/lesson/${step.lesson.id}`)}
                    disabled={step.locked}
                    className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center disabled:cursor-not-allowed"
                  >
                    <StepNode step={step} index={i + 1} />
                    <p className={`line-clamp-2 px-1 text-xs font-bold leading-tight ${step.isCurrent ? 'text-[#102f29]' : step.completed ? 'text-[#17211d]' : 'text-[#9aa39c]'}`}>
                      {step.lesson.title}
                    </p>
                    <StarRow count={step.stars} active={step.completed || step.isCurrent} />
                  </button>
                  {i < steps.length - 1 && (
                    <span className={`mt-6 h-0 flex-1 border-t-2 ${step.completed ? 'border-solid border-[#52b788]' : 'border-dashed border-[#d8ddd5]'}`} />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Banner motivador */}
          <div className="relative overflow-hidden rounded-[1.6rem] border border-[#ecdfc8] bg-gradient-to-r from-[#fbf3e3] to-[#f7f0e0] p-4 pl-3">
            <PyramidMotif />
            <div className="relative z-10 flex items-center gap-3">
              <div className="relative flex h-16 w-16 shrink-0 items-end justify-center">
                <Torogoz emotion="happy" size={72} />
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-black text-[#8a4b12]">
                  ¡Cada palabra es un paso en tu aventura! <Sparkles className="h-3.5 w-3.5 text-[#f4a261]" />
                </p>
                <p className="mt-0.5 text-xs font-semibold text-[#a9742f]">Sigue así, ¡lo estás haciendo increíble!</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ════ RAIL DERECHO ════ */}
        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-3.5"
        >
          <div className="flex justify-end">
            <button
              onClick={() => navigate('/logros')}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-white text-[#1f7a57] shadow-[var(--elev-1)] transition hover:bg-[#eef8f2]"
              aria-label="Ver logros"
            >
              <Calendar className="h-5 w-5" />
            </button>
          </div>

          {/* Nivel */}
          <div className="surface-card p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2fae7e] to-[#1f7a57] text-white">
                <Flag className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[#6d756e]">Nivel</p>
                <p className="text-xl font-black leading-none text-[#17211d]">{level}</p>
              </div>
              <p className="text-[0.7rem] font-bold tracking-tight text-[#6d756e]">{xpInLevel}/{xpPerLevel} XP</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eef0ea]">
              <motion.div initial={{ width: 0 }} animate={{ width: `${levelPct}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} className="h-full rounded-full bg-[#1f7a57]" />
            </div>
          </div>

          <StatCard icon={Trophy} label="XP total" value={xp} iconWrap="bg-[#fff1da] text-[#c77918]" />
          <StatCard icon={Flame} label="Racha" value={`${streak} ${streak === 1 ? 'día' : 'días'}`} iconWrap="bg-[#ffe8d6] text-[#c77918]" />
          <StatCard
            icon={Heart}
            label="Vidas"
            value={lives}
            iconWrap="bg-[#ffe0e3] text-[#d94848]"
            extra={
              <div className="mt-1.5 flex gap-1">
                {Array.from({ length: GAME_CONFIG.lives.max }, (_, i) => (
                  <Heart key={i} className={`h-3.5 w-3.5 ${i < lives ? 'fill-[#e63946] text-[#e63946]' : 'fill-[#e9e6df] text-[#e9e6df]'}`} />
                ))}
              </div>
            }
          />
          <div className="surface-card p-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#dff3e7] text-[#1f7a57]">
                <BookOpen className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[#6d756e]">Lecciones completadas</p>
                <p className="mt-0.5 text-xl font-black leading-none text-[#17211d]">{completedLessons} <span className="text-sm text-[#6d756e]">de {totalLessons}</span></p>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eef0ea]">
              <motion.div initial={{ width: 0 }} animate={{ width: `${lessonsPct}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} className="h-full rounded-full bg-[#52b788]" />
            </div>
          </div>

          {/* Reto diario */}
          <div className="relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-gradient-to-br from-[#16463a] to-[#102f29] p-4 text-white shadow-[0_16px_34px_rgba(16,47,41,0.25)]">
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-black">
                <Calendar className="h-4 w-4 text-[#9ddfc6]" /> Reto diario
              </p>
              <ChevronRight className="h-4 w-4 text-white/45" />
            </div>
            <p className="mt-1 text-[0.72rem] font-semibold text-white/55">Mantén tu racha activa</p>
            <div className="mt-3.5 flex items-center gap-2">
              {dailyDots.map((done, i) => (
                <div key={i} className="flex flex-1 items-center gap-2">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${done ? 'bg-[#52b788] text-[#06231a]' : 'border-2 border-dashed border-white/25 text-white/45'}`}>
                    {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                  </span>
                  {i < dailyDots.length - 1 && <span className={`h-0.5 flex-1 rounded-full ${dailyDots[i + 1] ? 'bg-[#52b788]' : 'bg-white/15'}`} />}
                </div>
              ))}
            </div>
            <button
              onClick={goNext}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#f7b076] to-[#f4a261] px-4 py-3 text-sm font-black text-[#102f29] shadow-[0_4px_0_#c47330] transition-transform duration-100 active:translate-y-0.5"
            >
              Ir al reto
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.aside>
      </div>
    </div>
  )
}

function HeroChip({ icon: Icon, text }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.08] px-3.5 py-2 text-xs font-black text-white/85 backdrop-blur">
      <Icon className="h-3.5 w-3.5 text-[#9ddfc6]" />
      {text}
    </span>
  )
}

function StepNode({ step, index }) {
  if (step.completed) {
    return (
      <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#1f7a57] bg-[#1f7a57] text-white shadow-[0_6px_14px_rgba(31,122,87,0.3)]">
        <Check className="h-6 w-6" strokeWidth={3} />
      </span>
    )
  }
  if (step.isCurrent) {
    return (
      <span className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#f4a261] bg-gradient-to-b from-[#f7b076] to-[#f4a261] text-lg font-black text-[#102f29] shadow-[0_0_0_5px_rgba(244,162,97,0.18),0_8px_16px_rgba(244,162,97,0.35)]">
        {index}
      </span>
    )
  }
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#dfe3dc] bg-[#eef0ea] text-[#9aa39c]">
      <Lock className="h-5 w-5" />
    </span>
  )
}

function StarRow({ count, active }) {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < count ? 'fill-[#f4a261] text-[#f4a261]' : active ? 'fill-[#e6e3da] text-[#e6e3da]' : 'fill-[#ebe8e0] text-[#ebe8e0]'}`}
        />
      ))}
    </div>
  )
}

function PyramidMotif() {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 120" className="pointer-events-none absolute right-0 top-0 h-full w-44 opacity-40" preserveAspectRatio="xMaxYMax slice">
      <g fill="#e7d5b3">
        <path d="M150 28 L210 120 L90 120 Z" />
        <rect x="132" y="74" width="36" height="46" fill="#dfc9a0" />
      </g>
    </svg>
  )
}
