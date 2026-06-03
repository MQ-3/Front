import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/index.js'
import rabbitImg from '../assets/술친구토끼.png'

export default function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup() {
    setError('')
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setSubmitting(true)
    try {
      const { data } = await api.register({ email, password })
      if (data?.success) {
        localStorage.setItem('user', JSON.stringify({ id: data.user.id, email: data.user.email }))
        navigate('/profile-setup')
      } else {
        setError('이미 사용 중인 이메일입니다.')
      }
    } catch {
      setError('이미 사용 중인 이메일입니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-[#1db520] via-[#148917] to-[#0a5c0e]">

      {/* 뒤로가기 */}
      <button
        type="button"
        onClick={() => navigate('/login')}
        className="absolute top-5 left-5 text-white text-xl"
        aria-label="뒤로가기"
      >
        ←
      </button>

      {/* 타이틀 */}
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">회원가입</h1>
      </div>

      {/* 카드 */}
      <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-2xl p-6 space-y-4">

        {/* 토끼 이미지 */}
        <div className="flex justify-center">
          <img src={rabbitImg} alt="술친구 토끼" className="w-35 h-35 object-contain" />
        </div>

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
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
        </div>

        {/* 에러 */}
        {error && (
          <p className="text-red-500 text-xs text-center">{error}</p>
        )}

        {/* 가입 버튼 */}
        <button
          type="button"
          onClick={handleSignup}
          disabled={submitting || !email || !password || !passwordConfirm}
          className="w-full text-white font-medium py-3.5 rounded-xl transition-colors disabled:opacity-50"
          style={{ backgroundColor: '#148917' }}
        >
          {submitting ? '가입 중...' : '가입하기'}
        </button>
      </div>
    </div>
  )
}
