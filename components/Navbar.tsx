'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flower2, Settings, LogOut, Calendar, CheckSquare, Store, Users, User, Copy, Check, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { signOutAction } from '@/actions/auth'
import { cn } from '@/lib/utils'
import { WEDDING_LOCATIONS, SIDO_LIST } from '@/lib/constants/wedding-locations'

export default function Navbar({ userEmail }: { userEmail?: string }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [displayName, setDisplayName] = useState('') // 버튼에 표시할 이름
    const [nickname, setNickname] = useState('')
    const [newWeddingDate, setNewWeddingDate] = useState('')
    const [regionSido, setRegionSido] = useState('')
    const [regionSigungu, setRegionSigungu] = useState('')
    const [inviteCode, setInviteCode] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)
    const [isLoadingProfile, setIsLoadingProfile] = useState(false)
    const [copied, setCopied] = useState(false)

    // 마운트 시 display name 로드 (버튼 레이블용)
    useEffect(() => {
        const loadDisplayName = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single()

            const name = profile?.full_name || userEmail?.split('@')[0] || ''
            setDisplayName(name)
        }
        loadDisplayName()
    }, [])

    // Load full profile data when modal opens
    useEffect(() => {
        if (isProfileOpen) {
            loadProfileData()
        }
    }, [isProfileOpen])

    const loadProfileData = async () => {
        setIsLoadingProfile(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setIsLoadingProfile(false); return }

        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, invite_code, wedding_date, region_sido, region_sigungu')
            .eq('id', user.id)
            .single()

        if (profile) {
            setNickname(profile.full_name || '')
            setInviteCode(profile.invite_code || '')
            // wedding_date가 "2026-06-15T00:00:00+00:00" 형태일 수 있으므로 앞 10자만 사용
            if (profile.wedding_date) setNewWeddingDate(String(profile.wedding_date).slice(0, 10))
            if (profile.region_sido) setRegionSido(profile.region_sido)
            if (profile.region_sigungu) setRegionSigungu(profile.region_sigungu)
        }
        setIsLoadingProfile(false)
    }

    const handleLogout = async () => {
        await signOutAction()
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdating(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase
                    .from('profiles')
                    .update({
                        full_name: nickname,
                        region_sido: regionSido || null,
                        region_sigungu: regionSigungu || null,
                    })
                    .eq('id', user.id)

                setDisplayName(nickname || userEmail?.split('@')[0] || '')
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

    const sigunguList = regionSido ? WEDDING_LOCATIONS[regionSido] || [] : []

    return (
        <>
            <div className="fixed top-5 left-0 right-0 z-50 flex justify-center w-full px-4 pointer-events-none">
                <nav className="relative rounded-full bg-white/80 backdrop-blur-xl border border-pink-200/50 shadow-lg shadow-pink-200/15 transition-all duration-300 pointer-events-auto hover:shadow-xl hover:shadow-pink-200/20 hover:-translate-y-px max-w-fit w-full">
                    {/* Accent Line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/5 h-[2px] bg-gradient-to-r from-transparent via-pink-300 to-transparent opacity-70 rounded-b-sm"></div>

                    <div className="flex items-center justify-center gap-3 md:gap-6 px-4 md:px-8 py-2">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105 shrink-0">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center text-white shadow-sm shadow-pink-300/30 shrink-0">
                                <Flower2 size={16} />
                            </div>
                            <span className="font-cursive font-bold text-xl text-gray-900 tracking-wide shrink-0">Wepln</span>
                        </Link>

                        {/* Center: Navigation (Dashboard) or Phrase (Landing) */}
                        <div className="hidden md:flex items-center justify-center">
                            {['/dashboard', '/schedule', '/checklist', '/places', '/community'].some(path => pathname.startsWith(path)) ? (
                                <div className="flex items-center gap-1 p-1 bg-pink-50/50 rounded-full border border-pink-100/50">
                                    {[
                                        { name: '일정표', href: '/schedule', icon: Calendar },
                                        { name: '체크리스트', href: '/checklist', icon: CheckSquare },
                                        { name: '장소', href: '/places', icon: Store },
                                        { name: '커뮤니티', href: '/community', icon: Users },
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
                                <span className="hidden lg:inline">{displayName || '설정'}</span>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pink-100 bg-pink-50/50 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-transparent hover:shadow-md hover:shadow-red-500/10 transition-all text-xs font-semibold"
                                title="Logout"
                            >
                                <LogOut size={14} />
                                <span className="hidden lg:inline">로그아웃</span>
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            {/* ─── Mobile Bottom Navigation ─── */}
            {['/dashboard', '/schedule', '/checklist', '/places', '/community'].some(path => pathname.startsWith(path)) && (
                <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 backdrop-blur-xl border-t border-pink-100/50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-around px-2 py-2">
                        {[
                            { name: '일정표', href: '/schedule', icon: Calendar },
                            { name: '체크리스트', href: '/checklist', icon: CheckSquare },
                            { name: '장소', href: '/places', icon: MapPin },
                            { name: '커뮤니티', href: '/community', icon: Users },
                        ].map((item) => {
                            const Icon = item.icon
                            const isActive = pathname.startsWith(item.href)
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[60px]",
                                        isActive
                                            ? "text-pink-500"
                                            : "text-gray-400"
                                    )}
                                >
                                    <Icon size={20} />
                                    <span className="text-[10px] font-bold">{item.name}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* ─── Profile Modal (Spring Wedding Style) ─── */}
            {isProfileOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-pink-900/10 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">

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
                            {isLoadingProfile ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-2 border-pink-200 border-t-pink-400 rounded-full animate-spin" />
                                </div>
                            ) : null}
                            <form onSubmit={handleUpdateProfile} className={`space-y-6 ${isLoadingProfile ? 'opacity-0 pointer-events-none' : ''}`}>
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

                                {/* Wedding Location */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        <MapPin size={12} className="text-pink-400" />
                                        결혼 장소
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            value={regionSido}
                                            onChange={(e) => {
                                                setRegionSido(e.target.value)
                                                setRegionSigungu('')
                                            }}
                                            className="flex-1 bg-pink-50/50 border-2 border-pink-100 rounded-[14px] px-3 py-3 text-sm text-gray-800 outline-none transition-all focus:border-pink-300 focus:bg-white focus:ring-4 focus:ring-pink-100"
                                        >
                                            <option value="">시·도 선택</option>
                                            {SIDO_LIST.map(sido => (
                                                <option key={sido} value={sido}>{sido}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={regionSigungu}
                                            onChange={(e) => setRegionSigungu(e.target.value)}
                                            disabled={!regionSido}
                                            className="flex-1 bg-pink-50/50 border-2 border-pink-100 rounded-[14px] px-3 py-3 text-sm text-gray-800 outline-none transition-all focus:border-pink-300 focus:bg-white focus:ring-4 focus:ring-pink-100 disabled:opacity-50"
                                        >
                                            <option value="">상세 지역</option>
                                            {sigunguList.map(sigungu => (
                                                <option key={sigungu} value={sigungu}>{sigungu}</option>
                                            ))}
                                        </select>
                                    </div>
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
                                            value={inviteCode || '코드 없음'}
                                            className="flex-1 bg-pink-50/50 border-2 border-pink-100 rounded-[14px] px-4 py-3 text-center text-sm font-bold text-gray-800 tracking-[3px] outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={copyInviteCode}
                                            disabled={!inviteCode}
                                            className="px-4 py-3 rounded-[14px] border-2 border-pink-100 bg-pink-50/50 text-gray-400 hover:border-pink-300 hover:text-pink-500 transition-all flex items-center gap-1 disabled:opacity-40"
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
