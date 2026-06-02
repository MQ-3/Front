import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/index.js'

const GENDER_OPTIONS = ['여성', '남성']

export default function ProfileSetupPage() {
  const navigate = useNavigate()
  const [weight, setWeight] = useState('')
  const [gender, setGender] = useState('')
  const [tolerance, setTolerance] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function getUserId() {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored).id : null
    } catch {
      return null
    }
  }

  async function handleSubmit() {
    if (!weight || !gender || !tolerance) return

    setSubmitting(true)
    try {
      await api.updateProfile({
        user_id: getUserId(),
        weight: Number(weight),
        gender,
        alcohol_tolerance: Number(tolerance),
      })
      navigate('/')
    } catch (error) {
      console.error('Failed to update profile:', error)
      navigate('/')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex flex-col justify-center p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">기본 정보 입력</h2>
        <p className="text-sm text-gray-500 mb-10 text-center">
          정확한 음주 측정을 위해 정보를 입력해주세요
        </p>

        <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <input
              type="number"
              min="1"
              max="300"
              placeholder="몸무게 (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-4 outline-none text-gray-900 placeholder-gray-400"
            />
            {weight && Number(weight) <= 0 && (
              <p className="px-4 pb-2 text-xs text-red-400">정확한 몸무게를 입력해주세요</p>
            )}
          </div>

          <div className="border-b border-gray-200">
            <div className="relative">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={`w-full px-4 py-4 outline-none bg-white appearance-none ${gender ? 'text-gray-900' : 'text-gray-400'}`}
              >
                <option value="" disabled>성별</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
            </div>
          </div>

          <div>
            <input
              type="number"
              min="0.5"
              step="0.5"
              placeholder="주량 (병)"
              value={tolerance}
              onChange={(e) => setTolerance(e.target.value)}
              className="w-full px-4 py-4 outline-none text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        <p className="text-xs text-gray-400 -mt-6 mb-8 px-1">
          소주 기준, 한병 = 1 · 한병 반 = 1.5 · 두병 = 2 · 두병 반 = 2.5 (0.5 단위 입력)
        </p>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !weight || !gender || !tolerance}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-4 rounded-xl text-lg transition-colors"
        >
          {submitting ? '저장 중...' : '시작하기'}
        </button>
      </main>
    </div>
  )
}
