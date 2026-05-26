import { useEffect, useState } from 'react'

const DUMMY_LOGGED_IN = false
// true / false 로 비로그인·로그인 화면 테스트

const DUMMY_USER = {
  id: 1,
  email: 'ha@test.com',
}

const DUMMY_LOGIN = {
  email: 'ha@test.com',
  password: '123456',
}

const DUMMY_REGISTERED_EMAILS = ['taken@test.com']
// 회원가입 시 "이미 사용 중" 테스트용

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

function ModalBackdrop({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  )
}

export default function MyPage() {
  const [user, setUser] = useState(null)
  const [modal, setModal] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // const stored = localStorage.getItem('user')
    // if (stored) {
    //   try {
    //     setUser(JSON.parse(stored))
    //   } catch {
    //     localStorage.removeItem('user')
    //   }
    // }

    if (DUMMY_LOGGED_IN) {
      localStorage.setItem('user', JSON.stringify(DUMMY_USER))
      setUser(DUMMY_USER)
    } else {
      localStorage.removeItem('user')
      setUser(null)
    }
  }, [])

  function openLoginModal() {
    setEmail('')
    setPassword('')
    setPasswordConfirm('')
    setModal('login')
  }

  function openSignupModal() {
    setEmail('')
    setPassword('')
    setPasswordConfirm('')
    setModal('signup')
  }

  function closeModal() {
    setModal(null)
    setEmail('')
    setPassword('')
    setPasswordConfirm('')
  }

  function saveUser(userData) {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  function clearUser() {
    localStorage.removeItem('user')
    setUser(null)
  }

  async function handleLogin() {
    setSubmitting(true)
    try {
      // const { data } = await api.login({ email, password })
      // if (data?.success && data.user) {
      //   saveUser(data.user)
      //   closeModal()
      // } else {
      //   alert('이메일 또는 비밀번호가 틀렸습니다.')
      // }

      if (email === DUMMY_LOGIN.email && password === DUMMY_LOGIN.password) {
        saveUser({ ...DUMMY_USER, email })
        closeModal()
      } else {
        alert('이메일 또는 비밀번호가 틀렸습니다.')
      }
    } catch {
      alert('이메일 또는 비밀번호가 틀렸습니다.')
    } finally {
      setSubmitting(false)
    }
  }

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
      //   closeModal()
      //   alert('회원가입이 완료되었습니다. 로그인해주세요.')
      // } else {
      //   alert('이미 사용 중인 이메일입니다.')
      // }

      const isDuplicate =
        email === DUMMY_LOGIN.email ||
        DUMMY_REGISTERED_EMAILS.includes(email)

      if (isDuplicate) {
        alert('이미 사용 중인 이메일입니다.')
        return
      }

      closeModal()
      alert('회원가입이 완료되었습니다. 로그인해주세요.')
    } catch {
      alert('이미 사용 중인 이메일입니다.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm('정말 탈퇴하시겠습니까?')) return

    try {
      // const { data } = await api.deleteAccount(user.id)
      // if (data?.success) {
      //   clearUser()
      // }

      clearUser()
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
              <p className="text-gray-500 text-sm mt-1">회원</p>
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
                  onClick={openLoginModal}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  로그인
                </button>
                <button
                  type="button"
                  onClick={openSignupModal}
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
              <span role="img" aria-hidden="true">
                🗑️
              </span>
              회원 탈퇴
            </button>
          </section>
        )}
      </main>

      {modal === 'login' && (
        <ModalBackdrop onClose={closeModal}>
          <h2 className="text-lg font-bold text-gray-900 mb-4">로그인</h2>
          <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden mb-6">
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
              className="w-full px-4 py-3 outline-none focus:bg-gray-50"
            />
          </div>
          <div className="flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="text-gray-500 font-medium px-2 py-1"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleLogin}
              disabled={submitting}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium px-5 py-2 rounded-lg transition-colors"
            >
              로그인
            </button>
          </div>
        </ModalBackdrop>
      )}

      {modal === 'signup' && (
        <ModalBackdrop onClose={closeModal}>
          <h2 className="text-lg font-bold text-gray-900 mb-4">회원가입</h2>
          <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden mb-2">
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
          <div className="flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="text-gray-500 font-medium px-2 py-1"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSignup}
              disabled={submitting}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium px-5 py-2 rounded-lg transition-colors"
            >
              가입하기
            </button>
          </div>
        </ModalBackdrop>
      )}
    </div>
  )
}
