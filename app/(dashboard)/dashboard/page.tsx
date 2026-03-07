import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { differenceInDays } from "date-fns"
import Particles from "@/components/Particles"
import Link from "next/link"

import { getInviteCode } from "@/actions/settings"
import { getBudgetSummary } from "@/actions/budget"
import DashboardGrid from "@/components/dashboard/DashboardGrid"

export default async function Dashboard() {
    const supabase = await createClient()

    // 1. Get User (Supabase Auth only)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 2. Get Profile & Wedding Date
    let weddingDate: Date | null = null
    let inviteCode = ''

    const { data: profile } = await supabase
        .from('profiles')
        .select('wedding_date')
        .eq('id', user.id)
        .single()

    weddingDate = profile?.wedding_date ? new Date(profile.wedding_date) : null

    // Fetch invite code
    const codeResult = await getInviteCode()
    if (codeResult && !codeResult.error) {
        inviteCode = codeResult.inviteCode || ''
    }

    const today = new Date()

    let dDay = null
    let dDayText = "D-Day"

    if (weddingDate) {
        const diff = differenceInDays(weddingDate, today)
        dDay = Math.ceil(diff)
        if (dDay === 0) dDayText = "D-Day"
        else if (dDay > 0) dDayText = `D-${dDay}`
        else dDayText = `D+${Math.abs(dDay)}`
    }


    // 3. Fetch Tasks & Budget Data (병렬 조회)
    const { getTasks } = await import("@/actions/checklist")
    const [tasks, budgetSummary] = await Promise.all([
        getTasks(),
        getBudgetSummary(),
    ])

    const taskStats = {
        total: tasks.length,
        completed: tasks.filter((t) => t.is_completed).length
    }

    // 다음 할 일: 미완료 태스크 중 d_day 기준 가장 임박한 3개 (d_day 오름차순 = 작은 값이 가장 가까움)
    const upcomingTasks = tasks
        .filter((t) => !t.is_completed)
        .sort((a, b) => (a.d_day ?? 9999) - (b.d_day ?? 9999))
        .slice(0, 3)
        .map((t) => ({
            title: t.title,
            dDay: t.d_day ?? 0,
            description: t.description || null,
            category: t.category || null,
            estimatedBudget: t.estimated_budget || null,
        }))

    // 예산 카테고리별 분류
    const categoryBudgets = tasks.reduce((acc: Record<string, number>, t) => {
        const budget = t.estimated_budget || 0
        if (budget <= 0) return acc
        const title = t.title || ''
        let category = '기타'
        if (title.includes('웨딩홀') || title.includes('예식') || title.includes('식대')) category = '웨딩홀/식대'
        else if (title.includes('스드메') || title.includes('스튜디오') || title.includes('드레스') || title.includes('메이크업')) category = '스드메'
        else if (title.includes('신혼여행') || title.includes('허니문')) category = '신혼여행'
        else if (title.includes('예물') || title.includes('예단') || title.includes('반지')) category = '예물/예단'
        acc[category] = (acc[category] || 0) + budget
        return acc
    }, {})

    // 예산 정보: profiles.budget_max (총 예산) + 완료 항목의 예산 합계
    const budgetStats = {
        total: budgetSummary.totalBudget || tasks.reduce((acc: number, t) => acc + (t.estimated_budget || 0), 0),
        used: budgetSummary.completedEstimatedTotal || 0,
    }

    return (
        <>
            {/* Dashboard-only: Dark Elegant Background */}
            <div className="fixed inset-0 bg-[#0f1015]">
                {/* 웨딩 사진 - 은은하게 */}
                <img
                    src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                    alt="Wedding Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-[0.08]"
                    style={{ animation: 'slow-zoom 20s infinite alternate ease-in-out' }}
                />
                {/* 어두운 그라디언트 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f1015]/80 via-transparent to-[#0f1015]/90 backdrop-blur-[1px]" />
                {/* 별빛/꽃가루 파티클 */}
                <Particles quantity={100} color="#ffffff" />
            </div>

            <style>{`
                @keyframes slow-zoom {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.08); }
                }
            `}</style>

            {/* Content — layout의 pt-24 pb-16 안에서 정상 흐름으로 렌더링 */}
            <div className="relative flex items-center" style={{ minHeight: 'calc(100vh - 10rem)' }}>
                <div className="w-full max-w-7xl mx-auto px-4">
                    {weddingDate ? (
                        <DashboardGrid
                            user={user}
                            weddingDate={weddingDate}
                            budget={budgetStats}
                            tasks={taskStats}
                            dDayText={dDayText}
                            upcomingTasks={upcomingTasks}
                            categoryBudgets={categoryBudgets}
                        />
                    ) : (
                        <div className="spring-card p-10 text-center animate-fade-in-up max-w-2xl mx-auto shadow-petal">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 tracking-tight">
                                Welcome to <span className="text-gradient-rose">Wepln</span>
                            </h1>
                            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                                아름다운 웨딩 여정이 시작됩니다. 결혼 예정일을 설정하여 플래너를 시작하세요.
                            </p>
                            <button
                                className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-pink-300 to-pink-400 text-white font-bold text-lg hover:scale-105 transition-transform shadow-rose-glow"
                            >
                                날짜 설정하기
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
