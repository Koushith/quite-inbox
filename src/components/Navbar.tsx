import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { Button } from '@/components/ui/button'
import { Mail, Activity, Settings, Scan, LogOut, Bug } from 'lucide-react'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAppStore()

  const isActive = (path: string) => {
    // Exact match for the main path
    if (location.pathname === path) return true
    // Check if it's a sub-route (e.g., /subscriptions/detail)
    if (location.pathname.startsWith(path + '/')) return true
    return false
  }

  return (
    <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/subscriptions')}
            className="text-lg sm:text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors flex items-center gap-2"
          >
            <span className="text-2xl">📭</span>
            <span>QuitInbox</span>
          </button>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => navigate('/subscriptions')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                isActive('/subscriptions')
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Subscriptions</span>
            </button>
            <button
              onClick={() => navigate('/activity')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                isActive('/activity')
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Activity</span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                isActive('/settings')
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => navigate('/report')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                isActive('/report')
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Bug className="w-4 h-4" />
              <span>Report</span>
            </button>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/scan')}
            className="hidden sm:flex items-center gap-2 font-semibold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
          >
            <Scan className="w-4 h-4" />
            <span>Scan Inbox</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="flex items-center gap-2 font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
