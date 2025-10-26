import { Link, useLocation } from 'react-router-dom'
import { Card } from '@nextui-org/react'
import { Home, BarChart3, Target, Activity, AlertTriangle, X } from 'lucide-react'

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation()

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/summary', icon: BarChart3, label: 'Summary' },
    { path: '/simulator', icon: Target, label: 'Simulator' },
    { path: '/health', icon: Activity, label: 'Health Check' },
    { path: '/alerts', icon: AlertTriangle, label: 'Alerts' },
  ]

  return (
    <aside
      className={`
        bg-white border-r border-gray-200 transition-all duration-300 
        hidden md:block
        ${isOpen ? 'w-64' : 'w-20'}
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        <h1 className={`font-bold text-banorte-red ${isOpen ? 'text-xl' : 'text-sm'}`}>
          {isOpen ? 'CFO Virtual' : 'CFO'}
        </h1>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link key={item.path} to={item.path}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-banorte-red text-white shadow-banorte'
                    : 'hover:bg-gray-100 text-banorte-gray'
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className={`font-medium ${!isOpen && 'hidden'}`}>{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
