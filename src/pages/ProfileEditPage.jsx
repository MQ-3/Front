import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/index.js'

export default function ProfileEditPage() {
  const navigate = useNavigate()
  const [weight, setWeight] = useState('')
  const [tolerance, setTolerance] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function getUserId() {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored).id : null
    } catch {
      return null
    }
  }

  useEffect(() => {
    async function fetchProfile() {
      const userId = getUserId()
      if (!userId) {
        navigate('/login')
        return
      }
      try {
        const { data } = await api.getProfile(userId)
        if (data?.success && data.user) {
          setWeight(data.user.weight ?? '')
          setTolerance(data.user.alcohol_tolerance ?? '')
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [navigate])

  async function handleSave() {
    const userId = getUserId()
    if (!userId) return

    setSaving(true)
    setSaved(false)
    try {
      const { data } = await api.updateProfile({
        user_id: userId,
        weight: weight !== '' ? Number(weight) : null,
        alcohol_tolerance: tolerance !== '' ? Number(tolerance) : null,
      })
      if (data?.success) {
        // localStorage 갱신
        const stored = localStorage.getItem('user')
        if (stored) {
          const user = JSON.parse(stored)
          localStorage.setItem('user', JSON.stringify({
            ...user,
            weight: weight !== '' ? Number(weight) : null,
            alcohol_tolerance: tolerance !== '' ? Number(tolerance) : null,
          }))
        }
        setSaved(true)
        setTimeout(() => navigate('/mypage'), 800)
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <header className="bg-white border-b border-gray-200 py-4 relative">
        <button
          type="button"
          onClick={() => navigate('/mypage')}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl"
          aria-label="뒤로가기"
        >
          ←
        </button>
        <h1 className="text-center text-base font-medium text-gray-900">
          정보 수정
        </h1>
      </header>

      <main className="p-4 space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4 animate-pulse">
            <div className="h-6 bg-gray-100 rounded w-1/3" />
            <div className="h-12 bg-gray-100 rounded-xl" />
            <div className="h-6 bg-gray-100 rounded w-1/3 mt-4" />
            <div className="h-12 bg-gray-100 rounded-xl" />
          </div>
        ) : (
          <section className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            {/* 몸무게 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                몸무게 (kg)
              </label>
              <input
                type="number"
                min="1"
                max="300"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="몸무게를 입력하세요"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
            </div>

            {/* 주량 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주량 (소주 기준, 병)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={tolerance}
                onChange={(e) => setTolerance(e.target.value)}
                placeholder="주량을 입력하세요 (예: 1, 1.5, 2)"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
              <p className="text-xs text-gray-400 mt-1">소주 1병 = 8잔, 맥주 1병 ≈ 2.4캔</p>
            </div>

            {/* 저장 버튼 */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || saved}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3.5 rounded-xl shadow-sm transition-colors"
            >
              {saved ? '✓ 저장됐습니다' : saving ? '저장 중...' : '저장하기'}
            </button>
          </section>
        )}
      </main>
    </div>
  )
}
