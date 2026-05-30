import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/index.js'

function ProfileIcon({ loggedIn }) {
  return (
    <div
      className={`w-24 h-24 rounded-full flex items-center justify-center ${
        loggedIn ? 'bg-blue-500' : 'bg-gray-200'
      }`}
    >
      <svg
        className={`w-12 h-12 ${loggedIn ? 'text-white' : 'text-gray-400'}`}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    </div>
  )
}

export default function MyPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('user')
      }
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem('user')
    setUser(null)
  }

  async function handleDeleteAccount() {
    if (!window.confirm('정말 탈퇴하시겠습니까?')) return

    try {
      const { data } = await api.deleteAccount(user.id)
      if (data?.success) {
        localStorage.removeItem('user')
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to delete account:', error)
    }
  }

  const emailInitial = user?.email?.charAt(0) ?? ''

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <header className="bg-white border-b border-gray-200 py-4">
        <h1 className="text-center text-base font-medium text-gray-900">
          음주 측정 모니터링
        </h1>
      </header>

      <main className="p-4 space-y-4">
        <section className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center text-center">
          <ProfileIcon loggedIn={!!user} />

          {user ? (
            <>
              <p className="text-3xl font-bold text-gray-900 mt-5">
                {emailInitial}
              </p>
              <p className="text-gray-500 text-sm mt-1">{user.email}</p>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-gray-900 mt-5">
                로그인이 필요합니다
              </h2>
              <p className="text-gray-500 text-sm mt-2 mb-6">
                로그인하고 음주 기록을 관리하세요
              </p>
              <div className="w-full space-y-3">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  로그인
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="w-full bg-white border border-blue-500 text-blue-500 font-medium py-3 rounded-xl transition-colors"
                >
                  회원가입
                </button>
              </div>
            </>
          )}
        </section>

        {user && (
          <section className="bg-white rounded-2xl shadow-sm p-4">
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-center gap-2 border border-red-400 text-red-500 font-medium py-3 rounded-xl hover:bg-red-50 transition-colors"
            >
              <span role="img" aria-hidden="true">🗑️</span>
              회원 탈퇴
            </button>
          </section>
        )}
      </main>
    </div>
  )
}
