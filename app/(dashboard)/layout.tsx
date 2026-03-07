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

                    <footer className="py-12 flex flex-col items-center gap-5 text-center px-4">
                        <div className="flex flex-col items-center justify-center gap-3">
                            <p className="text-sm font-medium text-gray-300">위플랜과 함께하는 결혼 준비, 소토은 언제든 환영해요 ✨</p>
                            <a
                                href="https://instagram.com/wepln_for_all"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-pink-400/50 transition-all duration-300 group"
                            >
                                <Instagram size={20} className="text-[#E1306C] group-hover:scale-110 transition-transform duration-300" />
                                <span className="font-bold text-white tracking-wide">@wepln_for_all</span>
                            </a>
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium tracking-widest uppercase mt-4">
                            © 2026 Wepln Corporation
                        </div>
                    </footer>
                </div>
            </div>
        </Providers>
    )
}
