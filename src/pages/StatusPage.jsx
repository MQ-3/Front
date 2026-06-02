import { useEffect, useState } from 'react'
import { api } from '../api'
import iconSafe from '../assets/건강해.png'
import iconCaution from '../assets/주의가 필요함.png'
import iconDanger from '../assets/만취.png'

const DEFAULT_MEASURE = { sensor_value: 0, state_level: 'safe', state_label: '안정 단계' }

function getLatestMeasurement(logs) {
  const measurements = logs
    .filter((log) => log.sensor_value > 0)
    .sort((a, b) => new Date(b.measured_at) - new Date(a.measured_at))
  if (measurements.length === 0) return DEFAULT_MEASURE
  const { sensor_value, state_level, state_label } = measurements[0]
  return { sensor_value, state_level, state_label }
}

const STATE_UI = {
  safe: {
    cardBg: 'bg-[#e8f5f0]',
    textColor: 'text-green-600',
    badgeBg: 'bg-green-600',
    recordBorder: 'border-green-100',
    icon: iconSafe,
    headline: '건강한 상태입니다',
    badge: '양호',
    message:
      '적절한 상태를 유지하고 있습니다. 건강한 음주 습관을 유지하세요.',
  },
  caution: {
    cardBg: 'bg-[#fdf8ec]',
    textColor: 'text-[#ca8a04]',
    badgeBg: 'bg-[#eab308]',
    recordBorder: 'border-yellow-100',
    icon: iconCaution,
    headline: '주의가 필요합니다',
    badge: '주의 필요',
    message:
      '음주량이 많아지고 있습니다.',
  },
  danger: {
    cardBg: 'bg-[#fdecea]',
    textColor: 'text-red-600',
    badgeBg: 'bg-red-600',
    recordBorder: 'border-red-100',
    icon: iconDanger,
    headline: '위험한 상태입니다',
    badge: '위험',
    message: '즉시 음주를 멈추세요. 물을 마시고 휴식하세요.',
  },
}

function sensorToPercent(sensorValue) {
  return `${((sensorValue / 4095) * 0.13).toFixed(3)}%`
}

function formatMeasuredAt(measuredAt) {
  const date = new Date(measuredAt)
  if (Number.isNaN(date.getTime())) return ''

  const hours = date.getHours()
  const minutes = date.getMinutes()
  const period = hours < 12 ? '오전' : '오후'
  const hour12 = hours % 12 || 12

  return `${period} ${hour12}:${String(minutes).padStart(2, '0')}`
}

function getStateUi(stateLevel) {
  return STATE_UI[stateLevel] ?? STATE_UI.safe
}

function StatusBadge({ stateLevel, label }) {
  const ui = getStateUi(stateLevel)
  return (
    <span
      className={`${ui.badgeBg} text-white text-sm font-medium px-4 py-1.5 rounded-full shrink-0`}
    >
      {label}
    </span>
  )
}

export default function StatusPage() {
  const [logs, setLogs] = useState([])
  const [current, setCurrent] = useState(DEFAULT_MEASURE)
  const [loading, setLoading] = useState(true)
  const [exceededTolerance, setExceededTolerance] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      try {
        const stored = localStorage.getItem('user')
        const userId = stored ? JSON.parse(stored).id : null
        const { data } = await api.logsToday(userId)
        if (!cancelled && data?.success) {
          const nextLogs = data.logs ?? []
          setLogs(nextLogs)
          setCurrent(getLatestMeasurement(nextLogs))
          setExceededTolerance(data.exceeded_tolerance ?? false)
        }
      } catch (error) {
        console.error('Failed to fetch today logs:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [])

  const stateLevel = current.state_level
  const sensorValue = current.sensor_value
  const percent = sensorToPercent(sensorValue)
  const ui = getStateUi(stateLevel)


  const sortedLogs = [...logs]
    .filter((log) => log.sensor_value > 0)
    .sort((a, b) => new Date(b.measured_at) - new Date(a.measured_at))

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <header className="bg-white border-b border-gray-200 py-4">
        <h1 className="text-center text-base font-medium text-gray-900">
          음주 측정 모니터링
        </h1>
      </header>

      <main className="p-4 space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-6" />
            <div className="h-16 bg-gray-200 rounded w-1/2 mx-auto mb-4" />
            <div className="h-8 bg-gray-200 rounded w-24 mx-auto mb-6" />
            <p className="text-center text-gray-400 text-sm">로딩 중...</p>
          </div>
        ) : (
          <section
            className={`${ui.cardBg} rounded-2xl p-8 flex flex-col items-center text-center`}
          >
            <img src={ui.icon} alt={ui.headline} className="w-40 h-40 object-contain mb-4" />
            <p className={`${ui.textColor} text-5xl font-bold mb-4`}>
              {percent}
            </p>
            <span
              className={`${ui.badgeBg} text-white font-medium px-6 py-2 rounded-full mb-2`}
            >
              {ui.badge}
            </span>
            {exceededTolerance && (
              <p className="text-red-600 text-sm font-medium mb-4">
                주량을 넘겼어요. 그만 먹어
              </p>
            )}
            {!exceededTolerance && <div className="mb-4" />}
            <p className="text-gray-600 text-base leading-relaxed">
              {ui.message}
            </p>
          </section>
        )}

        <section className="bg-white rounded-2xl p-4">
          <h2 className="text-left font-bold text-gray-900 mb-4">
            최근 측정 기록
          </h2>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-16 bg-gray-100 rounded-xl" />
              <div className="h-16 bg-gray-100 rounded-xl" />
            </div>
          ) : sortedLogs.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              측정 기록이 없습니다
            </p>
          ) : (
            <ul className="space-y-3">
              {sortedLogs.map((log) => {
                const logUi = getStateUi(log.state_level)
                return (
                  <li
                    key={log.id}
                    className={`flex items-center justify-between border ${logUi.recordBorder} rounded-xl p-4`}
                  >
                    <div className="text-left">
                      <p className="font-bold text-gray-900">
                        {sensorToPercent(log.sensor_value)}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {formatMeasuredAt(log.measured_at)}
                      </p>
                    </div>
                    <StatusBadge
                      stateLevel={log.state_level}
                      label={log.state_label}
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
