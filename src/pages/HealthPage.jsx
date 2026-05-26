import { useEffect, useMemo, useState } from 'react'

const DUMMY_DRINK_DAYS = 8
// 0 / 1~6 / 7~12 / 13~19 / 20 이상으로 바꿔서 5단계 전부 테스트

const GOOD_TIPS = [
  {
    emoji: '💧',
    title: '충분한 수분 섭취',
    desc: '음주 후에는 물을 충분히 마셔 탈수를 예방하세요',
    bg: 'bg-blue-50',
  },
  {
    emoji: '🥗',
    title: '영양 균형 식단',
    desc: '간 건강을 위해 채소와 과일을 충분히 섭취하세요',
    bg: 'bg-green-50',
  },
  {
    emoji: '😴',
    title: '충분한 휴식',
    desc: '음주 다음날은 충분한 수면으로 회복하세요',
    bg: 'bg-purple-50',
  },
  {
    emoji: '🏃',
    title: '규칙적인 운동',
    desc: '주 3회 이상 운동으로 건강을 유지하세요',
    bg: 'bg-orange-50',
  },
]

const CAUTION_EXTRA_TIPS = [
  {
    emoji: '🚫',
    title: '음주 빈도 줄이기',
    desc: '주 2회 이하로 음주 횟수를 줄여보세요',
    bg: 'bg-yellow-50',
  },
  {
    emoji: '🫀',
    title: '간 건강 체크',
    desc: '음주가 잦으면 간 수치 검사를 받아보세요',
    bg: 'bg-amber-50',
  },
]

const WARNING_EXTRA_TIPS = [
  {
    emoji: '🩺',
    title: '정기 건강검진',
    desc: '음주로 인한 건강 이상을 조기 발견하세요',
    bg: 'bg-orange-50',
  },
  {
    emoji: '👨‍👩‍👧',
    title: '주변 도움 요청',
    desc: '음주 습관 개선을 위해 가족이나 친구에게 도움을 요청하세요',
    bg: 'bg-rose-50',
  },
]

const DANGER_TIPS = [
  {
    emoji: '⚕️',
    title: '즉시 병원 방문',
    desc: '과도한 음주는 간경화, 췌장염 등 심각한 질환을 유발합니다',
    bg: 'bg-red-50',
  },
  {
    emoji: '📞',
    title: '전문 상담',
    desc: '알코올 의존증 상담: 1899-9135',
    bg: 'bg-red-50',
  },
  {
    emoji: '🛑',
    title: '즉각적인 금주',
    desc: '건강 회복을 위해 즉시 금주를 시작하세요',
    bg: 'bg-red-50',
  },
  {
    emoji: '💊',
    title: '전문의 처방',
    desc: '금단 증상이 있다면 반드시 전문의와 상담하세요',
    bg: 'bg-red-50',
  },
]

const LEVEL_BANNER = {
  perfect: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    titleColor: 'text-blue-600',
    subtitleColor: 'text-blue-500',
    icon: '⭐',
    title: '완벽한 한 달입니다!',
    subtitle: (n) => `이번 달 음주 ${n}일`,
  },
  good: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    titleColor: 'text-green-600',
    subtitleColor: 'text-green-600',
    icon: '💚',
    title: '건강 관리 양호',
    subtitle: (n) => `이번 달 ${n}일 음주하셨네요`,
  },
  caution: {
    bg: 'bg-[#fdf8ec]',
    border: 'border-yellow-300',
    titleColor: 'text-[#ca8a04]',
    subtitleColor: 'text-[#ca8a04]',
    icon: '⚠️',
    title: '건강 관리 필요',
    subtitle: (n) => `이번 달 ${n}일 음주하셨네요`,
  },
  warning: {
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    titleColor: 'text-orange-600',
    subtitleColor: 'text-orange-600',
    icon: '🚨',
    title: '건강 관리 필요',
    subtitle: (n) => `이번 달 ${n}일 음주하셨네요`,
  },
  danger: {
    bg: 'bg-[#fdecea]',
    border: 'border-red-300',
    titleColor: 'text-red-600',
    subtitleColor: 'text-red-600',
    icon: '🏥',
    title: '병원 방문을 권고합니다',
    subtitle: (n) => `이번 달 ${n}일 음주하셨네요`,
  },
}

const LEVEL_ALERT = {
  caution: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-amber-700',
    message: '음주 빈도가 높아지고 있습니다. 이번 달 음주 횟수를 줄이는 것이 좋습니다.',
  },
  warning: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    message:
      '과도한 음주 패턴이 감지되었습니다. 건강 검진과 음주 습관 개선이 시급합니다.',
  },
  danger: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    message:
      '매우 위험한 음주 수준입니다. 즉시 금주하고 전문의 상담 및 병원 방문을 권고합니다.',
  },
}

function getLevel(drinkDays) {
  if (drinkDays === 0) return 'perfect'
  if (drinkDays <= 6) return 'good'
  if (drinkDays <= 12) return 'caution'
  if (drinkDays <= 19) return 'warning'
  return 'danger'
}

function getTipsForLevel(level) {
  if (level === 'perfect') return []
  if (level === 'good') return GOOD_TIPS
  if (level === 'caution') return [...GOOD_TIPS, ...CAUTION_EXTRA_TIPS]
  if (level === 'warning') return [...GOOD_TIPS, ...CAUTION_EXTRA_TIPS, ...WARNING_EXTRA_TIPS]
  return DANGER_TIPS
}

export default function HealthPage() {
  const [loading, setLoading] = useState(true)
  const drinkDays = DUMMY_DRINK_DAYS

  useEffect(() => {
    // let cancelled = false
    //
    // async function fetchMonth() {
    //   setLoading(true)
    //   try {
    //     const { data } = await api.calendarMonth(currentYear, currentMonth)
    //     if (!cancelled && data?.success) {
    //       setDrinkDays(data.days?.length ?? 0)
    //     }
    //   } catch (error) {
    //     console.error('Failed to fetch calendar month:', error)
    //   } finally {
    //     if (!cancelled) setLoading(false)
    //   }
    // }
    //
    // fetchMonth()
    // return () => {
    //   cancelled = true
    // }

    setLoading(false)
  }, [])

  const level = getLevel(drinkDays)
  const banner = LEVEL_BANNER[level]
  const tips = useMemo(() => getTipsForLevel(level), [level])
  const alert = LEVEL_ALERT[level]
  const showCautionCard = level !== 'perfect'

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <header className="bg-white border-b border-gray-200 py-4">
        <h1 className="text-center text-base font-medium text-gray-900">
          음주 측정 모니터링
        </h1>
      </header>

      <main className="p-4 space-y-4">
        {loading ? (
          <p className="text-center text-gray-400 py-12">로딩 중...</p>
        ) : (
          <>
            <section
              className={`${banner.bg} border ${banner.border} rounded-2xl p-8 flex flex-col items-center text-center`}
            >
              <span className="text-4xl mb-3" role="img" aria-hidden="true">
                {banner.icon}
              </span>
              <h2 className={`${banner.titleColor} text-xl font-bold mb-2`}>
                {banner.title}
              </h2>
              <p className={`${banner.subtitleColor} text-sm`}>
                {banner.subtitle(drinkDays)}
              </p>
            </section>

            {level === 'perfect' ? (
              <p className="text-center text-blue-600 font-medium py-4">
                이 페이스를 유지하세요!
              </p>
            ) : (
              <>
                <section>
                  <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                    <span className="text-red-500" role="img" aria-hidden="true">
                      ❤️
                    </span>
                    건강 관리 팁
                  </h2>
                  <ul className="space-y-3">
                    {tips.map((tip) => (
                      <li
                        key={tip.title}
                        className={`${tip.bg} rounded-xl p-4`}
                      >
                        <p className="font-bold text-gray-900 mb-1">
                          <span role="img" aria-hidden="true">
                            {tip.emoji}
                          </span>{' '}
                          {tip.title}
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {tip.desc}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>

                {alert && (
                  <div
                    className={`${alert.bg} border ${alert.border} rounded-xl p-4`}
                  >
                    <p className={`text-sm font-medium leading-relaxed ${alert.text}`}>
                      {alert.message}
                    </p>
                  </div>
                )}
              </>
            )}

            {showCautionCard && (
              <section className="bg-[#fdecea] border border-red-300 rounded-xl p-4">
                <h3 className="text-red-600 font-bold mb-2">⚠️ 주의사항</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  음주 후 운전은 절대 금지입니다. 과도한 음주는 건강에
                  해롭습니다.
                </p>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
