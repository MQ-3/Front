import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import StatusPage from './pages/StatusPage'
import TodayPage from './pages/TodayPage'
import CalendarPage from './pages/CalendarPage'
import HealthPage from './pages/HealthPage'
import MyPage from './pages/MyPage'

function PlaceholderPage({ title }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center pb-20 text-gray-500">
      {title} (준비 중)
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StatusPage />} />
        <Route path="/today" element={<TodayPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/health" element={<HealthPage />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  )
}
