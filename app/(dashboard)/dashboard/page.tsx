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


    // 3. Fetch Tasks & Budget Data
    const { getTasks } = await import("@/actions/checklist")
    const tasks = await getTasks()

    const taskStats = {
        total: tasks.length,
        completed: tasks.filter((t) => t.is_completed).length
    }

    // 예산 정보: profiles.budget_max (총 예산) + tasks 합계
    const budgetSummary = await getBudgetSummary()
    const budgetStats = {
        total: budgetSummary.totalBudget || tasks.reduce((acc: number, t) => acc + (t.estimated_budget || 0), 0),
        used: budgetSummary.actualTotal || tasks.reduce((acc: number, t) => acc + (t.actual_cost || 0), 0)
    }

    return (
        <div className="fixed inset-0 overflow-hidden flex items-center justify-center">
            {/* Dashboard-only: Wedding Photo Background with Dark Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                    alt="Wedding Background"
                    className="w-full h-full object-cover opacity-40"
                    style={{ animation: 'slow-zoom 20s infinite alternate ease-in-out' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
            </div>

            <style>{`
                @keyframes slow-zoom {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.1); }
                }
            `}</style>

            {/* Content */}
            <div className="relative z-20 flex items-center justify-center w-full h-full">
                <div className="w-full max-w-7xl">
                    {weddingDate ? (
                        <DashboardGrid
                            user={user}
                            weddingDate={weddingDate}
                            budget={budgetStats}
                            tasks={taskStats}
                            dDayText={dDayText}
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
        </div>
    )
}
