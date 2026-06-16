import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Home, Route, Trophy, UserRound } from 'lucide-react'

import { useIsDesktop } from '../../hooks/useMediaQuery'

const tabs = [
  { id: 'home', label: 'Inicio', icon: Home, path: '/' },
  { id: 'sections', label: 'Secciones', shortLabel: 'Ruta', icon: Route, path: '/sections' },
  { id: 'logros', label: 'Logros', icon: Trophy, path: '/logros' },
  { id: 'profile', label: 'Perfil', icon: UserRound, path: '/profile' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()

  const hidden = isDesktop ||
    location.pathname.startsWith('/section/') ||
    location.pathname.startsWith('/lesson/') ||
    location.pathname === '/result'
  if (hidden) return null

  const activeTab = tabs.find((tab) => tab.path === location.pathname)?.id || 'home'

  return (
    <div className="fixed bottom-3 left-1/2 z-50 w-[calc(480px-28px)] max-w-[calc(100vw-28px)] -translate-x-1/2 lg:hidden">
      <nav
        className="relative grid grid-cols-4 gap-1 rounded-[1.4rem] border border-white/10 bg-brand-forest/92 p-1.5 shadow-[0_18px_40px_rgba(16,47,41,0.35)] backdrop-blur-xl"
        aria-label="Navegación principal"
      >
        <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="relative flex h-[52px] min-w-0 flex-col items-center justify-center gap-0.5 rounded-2xl text-[0.62rem] font-extrabold uppercase tracking-[0.06em] transition-colors"
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="navPill"
                  transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                  className="absolute inset-0 rounded-2xl bg-white shadow-[0_6px_16px_rgba(0,0,0,0.22)]"
                />
              )}
              <span className={`relative z-10 flex flex-col items-center gap-0.5 ${isActive ? 'text-brand-forest' : 'text-white/60'}`}>
                <span className="relative">
                  <Icon className="h-[19px] w-[19px]" strokeWidth={2.5} />
                  {isActive && <span className="absolute -right-1.5 -top-1 h-2 w-2 rounded-full bg-[#f4a261] ring-2 ring-white" />}
                </span>
                <span className="leading-none">{tab.shortLabel || tab.label}</span>
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
