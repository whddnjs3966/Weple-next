import Navbar from '@/components/Navbar'
import Providers from './Providers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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

                    <footer className="py-8 text-center text-gray-400 text-[10px] font-medium tracking-widest uppercase">
                        © 2026 Wepln Corporation
                    </footer>
                </div>
            </div>
        </Providers>
    )
}
