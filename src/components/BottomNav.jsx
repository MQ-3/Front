import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { label: '오늘 측정', path: '/' },
  { label: '상태', path: '/status' },
  { label: '달력', path: '/calendar' },
  { label: '건강 관리', path: '/health' },
  { label: '마이페이지', path: '/mypage' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const hideOn = ['/login', '/signup']
  if (hideOn.includes(location.pathname)) return null

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] border-t bg-white flex">
      {tabs.map(tab => (
        <button
          key={tab.path}
          onClick={() => navigate(tab.path)}
          className={`flex-1 py-3 text-xs ${location.pathname === tab.path ? 'text-blue-500 font-bold' : 'text-gray-400'}`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}