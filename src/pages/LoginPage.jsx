import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/index.js'
import sulchinguImg from '../assets/술친구.png'

// ─── 더미 유저 (임시) — 내일 삭제 ───────────────────────────────────────────
const DUMMY_USER = { email: 'test@test.com', password: '1234', id: 1 }
// ────────────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email || !password) return
    setSubmitting(true)
    setError('')

    // ─── 더미 유저 로그인 (임시) — 내일 삭제 ─────────────────────────────
    if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
      localStorage.setItem('user', JSON.stringify({ id: DUMMY_USER.id, email: DUMMY_USER.email }))
      setSubmitting(false)
      navigate('/')
      return
    }
    // ──────────────────────────────────────────────────────────────────────

    try {
      const { data } = await api.login({ email, password })
      if (data?.success) {
        localStorage.setItem('user', JSON.stringify({ id: data.user.id, email: data.user.email }))
        navigate('/')
      } else {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      }
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-[#1db520] via-[#148917] to-[#0a5c0e]">

      {/* 타이틀 */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-bold text-white tracking-tight">술친구</h1>
        <img src={sulchinguImg} alt="술친구" className="w-[168px] h-[168px] mx-auto object-contain" />
        <p className="text-green-200 text-lg">음주 측정 모니터링 서비스</p>
      </div>

      {/* 카드 */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4">

        {/* 입력 */}
        <div className="space-y-3">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
        </div>

        {/* 에러 */}
        {error && (
          <p className="text-red-500 text-xs text-center">{error}</p>
        )}

        {/* 회원가입 · 비밀번호 찾기 */}
        <div className="flex justify-center gap-6 text-sm">
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            회원가입
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            비밀번호 찾기
          </button>
        </div>

        {/* 로그인 버튼 */}
        <button
          type="button"
          onClick={handleLogin}
          disabled={submitting || !email || !password}
          className="w-full text-white font-medium py-3.5 rounded-xl transition-colors disabled:opacity-50"
          style={{ backgroundColor: '#148917' }}
        >
          {submitting ? '로그인 중...' : '로그인하기'}
        </button>
      </div>
    </div>
  )
}
