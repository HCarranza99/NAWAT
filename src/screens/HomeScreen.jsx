import { useNavigate } from 'react-router-dom'
import lessons from '../data/lessons'
import useGameStore from '../store/useGameStore'
import { GAME_CONFIG } from '../data/gameConfig'
import { useLivesRecharge } from '../hooks/useLivesRecharge'
import Torogoz from '../components/ui/Torogoz'

export default function HomeScreen() {
  const navigate = useNavigate()
  const { xp, lives, streak, lessonProgress, resetLives } = useGameStore()
  const { minutesLeft } = useLivesRecharge()

  return (
    <div className="screen home-screen">
      {/* ── HEADER ── */}
      <header className="home-header">
        <div className="home-logo">
          <span className="logo-leaf">🌿</span>
          <div>
            <h1 className="logo-title">Náhuat</h1>
            <p className="logo-sub">Idioma del pueblo Pipil</p>
          </div>
        </div>

        <div className="home-header-right">
          <div className="home-lives">
            {Array.from({ length: GAME_CONFIG.lives.max }, (_, i) => (
              <span key={i}>{i < lives ? '❤️' : '🖤'}</span>
            ))}
          </div>
          <div className="home-badges">
            {streak > 0 && (
              <div className="streak-badge">
                <span>🔥</span>
                <span className="streak-count">{streak}</span>
              </div>
            )}
            <div className="xp-badge">
              <span className="xp-icon">⚡</span>
              <span className="xp-count">{xp}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── SIN VIDAS ── */}
      {lives === 0 && (
        <div className="no-lives-banner">
          <p className="no-lives-text">
            {minutesLeft !== null
              ? `Sin vidas — recarga en ${minutesLeft} min`
              : 'Sin vidas — recuperando...'}
          </p>
          <button className="btn-recover" onClick={resetLives}>
            Recuperar
          </button>
        </div>
      )}

      {/* ── MASCOTA ── */}
      <div className="home-torogoz">
        <Torogoz emotion="idle" size={180} />
      </div>

      {/* ── LESSON MAP ── */}
      <main className="lesson-map">
        <p className="map-label">Elige una lección</p>

        {lessons.map((lesson, index) => {
          const prev = index > 0 ? lessons[index - 1] : null
          const isUnlocked =
            index === 0 || lessonProgress[prev?.id]?.completed === true
          const isEmpty = lesson.items.length === 0
          const disabled = !isUnlocked || isEmpty || lives === 0
          const progress = lessonProgress[lesson.id]

          return (
            <button
              key={lesson.id}
              className={`lesson-card ${disabled ? 'lesson-locked' : ''} ${progress?.completed ? 'lesson-completed' : ''}`}
              style={{ '--lesson-color': lesson.color }}
              onClick={() => !disabled && navigate(`/lesson/${lesson.id}`)}
              disabled={disabled}
              aria-label={`${lesson.title}${disabled ? ', bloqueada' : ''}`}
            >
              <div
                className="card-icon-wrap"
                style={{ background: lesson.color + '22' }}
              >
                <span className="card-icon">{lesson.icon}</span>
              </div>

              <div className="card-body">
                <h3 className="card-title">{lesson.title}</h3>
                <p className="card-desc">{lesson.description}</p>
                {progress?.stars && (
                  <div className="card-stars">
                    {Array.from({ length: 3 }, (_, i) => (
                      <span key={i}>{i < progress.stars ? '⭐' : '☆'}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="card-right">
                {isEmpty ? (
                  <span className="badge-soon">Pronto</span>
                ) : !isUnlocked ? (
                  <span className="card-lock">🔒</span>
                ) : progress?.completed ? (
                  <div className="card-done">
                    <span className="card-done-check">✓</span>
                    <span className="card-done-label">Hecho</span>
                  </div>
                ) : (
                  <div className="card-xp">
                    <span className="card-xp-val">+{lesson.xpReward}</span>
                    <span className="card-xp-label">XP</span>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </main>
    </div>
  )
}
