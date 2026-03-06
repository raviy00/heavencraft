import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import PublicLayout from './layouts/PublicLayout'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import SupportPage from './pages/SupportPage'
import DonatePage from './pages/DonatePage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardPage from './pages/DashboardPage'
import ServerInfoPage from './pages/ServerInfoPage'
import ModsPage from './pages/ModsPage'
import StatsPage from './pages/StatsPage'
import LeaderboardPage from './pages/LeaderboardPage'

// Protect dashboard routes
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? children : <Navigate to="/" replace />
}

// Full-screen loading state while auth is being checked
function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#04090f' }}
    >
      <div className="text-center">
        <div
          className="p-3 rounded-xl inline-flex mb-4"
          style={{
            background: '#258cf4',
            boxShadow: '0 0 30px rgba(37,140,244,0.4)',
          }}
        >
          <span
            className="material-symbols-outlined text-white"
            style={{ fontSize: '2rem' }}
          >
            deployed_code
          </span>
        </div>
        <div
          className="w-6 h-6 border-2 rounded-full mx-auto"
          style={{
            borderColor: 'rgba(37,140,244,0.3)',
            borderTopColor: '#258cf4',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
    </div>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <Routes>
      {/* OAuth Callback — must be outside layouts */}
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Public Pages */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <PublicLayout />}
      >
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="donate" element={<DonatePage />} />
      </Route>

      {/* Dashboard */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="server-info" element={<ServerInfoPage />} />
        <Route path="mods" element={<ModsPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
