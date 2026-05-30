import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/index.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const DUMMY_USER = { id: 1, email: 'test@test.com', password: '123456' }

  async function handleLogin() {
    if (!email || !password) return

    setSubmitting(true)
    try {
      // const { data } = await api.login({ email, password })
      // if (data?.success) {
      //   localStorage.setItem('user', JSON.stringify({ id: data.user_id, email: data.email }))
      //   navigate('/')
      // } else {
      //   alert('이메일 또는 비밀번호가 올바르지 않습니다.')
      // }

      if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
        localStorage.setItem('user', JSON.stringify({ id: DUMMY_USER.id, email: DUMMY_USER.email }))
        navigate('/')
      } else {
        alert('이메일 또는 비밀번호가 올바르지 않습니다.')
      }
    } catch {
      alert('이메일 또는 비밀번호가 올바르지 않습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4 relative">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
          aria-label="홈으로"
        >
          🏠
        </button>
        <h1 className="text-center text-base font-medium text-gray-900">
          음주 측정 모니터링
        </h1>
      </header>

      <main className="flex-1 flex flex-col justify-center p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">로그인</h2>

        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border-b border-gray-200 outline-none focus:bg-gray-50"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 outline-none focus:bg-gray-50"
          />
        </div>

        <button
          type="button"
          onClick={handleLogin}
          disabled={submitting || !email || !password}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 rounded-xl transition-colors mb-3"
        >
          {submitting ? '로그인 중...' : '로그인'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="w-full bg-white border border-blue-500 text-blue-500 font-medium py-3 rounded-xl transition-colors"
        >
          회원가입
        </button>
      </main>
    </div>
  )
}
