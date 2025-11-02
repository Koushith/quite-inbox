import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAppStore()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <header className="border-b bg-white sticky top-0 z-10 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate('/subscriptions')}
            className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
          >
            SubZero
          </button>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => navigate('/subscriptions')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/subscriptions')
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Subscriptions
            </button>
            <button
              onClick={() => navigate('/activity')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/activity')
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => navigate('/settings')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/settings')
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/scan')}
            className="hidden sm:flex"
          >
            Scan Inbox
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
