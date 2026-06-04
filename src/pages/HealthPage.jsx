import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import iconPerfect from '../assets/누가봐도 건강.png'
import iconGood from '../assets/피곤한 남자.png'
import iconCaution from '../assets/숙취 쩔어.png'
import iconWarning from '../assets/두통.png'
import iconDanger from '../assets/병원가봐요.png'

const GOOD_TIPS = [
  {
    emoji: '💧',
    title: '음주 전 충분한 수분 섭취',
    desc: '술을 마시기 전 물 한두 잔을 마시면 알코올 흡수 속도를 늦추고 숙취를 줄일 수 있어요.',
    bg: 'bg-blue-50',
  },
  {
    emoji: '🍚',
    title: '공복 음주 피하기',
    desc: '빈속에 마시면 알코올이 빠르게 흡수됩니다. 식사 후 음주하거나 안주와 함께 드세요.',
    bg: 'bg-green-50',
  },
  {
    emoji: '🕐',
    title: '천천히, 적당히 마시기',
    desc: '간이 시간당 처리할 수 있는 알코올 양은 한정적이에요. 급하게 마시지 말고 천천히 즐기세요.',
    bg: 'bg-purple-50',
  },
  {
    emoji: '😴',
    title: '음주 다음날 충분한 수면',
    desc: '수면 중 간이 알코올을 분해합니다. 다음날 일정을 여유 있게 잡고 푹 쉬어주세요.',
    bg: 'bg-indigo-50',
  },
  {
    emoji: '🚶',
    title: '다음날 가벼운 유산소 운동',
    desc: '과격한 운동은 피하되, 가벼운 산책은 혈액순환을 돕고 알코올 대사를 촉진해요.',
    bg: 'bg-orange-50',
  },
]

const CAUTION_EXTRA_TIPS = [
  {
    emoji: '📅',
    title: '음주 없는 날 의식적으로 만들기',
    desc: '일주일에 최소 3~4일은 금주일로 정하세요. 간이 회복할 시간이 필요합니다.',
    bg: 'bg-yellow-50',
  },
  {
    emoji: '🫀',
    title: '간 기능 자가 점검',
    desc: '피로감이 지속되거나 소화가 잘 안 된다면 간 수치 이상의 신호일 수 있어요. 내과 방문을 고려해보세요.',
    bg: 'bg-amber-50',
  },
  {
    emoji: '🧃',
    title: '술 대신 무알코올 음료로 대체',
    desc: '사교 자리에서 무알코올 맥주나 탄산수로 대체해보세요. 분위기는 유지하면서 음주량을 줄일 수 있어요.',
    bg: 'bg-lime-50',
  },
  {
    emoji: '📝',
    title: '음주 일지 기록하기',
    desc: '언제, 얼마나, 왜 마시는지 기록하면 음주 패턴을 파악하고 조절하는 데 도움이 됩니다.',
    bg: 'bg-sky-50',
  },
  {
    emoji: '🍋',
    title: '비타민 B군·C 보충',
    desc: '알코올은 비타민 B1, B6, 엽산을 크게 소모합니다. 음주 빈도가 높다면 영양제로 보충해주세요.',
    bg: 'bg-yellow-50',
  },
]

const WARNING_EXTRA_TIPS = [
  {
    emoji: '🩺',
    title: '간·췌장 정밀 검사 받기',
    desc: '이 수준의 음주가 지속되면 지방간, 간염, 췌장염 위험이 크게 높아집니다. 내과 검진을 받아보세요.',
    bg: 'bg-orange-50',
  },
  {
    emoji: '🧠',
    title: '음주 트리거 파악하기',
    desc: '스트레스·외로움·특정 상황이 음주를 유발하진 않나요? 원인을 알아야 습관을 바꿀 수 있어요.',
    bg: 'bg-violet-50',
  },
  {
    emoji: '👨‍👩‍👧',
    title: '가까운 사람에게 도움 요청',
    desc: '혼자 줄이기 어렵다면 가족이나 친한 친구에게 절주 의지를 밝히고 지지를 부탁해보세요.',
    bg: 'bg-rose-50',
  },
  {
    emoji: '🏥',
    title: '알코올 상담 서비스 활용',
    desc: '한국음주문화연구센터(02-780-8888)나 정신건강 위기상담(1577-0199)에 부담 없이 전화할 수 있어요.',
    bg: 'bg-pink-50',
  },
  {
    emoji: '⏸️',
    title: '한 달 단위 금주 챌린지 시작',
    desc: '"이번 달만 안 마신다"는 작은 목표부터 시작해보세요. 단기 금주만으로도 간 수치가 눈에 띄게 개선됩니다.',
    bg: 'bg-teal-50',
  },
]

const DANGER_TIPS = [
  {
    emoji: '⚕️',
    title: '즉시 내과·소화기내과 방문',
    desc: '이 수준의 음주는 간경화, 식도정맥류, 알코올성 췌장염 등 생명과 직결된 질환을 유발합니다. 즉시 진료를 받으세요.',
    bg: 'bg-red-50',
  },
  {
    emoji: '🚨',
    title: '혼자 금주하지 마세요',
    desc: '심한 알코올 의존 상태에서 갑자기 끊으면 금단 발작·섬망이 올 수 있습니다. 반드시 전문의 지도 하에 중단하세요.',
    bg: 'bg-red-50',
  },
  {
    emoji: '📞',
    title: '알코올 중독 전문 상담',
    desc: '한국도박문제예방치유원 알코올 상담: 1899-9135 (24시간 운영). 익명으로 상담 가능합니다.',
    bg: 'bg-red-50',
  },
  {
    emoji: '🏨',
    title: '입원 치료 고려',
    desc: '외래 치료가 어렵다면 알코올 전문 병원 입원 치료가 가장 효과적인 방법입니다. 전문의와 상의하세요.',
    bg: 'bg-red-50',
  },
  {
    emoji: '💊',
    title: '약물 보조 치료',
    desc: '날트렉손·아캄프로세이트 등 음주 욕구를 줄이는 전문 처방약이 있습니다. 정신건강의학과에서 처방받을 수 있어요.',
    bg: 'bg-red-50',
  },
]

const LEVEL_BANNER = {
  perfect: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    titleColor: 'text-blue-600',
    subtitleColor: 'text-blue-500',
    icon: iconPerfect,
    title: '완벽한 한 달입니다!',
    subtitle: (n) => `이번 달 음주 ${n}일`,
  },
  good: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    titleColor: 'text-green-600',
    subtitleColor: 'text-green-600',
    icon: iconGood,
    title: '건강 관리 양호',
    subtitle: (n) => `이번 달 ${n}일 음주하셨네요`,
  },
  caution: {
    bg: 'bg-[#fdf8ec]',
    border: 'border-yellow-300',
    titleColor: 'text-[#ca8a04]',
    subtitleColor: 'text-[#ca8a04]',
    icon: iconCaution,
    title: '건강 관리 필요',
    subtitle: (n) => `이번 달 ${n}일 음주하셨네요`,
  },
  warning: {
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    titleColor: 'text-orange-600',
    subtitleColor: 'text-orange-600',
    icon: iconWarning,
    title: '건강 관리 필요',
    subtitle: (n) => `이번 달 ${n}일 음주하셨네요`,
  },
  danger: {
    bg: 'bg-[#fdecea]',
    border: 'border-red-300',
    titleColor: 'text-red-600',
    subtitleColor: 'text-red-600',
    icon: iconDanger,
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

function getUserId() {
  try {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored).id : null
  } catch {
    return null
  }
}

export default function HealthPage() {
  const [loading, setLoading] = useState(true)
  const [drinkDays, setDrinkDays] = useState(0)

  const fetchMonth = useCallback(async () => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1
    setLoading(true)
    try {
      const { data } = await api.calendarMonth(currentYear, currentMonth, getUserId())
      if (data?.success) {
        setDrinkDays(data.days?.length ?? 0)
      }
    } catch (error) {
      console.error('Failed to fetch calendar month:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMonth()
  }, [fetchMonth])

  const level = getLevel(drinkDays)
  const banner = LEVEL_BANNER[level]
  const tips = useMemo(() => getTipsForLevel(level), [level])
  const alert = LEVEL_ALERT[level]
  const showCautionCard = level !== 'perfect'

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <header className="py-4" style={{ backgroundColor: '#148917' }}>
        <h1 className="text-center text-xl font-bold text-white">
          건강을 관리해요
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
              <img src={banner.icon} alt={banner.title} className="w-40 h-40 object-contain mb-3" />
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
