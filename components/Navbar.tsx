'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flower2, Settings, LogOut, Calendar, CheckSquare, Store, Users, User, Copy, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export default function Navbar({ userEmail }: { userEmail?: string }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [nickname, setNickname] = useState('')
    const [newWeddingDate, setNewWeddingDate] = useState('')
    const [inviteCode, setInviteCode] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)
    const [copied, setCopied] = useState(false)

    // Load profile data when modal opens
    useEffect(() => {
        if (isProfileOpen) {
            loadProfileData()
        }
    }, [isProfileOpen])

    const loadProfileData = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, invite_code, wedding_group_id')
            .eq('id', user.id)
            .single()

        if (profile) {
            setNickname(profile.full_name || '')
            setInviteCode(profile.invite_code || '코드 없음')

            if (profile.wedding_group_id) {
                const { data: group } = await supabase
                    .from('wedding_groups')
                    .select('wedding_date')
                    .eq('id', profile.wedding_group_id)
                    .single() as { data: { wedding_date: string | null } | null }
                if (group?.wedding_date) {
                    setNewWeddingDate(group.wedding_date)
                }
            }
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdating(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase
                    .from('profiles')
                    .update({ full_name: nickname })
                    .eq('id', user.id)
            }
            if (newWeddingDate) {
                const { updateWeddingDate } = await import('@/actions/profile')
                await updateWeddingDate(newWeddingDate)
            }
        } catch (err) {
            console.error('Profile update error:', err)
        }
        setIsUpdating(false)
        setIsProfileOpen(false)
        router.refresh()
    }

    const copyInviteCode = async () => {
        if (inviteCode && inviteCode !== '코드 없음') {
            await navigator.clipboard.writeText(inviteCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <>
            <div className="fixed top-5 left-0 right-0 z-50 flex justify-center w-full px-4 pointer-events-none">
                <nav className="relative rounded-full bg-white/80 backdrop-blur-xl border border-pink-200/50 shadow-lg shadow-pink-200/15 transition-all duration-300 pointer-events-auto hover:shadow-xl hover:shadow-pink-200/20 hover:-translate-y-px max-w-fit w-full">
                    {/* Accent Line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/5 h-[2px] bg-gradient-to-r from-transparent via-pink-300 to-transparent opacity-70 rounded-b-sm"></div>

                    <div className="flex items-center justify-center gap-6 px-8 py-2">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105 shrink-0">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center text-white shadow-sm shadow-pink-300/30 shrink-0">
                                <Flower2 size={16} />
                            </div>
                            <span className="font-cursive font-bold text-xl text-gray-900 tracking-wide shrink-0">Wepln</span>
                        </Link>

                        {/* Center: Navigation (Dashboard) or Phrase (Landing) */}
                        <div className="hidden md:flex items-center justify-center">
                            {['/dashboard', '/schedule', '/checklist', '/vendors', '/community'].some(path => pathname.startsWith(path)) ? (
                                <div className="flex items-center gap-1 p-1 bg-pink-50/50 rounded-full border border-pink-100/50">
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
                                                        ? "bg-white text-pink-500 shadow-sm shadow-pink-100"
                                                        : "text-gray-700 hover:text-pink-500 hover:bg-white/50"
                                                )}
                                            >
                                                <Icon size={12} />
                                                {item.name}
                                            </Link>
                                        )
                                    })}
                                </div>
                            ) : (
                                <span className="text-gray-400 text-xs font-medium flex items-center gap-2 tracking-widest uppercase">
                                    <Flower2 size={12} className="text-pink-300" />
                                    당신의 아름다운 웨딩
                                    <Flower2 size={12} className="text-pink-300" />
                                </span>
                            )}
                        </div>

                        {/* Mobile Fallback */}
                        <div className="md:hidden text-xs text-gray-400 font-medium flex items-center gap-1">
                            <Flower2 size={10} className="text-pink-300" />
                            <span>Wepln</span>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsProfileOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pink-100 bg-pink-50/50 text-gray-400 hover:bg-gradient-to-br hover:from-pink-300 hover:to-pink-400 hover:text-white hover:border-transparent hover:shadow-md hover:shadow-pink-300/20 transition-all text-xs font-semibold"
                                title="Settings"
                            >
                                <Settings size={14} />
                                <span className="hidden lg:inline">설정</span>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pink-100 bg-pink-50/50 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-transparent hover:shadow-md hover:shadow-red-500/10 transition-all text-xs font-semibold"
                                title="Logout"
                            >
                                <LogOut size={14} />
                                <span className="hidden lg:inline">Log Out</span>
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            {/* ─── Profile Modal (Spring Wedding Style) ─── */}
            {isProfileOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-pink-900/10 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        {/* Modal Header - Pastel Pink Gradient */}
                        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F9A8D4 0%, #FBCFE8 100%)', padding: '2rem 2rem 1.8rem' }}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:24px_24px]"></div>
                            <div className="relative z-10 text-center">
                                <div className="w-12 h-12 rounded-[14px] bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 text-white shadow-lg">
                                    <User size={22} />
                                </div>
                                <h3 className="font-serif font-bold text-xl text-white">내 정보 변경</h3>
                                <p className="text-white/70 text-xs mt-1">프로필과 결혼일을 수정하세요</p>
                            </div>
                            <button
                                onClick={() => setIsProfileOpen(false)}
                                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8">
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                {/* Nickname */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        <User size={12} className="text-pink-400" />
                                        닉네임
                                    </label>
                                    <input
                                        type="text"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        placeholder="닉네임을 입력하세요"
                                        className="w-full bg-pink-50/50 border-2 border-pink-100 rounded-[14px] px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:border-pink-300 focus:bg-white focus:ring-4 focus:ring-pink-100"
                                    />
                                </div>

                                {/* Wedding Date */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        <Calendar size={12} className="text-pink-400" />
                                        결혼 예정일
                                    </label>
                                    <input
                                        type="date"
                                        value={newWeddingDate}
                                        onChange={(e) => setNewWeddingDate(e.target.value)}
                                        className="w-full bg-pink-50/50 border-2 border-pink-100 rounded-[14px] px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:border-pink-300 focus:bg-white focus:ring-4 focus:ring-pink-100"
                                    />
                                </div>

                                {/* Partner Invite Code */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        <Users size={12} className="text-pink-400" />
                                        파트너 초대코드
                                    </label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            readOnly
                                            value={inviteCode}
                                            className="flex-1 bg-pink-50/50 border-2 border-pink-100 rounded-[14px] px-4 py-3 text-center text-sm font-bold text-gray-800 tracking-[3px] outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={copyInviteCode}
                                            className="px-4 py-3 rounded-[14px] border-2 border-pink-100 bg-pink-50/50 text-gray-400 hover:border-pink-300 hover:text-pink-500 transition-all flex items-center gap-1"
                                        >
                                            {copied ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-2 ml-1">이 코드를 파트너에게 공유하여 함께 관리하세요</p>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="w-full py-3.5 rounded-[14px] border-none text-white font-bold text-sm cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-70 bg-gradient-to-r from-pink-300 to-pink-400 shadow-lg shadow-pink-300/30"
                                >
                                    {isUpdating ? '저장 중...' : '✓ 저장하기'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
