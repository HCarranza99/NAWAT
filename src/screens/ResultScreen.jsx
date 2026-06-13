import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Flame, Medal, RotateCcw, Star, Target, Trophy, Zap } from 'lucide-react'

import useGameStore from '../store/useGameStore'
import Torogoz from '../components/ui/Torogoz'
import sections from '../data/sections'

function ResultStat({ icon: Icon, value, label, tone = 'text-[#1f7a57]' }) {
  return (
    <div className="surface-card p-4 text-left">
      <Icon className={`h-5 w-5 ${tone}`} />
      <p className="mt-3 text-2xl font-black leading-none text-[#17211d]">{value}</p>
      <p className="mt-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#6d756e]">{label}</p>
    </div>
  )
}

export default function ResultScreen() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const streak = useGameStore((store) => store.streak)
  const sectionProgress = useGameStore((store) => store.sectionProgress)

  if (!state) {
    return <Navigate to="/" replace />
  }

  const { lessonId, lessonTitle, score, xpEarned, isBoss, sectionId, returnTo } = state
  const pct = Math.round(score * 100)
  const stars = score >= 0.9 ? 3 : score >= 0.7 ? 2 : 1
  const passed = score >= 0.5

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

  const nextLesson = findNextLesson()

  return (
    <div className="screen justify-between bg-[#f7f5ef] px-5 py-5">
      <main className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <div className="relative flex items-center justify-center">
          {passed && (
            <>
              <motion.span
                aria-hidden
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(244,162,97,0.28),transparent_62%)]"
              />
              <motion.span
                aria-hidden
                initial={{ rotate: 0, opacity: 0 }}
                animate={{ rotate: 360, opacity: 0.5 }}
                transition={{ rotate: { duration: 22, repeat: Infinity, ease: 'linear' }, opacity: { duration: 0.8 } }}
                className="absolute h-44 w-44 rounded-full"
                style={{ background: 'conic-gradient(from 0deg, transparent, rgba(157,223,198,0.35), transparent 40%)' }}
              />
            </>
          )}
          <div className="absolute inset-x-0 bottom-2 mx-auto h-12 w-36 rounded-full bg-[#102f29]/10 blur-xl" />
          <motion.div
            initial={{ scale: 0.7, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            className="relative"
          >
            <Torogoz emotion={passed ? (isBoss ? 'achievement' : 'celebrate') : 'sad'} size={132} />
          </motion.div>
        </div>

        <div className="flex gap-2.5">
          {Array.from({ length: 3 }, (_, index) => {
            const earned = index < stars
            return (
              <motion.span
                key={index}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.25 + index * 0.16, type: 'spring', stiffness: 320, damping: 14 }}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                  earned
                    ? 'border-[#f4a261]/45 bg-gradient-to-b from-[#fff8ec] to-[#ffeccf] text-[#c77918] shadow-[0_8px_18px_rgba(244,162,97,0.28)]'
                    : 'border-[#e3ded2] bg-white text-[#cfd6d1]'
                }`}
              >
                <Star className={`h-6 w-6 ${earned ? 'fill-current' : ''}`} />
              </motion.span>
            )
          })}
        </div>

        <span className="inline-flex max-w-full items-center gap-2 rounded-md border border-[#e3ded2] bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#6d756e] shadow-sm">
          {isBoss ? <Trophy className="h-4 w-4 text-[#c77918]" /> : <Medal className="h-4 w-4 text-[#1f7a57]" />}
          <span className="truncate">{lessonTitle}</span>
        </span>

        <div>
          <h1 className="text-3xl font-black leading-tight tracking-normal text-[#17211d]">
            {passed
              ? (isBoss ? 'Sección completada' : 'Lección completada')
              : 'Sigue practicando'}
          </h1>
          <p className="mx-auto mt-2 max-w-[300px] text-sm font-medium leading-snug text-[#6d756e]">
            {passed
              ? 'Vas sumando bases sólidas para entender y usar el náhuat.'
              : 'Repasa los ejercicios y vuelve a intentarlo con calma.'}
          </p>
        </div>

        <section className="grid w-full grid-cols-3 gap-3">
          <ResultStat icon={Target} value={`${pct}%`} label="Precisión" tone="text-[#2f6fb2]" />
          <ResultStat icon={Zap} value={`+${xpEarned}`} label="XP ganado" tone="text-[#1f7a57]" />
          <ResultStat icon={Star} value={`${stars}/3`} label="Estrellas" tone="text-[#c77918]" />
        </section>

        {streak > 0 && (
          <div className="flex items-center gap-2 rounded-md border border-[#f4d7ad] bg-[#fff8ec] px-4 py-3 text-sm font-black text-[#8a4b12]">
            <Flame className="h-5 w-5 text-[#c77918]" />
            {streak === 1 ? 'Primer día de racha' : `${streak} días seguidos`}
          </div>
        )}
      </main>

      <footer className="space-y-3">
        {!passed && sectionId && (
          <button
            className="btn-3d btn-3d-soft"
            onClick={() => {
              if (isBoss) {
                navigate(`/section/${sectionId}/boss`)
              } else {
                navigate(`/section/${sectionId}/lesson/${lessonId}`)
              }
            }}
          >
            <RotateCcw className="h-5 w-5" />
            Intentar de nuevo
          </button>
        )}
        {!passed && !sectionId && (
          <button
            className="btn-3d btn-3d-soft"
            onClick={() => navigate(`/lesson/${lessonId}`)}
          >
            <RotateCcw className="h-5 w-5" />
            Intentar de nuevo
          </button>
        )}

        {passed && nextLesson ? (
          <>
            <button
              className="btn-3d btn-3d-primary"
              onClick={() => {
                if (nextLesson.isBoss) {
                  navigate(`/section/${nextLesson.section.id}/boss`)
                } else {
                  navigate(`/section/${nextLesson.section.id}/lesson/${nextLesson.lesson.id}`)
                }
              }}
            >
              Siguiente lección
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              className="w-full py-2 text-sm font-bold text-[#6d756e] transition active:scale-[0.99]"
              onClick={() => navigate('/')}
            >
              Volver al inicio
            </button>
          </>
        ) : (
          <>
            {returnTo === '/sections' && (
              <button
                className="btn-3d btn-3d-soft"
                onClick={() => navigate('/sections')}
              >
                Ver secciones
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
            <button
              className="btn-3d btn-3d-primary"
              onClick={() => navigate('/')}
            >
              Volver al inicio
              <ArrowRight className="h-5 w-5" />
            </button>
          </>
        )}
      </footer>
    </div>
  )
}
