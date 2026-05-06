import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Layers3, UserRound } from 'lucide-react'

const tabs = [
  { id: 'home', label: 'Inicio', icon: Home, path: '/' },
  { id: 'sections', label: 'Secciones', shortLabel: 'Ruta', icon: Layers3, path: '/sections' },
  { id: 'profile', label: 'Perfil', icon: UserRound, path: '/profile' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const hidden = location.pathname.startsWith('/section/') ||
    location.pathname.startsWith('/lesson/') ||
    location.pathname === '/result'
  if (hidden) return null

  const activeTab = tabs.find((tab) => tab.path === location.pathname)?.id || 'home'

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(480px-32px)] max-w-[calc(100vw-32px)] -translate-x-1/2">
      <nav
        className="grid grid-cols-3 gap-1 rounded-lg border border-black/10 bg-[#102f29]/94 p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl"
        aria-label="Navegación principal"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-md text-[0.68rem] font-extrabold uppercase tracking-[0.08em] transition ${
                isActive
                  ? 'bg-white text-[#102f29] shadow-sm'
                  : 'text-white/62 hover:bg-white/8 hover:text-white'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" strokeWidth={2.4} />
              <span className="leading-none">{tab.shortLabel || tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
