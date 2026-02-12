'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Flower, Settings, LogOut, Calendar, CheckSquare, Store, Users, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function Navbar({ userEmail }: { userEmail?: string }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [newWeddingDate, setNewWeddingDate] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdating(true)
        const { updateWeddingDate } = await import('@/actions/profile')
        await updateWeddingDate(newWeddingDate)
        setIsUpdating(false)
        setIsProfileOpen(false)
        router.refresh()
    }

    return (
        <>
            <div className="fixed top-5 left-0 right-0 z-50 flex justify-center w-full px-4 pointer-events-none">
                <nav className="relative rounded-full bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg shadow-primary/10 transition-all duration-300 pointer-events-auto hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-px max-w-fit w-full">
                    {/* Accent Line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/5 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-70 rounded-b-sm"></div>

                    <div className="flex items-center justify-center gap-6 px-8 py-2">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white shadow-sm shadow-primary/30">
                                <Heart size={16} fill="white" />
                            </div>
                            <span className="font-serif font-bold text-lg text-gray-800 tracking-wide hidden sm:block">Wepln</span>
                        </Link>

                        {/* Center Navigation */}
                        <div className="hidden md:flex items-center gap-1 p-1 bg-gray-100/50 rounded-full border border-gray-100/50">
                            {[
                                { name: 'Schedule', href: '/schedule', icon: Calendar },
                                { name: 'Checklist', href: '/checklist', icon: CheckSquare },
                                { name: 'Vendors', href: '/vendors', icon: Store },
                                { name: 'Community', href: '/community', icon: Users },
                            ].map((item) => {
                                const Icon = item.icon
                                const isActive = pathname.startsWith(item.href)
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5",
                                            isActive
                                                ? "bg-white text-primary shadow-sm"
                                                : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                                        )}
                                    >
                                        <Icon size={12} />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Mobile 'Phrase' Fallback for center (optional, or just hide on mobile) */}
                        <div className="md:hidden text-xs text-gray-400 font-medium flex items-center gap-1">
                            <Flower size={10} className="text-primary-light" />
                            <span>Wepln</span>
                        </div>


                        {/* Right Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsProfileOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-100 bg-gray-50/80 text-gray-400 hover:bg-gradient-to-br hover:from-primary hover:to-primary-light hover:text-white hover:border-transparent hover:shadow-md hover:shadow-primary/20 transition-all text-xs font-semibold"
                                title="Settings"
                            >
                                <Settings size={14} />
                                <span className="hidden lg:inline">설정</span>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-100 bg-gray-50/80 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-transparent hover:shadow-md hover:shadow-red-500/10 transition-all text-xs font-semibold"
                                title="Logout"
                            >
                                <LogOut size={14} />
                                <span className="hidden lg:inline">Log Out</span>
                            </button>

                            {userEmail && (
                                <div className="hidden xl:flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-xs text-gray-500 font-medium border border-gray-200">
                                    {userEmail[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            </div>

            {/* Profile Modal Placeholder - To be implemented fully */}
            {isProfileOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:24px_24px]"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-3 text-white text-xl shadow-lg shadow-primary/30">
                                    <User />
                                </div>
                                <h3 className="font-serif font-bold text-xl text-white">내 정보 변경</h3>
                                <p className="text-white/50 text-xs mt-1">프로필과 결혼일을 수정하세요</p>
                            </div>
                            <button
                                onClick={() => setIsProfileOpen(false)}
                                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-8">
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">결혼식 예정일</label>
                                    <input
                                        type="date"
                                        value={newWeddingDate}
                                        onChange={(e) => setNewWeddingDate(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-70"
                                >
                                    {isUpdating ? '저장 중...' : '저장하기'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
