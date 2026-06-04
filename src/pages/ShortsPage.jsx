import { useCallback, useEffect, useState } from 'react'
import dramaImg from '../assets/드라마.png'
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

const VIDEO_BASE = 'http://192.168.30.14:5000'

export default function ShortsPage() {
  const navigate = useNavigate()
  const [shorts, setShorts] = useState([])
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [unlockResult, setUnlockResult] = useState(null)
  const [heavyDrinking, setHeavyDrinking] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)

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

  async function handleVideoEnded(episodeNo) {
    try {
      await api.markWatched(episodeNo)
      await fetchShorts()
    } catch (error) {
      console.error('Failed to mark watched:', error)
    }
  }

  const unlockedCount = shorts.filter((s) => s.is_unlocked).length
  const watchedCount = shorts.filter((s) => s.is_watched).length
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
          <img src={dramaImg} alt="드라마" className="w-30 h-30 mb-2 object-contain" />
          <h2 className="text-xl font-bold text-gray-900 mb-1">숏드라마 시청</h2>
          <p className="text-sm text-gray-500 mb-5">음주 측정으로 에피소드를 해제하세요!</p>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">{unlockedCount}/{totalCount}</p>
              <p className="text-sm text-gray-500 mt-1">해제됨</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{watchedCount}/{totalCount}</p>
              <p className="text-sm text-gray-500 mt-1">시청 완료</p>
            </div>
          </div>
        </section>

        {/* 과음 경고 */}
        {heavyDrinking && (
          <div className="rounded-xl p-4 text-center text-sm font-medium bg-red-50 text-red-700 border border-red-200">
            🚨 과음이 의심됩니다. 음주를 멈추세요.
          </div>
        )}

        {/* 음주 측정 버튼 */}
        <button
          type="button"
          onClick={handleUnlock}
          disabled={unlocking || heavyDrinking}
          className="w-full py-4 rounded-2xl text-white font-bold text-base bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {unlocking ? '측정 중...' : '음주 측정하고 에피소드 해제'}
        </button>

        {/* 측정 결과 메시지 */}
        {unlockResult && (
          <div className={`rounded-xl p-4 text-center text-sm font-medium ${unlockResult.unlocked ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
            {unlockResult.message}
          </div>
        )}

        {/* 에피소드 목록 */}
        <section className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            에피소드 목록
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
                    onClick={() => setSelectedVideo({ title: short.title, url: `${VIDEO_BASE}${short.video_path}`, episodeNo: short.episode_no })}
                    className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-green-100 transition-colors"
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

      {/* 동영상 모달 */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="w-full max-w-lg bg-black rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-white text-sm font-medium truncate">{selectedVideo.title}</p>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="text-gray-400 hover:text-white text-xl ml-3"
              >
                ✕
              </button>
            </div>
            <video
              src={selectedVideo.url}
              controls
              autoPlay
              className="w-full"
              onEnded={() => handleVideoEnded(selectedVideo.episodeNo)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
