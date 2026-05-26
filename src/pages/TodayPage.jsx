import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'

const DRINK_TYPES = ['소주', '맥주', '막걸리']

const STATE_UI = {
  safe: {
    bar: 'bg-green-500',
    text: 'text-green-600',
    badge: 'bg-green-600',
    badgeText: '양호',
    recordBg: 'bg-white',
    recordBorder: 'border-gray-100',
  },
  caution: {
    bar: 'bg-[#eab308]',
    text: 'text-[#ca8a04]',
    badge: 'bg-[#eab308]',
    badgeText: '주의 필요',
    recordBg: 'bg-[#fdf8ec]',
    recordBorder: 'border-yellow-100',
  },
  danger: {
    bar: 'bg-red-600',
    text: 'text-red-600',
    badge: 'bg-red-600',
    badgeText: '위험',
    recordBg: 'bg-[#fdecea]',
    recordBorder: 'border-red-100',
  },
}

const DEFAULT_MEASURE = {
  sensor_value: 0,
  state_level: 'safe',
  state_label: '양호',
}

function sensorToPercent(sensorValue) {
  return `${((sensorValue / 4095) * 0.13).toFixed(3)}%`
}

function progressPercent(sensorValue) {
  return Math.min(100, (sensorValue / 4095) * 100)
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

function getLatestMeasurement(logs) {
  const measurements = logs
    .filter((log) => log.sensor_value > 0)
    .sort((a, b) => new Date(b.measured_at) - new Date(a.measured_at))

  if (measurements.length === 0) return DEFAULT_MEASURE

  const latest = measurements[0]
  return {
    sensor_value: latest.sensor_value,
    state_level: latest.state_level,
    state_label: latest.state_label,
  }
}

export default function TodayPage() {
  const [logs, setLogs] = useState([])
  const [currentMeasure, setCurrentMeasure] = useState(DEFAULT_MEASURE)
  const [measuring, setMeasuring] = useState(false)
  const [adding, setAdding] = useState(false)
  const [drinkType, setDrinkType] = useState('소주')
  const [drinkAmount, setDrinkAmount] = useState('')

  const fetchLogs = useCallback(async () => {
    try {
      const { data } = await api.logsToday()
      if (data?.success) {
        const nextLogs = data.logs ?? []
        setLogs(nextLogs)
        setCurrentMeasure(getLatestMeasurement(nextLogs))
      }
    } catch (error) {
      console.error('Failed to fetch today logs:', error)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const ui = getStateUi(currentMeasure.state_level)
  const percent = sensorToPercent(currentMeasure.sensor_value)
  const fillWidth = progressPercent(currentMeasure.sensor_value)

  const drinkLogs = [...logs]
    .filter((log) => log.drink_type)
    .sort((a, b) => new Date(b.measured_at) - new Date(a.measured_at))

  const measurementLogs = [...logs]
    .filter((log) => log.sensor_value > 0)
    .sort((a, b) => new Date(b.measured_at) - new Date(a.measured_at))

  async function handleMeasure() {
    setMeasuring(true)
    try {
      const { data } = await api.measure()
      if (!data?.success) return

      const nextMeasure = {
        sensor_value: data.sensor_value,
        state_level: data.state.level,
        state_label: data.state.label,
      }
      setCurrentMeasure(nextMeasure)

      await api.saveLog({
        sensor_value: data.sensor_value,
        state_level: data.state.level,
        state_label: data.state.label,
        state_message: data.state.message,
      })

      await fetchLogs()
    } catch (error) {
      console.error('Failed to measure:', error)
    } finally {
      setMeasuring(false)
    }
  }

  async function handleAddDrink() {
    if (!drinkType || !drinkAmount) return

    setAdding(true)
    try {
      await api.saveLog({
        sensor_value: 0,
        state_level: 'safe',
        state_label: '안정 단계',
        drink_type: drinkType,
        drink_amount: Number(drinkAmount),
        drink_unit: 'ml',
      })

      setDrinkAmount('')
      await fetchLogs()
    } catch (error) {
      console.error('Failed to add drink log:', error)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <header className="bg-white border-b border-gray-200">
        <h1 className="text-center text-base font-medium text-gray-900 py-4">
          음주 측정 모니터링
        </h1>
        <p className="text-center text-sm text-gray-600 pb-3">
          오늘의 음주 측정
        </p>
      </header>

      <main className="p-4 space-y-4">
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className={`h-2 ${ui.bar}`} />
          <div className="p-6 flex flex-col items-center">
            <p className={`${ui.text} text-5xl font-bold mb-3`}>{percent}</p>
            <span
              className={`${ui.badge} text-white font-medium px-5 py-1.5 rounded-full mb-5`}
            >
              {currentMeasure.state_label || ui.badgeText}
            </span>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${ui.bar} rounded-full transition-all duration-300`}
                style={{ width: `${fillWidth}%` }}
              />
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={handleMeasure}
          disabled={measuring}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3.5 rounded-xl shadow-sm transition-colors"
        >
          {measuring ? '측정 중...' : '측정하기'}
        </button>

        <section className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
          <h2 className="font-bold text-gray-900">
            <span role="img" aria-hidden="true">
              🍸
            </span>{' '}
            음주 기록 추가
          </h2>

          <div className="flex gap-3">
            <label className="flex-1 relative">
              <span className="absolute -top-2 left-3 px-1 bg-white text-xs text-gray-500">
                주종
              </span>
              <select
                value={drinkType}
                onChange={(e) => setDrinkType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 pt-4 pb-2 text-gray-900 bg-white"
              >
                {DRINK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex-1 relative">
              <span className="absolute -top-2 left-3 px-1 bg-white text-xs text-gray-500">
                양 (ml)
              </span>
              <input
                type="number"
                min="1"
                value={drinkAmount}
                onChange={(e) => setDrinkAmount(e.target.value)}
                placeholder="양 (ml)"
                className="w-full border border-gray-300 rounded-lg px-3 pt-4 pb-2 text-gray-900"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleAddDrink}
            disabled={adding || !drinkType || !drinkAmount}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium py-3 rounded-xl transition-colors"
          >
            ＋ 추가
          </button>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-3">음주 기록</h2>
          {drinkLogs.length === 0 ? (
            <p className="text-center text-gray-400 py-6">기록이 없습니다</p>
          ) : (
            <ul className="space-y-2">
              {drinkLogs.map((log) => (
                <li
                  key={log.id}
                  className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm"
                >
                  <div>
                    <p className="font-bold text-gray-900">{log.drink_type}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {formatMeasuredAt(log.measured_at)}
                    </p>
                  </div>
                  <p className="text-gray-700 font-medium">
                    {log.drink_amount}
                    {log.drink_unit || 'ml'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-3">측정 기록</h2>
          {measurementLogs.length === 0 ? (
            <p className="text-center text-gray-400 py-6">기록이 없습니다</p>
          ) : (
            <ul className="space-y-2">
              {measurementLogs.map((log) => {
                const logUi = getStateUi(log.state_level)
                return (
                  <li
                    key={log.id}
                    className={`${logUi.recordBg} border ${logUi.recordBorder} rounded-xl p-4 flex items-center justify-between`}
                  >
                    <div>
                      <p className="font-bold text-gray-900">
                        {sensorToPercent(log.sensor_value)}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {formatMeasuredAt(log.measured_at)}
                      </p>
                    </div>
                    <span
                      className={`${logUi.badge} text-white text-sm font-medium px-4 py-1.5 rounded-full shrink-0`}
                    >
                      {log.state_label}
                    </span>
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
