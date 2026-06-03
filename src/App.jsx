import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import BottomNav from './components/BottomNav'
import TodayPage from './pages/TodayPage'
import StatusPage from './pages/StatusPage'
import CalendarPage from './pages/CalendarPage'
import HealthPage from './pages/HealthPage'
import MyPage from './pages/MyPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfileSetupPage from './pages/ProfileSetupPage'
import ProfileEditPage from './pages/ProfileEditPage'
import ShortsPage from './pages/ShortsPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function RequireAuth({ children }) {
  try {
    const stored = localStorage.getItem('user')
    if (!stored) return <Navigate to="/login" replace />
  } catch {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<RequireAuth><TodayPage /></RequireAuth>} />
        <Route path="/status" element={<RequireAuth><StatusPage /></RequireAuth>} />
        <Route path="/calendar" element={<RequireAuth><CalendarPage /></RequireAuth>} />
        <Route path="/health" element={<RequireAuth><HealthPage /></RequireAuth>} />
        <Route path="/mypage" element={<RequireAuth><MyPage /></RequireAuth>} />
        <Route path="/shorts" element={<RequireAuth><ShortsPage /></RequireAuth>} />
        <Route path="/profile-edit" element={<RequireAuth><ProfileEditPage /></RequireAuth>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile-setup" element={<ProfileSetupPage />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  )
}
