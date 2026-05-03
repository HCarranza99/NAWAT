import { useLocation, useNavigate } from 'react-router-dom'
import Torogoz from './Torogoz'

const tabs = [
  { id: 'sections', label: 'Secciones', icon: '📚', path: '/sections' },
  { id: 'home',     label: 'Inicio',    icon: '🏠', path: '/' },
  { id: 'profile',  label: 'Perfil',    icon: '👤', path: '/profile' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  // Don't show on lesson screens or result screens
  const hidden = location.pathname.startsWith('/section/') ||
                 location.pathname.startsWith('/lesson/') ||
                 location.pathname === '/result'
  if (hidden) return null

  const activeTab = tabs.find((t) => t.path === location.pathname)?.id || 'home'

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-[68px] flex items-end justify-around bg-primary rounded-t-[24px] z-[100] shadow-[0_-4px_20px_rgba(29,73,54,0.25)] px-5 pb-[calc(12px+env(safe-area-inset-bottom,0px))]"
      aria-label="Navegación principal"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id

        if (tab.id === 'home') {
          return (
            <button
              key={tab.id}
              type="button"
              className="group relative h-auto p-0 -top-6 cursor-pointer flex flex-col items-center justify-center min-w-16 bg-transparent border-0"
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="w-[72px] h-[72px] rounded-full bg-background flex items-center justify-center p-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.15)] transition-transform duration-200 group-active:scale-[0.94]">
                <div
                  className={`w-full h-full rounded-full border-2 border-accent flex items-center justify-center text-white text-[1.8rem] ${
                    isActive
                      ? 'bg-gradient-to-br from-primary to-[#3a8461] shadow-[inset_0_0_0_2px_var(--nahuat-green-pale)]'
                      : 'bg-primary'
                  }`}
                >
                  <Torogoz emotion="idle" size={48} />
                </div>
              </div>
            </button>
          )
        }

        return (
          <button
            key={tab.id}
            type="button"
            className="flex flex-col items-center justify-center gap-1 py-1.5 px-3 min-w-16 h-full relative cursor-pointer bg-transparent border-0 transition-all duration-200 active:scale-[0.92]"
            onClick={() => navigate(tab.path)}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span
              className={`text-[1.3rem] leading-none transition-transform duration-200 ${
                isActive ? 'scale-115 text-white' : 'text-white/60'
              }`}
            >
              {tab.icon}
            </span>
            <span
              className={`text-[0.65rem] tracking-[0.3px] transition-colors duration-200 ${
                isActive ? 'text-white font-bold' : 'text-white/60 font-semibold'
              }`}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
