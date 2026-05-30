import { useNavigate, useLocation } from 'react-router-dom'
import iconAlcohol from '../assets/alcohol.png'
import iconHealth from '../assets/health-monitoring.png'
import iconCalendar from '../assets/calendar-check.png'
import iconDoctor from '../assets/doctor.png'
import iconUser from '../assets/user.png'

const tabs = [
  { label: '오늘 측정', path: '/', icon: iconAlcohol },
  { label: '상태', path: '/status', icon: iconHealth },
  { label: '달력', path: '/calendar', icon: iconCalendar },
  { label: '건강 관리', path: '/health', icon: iconDoctor },
  { label: '마이페이지', path: '/mypage', icon: iconUser },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const hideOn = ['/login', '/signup']
  if (hideOn.includes(location.pathname)) return null

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex" style={{ backgroundColor: '#148917' }}>
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="flex-1 pt-3 pb-2 flex flex-col items-center gap-1 justify-start"
          >
            <img
              src={tab.icon}
              alt={tab.label}
              className={`w-7 h-7 object-contain ${isActive ? 'opacity-100' : 'opacity-50'}`}
            />
            <span className={`text-xs ${isActive ? 'font-bold text-white' : 'font-normal text-gray-300'}`}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
