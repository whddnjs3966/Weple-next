import Navbar from '@/components/Navbar'
import Providers from './Providers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Instagram } from 'lucide-react'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 미들웨어에서 넘어온 DB 조회 책임
    // 사용자가 온보딩을 완료했는지 (wedding_date 확인) 검사합니다.
    const { data: profile } = await supabase
        .from('profiles')
        .select('wedding_date')
        .eq('id', user.id)
        .single()

    if (!profile?.wedding_date) {
        redirect('/onboarding')
    }

    return (
        <Providers>
            <div className="min-h-screen relative">
                {/* Fixed Background with Wedding Photo & Gradient Overlay */}
                <div className="fixed inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80"
                        alt="Wedding Background"
                        className="w-full h-full object-cover"
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'linear-gradient(135deg, rgba(253, 251, 247, 0.78) 0%, rgba(255, 240, 245, 0.78) 100%)'
                        }}
                    />
                </div>

                {/* Content Wrapper */}
                <div className="relative z-10">
                    <Navbar userEmail={user.email} />

                    {/* Main Content */}
                    <main className="w-full min-h-screen pt-24 pb-24 md:pb-16">
                        {children}
                    </main>

                    <footer className="py-8 flex flex-col items-center gap-3 text-center text-gray-500 text-xs font-medium tracking-widest uppercase">
                        <div className="flex items-center gap-2 lowercase tracking-normal text-sm font-bold text-gray-700">
                            <svg width="0" height="0" className="hidden">
                                <linearGradient id="ig-gradient-dash" x1="1" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f09433" />
                                    <stop offset="25%" stopColor="#e6683c" />
                                    <stop offset="50%" stopColor="#dc2743" />
                                    <stop offset="75%" stopColor="#cc2366" />
                                    <stop offset="100%" stopColor="#bc1888" />
                                </linearGradient>
                            </svg>
                            <span>contact :</span>
                            <a href="https://instagram.com/wepln_for_all" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 inline-flex items-center gap-1.5 transition-colors group">
                                <Instagram size={18} stroke="url(#ig-gradient-dash)" className="group-hover:scale-110 transition-transform" />
                                wepln_for_all
                            </a>
                        </div>
                        <div className="opacity-70">© 2026 Wepln Corporation</div>
                    </footer>
                </div>
            </div>
        </Providers>
    )
}
