import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  Cloud,
  Download,
  Flame,
  Heart,
  LogOut,
  Medal,
  ShieldCheck,
  Zap,
} from 'lucide-react'

import useGameStore, { PHASES } from '../store/useGameStore'
import { DONATION_ENABLED } from '../data/donation'
import { GAME_CONFIG } from '../data/gameConfig'
import TorogozBadge from '../components/ui/TorogozBadge'
import { signOut } from '../services/auth'
import { usePwaInstall } from '../hooks/usePwaInstall'

function StatCard({ icon: Icon, value, label, tone = 'text-[#1f7a57]' }) {
  return (
    <div className="surface-card p-3.5">
      <Icon className={`h-5 w-5 ${tone}`} />
      <p className="mt-3 text-2xl font-black leading-none text-[#17211d] tabular-nums">{value}</p>
      <p className="mt-1 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-[#6d756e]">{label}</p>
    </div>
  )
}

export default function ProfileScreen() {
  const [loggingOut, setLoggingOut] = useState(false)
  const navigate = useNavigate()
  const { canInstall, install } = usePwaInstall()
  const {
    xp, streak, lastPlayedDate,
    participantName,
    isGuestMode, setAuthUser,
  } = useGameStore()

  const xpPerLevel = GAME_CONFIG.xp.perLevel
  const level = Math.floor(xp / xpPerLevel) + 1
  const xpInLevel = xp % xpPerLevel
  const levelPct = Math.round((xpInLevel / xpPerLevel) * 100)

  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut()
    setAuthUser(null)
    setLoggingOut(false)
  }

  return (
    <div className="screen bg-[#f7f5ef] pb-28 lg:pb-12">
      <header className="brand-header px-5 pb-6 pt-5 lg:hidden">
        <div className="relative z-10 flex items-center justify-between gap-4">
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

          <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f7b076] to-[#f4a261] text-[#102f29] shadow-[0_8px_18px_rgba(244,162,97,0.35)]">
            <Medal className="h-7 w-7" />
          </div>
        </div>

        <div className="relative z-10 mt-5 rounded-2xl border border-white/10 bg-white/[0.08] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_45px_rgba(0,0,0,0.18)]">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-extrabold text-white">Progreso de nivel</p>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/55">{xpInLevel}/{xpPerLevel} XP</p>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/14">
            <div className="h-full rounded-full bg-[#9ddfc6] transition-[width] duration-500 ease-out" style={{ width: `${levelPct}%` }} />
          </div>
        </div>

        <div className="relative z-10 mt-3 flex items-center justify-between gap-2">
          <div className={`inline-flex min-w-0 items-center gap-2 rounded-md border px-3 py-2 text-xs font-extrabold ${
            isGuestMode
              ? 'border-white/15 bg-white/8 text-white/72'
              : 'border-[#9ddfc6]/25 bg-[#9ddfc6]/12 text-[#9ddfc6]'
          }`}>
            {isGuestMode ? <ShieldCheck className="h-4 w-4 shrink-0" /> : <Cloud className="h-4 w-4 shrink-0" />}
            <span className="truncate">{isGuestMode ? 'Sin cuenta vinculada' : 'Cuenta vinculada'}</span>
          </div>

          {isGuestMode && (
            <button
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-[#1f7a57] px-3 py-2 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(31,122,87,0.2)] transition active:scale-[0.99]"
              onClick={() => useGameStore.setState({ studyPhase: PHASES.ACCOUNT_PROMPT })}
            >
              <Cloud className="h-4 w-4" />
              Crear cuenta
            </button>
          )}
        </div>
      </header>

      <main className="space-y-5 px-5 pt-5 lg:mx-auto lg:max-w-[900px] lg:px-8 lg:pt-9">
        <div className="hidden lg:mb-1 lg:flex lg:items-center lg:justify-between">
          <div>
            <p className="text-[0.66rem] font-black uppercase tracking-[0.2em] text-[#6d756e]">Perfil</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-[#17211d]">{participantName || 'Estudiante'}</h1>
            <p className="mt-1.5 text-sm font-medium text-[#6d756e]">Nivel {level}</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f7b076] to-[#f4a261] text-[#102f29] shadow-[0_10px_22px_rgba(244,162,97,0.32)]">
            <Medal className="h-8 w-8" />
          </div>
        </div>
        {/* Solo lo que no vive en Logros: estrellas, lecciones, secciones e
            insignias son de esa pantalla y aquí solo duplicaban. */}
        <section className="grid grid-cols-3 gap-3">
          <StatCard icon={Zap} value={xp} label="XP total" tone="text-[#1f7a57]" />
          <StatCard icon={Flame} value={streak} label="Racha" tone="text-[#c77918]" />
          <StatCard icon={Heart} value={GAME_CONFIG.lives.max} label="Vidas por lección" tone="text-[#d94848]" />
        </section>

        {lastPlayedDate && (
          <p className="rounded-md border border-[#e3ded2] bg-white px-4 py-3 text-center text-sm font-medium text-[#6d756e] shadow-sm">
            Última sesión: {new Date(lastPlayedDate).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        )}

        {DONATION_ENABLED && (
          <button
            onClick={() => navigate('/donar')}
            className="flex w-full items-center gap-3 rounded-2xl border border-[#f4a261]/35 bg-[#fff6ec] p-4 text-left transition active:scale-[0.99]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f7b076] to-[#f4a261] text-[#102f29] shadow-[0_6px_16px_rgba(244,162,97,0.3)]">
              <Heart className="h-5 w-5 fill-current" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.92rem] font-black leading-tight text-[#17211d]">Apoya el proyecto</span>
              <span className="mt-1 block text-[0.76rem] font-semibold leading-snug text-[#6d756e]">
                Una donación mantiene la app gratis y sin anuncios.
              </span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-[#c77918]" />
          </button>
        )}

        <section className="space-y-2">
          {canInstall && (
            <button className="btn-3d btn-3d-primary text-sm" onClick={install}>
              <Download className="h-4 w-4" />
              Instalar app
            </button>
          )}

          {!isGuestMode && (
            <button
              className="btn-3d btn-3d-soft text-sm"
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
