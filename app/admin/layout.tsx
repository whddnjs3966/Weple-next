import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Shield } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, username')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') redirect('/dashboard')

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 관리자 헤더 */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-rose-100 rounded-lg">
                            <Shield size={16} className="text-rose-600" />
                        </div>
                        <span className="font-bold text-gray-800 text-sm">Weple Admin</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-400">
                            {profile?.username || user.email}
                        </span>
                        <Link
                            href="/dashboard"
                            className="text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
                        >
                            대시보드로 →
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    )
}
