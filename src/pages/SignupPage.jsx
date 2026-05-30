import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/index.js'

export default function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSignup() {
    if (password.length < 6) {
      alert('비밀번호는 6자 이상이어야 합니다.')
      return
    }
    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }

    setSubmitting(true)
    try {
      // const { data } = await api.register({ email, password })
      // if (data?.success) {
      //   alert('회원가입이 완료되었습니다. 로그인해주세요.')
      //   navigate('/login')
      // } else {
      //   alert('이미 사용 중인 이메일입니다.')
      // }

      alert('회원가입이 완료되었습니다. 로그인해주세요.')
      navigate('/login')
    } catch {
      alert('이미 사용 중인 이메일입니다.')
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
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">회원가입</h2>

        <div className="border border-gray-200 rounded-lg overflow-hidden mb-2">
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
            className="w-full px-4 py-3 border-b border-gray-200 outline-none focus:bg-gray-50"
          />
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="w-full px-4 py-3 outline-none focus:bg-gray-50"
          />
        </div>
        <p className="text-xs text-gray-400 mb-6">6자 이상 입력해주세요</p>

        <button
          type="button"
          onClick={handleSignup}
          disabled={submitting || !email || !password || !passwordConfirm}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 rounded-xl transition-colors mb-3"
        >
          {submitting ? '가입 중...' : '가입하기'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full bg-white border border-gray-300 text-gray-500 font-medium py-3 rounded-xl transition-colors"
        >
          로그인으로 돌아가기
        </button>
      </main>
    </div>
  )
}
