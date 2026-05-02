import { useState } from 'react'
import useGameStore, { PHASES } from '../store/useGameStore'
import sections from '../data/sections'
import { GAME_CONFIG } from '../data/gameConfig'
import TorogozBadge from '../components/ui/TorogozBadge'
import { signOut } from '../services/auth'

export default function ProfileScreen() {
  const [loggingOut, setLoggingOut] = useState(false)
  const {
    xp, lives, streak, lastPlayedDate,
    sectionProgress,
    participantName, resetLives,
    isGuestMode, setAuthUser,
  } = useGameStore()

  // XP and level calculations
  const xpPerLevel = GAME_CONFIG.xp.perLevel
  const level = Math.floor(xp / xpPerLevel) + 1
  const xpInLevel = xp % xpPerLevel
  const levelPct = Math.round((xpInLevel / xpPerLevel) * 100)

  // Stats calculations
  const totalSectionsCompleted = sections.filter((s) => {
    const prog = sectionProgress[s.id]
    return prog?.bossCompleted === true
  }).length

  const totalLessonsCompleted = sections.reduce((acc, s) => {
    const prog = sectionProgress[s.id]
    if (!prog?.lessonsCompleted) return acc
    return acc + Object.values(prog.lessonsCompleted).filter((l) => l.completed).length
  }, 0)

  const totalStars = sections.reduce((acc, s) => {
    const prog = sectionProgress[s.id]
    if (!prog?.lessonsCompleted) return acc
    const lessonStars = Object.values(prog.lessonsCompleted).reduce((sum, l) => sum + (l.stars || 0), 0)
    const bossStars = prog.bossStars || 0
    return acc + lessonStars + bossStars
  }, 0)

  // Legacy lessons stats
  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut()
    setAuthUser(null)
    setLoggingOut(false)
  }

  return (
    <div className="screen profile-screen">
      {/* Header */}
      <header className="profile-header">
        <div className="profile-avatar-wrap">
          <TorogozBadge size={72} />
        </div>
        <h1 className="profile-name">{participantName || 'Estudiante'}</h1>
        <p className="profile-level-label">Nivel {level}</p>
        <div className="profile-level-bar">
          <div className="profile-level-fill" style={{ width: `${levelPct}%` }} />
        </div>
        <p className="profile-xp-label">{xpInLevel} / {xpPerLevel} XP</p>

        {/* Account status badge */}
        <div className={`profile-account-badge ${isGuestMode ? 'badge-guest' : 'badge-linked'}`}>
          <span>{isGuestMode ? '📵' : '☁️'}</span>
          <span>{isGuestMode ? 'Sin cuenta' : 'Cuenta vinculada'}</span>
        </div>
      </header>

      {/* Stats Grid */}
      <main className="profile-body">
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <span className="profile-stat-icon">⚡</span>
            <span className="profile-stat-value">{xp}</span>
            <span className="profile-stat-label">XP Total</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-icon">🔥</span>
            <span className="profile-stat-value">{streak}</span>
            <span className="profile-stat-label">Racha</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-icon">⭐</span>
            <span className="profile-stat-value">{totalStars}</span>
            <span className="profile-stat-label">Estrellas</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-icon">📖</span>
            <span className="profile-stat-value">{totalLessonsCompleted}</span>
            <span className="profile-stat-label">Lecciones</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-icon">🏆</span>
            <span className="profile-stat-value">{totalSectionsCompleted}</span>
            <span className="profile-stat-label">Secciones</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-icon">❤️</span>
            <span className="profile-stat-value">{lives}/{GAME_CONFIG.lives.max}</span>
            <span className="profile-stat-label">Vidas</span>
          </div>
        </div>

        {/* Section badges */}
        {totalSectionsCompleted > 0 && (
          <div className="profile-section-badges">
            <h2 className="profile-section-title">Insignias</h2>
            <div className="profile-badges-row">
              {sections.map((s) => {
                const completed = sectionProgress[s.id]?.bossCompleted === true
                if (!completed) return null
                return (
                  <div key={s.id} className="profile-badge" style={{ '--badge-color': s.color }}>
                    <span className="profile-badge-icon">{s.icon}</span>
                    <span className="profile-badge-name">{s.title}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Last played */}
        {lastPlayedDate && (
          <p className="profile-last-played">
            Última sesión: {new Date(lastPlayedDate).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        )}

        {/* Actions */}
        <div className="profile-actions">
          {lives === 0 && (
            <button className="btn btn-secondary" onClick={resetLives}>
              ❤️ Recuperar vidas
            </button>
          )}

          {isGuestMode ? (
            <button
              className="btn btn-primary"
              onClick={() => useGameStore.setState({ studyPhase: PHASES.ACCOUNT_PROMPT })}
            >
              ☁️ Crear cuenta
            </button>
          ) : (
            <button
              className="btn btn-secondary profile-logout-btn"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? 'Cerrando sesión…' : '🚪 Cerrar sesión'}
            </button>
          )}
        </div>
      </main>

      {/* Spacer for bottom nav */}
      <div className="bottom-nav-spacer" />
    </div>
  )
}
