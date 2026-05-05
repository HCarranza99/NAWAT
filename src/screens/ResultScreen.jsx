import { useLocation, useNavigate } from 'react-router-dom'
import useGameStore from '../store/useGameStore'
import Torogoz from '../components/ui/Torogoz'

export default function ResultScreen() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const streak = useGameStore((s) => s.streak)

  if (!state) {
    navigate('/', { replace: true })
    return null
  }

  const { lessonId, lessonTitle, lessonIcon, score, xpEarned, isBoss, sectionId, returnTo } = state
  const pct = Math.round(score * 100)
  const stars = score >= 0.9 ? 3 : score >= 0.7 ? 2 : 1
  const passed = score >= 0.5

  return (
    <div className="screen px-6 pt-10 pb-9 justify-between">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Mascota */}
        <div className="flex justify-center items-center my-2">
          <Torogoz emotion={passed ? 'celebrate' : 'sad'} size={110} />
        </div>

        {/* Stars */}
        <div className="flex gap-2 mb-1">
          {Array.from({ length: 3 }, (_, i) => {
            const earned = i < stars
            return (
              <span
                key={i}
                className={`transition-transform duration-300 ${
                  earned ? 'text-[2.5rem] scale-110' : 'text-[2.1rem] opacity-30'
                }`}
              >
                {earned ? '⭐' : '☆'}
              </span>
            )
          })}
        </div>

        {/* Heading */}
        <div className="flex items-center gap-2 bg-secondary text-primary font-semibold text-[0.85rem] px-4 py-1.5 rounded-[20px]">
          <span>{lessonIcon}</span>
          <span>{lessonTitle}</span>
        </div>

        <h1 className="text-[1.8rem] font-extrabold text-foreground tracking-[-0.5px] leading-[1.2]">
          {passed
            ? (isBoss ? '¡Sección completada!' : '¡Lección completada!')
            : '¡Sigue intentándolo!'}
        </h1>
        <p className="text-[0.95rem] text-muted-foreground max-w-[280px]">
          {passed
            ? 'Estás aprendiendo Náhuat muy bien.'
            : 'Repasa los ejercicios y vuelve a intentarlo.'}
        </p>

        {/* Stats */}
        <div className="flex gap-3 mt-2 w-full">
          <div className="flex-1 bg-card rounded-sm px-2.5 py-4 flex flex-col items-center gap-1 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
            <span className="text-[1.5rem] font-extrabold text-foreground">{pct}%</span>
            <span className="text-[0.72rem] uppercase tracking-[0.5px] font-semibold text-muted-foreground">Precisión</span>
          </div>
          <div className="flex-1 bg-card rounded-sm px-2.5 py-4 flex flex-col items-center gap-1 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
            <span className="text-[1.5rem] font-extrabold text-primary">+{xpEarned}</span>
            <span className="text-[0.72rem] uppercase tracking-[0.5px] font-semibold text-muted-foreground">XP ganado</span>
          </div>
          <div className="flex-1 bg-card rounded-sm px-2.5 py-4 flex flex-col items-center gap-1 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
            <span className="text-[1.5rem] font-extrabold text-foreground">{stars}/3</span>
            <span className="text-[0.72rem] uppercase tracking-[0.5px] font-semibold text-muted-foreground">Estrellas</span>
          </div>
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div className="flex items-center gap-2 bg-[#fff3e0] border-[1.5px] border-[#ffb300] rounded-[20px] px-[18px] py-2 mt-1">
            <span className="text-[1.2rem]">🔥</span>
            <p className="text-[0.9rem] font-bold text-[#e65100]">
              {streak === 1 ? '¡Primer día de racha!' : `${streak} días seguidos`}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2.5 w-full">
        {!passed && sectionId && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (isBoss) {
                navigate(`/section/${sectionId}/boss`)
              } else {
                navigate(`/section/${sectionId}/lesson/${lessonId}`)
              }
            }}
          >
            Intentar de nuevo
          </button>
        )}
        {!passed && !sectionId && (
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/lesson/${lessonId}`)}
          >
            Intentar de nuevo
          </button>
        )}
        <button className="btn btn-primary" onClick={() => navigate(returnTo || '/')}>
          {returnTo === '/sections' ? 'Ver secciones' : 'Volver al inicio'}
        </button>
      </div>
    </div>
  )
}
