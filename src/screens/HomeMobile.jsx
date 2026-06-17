import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowRight, BookOpen, Check, Clock3, Crown, Flame, Heart, Leaf,
  Lock, Mountain, Sparkles, Sprout, Star, Trophy,
} from 'lucide-react'

import useGameStore from '../store/useGameStore'
import { GAME_CONFIG } from '../data/gameConfig'
import TorogozBadge from '../components/ui/TorogozBadge'
import Torogoz from '../components/ui/Torogoz'
import {
  findNextLesson, globalLessonIndex, buildSteps,
  totalLessonsCount, completedLessonsCount,
} from '../lib/lessonPath'
import sections from '../data/sections'

export default function HomeMobile({ greeting }) {
  const navigate = useNavigate()
  const { xp, lives, streak, sectionProgress, participantName, resetLives } = useGameStore()
  const firstName = participantName ? participantName.split(' ')[0] : 'Estudiante'

  const xpPerLevel = GAME_CONFIG.xp.perLevel
  const level = Math.floor(xp / xpPerLevel) + 1
  const xpInLevel = xp % xpPerLevel
  const levelPct = Math.min(100, Math.round((xpInLevel / xpPerLevel) * 100))

  const totalLessons = totalLessonsCount()
  const completedLessons = completedLessonsCount(sectionProgress)
  const lessonsPct = Math.round((completedLessons / totalLessons) * 100)

  const next = findNextLesson(sectionProgress)
  const pathSection = next ? next.section : sections[sections.length - 1]
  const steps = buildSteps(pathSection, sectionProgress, next, 4)

  const heroXp = next ? next.lesson.xpReward : 0
  const heroMinutes = next ? Math.max(2, Math.round((next.lesson.items?.length || 6) * 0.6)) : 0
  const heroIndex = next && !next.isBoss ? globalLessonIndex(next.lesson) : null

  const goNext = () => {
    if (lives === 0) return
    if (!next) { navigate('/sections'); return }
    navigate(`/section/${next.section.id}/${next.isBoss ? 'boss' : `lesson/${next.lesson.id}`}`)
  }

  return (
    <div className="space-y-4 px-4 pb-28 pt-5">
      {/* ── Header ── */}
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <TorogozBadge size={48} />
          <div>
            <p className="flex items-center gap-1 text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#1f7a57]">
              <Leaf className="h-3 w-3" /> Aprende
            </p>
            <h1 className="mt-0.5 text-2xl font-black leading-none text-[#17211d]">Nawat</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-hairline bg-white px-3 py-2 shadow-[var(--elev-1)]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#dff3e7] text-[#1f7a57]">
            <Mountain className="h-4 w-4" />
          </span>
          <div className="pr-0.5 text-right">
            <p className="text-[0.54rem] font-bold uppercase tracking-[0.14em] text-[#6d756e]">Nivel</p>
            <p className="text-lg font-black leading-none text-[#17211d]">{level}</p>
          </div>
        </div>
      </header>

      {/* ── Saludo ── */}
      <div>
        <p className="flex items-center gap-1.5 text-base font-bold text-[#1f7a57]">
          Hola, {firstName} <Sprout className="h-4 w-4" />
        </p>
        <h2 className="mt-0.5 flex items-start gap-1.5 text-[2.15rem] font-black leading-[1.04] tracking-tight text-[#17211d]">
          <span>Tu aventura <span className="text-[#1f7a57]">continúa</span></span>
          <Sparkles className="mt-1 h-5 w-5 shrink-0 text-[#f4a261]" />
        </h2>
      </div>

      {/* ── Tarjeta XP ── */}
      <div
        className="relative overflow-hidden rounded-[1.8rem] border border-white/10 p-5 text-white shadow-[0_18px_40px_rgba(16,47,41,0.28)]"
        style={{ background: 'radial-gradient(circle at 86% 12%, rgba(157,223,198,0.18) 0, transparent 45%), linear-gradient(160deg,#16463a 0%, #102f29 72%)' }}
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-[3rem] font-black leading-none">{xpInLevel}</p>
            <p className="mt-0.5 text-lg font-black tracking-wide text-[#9ddfc6]">XP</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#f4a261]/45 bg-[#0c2620] text-[#f4a261] shadow-[0_0_28px_rgba(244,162,97,0.5)]">
            <Trophy className="h-8 w-8" />
          </div>
        </div>
        <div className="relative z-10 mt-3 h-2.5 overflow-visible rounded-full bg-white/14">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelPct}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative h-full rounded-full bg-gradient-to-r from-[#52b788] to-[#9ddfc6] shadow-[0_0_10px_rgba(157,223,198,0.7)]"
          >
            <Sparkles className="absolute -right-1 -top-[7px] h-3.5 w-3.5 text-[#fff4cf]" />
          </motion.div>
        </div>
        <p className="relative z-10 mt-2 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-white/50">de {xpPerLevel} XP</p>

        <div className="relative z-10 mt-4 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]">
          <div className="flex items-center gap-2.5 p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e63946]/18 text-[#ff8b8b]">
              <Heart className="h-4 w-4 fill-current" />
            </span>
            <div>
              <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-white/50">Vidas</p>
              <p className="text-base font-black leading-none">{lives}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 border-l border-white/10 p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4a261]/18 text-[#ffb15f]">
              <Flame className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-white/50">Racha</p>
              <p className="text-base font-black leading-none">{streak} d</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sin vidas ── */}
      {lives === 0 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#e63946]/25 bg-[#fff0f1] px-4 py-3">
          <p className="text-sm font-extrabold text-[#b91c1c]">Te quedaste sin vidas</p>
          <button onClick={resetLives} className="rounded-xl bg-[#b91c1c] px-3.5 py-2 text-xs font-black text-white transition active:scale-95">
            Recuperar
          </button>
        </div>
      )}

      {/* ── Siguiente lección ── */}
      {next ? (
        <motion.button
          whileTap={lives > 0 ? { scale: 0.99 } : {}}
          onClick={goNext}
          disabled={lives === 0}
          style={{ background: `radial-gradient(circle at 84% 16%, ${pathSection.color || '#f4a261'}26 0, transparent 48%), linear-gradient(160deg, #16463a 0%, #102f29 72%)` }}
          className="group relative block w-full overflow-hidden rounded-[1.8rem] border border-white/10 p-5 text-left shadow-[0_18px_40px_rgba(16,47,41,0.26)] transition disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="relative z-10 max-w-[64%]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f4a261]/30 bg-[#f4a261]/12 px-3 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.14em] text-[#f4a261]">
              {next.isBoss ? <Crown className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
              {next.isBoss ? 'Reto final' : 'Siguiente lección'}
            </span>
            <h3 className="mt-3 text-[1.55rem] font-black leading-tight tracking-tight text-white">{next.lesson.title}</h3>
            <p className="mt-1 text-[0.82rem] font-semibold leading-snug text-white/60">{next.lesson.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <HeroChip icon={Star} text={`+${heroXp} XP`} />
              <HeroChip icon={Clock3} text={`${heroMinutes} min`} />
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#f7b076] to-[#f4a261] px-6 py-3 text-sm font-black text-[#102f29] shadow-[0_4px_0_#c47330,0_10px_20px_rgba(244,162,97,0.3)] transition-transform duration-150 group-active:translate-y-[3px] group-active:shadow-[0_1px_0_#c47330]">
              {next.isBoss ? 'Empezar reto' : 'Aprender ahora'}
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#102f29]/15">
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>

          <div className="pointer-events-none absolute right-3 top-4 z-20 max-w-[150px] rounded-2xl border border-black/5 bg-white px-3 py-2 shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
            <p className="text-[0.64rem] font-black text-[#102f29]">{greeting?.nahuat || '¡Nawat tiwelli!'}</p>
            <p className="mt-0.5 text-[0.66rem] font-semibold leading-tight text-[#2d4d44]">{greeting?.spanish || '¿Vamos a practicar?'}</p>
            <span className="absolute -bottom-1.5 right-8 h-3 w-3 rotate-45 border-b border-r border-black/5 bg-white" />
          </div>
          <div className="pointer-events-none absolute -bottom-1 -right-1 z-10 drop-shadow-[0_12px_22px_rgba(0,0,0,0.34)]">
            <Torogoz emotion={next.isBoss ? 'proud' : 'explaining'} size={150} />
          </div>
        </motion.button>
      ) : (
        <div className="rounded-[1.8rem] border border-hairline bg-white p-7 text-center shadow-[var(--elev-2)]">
          <Trophy className="mx-auto h-9 w-9 text-[#c77918]" />
          <h3 className="mt-3 text-xl font-black text-[#17211d]">¡Todo completado!</h3>
          <p className="mt-1 text-sm text-[#6d756e]">Has terminado las lecciones disponibles.</p>
        </div>
      )}

      {/* ── Ruta de hoy ── */}
      <section className="surface-card-lg p-4">
        <div className="mb-4 flex items-center gap-2">
          <Leaf className="h-4 w-4 text-[#1f7a57]" />
          <h3 className="text-base font-black tracking-tight text-[#17211d]">Ruta de hoy</h3>
        </div>
        <div className="flex items-start">
          {steps.map((step, i) => (
            <div key={step.lesson.id} className="flex min-w-0 flex-1 items-start">
              <button
                onClick={() => !step.locked && navigate(`/section/${pathSection.id}/lesson/${step.lesson.id}`)}
                disabled={step.locked}
                className="flex min-w-0 flex-1 flex-col items-center gap-1.5 disabled:cursor-not-allowed"
                aria-label={step.lesson.title}
              >
                <StepNode step={step} index={i + 1} />
                <span className={`text-xs font-black ${step.isCurrent ? 'text-[#c77918]' : step.completed ? 'text-[#17211d]' : 'text-[#9aa39c]'}`}>{i + 1}</span>
                <StarRow count={step.stars} active={step.completed || step.isCurrent} />
              </button>
              {i < steps.length - 1 && (
                <span className={`mt-[22px] h-0 flex-1 border-t-2 ${step.completed ? 'border-solid border-[#52b788]' : 'border-dotted border-[#cdd3cb]'}`} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="surface-card p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#dff3e7] text-[#1f7a57]">
            <BookOpen className="h-5 w-5" />
          </span>
          <p className="mt-3 text-2xl font-black leading-none text-[#17211d]">{completedLessons}</p>
          <p className="mt-1 text-[0.66rem] font-bold uppercase tracking-[0.1em] text-[#6d756e]">de {totalLessons} lecciones</p>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#eef0ea]">
            <div className="h-full rounded-full bg-[#52b788]" style={{ width: `${lessonsPct}%` }} />
          </div>
        </div>
        <div className="surface-card p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff1da] text-[#c77918]">
            <Trophy className="h-5 w-5" />
          </span>
          <p className="mt-3 text-2xl font-black leading-none text-[#17211d] tabular-nums">{xp}</p>
          <p className="mt-1 text-[0.66rem] font-bold uppercase tracking-[0.1em] text-[#6d756e]">XP total</p>
        </div>
      </div>
    </div>
  )
}

function HeroChip({ icon: Icon, text }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-[0.72rem] font-black text-white/85">
      <Icon className="h-3.5 w-3.5 text-[#9ddfc6]" />
      {text}
    </span>
  )
}

function StepNode({ step, index }) {
  if (step.completed) {
    return (
      <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#1f7a57] bg-[#1f7a57] text-white shadow-[0_5px_12px_rgba(31,122,87,0.3)]">
        <Check className="h-5 w-5" strokeWidth={3} />
      </span>
    )
  }
  if (step.isCurrent) {
    return (
      <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#f4a261] bg-gradient-to-b from-[#f7b076] to-[#f4a261] text-base font-black text-[#102f29] shadow-[0_0_0_4px_rgba(244,162,97,0.18),0_6px_14px_rgba(244,162,97,0.35)]">
        {index}
      </span>
    )
  }
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#dfe3dc] bg-[#0c2620] text-[#9ddfc6]/80">
      <Lock className="h-4 w-4" />
    </span>
  )
}

function StarRow({ count, active }) {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < count ? 'fill-[#f4a261] text-[#f4a261]' : active ? 'fill-[#e6e3da] text-[#e6e3da]' : 'fill-[#ebe8e0] text-[#ebe8e0]'}`}
        />
      ))}
    </div>
  )
}
