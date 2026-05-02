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
    <div className="screen result-screen">
      <div className="result-content">
        {/* Mascota */}
        <div className="torogoz-wrap">
          <Torogoz emotion={passed ? 'celebrate' : 'sad'} size={110} />
        </div>

        {/* Stars */}
        <div className="result-stars">
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              className={`result-star ${i < stars ? 'star-earned' : 'star-empty'}`}
            >
              {i < stars ? '⭐' : '☆'}
            </span>
          ))}
        </div>

        {/* Heading */}
        <div className="result-lesson-badge">
          <span>{lessonIcon}</span>
          <span>{lessonTitle}</span>
        </div>

        <h1 className="result-title">
          {passed
            ? (isBoss ? '¡Sección completada!' : '¡Lección completada!')
            : '¡Sigue intentándolo!'}
        </h1>
        <p className="result-subtitle">
          {passed
            ? 'Estás aprendiendo Náhuat muy bien.'
            : 'Repasa los ejercicios y vuelve a intentarlo.'}
        </p>

        {/* Stats */}
        <div className="result-stats">
          <div className="stat-card">
            <span className="stat-value">{pct}%</span>
            <span className="stat-label">Precisión</span>
          </div>
          <div className="stat-card stat-xp">
            <span className="stat-value">+{xpEarned}</span>
            <span className="stat-label">XP ganado</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stars}/3</span>
            <span className="stat-label">Estrellas</span>
          </div>
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div className="result-streak">
            <span className="result-streak-icon">🔥</span>
            <p className="result-streak-text">
              {streak === 1 ? '¡Primer día de racha!' : `${streak} días seguidos`}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="result-actions">
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
