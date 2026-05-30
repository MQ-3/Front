import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { api } from '../api'

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const STATE_COLORS = {
  safe: '#22c55e',
  caution: '#f59e0b',
  danger: '#ef4444',
}
const NO_RECORD_COLOR = '#d1d5db'

function toDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function maxValueToPercent(maxValue) {
  if (!maxValue || maxValue <= 0) return 0
  return parseFloat(((maxValue / 4095) * 0.13).toFixed(3))
}

function getBarColor(stateLevel, hasRecord) {
  if (!hasRecord) return NO_RECORD_COLOR
  return STATE_COLORS[stateLevel] ?? NO_RECORD_COLOR
}

function getTextColor(stateLevel) {
  return STATE_COLORS[stateLevel] ?? '#9ca3af'
}

function buildWeekChartData(weekData) {
  if (!weekData?.start_date) {
    return WEEKDAY_LABELS.map((name) => ({
      name,
      percent: 0,
      fill: NO_RECORD_COLOR,
      hasRecord: false,
      isToday: false,
      label: '',
    }))
  }

  const start = new Date(weekData.start_date)
  const dayMap = Object.fromEntries(
    (weekData.days ?? []).map((day) => [toDateKey(new Date(day.date)), day]),
  )
  const todayKey = toDateKey(new Date())

  return WEEKDAY_LABELS.map((name, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const dateKey = toDateKey(date)
    const entry = dayMap[dateKey]
    const hasRecord = !!entry && entry.max_value > 0
    const percent = hasRecord ? maxValueToPercent(entry.max_value) : 0

    return {
      name,
      percent,
      fill: getBarColor(entry?.state_level, hasRecord),
      hasRecord,
      isToday: dateKey === todayKey,
      label: hasRecord ? percent.toFixed(3) : '',
    }
  })
}

function buildCalendarCells(year, month) {
  const firstDay = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()
  const startWeekday = firstDay.getDay()
  const cells = []

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({ type: 'empty', key: `empty-${i}` })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    cells.push({ type: 'day', day, dateKey, key: dateKey })
  }

  return cells
}

function BarValueLabel(props) {
  const { x, y, width, value } = props
  if (!value) return null

  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill="#6b7280"
      textAnchor="middle"
      fontSize={11}
    >
      {value}
    </text>
  )
}

export default function CalendarPage() {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  const todayKey = toDateKey(today)

  const [viewMode, setViewMode] = useState('week')
  const [viewYear, setViewYear] = useState(currentYear)
  const [viewMonth, setViewMonth] = useState(currentMonth)
  const [weekData, setWeekData] = useState(null)
  const [monthData, setMonthData] = useState(null)
  const [statsData, setStatsData] = useState(null)

  const displayYear = viewMode === 'week' ? currentYear : viewYear
  const displayMonth = viewMode === 'week' ? currentMonth : viewMonth

  const minMonthDate = new Date(currentYear, currentMonth - 1 - 6, 1)
  const viewMonthDate = new Date(viewYear, viewMonth - 1, 1)
  const canGoPrev = viewMonthDate > minMonthDate
  const canGoNext =
    viewYear < currentYear ||
    (viewYear === currentYear && viewMonth < currentMonth)

  function getUserId() {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored).id : null
    } catch {
      return null
    }
  }

  const fetchWeek = useCallback(async () => {
    try {
      const { data } = await api.week(getUserId())
      if (data?.success) setWeekData(data)
    } catch (error) {
      console.error('Failed to fetch week logs:', error)
    }
  }, [])

  const fetchMonth = useCallback(async (year, month) => {
    try {
      const { data } = await api.calendarMonth(year, month, getUserId())
      if (data?.success) setMonthData(data)
    } catch (error) {
      console.error('Failed to fetch calendar month:', error)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.calendarMonth(currentYear, currentMonth, getUserId())
      if (data?.success) setStatsData(data)
    } catch (error) {
      console.error('Failed to fetch month stats:', error)
    }
  }, [currentYear, currentMonth])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    if (viewMode === 'week') {
      window.scrollTo(0, 0)
      fetchWeek()
    }
  }, [viewMode, fetchWeek])

  useEffect(() => {
    if (viewMode === 'month') fetchMonth(viewYear, viewMonth)
  }, [viewMode, viewYear, viewMonth, fetchMonth])

  const chartData = useMemo(() => buildWeekChartData(weekData), [weekData])

  const monthDayMap = useMemo(() => {
    const map = {}
    ;(monthData?.days ?? []).forEach((day) => {
      map[toDateKey(new Date(day.date))] = day
    })
    return map
  }, [monthData])

  const calendarCells = useMemo(
    () => buildCalendarCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  )

  const statsDays = statsData?.days ?? []
  const totalDrinkDays = statsDays.length
  const dangerDays = statsDays.filter((day) => day.state_level === 'danger').length

  function goPrevMonth() {
    if (!canGoPrev) return
    if (viewMonth === 1) {
      setViewYear((y) => y - 1)
      setViewMonth(12)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function goNextMonth() {
    if (!canGoNext) return
    if (viewMonth === 12) {
      setViewYear((y) => y + 1)
      setViewMonth(1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  return (
    <div className={`bg-gray-100 pb-20 ${viewMode === 'week' ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <header className="bg-white border-b border-gray-200 py-4">
        <h1 className="text-center text-base font-medium text-gray-900">
          음주 측정 모니터링
        </h1>
      </header>

      <main className="p-4 space-y-4">
        <section className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-medium text-gray-900">
              <span role="img" aria-hidden="true">
                📅
              </span>
              <span>
                {displayYear}년 {displayMonth}월
              </span>
            </div>

            {viewMode === 'month' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrevMonth}
                  disabled={!canGoPrev}
                  className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="이전 달"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={goNextMonth}
                  disabled={!canGoNext}
                  className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="다음 달"
                >
                  ▶
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                viewMode === 'week'
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-white border-blue-500 text-blue-500'
              }`}
            >
              주간
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                viewMode === 'month'
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-white border-blue-500 text-blue-500'
              }`}
            >
              월간
            </button>
          </div>

          {viewMode === 'week' ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 8, left: -8, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis
                    domain={[0, 0.15]}
                    ticks={[0, 0.05, 0.1, 0.15]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                  />
                  <Bar dataKey="percent" radius={[6, 6, 0, 0]} maxBarSize={36}>
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.fill}
                        stroke={entry.isToday ? '#3b82f6' : 'transparent'}
                        strokeWidth={entry.isToday ? 2 : 0}
                      />
                    ))}
                    <LabelList dataKey="label" content={<BarValueLabel />} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAY_LABELS.map((label) => (
                  <div
                    key={label}
                    className="text-center text-xs text-gray-400 font-medium py-1"
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((cell) => {
                  if (cell.type === 'empty') {
                    return <div key={cell.key} className="aspect-square" />
                  }

                  const dayInfo = monthDayMap[cell.dateKey]
                  const hasRecord = !!dayInfo
                  const isToday = cell.dateKey === todayKey
                  const textColor = hasRecord
                    ? getTextColor(dayInfo.state_level)
                    : '#9ca3af'

                  return (
                    <div
                      key={cell.key}
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg ${
                        isToday ? 'border-2 border-blue-500' : ''
                      }`}
                    >
                      <span
                        className="text-sm font-medium leading-none"
                        style={{ color: textColor }}
                      >
                        {cell.day}
                      </span>
                      {hasRecord && (
                        <span className="text-xs leading-none mt-0.5" role="img" aria-hidden="true">
                          🍺
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-3">이번 달 통계</h2>
          <div className="space-y-2">
            <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-gray-700">총 음주일</span>
              <span className="font-bold text-blue-600">{totalDrinkDays}일</span>
            </div>
            <div className="bg-[#fdecea] rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-gray-700">과음 일수</span>
              <span className="font-bold text-red-600">{dangerDays}일</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
