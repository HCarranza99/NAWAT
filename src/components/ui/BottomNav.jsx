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
    <nav className="bottom-nav" aria-label="Navegación principal">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        
        // Special render for center tab
        if (tab.id === 'home') {
          return (
            <button
              key={tab.id}
              className={`bottom-nav-tab tab-center ${isActive ? 'tab-active' : ''}`}
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="tab-center-inner">
                <div className="tab-center-circle">
                  <Torogoz emotion="idle" size={48} />
                </div>
              </div>
            </button>
          )
        }

        // Normal tabs
        return (
          <button
            key={tab.id}
            className={`bottom-nav-tab ${isActive ? 'tab-active' : ''}`}
            onClick={() => navigate(tab.path)}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
