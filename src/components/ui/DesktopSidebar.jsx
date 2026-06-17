import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Home, Layers3, Trophy, UserRound, Sparkles, Star } from 'lucide-react'

import useGameStore from '../../store/useGameStore'
import TorogozBadge from './TorogozBadge'

const navItems = [
  { id: 'home', label: 'Inicio', icon: Home, path: '/' },
  { id: 'sections', label: 'Secciones', icon: Layers3, path: '/sections' },
  { id: 'logros', label: 'Logros', icon: Trophy, path: '/logros' },
  { id: 'profile', label: 'Perfil', icon: UserRound, path: '/profile' },
]

export default function DesktopSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const { participantName } = useGameStore()
  const firstName = participantName ? participantName.split(' ')[0] : 'Estudiante'

  const activeId = navItems.find((item) => item.path === location.pathname)?.id || 'home'

  return (
    <aside className="brand-header relative hidden h-svh w-[284px] shrink-0 flex-col rounded-none px-5 pb-6 pt-7 lg:flex">
      {/* Decoración de selva + pirámide (sutil, al fondo) */}
      <SidebarDecor />

      {/* Marca */}
      <button
        onClick={() => navigate('/')}
        className="relative z-10 flex items-center gap-3 text-left"
        aria-label="Ir a inicio"
      >
        <TorogozBadge size={50} />
        <div>
          <p className="flex items-center gap-1.5 text-[0.58rem] font-bold uppercase tracking-[0.2em] text-[#9ddfc6]">
            <Sparkles className="h-3 w-3" />
            Aprende
          </p>
          <h1 className="mt-0.5 text-2xl font-black leading-none">Nawat</h1>
        </div>
      </button>

      {/* Tarjeta de usuario */}
      <div className="relative z-10 mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2fae7e] to-[#1f7a57] text-white shadow-[0_4px_12px_rgba(31,122,87,0.4)]">
          <UserRound className="h-5 w-5" strokeWidth={2.4} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-black leading-tight">Hola, {firstName}</p>
          <p className="mt-0.5 text-[0.72rem] font-semibold text-[#9ddfc6]">¡Qué bueno verte!</p>
        </div>
      </div>

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

      {/* Tarjeta motivadora */}
      <div className="relative z-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f7b076] to-[#f4a261] text-[#102f29] shadow-[0_6px_16px_rgba(244,162,97,0.4)]">
          <Star className="h-5 w-5 fill-current" />
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[0.82rem] font-black leading-tight">
            ¡Sigue aprendiendo! <Sparkles className="h-3 w-3 text-[#9ddfc6]" />
          </p>
          <p className="mt-1 text-[0.68rem] font-semibold leading-snug text-white/55">
            Cada palabra te acerca a dominar el Náhuat.
          </p>
        </div>
      </div>
    </aside>
  )
}

/* Decoración de hojas y pirámide al pie del sidebar */
function SidebarDecor() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 284 220"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-56 w-full opacity-[0.5]"
      preserveAspectRatio="xMidYMax slice"
    >
      {/* Pirámide escalonada */}
      <g fill="#0b231e" opacity="0.55">
        <path d="M142 96 L210 220 L74 220 Z" />
        <rect x="118" y="150" width="48" height="70" fill="#091d19" />
        <rect x="132" y="150" width="20" height="20" fill="#0b231e" />
      </g>
      {/* Hojas */}
      <g fill="#16463a" opacity="0.7">
        <path d="M0 220 C 30 150 70 140 96 150 C 60 165 40 195 36 220 Z" />
        <path d="M284 220 C 250 140 205 135 182 150 C 222 168 240 196 246 220 Z" />
        <path d="M24 220 C 40 175 78 168 102 178 C 70 188 52 205 52 220 Z" fill="#1f7a57" opacity="0.5" />
      </g>
      {/* Nervaduras de hoja */}
      <g stroke="#52b788" strokeWidth="1.4" opacity="0.45" fill="none">
        <path d="M14 214 C 36 180 64 168 92 158" />
        <path d="M270 214 C 244 178 214 166 188 158" />
      </g>
    </svg>
  )
}
