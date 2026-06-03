import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
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

function LoginOverlay() {
  const navigate = useNavigate()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 pb-20">
      <div className="bg-white rounded-2xl w-72 p-8 flex flex-col items-center text-center shadow-lg">
        <span className="text-4xl mb-4">🔒</span>
        <h2 className="text-lg font-bold text-gray-900 mb-2">로그인이 필요합니다</h2>
        <p className="text-sm text-gray-500 mb-6">로그인하고 기록을 확인하세요</p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition-colors"
        >
          로그인하기
        </button>
      </div>
    </div>
  )
}

function RequireAuth({ children }) {
  try {
    const stored = localStorage.getItem('user')
    if (!stored) {
      return (
        <div className="relative">
          <div className="pointer-events-none select-none blur-sm">{children}</div>
          <LoginOverlay />
        </div>
      )
    }
  } catch {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none blur-sm">{children}</div>
        <LoginOverlay />
      </div>
    )
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<TodayPage />} />
        <Route path="/status" element={<RequireAuth><StatusPage /></RequireAuth>} />
        <Route path="/calendar" element={<RequireAuth><CalendarPage /></RequireAuth>} />
        <Route path="/health" element={<RequireAuth><HealthPage /></RequireAuth>} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile-setup" element={<ProfileSetupPage />} />
        <Route path="/profile-edit" element={<ProfileEditPage />} />
        <Route path="/shorts" element={<ShortsPage />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  )
}
