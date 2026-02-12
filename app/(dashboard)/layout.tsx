import Navbar from '@/components/Navbar'
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
        <div className="min-h-screen bg-gray-50">
            <Navbar userEmail={user.email} />

            {/* Main Content */}
            <main className="w-full min-h-screen pt-24 pb-16">
                {children}
            </main>

            <footer className="py-8 text-center text-gray-400 text-[10px] font-medium tracking-widest uppercase">
                © 2026 Wepln Corporation
            </footer>
        </div>
    )
}
