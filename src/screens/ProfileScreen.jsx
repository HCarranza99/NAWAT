import { useState } from 'react'
import {
  Award,
  BookOpen,
  Cloud,
  Flame,
  Heart,
  LogOut,
  Medal,
  RotateCcw,
  ShieldCheck,
  Star,
  Trophy,
  Zap,
} from 'lucide-react'

import useGameStore, { PHASES } from '../store/useGameStore'
import sections from '../data/sections'
import { GAME_CONFIG } from '../data/gameConfig'
import TorogozBadge from '../components/ui/TorogozBadge'
import { signOut } from '../services/auth'

function StatCard({ icon: Icon, value, label, tone = 'text-[#1f7a57]' }) {
  return (
    <div className="rounded-lg border border-[#e3ded2] bg-white p-3 shadow-sm">
      <Icon className={`h-5 w-5 ${tone}`} />
      <p className="mt-3 text-2xl font-black leading-none text-[#17211d] tabular-nums">{value}</p>
      <p className="mt-1 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-[#6d756e]">{label}</p>
    </div>
  )
}

export default function ProfileScreen() {
  const [loggingOut, setLoggingOut] = useState(false)
  const {
    xp, lives, streak, lastPlayedDate,
    sectionProgress,
    participantName, resetLives,
    isGuestMode, setAuthUser,
  } = useGameStore()

  const xpPerLevel = GAME_CONFIG.xp.perLevel
  const level = Math.floor(xp / xpPerLevel) + 1
  const xpInLevel = xp % xpPerLevel
  const levelPct = Math.round((xpInLevel / xpPerLevel) * 100)

  const totalSectionsCompleted = sections.filter((section) => {
    const prog = sectionProgress[section.id]
    return prog?.bossCompleted === true
  }).length

  const totalLessonsCompleted = sections.reduce((acc, section) => {
    const prog = sectionProgress[section.id]
    if (!prog?.lessonsCompleted) return acc
    return acc + Object.values(prog.lessonsCompleted).filter((lesson) => lesson.completed).length
  }, 0)

  const totalStars = sections.reduce((acc, section) => {
    const prog = sectionProgress[section.id]
    if (!prog?.lessonsCompleted) return acc
    const lessonStars = Object.values(prog.lessonsCompleted).reduce((sum, lesson) => sum + (lesson.stars || 0), 0)
    const bossStars = prog.bossStars || 0
    return acc + lessonStars + bossStars
  }, 0)

  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut()
    setAuthUser(null)
    setLoggingOut(false)
  }

  return (
    <div className="screen bg-[#f7f5ef] pb-28">
      <header className="bg-[#102f29] px-5 pb-5 pt-5 text-white">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TorogozBadge size={54} />
            <div className="min-w-0">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9ddfc6]">Perfil</p>
              <h1 className="mt-1 truncate text-2xl font-black leading-none tracking-normal">
                {participantName || 'Estudiante'}
              </h1>
              <p className="mt-2 text-sm font-medium text-white/65">Nivel {level}</p>
            </div>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#f4a261] text-[#102f29]">
            <Medal className="h-7 w-7" />
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.07] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-extrabold text-white">Progreso de nivel</p>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/55">{xpInLevel}/{xpPerLevel} XP</p>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/14">
            <div className="h-full rounded-full bg-[#9ddfc6] transition-[width] duration-500 ease-out" style={{ width: `${levelPct}%` }} />
          </div>
        </div>

        <div className={`mt-3 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-extrabold ${
          isGuestMode
            ? 'border-white/15 bg-white/8 text-white/72'
            : 'border-[#9ddfc6]/25 bg-[#9ddfc6]/12 text-[#9ddfc6]'
        }`}>
          {isGuestMode ? <ShieldCheck className="h-4 w-4" /> : <Cloud className="h-4 w-4" />}
          {isGuestMode ? 'Sin cuenta vinculada' : 'Cuenta vinculada'}
        </div>
      </header>

      <main className="space-y-5 px-5 pt-5">
        <section className="grid grid-cols-2 gap-3">
          <StatCard icon={Zap} value={xp} label="XP total" tone="text-[#1f7a57]" />
          <StatCard icon={Flame} value={streak} label="Racha" tone="text-[#c77918]" />
          <StatCard icon={Star} value={totalStars} label="Estrellas" tone="text-[#d89a1d]" />
          <StatCard icon={BookOpen} value={totalLessonsCompleted} label="Lecciones" tone="text-[#2f6fb2]" />
          <StatCard icon={Trophy} value={totalSectionsCompleted} label="Secciones" tone="text-[#8d4ac3]" />
          <StatCard icon={Heart} value={`${lives}/${GAME_CONFIG.lives.max}`} label="Vidas" tone="text-[#d94848]" />
        </section>

        {totalSectionsCompleted > 0 && (
          <section className="rounded-lg border border-[#e3ded2] bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-[#1f7a57]" />
              <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#17211d]">Insignias</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => {
                const completed = sectionProgress[section.id]?.bossCompleted === true
                if (!completed) return null
                return (
                  <div
                    key={section.id}
                    className="rounded-md border px-3 py-2 text-sm font-extrabold text-[#17211d]"
                    style={{ borderColor: `${section.color}55`, backgroundColor: `${section.color}10` }}
                  >
                    {section.title}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {lastPlayedDate && (
          <p className="rounded-md border border-[#e3ded2] bg-white px-4 py-3 text-center text-sm font-medium text-[#6d756e] shadow-sm">
            Última sesión: {new Date(lastPlayedDate).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        )}

        <section className="space-y-2">
          {lives === 0 && (
            <button
              className="flex w-full items-center justify-center gap-2 rounded-md border border-[#d94848]/25 bg-[#fff0f1] px-4 py-3 text-sm font-extrabold text-[#b91c1c] transition active:scale-[0.99]"
              onClick={resetLives}
            >
              <RotateCcw className="h-4 w-4" />
              Recuperar vidas
            </button>
          )}

          {isGuestMode ? (
            <button
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1f7a57] px-4 py-3 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(31,122,87,0.2)] transition active:scale-[0.99]"
              onClick={() => useGameStore.setState({ studyPhase: PHASES.ACCOUNT_PROMPT })}
            >
              <Cloud className="h-4 w-4" />
              Crear cuenta
            </button>
          ) : (
            <button
              className="flex w-full items-center justify-center gap-2 rounded-md border border-[#d8ddd5] bg-white px-4 py-3 text-sm font-extrabold text-[#17211d] shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
            </button>
          )}
        </section>
      </main>
    </div>
  )
}
