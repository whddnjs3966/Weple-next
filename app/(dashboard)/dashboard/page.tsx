import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { differenceInDays } from "date-fns"
import Particles from "@/components/Particles"
import Link from "next/link"

import { getInviteCode } from "@/actions/settings"
import DashboardGrid from "@/components/dashboard/DashboardGrid"

export default async function Dashboard() {
    const supabase = await createClient()

    // 1. Get User (Supabase or NextAuth)
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()

    let user = supabaseUser
    let isNextAuth = false

    if (!user) {
        // Check NextAuth session
        const { getServerSession } = await import("next-auth/next")
        const { authOptions } = await import("@/lib/auth")
        const session = await getServerSession(authOptions)

        if (session?.user) {
            user = session.user as any
            isNextAuth = true
        } else {
            redirect('/login')
        }
    }

    // 2. Get Profile & Wedding Date
    // Only fetch profile if it's a Supabase user with an ID
    let weddingDate: Date | null = null
    let inviteCode = ''

    if (user && !isNextAuth) {
        const { data: profile } = await (supabase
            .from('profiles') as any)
            .select('wedding_date')
            .eq('id', user.id)
            .single()

        weddingDate = profile?.wedding_date ? new Date(profile.wedding_date) : null

        // Fetch invite code
        const codeResult = await getInviteCode()
        if (codeResult && !codeResult.error) {
            inviteCode = codeResult.inviteCode || ''
        }
    }

    // For NextAuth users, we currently don't have a profile logic synced yet
    // So weddingDate defaults to null, which shows the "Set Your Date" UI (safe fallback)

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
        completed: tasks.filter((t: any) => t.is_completed).length
    }

    const budgetStats = {
        total: tasks.reduce((acc: number, t: any) => acc + (t.estimated_budget || 0), 0),
        used: tasks.reduce((acc: number, t: any) => acc + (t.actual_cost || 0), 0)
    }

    return (
        <div className="fixed inset-0 bg-[#050505] overflow-hidden flex flex-col">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                    alt="Wedding Background"
                    className="w-full h-full object-cover opacity-40 scale-105 animate-slow-zoom"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-cosmos-dark/80 via-cosmos-dark/40 to-cosmos-dark/90"></div>
                <Particles />
            </div>

            {/* Main Content Spacer for Fixed Navbar */}
            <div className="h-24"></div>

            {/* Bento Grid Content */}
            <div className="relative z-20 flex-1 flex items-center justify-center p-4 md:p-8 overflow-y-auto">
                <div className="w-full h-full max-w-7xl flex items-center justify-center">
                    {weddingDate ? (
                        // Dynamically import DashboardGrid to avoid heavy load on server if possible, though it's client comp
                        // Actually normal import is fine for RSC -> Client Comp patterns
                        <DashboardGrid
                            user={user}
                            weddingDate={weddingDate}
                            budget={budgetStats}
                            tasks={taskStats}
                            dDayText={dDayText}
                        />
                    ) : (
                        <div className="glass-panel p-10 text-center animate-fade-in-up max-w-2xl">
                            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                                Welcome to <span className="text-gradient-cosmic">Wepln</span>
                            </h1>
                            <p className="text-white/70 text-lg mb-8 leading-relaxed">
                                Your journey to the stars begins here. Set your wedding date to unlock your command center.
                            </p>
                            <button
                                className="inline-block px-8 py-4 rounded-full bg-white text-cosmos-dark font-bold text-lg hover:scale-105 transition-transform shadow-neon"
                            >
                                Set Your Date
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}


