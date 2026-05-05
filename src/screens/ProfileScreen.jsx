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
    <div className="screen bg-background">
      {/* Header */}
      <header className="flex flex-col items-center px-5 pt-8 pb-7 bg-gradient-to-br from-[#1f4f3b] via-primary to-[#3a8461] text-white rounded-b-[32px] shadow-[0_6px_20px_rgba(29,73,54,0.25)] gap-2">
        <div className="mb-1">
          <TorogozBadge size={72} />
        </div>
        <h1 className="text-[1.4rem] font-extrabold text-white tracking-[-0.5px]">{participantName || 'Estudiante'}</h1>
        <p className="text-[0.82rem] font-semibold text-white/80">Nivel {level}</p>
        <div className="w-[60%] h-2 rounded bg-white/20 overflow-hidden mt-1">
          <div className="h-full bg-nahuat-gold rounded transition-[width] duration-400 ease-out" style={{ width: `${levelPct}%` }} />
        </div>
        <p className="text-[0.72rem] text-white/65 mt-0.5">{xpInLevel} / {xpPerLevel} XP</p>

        {/* Account status badge */}
        <div className={`inline-flex items-center gap-1.5 mt-3 px-3.5 py-1.5 rounded-[20px] text-[0.8rem] font-bold ${
          isGuestMode
            ? 'bg-white/[0.12] text-white/75 border border-white/20'
            : 'bg-[rgba(82,183,136,0.2)] text-nahuat-green-light border border-[rgba(82,183,136,0.35)]'
        }`}>
          <span>{isGuestMode ? '📵' : '☁️'}</span>
          <span>{isGuestMode ? 'Sin cuenta' : 'Cuenta vinculada'}</span>
        </div>
      </header>

      {/* Stats Grid */}
      <main className="px-4 py-5 flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: '⚡', value: xp, label: 'XP Total' },
            { icon: '🔥', value: streak, label: 'Racha' },
            { icon: '⭐', value: totalStars, label: 'Estrellas' },
            { icon: '📖', value: totalLessonsCompleted, label: 'Lecciones' },
            { icon: '🏆', value: totalSectionsCompleted, label: 'Secciones' },
            { icon: '❤️', value: `${lives}/${GAME_CONFIG.lives.max}`, label: 'Vidas' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 px-2.5 py-4 bg-card rounded-sm shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
              <span className="text-[1.3rem]">{stat.icon}</span>
              <span className="text-[1.3rem] font-extrabold text-foreground tabular-nums">{stat.value}</span>
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.5px] text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Section badges */}
        {totalSectionsCompleted > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-[0.85rem] font-bold uppercase tracking-[0.6px] text-muted-foreground">Insignias</h2>
            <div className="flex flex-wrap gap-2.5">
              {sections.map((s) => {
                const completed = sectionProgress[s.id]?.bossCompleted === true
                if (!completed) return null
                return (
                  <div key={s.id} className="flex flex-col items-center gap-1 px-4 py-3.5 bg-card rounded-sm shadow-[0_2px_12px_rgba(0,0,0,0.08)] border-2 min-w-[80px]" style={{ borderColor: s.color }}>
                    <span className="text-[1.5rem]">{s.icon}</span>
                    <span className="text-[0.7rem] font-bold text-foreground text-center">{s.title}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Last played */}
        {lastPlayedDate && (
          <p className="text-center text-[0.78rem] text-muted-foreground italic">
            Última sesión: {new Date(lastPlayedDate).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
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
              className="btn btn-secondary w-full mt-1"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? 'Cerrando sesión…' : '🚪 Cerrar sesión'}
            </button>
          )}
        </div>
      </main>

      {/* Spacer for bottom nav */}
      <div className="h-[90px] shrink-0" />
    </div>
  )
}
