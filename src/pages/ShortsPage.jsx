import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

function getUserId() {
  try {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored).id : null
  } catch {
    return null
  }
}

export default function ShortsPage() {
  const navigate = useNavigate()
  const [shorts, setShorts] = useState([])
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [unlockResult, setUnlockResult] = useState(null)
  const [heavyDrinking, setHeavyDrinking] = useState(false)

  const fetchShorts = useCallback(async () => {
    try {
      const { data } = await api.shorts()
      if (data?.success) setShorts(data.shorts ?? [])
    } catch (error) {
      console.error('Failed to fetch shorts:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchHeavyStatus = useCallback(async () => {
    try {
      const userId = getUserId()
      const { data } = await api.logsToday(userId)
      if (data?.success) setHeavyDrinking(data.heavy_drinking ?? false)
    } catch (error) {
      console.error('Failed to fetch heavy drinking status:', error)
    }
  }, [])

  useEffect(() => {
    fetchShorts()
    fetchHeavyStatus()
  }, [fetchShorts, fetchHeavyStatus])

  async function handleUnlock() {
    if (heavyDrinking) return
    setUnlocking(true)
    setUnlockResult(null)
    try {
      const userId = getUserId()
      const { data } = await api.unlock(userId)
      if (data?.success) {
        setUnlockResult(data)
        await fetchShorts()
        await fetchHeavyStatus()
      }
    } catch (error) {
      console.error('Failed to unlock:', error)
    } finally {
      setUnlocking(false)
    }
  }

  const unlockedCount = shorts.filter((s) => s.is_unlocked).length
  const totalCount = shorts.length

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <header className="bg-white border-b border-gray-200 py-4 relative">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl"
          aria-label="뒤로가기"
        >
          ←
        </button>
        <h1 className="text-center text-base font-medium text-gray-900">
          음주 측정 모니터링
        </h1>
      </header>

      <main className="p-4 space-y-4">
        {/* 요약 카드 */}
        <section className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 flex flex-col items-center text-center">
          <span className="text-4xl mb-2" role="img" aria-hidden="true">🎬</span>
          <h2 className="text-xl font-bold text-gray-900 mb-1">숏드라마 시청</h2>
          <p className="text-sm text-gray-500 mb-5">음주 측정으로 에피소드를 해제하세요!</p>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">{unlockedCount}/{totalCount}</p>
              <p className="text-sm text-gray-500 mt-1">해제됨</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">0/{totalCount}</p>
              <p className="text-sm text-gray-500 mt-1">시청 완료</p>
            </div>
          </div>
        </section>

        {/* 과음 경고 또는 체크인 결과 */}
        {heavyDrinking ? (
          <div className="rounded-xl p-4 text-center text-sm font-medium bg-red-50 text-red-700 border border-red-200">
            🚨 과음이 의심됩니다. 음주를 멈추세요.
          </div>
        ) : (
          unlockResult && (
            <div className={`rounded-xl p-4 text-center text-sm font-medium ${
              unlockResult.unlocked
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            }`}>
              {unlockResult.message}
            </div>
          )
        )}

        {/* 에피소드 언락 버튼 — 과음 시 잠금 */}
        <button
          type="button"
          onClick={handleUnlock}
          disabled={unlocking || heavyDrinking}
          className={`w-full font-medium py-3.5 rounded-xl shadow-sm transition-colors text-white ${
            heavyDrinking
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300'
          }`}
        >
          {heavyDrinking ? '🔒 음주 측정 잠김' : unlocking ? '측정 중...' : '🍶 술친구 체크인'}
        </button>

        {/* 에피소드 목록 */}
        <section className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span role="img" aria-hidden="true">🎬</span> 에피소드 목록
          </h2>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl" />
              ))}
            </div>
          ) : (
            <ul className="space-y-3">
              {shorts.map((short) =>
                short.is_unlocked ? (
                  <li
                    key={short.episode_no}
                    className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-sm">{short.episode_no}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{short.title}</p>
                      <p className="text-sm text-green-600 mt-0.5">▶ 시청 가능</p>
                    </div>
                  </li>
                ) : (
                  <li
                    key={short.episode_no}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                      <span className="text-white text-lg">🔒</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-400">{short.title}</p>
                      <p className="text-sm text-gray-400 mt-0.5">🔒 잠김</p>
                    </div>
                  </li>
                )
              )}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
