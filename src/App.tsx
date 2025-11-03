import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppStore } from './stores/appStore'

// Routes
import OnboardingPage from './routes/Onboarding'
import ScanPage from './routes/Scan'
import SubscriptionsPage from './routes/Subscriptions'
import GroupDetailPage from './routes/GroupDetail'
import ActivityPage from './routes/Activity'
import SettingsPage from './routes/Settings'
import ReportPage from './routes/Report'
import OAuthCallback from './routes/OAuthCallback'
import PrivacyPage from './routes/Privacy'
import TermsPage from './routes/Terms'
import SecurityPage from './routes/Security'

function App() {
  const { isAuthenticated, checkAuth, theme, setTheme } = useAppStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Apply theme
  useEffect(() => {
    setTheme(theme)
  }, [theme, setTheme])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          {/* OAuth callback */}
          <Route path="/oauth/callback" element={<OAuthCallback />} />

          {/* Public routes */}
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/security" element={<SecurityPage />} />

          {/* Protected routes */}
          {isAuthenticated ? (
            <>
              <Route path="/" element={<Navigate to="/subscriptions" replace />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/subscriptions" element={<SubscriptionsPage />} />
              <Route path="/groups" element={<SubscriptionsPage />} />
              <Route path="/group/:id" element={<GroupDetailPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/report" element={<ReportPage />} />
            </>
          ) : (
            <>
              <Route path="/" element={<OnboardingPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
