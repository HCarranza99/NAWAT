import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Flame, Medal, RotateCcw, Star, Target, Trophy, Zap } from 'lucide-react'

import useGameStore from '../store/useGameStore'
import Torogoz from '../components/ui/Torogoz'

function ResultStat({ icon: Icon, value, label, tone = 'text-[#1f7a57]' }) {
  return (
    <div className="rounded-lg border border-[#e3ded2] bg-white p-4 text-left shadow-sm">
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

  if (!state) {
    navigate('/', { replace: true })
    return null
  }

  const { lessonId, lessonTitle, score, xpEarned, isBoss, sectionId, returnTo } = state
  const pct = Math.round(score * 100)
  const stars = score >= 0.9 ? 3 : score >= 0.7 ? 2 : 1
  const passed = score >= 0.5

  return (
    <div className="screen justify-between bg-[#f7f5ef] px-5 py-5">
      <main className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <div className="relative">
          <div className="absolute inset-x-0 bottom-2 mx-auto h-12 w-36 rounded-full bg-[#102f29]/10 blur-xl" />
          <Torogoz emotion={passed ? 'celebrate' : 'sad'} size={132} />
        </div>

        <div className="flex gap-2">
          {Array.from({ length: 3 }, (_, index) => {
            const earned = index < stars
            return (
              <span
                key={index}
                className={`flex h-11 w-11 items-center justify-center rounded-md border ${
                  earned
                    ? 'border-[#f4a261]/45 bg-[#fff8ec] text-[#c77918]'
                    : 'border-[#e3ded2] bg-white text-[#cfd6d1]'
                }`}
              >
                <Star className={`h-6 w-6 ${earned ? 'fill-current' : ''}`} />
              </span>
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

      <footer className="space-y-2.5">
        {!passed && sectionId && (
          <button
            className="flex w-full items-center justify-center gap-2 rounded-md border border-[#d8ddd5] bg-white px-4 py-3.5 text-base font-black text-[#17211d] shadow-sm transition active:scale-[0.99]"
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
            className="flex w-full items-center justify-center gap-2 rounded-md border border-[#d8ddd5] bg-white px-4 py-3.5 text-base font-black text-[#17211d] shadow-sm transition active:scale-[0.99]"
            onClick={() => navigate(`/lesson/${lessonId}`)}
          >
            <RotateCcw className="h-5 w-5" />
            Intentar de nuevo
          </button>
        )}
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1f7a57] px-4 py-4 text-base font-black text-white shadow-[0_10px_24px_rgba(31,122,87,0.22)] transition active:scale-[0.99]"
          onClick={() => navigate(returnTo || '/')}
        >
          {returnTo === '/sections' ? 'Ver secciones' : 'Volver al inicio'}
          <ArrowRight className="h-5 w-5" />
        </button>
      </footer>
    </div>
  )
}
