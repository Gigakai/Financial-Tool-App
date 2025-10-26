import { Link, useLocation } from 'react-router-dom'
import { Badge } from '@nextui-org/react'
import { Home, BarChart3, AlertTriangle, Activity, Bot } from 'lucide-react'

const BottomNav = ({ onChatClick }) => {
  const location = useLocation()

  const leftNavItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/summary', icon: BarChart3, label: 'Resumen' },
  ]

  const rightNavItems = [
    { path: '/alerts', icon: AlertTriangle, label: 'Alertas', badge: 3 },
    { path: '/health', icon: Activity, label: 'Salud' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Left Navigation Items */}
        {leftNavItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative"
            >
              <div className={`transition-colors ${isActive ? 'text-banorte-red' : 'text-gray-500'}`}>
                <Icon size={24} strokeWidth={1.5} />
              </div>
              <span className={`text-xs ${isActive ? 'text-banorte-red font-semibold' : 'text-gray-500'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-banorte-red rounded-b-full" />
              )}
            </Link>
          )
        })}
        
        {/* AI Chat Button - Centro */}
        <button
          onClick={onChatClick}
          className="flex-1 flex flex-col items-center justify-center gap-1 relative group"
        >
          <div className="w-14 h-14 -mt-8 bg-gradient-to-br from-banorte-red to-red-700 rounded-full flex items-center justify-center shadow-2xl group-active:scale-95 transition-transform">
            <Bot size={28} strokeWidth={2} className="text-white animate-pulse" />
            {/* Shine effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-xs text-banorte-red font-bold mt-1">Chat IA</span>
        </button>

        {/* Right Navigation Items */}
        {rightNavItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative"
            >
              <div className={`transition-colors ${isActive ? 'text-banorte-red' : 'text-gray-500'}`}>
                {item.badge ? (
                  <Badge content={item.badge} color="danger" size="sm" className="scale-75">
                    <Icon size={24} strokeWidth={1.5} />
                  </Badge>
                ) : (
                  <Icon size={24} strokeWidth={1.5} />
                )}
              </div>
              <span className={`text-xs ${isActive ? 'text-banorte-red font-semibold' : 'text-gray-500'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-banorte-red rounded-b-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
