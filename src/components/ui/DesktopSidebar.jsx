import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Home, Layers3, UserRound, Flame, Heart, Sparkles, Trophy } from 'lucide-react'

import useGameStore from '../../store/useGameStore'
import { GAME_CONFIG } from '../../data/gameConfig'
import TorogozBadge from './TorogozBadge'

const navItems = [
  { id: 'home', label: 'Inicio', icon: Home, path: '/' },
  { id: 'sections', label: 'Secciones', icon: Layers3, path: '/sections' },
  { id: 'profile', label: 'Perfil', icon: UserRound, path: '/profile' },
]

export default function DesktopSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const { xp, lives, streak, participantName } = useGameStore()
  const firstName = participantName ? participantName.split(' ')[0] : 'Estudiante'

  const xpPerLevel = GAME_CONFIG.xp.perLevel
  const level = Math.floor(xp / xpPerLevel) + 1
  const xpInLevel = xp % xpPerLevel
  const levelPct = Math.min(100, Math.round((xpInLevel / xpPerLevel) * 100))

  const activeId = navItems.find((item) => item.path === location.pathname)?.id || 'home'

  return (
    <aside className="brand-header hidden h-svh w-[268px] shrink-0 flex-col rounded-none px-5 pb-6 pt-7 lg:flex">
      {/* Marca */}
      <button
        onClick={() => navigate('/')}
        className="relative z-10 flex items-center gap-3 text-left"
        aria-label="Ir a inicio"
      >
        <TorogozBadge size={46} />
        <div>
          <p className="flex items-center gap-1.5 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[#9ddfc6]">
            <Sparkles className="h-3 w-3" />
            Aprende
          </p>
          <h1 className="mt-0.5 text-2xl font-black leading-none">Náhuat</h1>
        </div>
      </button>

      {/* Saludo */}
      <p className="relative z-10 mt-6 text-sm font-semibold text-white/65">
        Hola, <span className="font-black text-white">{firstName}</span>
      </p>

      {/* Navegación */}
      <nav className="relative z-10 mt-5 flex flex-col gap-1.5" aria-label="Navegación principal">
        {navItems.map((item) => {
          const isActive = activeId === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold transition-colors"
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebarPill"
                  transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                  className="absolute inset-0 rounded-2xl bg-white shadow-[0_6px_16px_rgba(0,0,0,0.22)]"
                />
              )}
              <span className={`relative z-10 flex items-center gap-3 ${isActive ? 'text-brand-forest' : 'text-white/70'}`}>
                <Icon className="h-[20px] w-[20px]" strokeWidth={2.5} />
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>

      <div className="flex-1" />

      {/* Bloque de progreso */}
      <div className="relative z-10 space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#f7b076] to-[#f4a261] text-[#102f29]">
                <Trophy className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[0.56rem] font-bold uppercase tracking-[0.14em] text-white/50">Nivel</p>
                <p className="text-lg font-black leading-none">{level}</p>
              </div>
            </div>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white/55">
              {xpInLevel}/{xpPerLevel} XP
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/14">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelPct}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="h-full rounded-full bg-[#9ddfc6]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="glass-chip flex items-center gap-2 px-3 py-2.5">
            <Heart className="h-4 w-4 text-[#ff8b8b]" />
            <div>
              <p className="text-[0.54rem] font-bold uppercase leading-none tracking-[0.14em] text-white/55">Vidas</p>
              <p className="mt-1 text-sm font-extrabold leading-none">{lives}</p>
            </div>
          </div>
          <div className="glass-chip flex items-center gap-2 px-3 py-2.5">
            <Flame className="h-4 w-4 text-[#ffb15f]" />
            <div>
              <p className="text-[0.54rem] font-bold uppercase leading-none tracking-[0.14em] text-white/55">Racha</p>
              <p className="mt-1 text-sm font-extrabold leading-none">{streak} d</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
