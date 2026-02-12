import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { differenceInDays } from "date-fns"
import Particles from "@/components/Particles"
import Link from "next/link"

export default async function Dashboard() {
    const supabase = await createClient()

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // 2. Get Profile & Wedding Date
    const { data: profile } = await supabase
        .from('profiles')
        .select('wedding_date')
        .eq('id', user.id)
        .single()

    const weddingDate = profile?.wedding_date ? new Date(profile.wedding_date) : null
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

    return (
        <div className="fixed inset-0 bg-[#050505] overflow-hidden -z-10">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                    alt="Wedding Background"
                    className="w-full h-full object-cover opacity-60 scale-105 animate-slow-zoom"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40"></div>
                <Particles />
            </div>

            {/* Main Content Center */}
            <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4">
                {weddingDate ? (
                    <div className="animate-fade-in-up">
                        <p className="text-white/60 text-sm tracking-[0.3em] font-medium mb-4 uppercase">Your Beautiful Journey</p>
                        <h1 className="font-serif text-8xl md:text-[10rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-2xl mb-2 tracking-tight leading-none">
                            {dDay && dDay > 0 ? `D-${dDay}` : (dDay === 0 ? "D-Day" : `D+${Math.abs(dDay || 0)}`)}
                        </h1>
                        <div className="mt-6 font-serif text-4xl md:text-6xl text-white/90 tracking-[0.2em] font-light">
                            {weddingDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '.')}
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in-up">
                        <h1 className="font-serif text-6xl md:text-8xl font-bold text-white mb-6">Welcome to Weple</h1>
                        <button
                            className="inline-block px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform"
                        >
                            Set Your Date
                        </button>
                    </div>
                )}
            </div>

            {/* Floating Cards - Exact Positions from style.css */}
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden hidden md:block">

                {/* Card 1: Schedule (Top Left) */}
                <div className="cosmos-card" style={{ top: '20%', left: '20%', animationDelay: '0s' }}>
                    <div className="glass-panel p-4 flex items-center gap-3 hover:bg-white/20 transition-colors pointer-events-auto">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                            <i className="bi bi-calendar-check"></i>
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] text-white/60 uppercase tracking-wider">Next Event</p>
                            <p className="text-white text-sm font-bold">Dress Fitting</p>
                        </div>
                    </div>
                </div>

                {/* Card 2: Budget (Bottom Left) */}
                <div className="cosmos-card" style={{ top: '75%', left: '15%', animationDelay: '-2s' }}>
                    <div className="glass-panel p-4 flex flex-col items-center text-center hover:bg-white/20 transition-colors pointer-events-auto">
                        <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1">Budget Used</p>
                        <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-white/80 w-1/3"></div>
                        </div>
                        <p className="text-white text-xs font-bold">35% Complete</p>
                    </div>
                </div>

                {/* Card 3: Vendor (Top Right) */}
                <div className="cosmos-card" style={{ top: '15%', right: '15%', animationDelay: '-4s' }}>
                    <div className="glass-panel p-3 flex items-center gap-2 hover:bg-white/20 transition-colors pointer-events-auto">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        <span className="text-white text-xs font-medium">Vendor Search</span>
                    </div>
                </div>


                {/* Card 4: Checklist (Bottom Right) */}
                <div className="cosmos-card" style={{ top: '65%', right: '20%', animationDelay: '-1s' }}>
                    <div className="glass-panel p-4 flex items-center gap-3 hover:bg-white/20 transition-colors pointer-events-auto">
                        <div className="w-8 h-8 rounded-full bg-[#FF8E8E] flex items-center justify-center text-white text-xs shadow-lg shadow-red-500/30">
                            5
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] text-white/60 uppercase tracking-wider">To-Do</p>
                            <p className="text-white text-sm font-bold">New Tasks</p>
                        </div>
                    </div>
                </div>

                {/* Card 5: Community (Left Center) */}
                <div className="cosmos-card" style={{ top: '40%', left: '10%', animationDelay: '-5s' }}>
                    <div className="glass-panel p-3 flex items-center gap-2 hover:bg-white/20 transition-colors pointer-events-auto">
                        <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-gray-300 border border-white"></div>
                            <div className="w-6 h-6 rounded-full bg-gray-400 border border-white"></div>
                            <div className="w-6 h-6 rounded-full bg-gray-500 border border-white"></div>
                        </div>
                        <span className="text-white text-xs font-medium ml-1">+12 New</span>
                    </div>
                </div>

                {/* Card 8: Quote (Top Center) */}
                <div className="cosmos-card" style={{ top: '10%', left: '50%', transform: 'translateX(-50%)', animationDelay: '-2.5s' }}>
                    <div className="glass-panel px-5 py-3 text-center pointer-events-auto">
                        <p className="font-serif italic text-white/90 text-sm">"Together is a beautiful place to be"</p>
                    </div>
                </div>

            </div>
        </div>
    )
}
