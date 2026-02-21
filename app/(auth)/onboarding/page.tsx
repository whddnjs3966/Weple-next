'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Calendar, Users, Sparkles, Heart, MapPin, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { WEDDING_LOCATIONS, SIDO_LIST } from '@/lib/constants/wedding-locations'
import Particles from '@/components/Particles'

/* ─── 3D Tilt Card Wrapper ─── */
function TiltCardWrapper({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 })
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 })

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [3, -3])
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-3, 3])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return
        const rect = ref.current.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        const xPct = mouseX / width - 0.5
        const yPct = mouseY / height - 0.5
        x.set(xPct)
        y.set(yPct)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
            }}
            className={`w-full rounded-3xl p-7 sm:p-8 min-h-[400px] flex flex-col relative ${className}`}
        >
            <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                    background: 'rgba(255,255,255,0.035)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
                }}
            />
            {children}
        </motion.div>
    )
}

// Steps
// 0. Choose Path (신규 입력 vs 초대 코드)
// 1. Wedding Date
// 2. Wedding Location
// 3. Budget Range
// 4. Style Preference

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        weddingDate: '',
        regionSido: '',
        regionSigungu: '',
        budgetRange: 3000,
        styles: [] as string[],
    })
    const [inviteCode, setInviteCode] = useState('')
    const [inviteError, setInviteError] = useState('')
    const [inviteSuccess, setInviteSuccess] = useState('')

    const totalSteps = 5
    const handleNext = () => setStep(prev => prev + 1)
    const handleBack = () => setStep(prev => prev - 1)

    const handleJoinWithCode = async () => {
        if (!inviteCode.trim()) {
            setInviteError('초대 코드를 입력해 주세요.')
            return
        }
        setLoading(true)
        setInviteError('')
        try {
            const { joinByInviteCode } = await import('@/actions/invite')
            const result = await joinByInviteCode(inviteCode)
            if (result.error) {
                setInviteError(result.error)
                setLoading(false)
                return
            }
            setInviteSuccess(result.message || '파트너와 연결되었습니다!')
            setTimeout(() => router.push('/dashboard'), 1500)
        } catch (error) {
            console.error('Invite Code Error:', error)
            setInviteError('초대 코드 처리 중 오류가 발생했습니다.')
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user found')

            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    wedding_date: formData.weddingDate,
                    region_sido: formData.regionSido || null,
                    region_sigungu: formData.regionSigungu || null,
                    budget_max: formData.budgetRange,
                    style: formData.styles.join(',') || null,
                })
                .eq('id', user.id)

            if (profileError) throw profileError

            const { generateInviteCode } = await import('@/actions/invite')
            await generateInviteCode()

            router.push('/dashboard')
        } catch (error) {
            console.error('Onboarding Error:', error)
            alert('설정 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const sigunguList = formData.regionSido ? WEDDING_LOCATIONS[formData.regionSido] || [] : []

    const fadeSlide = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.28, ease: 'easeOut' } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: 'easeIn' } },
    }

    return (
        <div className="relative min-h-screen w-full bg-[#0A0A14] flex items-center justify-center overflow-hidden font-sans py-12 px-5">

            {/* Aurora */}
            <div
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                    background: `
                        radial-gradient(ellipse 700px 600px at 25% 30%, rgba(139,92,246,0.13) 0%, transparent 65%),
                        radial-gradient(ellipse 600px 500px at 80% 70%, rgba(212,163,115,0.10) 0%, transparent 60%)
                    `,
                }}
            />
            <Particles className="absolute inset-0 z-[1] opacity-35" quantity={55} />

            <div className="relative z-10 w-full max-w-2xl">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4A373]/20 to-[#A78BFA]/20 border border-white/10 mb-4">
                        <Heart size={20} className="text-[#D4A373] fill-[#D4A373]/40" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        Wepln <span className="bg-gradient-to-r from-[#D4A373] to-[#A78BFA] bg-clip-text text-transparent">AI Concierge</span>
                    </h1>
                    <p className="text-white/35 text-sm">아름다운 웨딩을 위한 몇 가지 질문입니다.</p>
                </div>

                {/* Progress bar (step 1+) */}
                {step > 0 && (
                    <div className="w-full h-1.5 rounded-full mb-8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div
                            className="h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(212,163,115,0.5)]"
                            style={{
                                width: `${(step / (totalSteps - 1)) * 100}%`,
                                background: 'linear-gradient(90deg, #A78BFA, #D4A373)',
                            }}
                        />
                    </div>
                )}

                {/* Tilt Card Wrapper for Onboarding Steps */}
                <TiltCardWrapper>
                    <AnimatePresence mode="wait">

                        {/* ── Step 0: 경로 선택 ── */}
                        {step === 0 && (
                            <motion.div
                                key="step0"
                                {...fadeSlide}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="space-y-6 flex-1 relative z-10"
                            >
                                <h2 className="text-2xl font-bold text-white text-center mb-8 tracking-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">어떻게 시작하시겠어요?</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* 새로 시작하기 */}
                                    <button
                                        onClick={handleNext}
                                        className="group p-6 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                                        style={{
                                            background: 'rgba(167,139,250,0.06)',
                                            border: '1px solid rgba(167,139,250,0.15)',
                                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)'; e.currentTarget.style.background = 'rgba(167,139,250,0.12)'; e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(167,139,250,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(167,139,250,0.15)'; e.currentTarget.style.background = 'rgba(167,139,250,0.06)'; e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05)' }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#A78BFA]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="w-12 h-12 rounded-xl bg-[#A78BFA]/15 border border-[#A78BFA]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-[#A78BFA] shadow-[0_0_15px_rgba(167,139,250,0.2)]">
                                            <Sparkles size={22} />
                                        </div>
                                        <div className="font-bold text-lg mb-1.5 text-white">새로 시작하기</div>
                                        <div className="text-sm text-white/40 leading-relaxed">
                                            결혼 준비 정보를 직접 입력하고<br />나만의 웨딩 플랜을 만들어요.
                                        </div>
                                    </button>

                                    {/* 초대 코드로 참여 */}
                                    <div
                                        className="p-6 rounded-2xl space-y-4 group transition-all duration-300 relative overflow-hidden"
                                        style={{
                                            background: 'rgba(212,163,115,0.06)',
                                            border: '1px solid rgba(212,163,115,0.15)',
                                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212,163,115,0.4)'; e.currentTarget.style.background = 'rgba(212,163,115,0.12)'; e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(212,163,115,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(212,163,115,0.15)'; e.currentTarget.style.background = 'rgba(212,163,115,0.06)'; e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05)' }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#D4A373]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="w-12 h-12 rounded-xl bg-[#D4A373]/15 border border-[#D4A373]/20 flex items-center justify-center text-[#D4A373] shadow-[0_0_15px_rgba(212,163,115,0.2)] group-hover:scale-110 transition-transform">
                                            <Users size={22} />
                                        </div>
                                        <div className="font-bold text-lg text-white">초대 코드로 참여</div>
                                        <div className="text-sm text-white/40 leading-relaxed">
                                            파트너에게 받은 코드를 입력하면<br />데이터가 자동으로 공유돼요.
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="초대 코드 입력"
                                            value={inviteCode}
                                            onChange={(e) => {
                                                setInviteCode(e.target.value.toUpperCase())
                                                setInviteError('')
                                                setInviteSuccess('')
                                            }}
                                            className="relative z-10 w-full rounded-xl px-4 py-3 text-center text-lg tracking-[0.3em] font-mono uppercase outline-none transition-all placeholder:text-white/20 placeholder:tracking-normal placeholder:font-sans text-white focus:ring-2 focus:ring-[#D4A373]/30"
                                            style={{
                                                background: 'rgba(255,255,255,0.06)',
                                                border: '1px solid rgba(255,255,255,0.15)',
                                            }}
                                            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,163,115,0.6)'; e.currentTarget.style.background = 'rgba(0,0,0,0.2)' }}
                                            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                                            maxLength={8}
                                        />

                                        {inviteError && <p className="text-red-400 text-sm">{inviteError}</p>}
                                        {inviteSuccess && <p className="text-[#A7C4A0] text-sm font-medium">{inviteSuccess}</p>}

                                        <button
                                            onClick={handleJoinWithCode}
                                            disabled={loading || !inviteCode.trim()}
                                            className="relative z-10 w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_8px_20px_rgba(212,163,115,0.3)] border border-white/10"
                                            style={{ background: 'linear-gradient(135deg, #D4A373, #B8845A)' }}
                                        >
                                            {loading ? '연결 중...' : '참여하기'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Step 1: 결혼 예정일 ── */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                {...fadeSlide}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="space-y-6 flex-1 relative z-10"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/15 border border-[#A78BFA]/20 flex items-center justify-center text-[#A78BFA] flex-shrink-0 shadow-[0_0_15px_rgba(167,139,250,0.3)]">
                                        <Calendar size={18} />
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">결혼 예정일이 언제인가요?</h2>
                                </div>
                                <input
                                    type="date"
                                    className="w-full rounded-xl p-5 text-lg sm:text-xl outline-none transition-all text-white font-medium"
                                    style={{
                                        background: 'rgba(0,0,0,0.2)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        colorScheme: 'dark',
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                                    }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(167,139,250,0.6)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(167,139,250,0.2), inset 0 2px 4px rgba(0,0,0,0.2)' }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)' }}
                                    value={formData.weddingDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, weddingDate: e.target.value }))}
                                />
                            </motion.div>
                        )}

                        {/* ── Step 2: 결혼 장소 ── */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                {...fadeSlide}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="space-y-5 flex-1 relative z-10"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-[#60A5FA]/15 border border-[#60A5FA]/20 flex items-center justify-center text-[#60A5FA] flex-shrink-0 shadow-[0_0_15px_rgba(96,165,250,0.3)]">
                                        <MapPin size={18} />
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">어디서 결혼하실 예정인가요?</h2>
                                </div>

                                {/* 시·도 선택 */}
                                <div>
                                    <p className="text-xs text-white/35 mb-3 font-semibold tracking-wider uppercase">시·도 선택</p>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {SIDO_LIST.map((sido) => (
                                            <button
                                                key={sido}
                                                onClick={() => setFormData(prev => ({ ...prev, regionSido: sido, regionSigungu: '' }))}
                                                className="py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all hover:-translate-y-0.5"
                                                style={formData.regionSido === sido
                                                    ? { background: 'rgba(96,165,250,0.2)', border: '1px solid rgba(96,165,250,0.6)', color: '#60A5FA', boxShadow: '0 4px 12px rgba(96,165,250,0.2), inset 0 1px 0 rgba(255,255,255,0.1)' }
                                                    : { background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }
                                                }
                                                onMouseEnter={(e) => { if (formData.regionSido !== sido) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' } }}
                                                onMouseLeave={(e) => { if (formData.regionSido !== sido) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(0,0,0,0.2)' } }}
                                            >
                                                {sido}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 상세 도시 선택 */}
                                {formData.regionSido && sigunguList.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                                    >
                                        <p className="text-xs text-white/35 mb-3 font-semibold tracking-wider uppercase">상세 지역 선택</p>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                            {sigunguList.map((sigungu) => (
                                                <button
                                                    key={sigungu}
                                                    onClick={() => setFormData(prev => ({ ...prev, regionSigungu: sigungu }))}
                                                    className="py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all hover:-translate-y-0.5"
                                                    style={formData.regionSigungu === sigungu
                                                        ? { background: 'rgba(212,163,115,0.2)', border: '1px solid rgba(212,163,115,0.6)', color: '#D4A373', boxShadow: '0 4px 12px rgba(212,163,115,0.2), inset 0 1px 0 rgba(255,255,255,0.1)' }
                                                        : { background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }
                                                    }
                                                    onMouseEnter={(e) => { if (formData.regionSigungu !== sigungu) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' } }}
                                                    onMouseLeave={(e) => { if (formData.regionSigungu !== sigungu) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(0,0,0,0.2)' } }}
                                                >
                                                    {sigungu}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {formData.regionSido && formData.regionSigungu && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 text-sm text-[#A7C4A0] bg-[#A7C4A0]/10 px-4 py-2.5 rounded-xl border border-[#A7C4A0]/20 w-max">
                                        <Check size={16} />
                                        <span className="font-bold">{formData.regionSido} {formData.regionSigungu}</span>
                                    </motion.div>
                                )}
                                {!formData.regionSido && (
                                    <p className="text-xs text-white/22">아직 정하지 않으셨다면 건너뛰기를 눌러주세요.</p>
                                )}
                            </motion.div>
                        )}

                        {/* ── Step 3: 예산 범위 ── */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                {...fadeSlide}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="space-y-6 flex-1 relative z-10"
                            >
                                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">생각하시는 총 예산 범위는요?</h2>

                                <div
                                    className="text-5xl sm:text-6xl font-bold tracking-tight drop-shadow-[0_0_15px_rgba(212,163,115,0.4)]"
                                    style={{ background: 'linear-gradient(135deg, #D4A373, #EDD5A3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                                >
                                    {formData.budgetRange >= 10000
                                        ? '1억 원 이상'
                                        : `${formData.budgetRange.toLocaleString()}`}
                                    {formData.budgetRange < 10000 && <span className="text-2xl sm:text-3xl font-medium text-white/40 ml-1">만 원</span>}
                                </div>

                                {/* Custom range slider */}
                                <div className="relative pt-4 pb-2">
                                    <input
                                        type="range"
                                        min="1000"
                                        max="10000"
                                        step="500"
                                        className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(90deg, #D4A373 ${(formData.budgetRange - 1000) / 90}%, rgba(255,255,255,0.1) ${(formData.budgetRange - 1000) / 90}%)`,
                                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)'
                                        }}
                                        value={formData.budgetRange}
                                        onChange={(e) => setFormData(prev => ({ ...prev, budgetRange: Number(e.target.value) }))}
                                    />
                                </div>

                                <div className="flex justify-between text-xs text-white/40 font-bold uppercase tracking-widest">
                                    <span>1,000만 원</span>
                                    <span>1억 원+</span>
                                </div>

                                {/* Budget breakdown preview */}
                                <div
                                    className="rounded-2xl p-5 space-y-3 relative overflow-hidden"
                                    style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)' }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
                                    <p className="text-xs text-white/40 mb-4 font-bold tracking-widest uppercase flex items-center gap-2"><Sparkles size={12} className="text-[#D4A373]" /> AI 예산 배분 미리보기</p>
                                    {[
                                        { label: '웨딩홀', pct: 50, color: '#D4A373' },
                                        { label: '스드메', pct: 15, color: '#A78BFA' },
                                        { label: '신혼여행', pct: 20, color: '#60A5FA' },
                                        { label: '기타', pct: 15, color: '#A7C4A0' },
                                    ].map((b) => {
                                        const amount = Math.round((formData.budgetRange * b.pct) / 100)
                                        return (
                                            <div key={b.label} className="flex items-center gap-4 relative z-10">
                                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-[0_0_8px_currentColor]" style={{ background: b.color, color: b.color }} />
                                                <span className="text-white/60 text-sm font-medium w-16">{b.label}</span>
                                                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                                    <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${b.pct}%`, background: b.color, boxShadow: `0 0 10px ${b.color}` }} />
                                                </div>
                                                <span className="text-sm font-bold w-24 text-right" style={{ color: b.color }}>{amount.toLocaleString()}만 원</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* ── Step 4: 웨딩 스타일 ── */}
                        {step === 4 && (
                            <motion.div
                                key="step4"
                                {...fadeSlide}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="space-y-6 flex-1 relative z-10"
                            >
                                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">어떤 분위기의 웨딩을 원하시나요?</h2>
                                <p className="text-white/40 text-sm -mt-3 font-medium">여러 개를 선택할 수 있어요.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    {[
                                        { id: 'Classic', label: 'Classic & Elegant', desc: '클래식, 고급스러운, 격식', color: '#D4A373', emoji: '✨' },
                                        { id: 'Garden', label: 'Garden & Nature', desc: '야외, 그리너리, 자연광', color: '#A7C4A0', emoji: '🌿' },
                                        { id: 'Modern', label: 'Bright & Modern', desc: '화이트, 미니멀, 깔끔함', color: '#60A5FA', emoji: '🤍' },
                                        { id: 'Small', label: 'Small & Intimate', desc: '소규모, 가족 중심, 파티', color: '#F9A8D4', emoji: '💝' },
                                    ].map((style) => {
                                        const active = formData.styles.includes(style.id)
                                        return (
                                            <button
                                                key={style.id}
                                                onClick={() => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        styles: active
                                                            ? prev.styles.filter(s => s !== style.id)
                                                            : [...prev.styles, style.id],
                                                    }))
                                                }}
                                                className="p-5 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group"
                                                style={active
                                                    ? { background: `${style.color}15`, border: `1px solid ${style.color}60`, boxShadow: `0 10px 30px -10px ${style.color}40, inset 0 1px 0 rgba(255,255,255,0.1)` }
                                                    : { background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }
                                                }
                                                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' } }}
                                                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(0,0,0,0.2)' } }}
                                            >
                                                {active && (
                                                    <motion.div
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center shadow-[0_0_10px_currentColor]"
                                                        style={{ background: style.color, color: style.color }}
                                                    >
                                                        <Check size={13} className="text-white drop-shadow-sm" />
                                                    </motion.div>
                                                )}
                                                <div className={`text-3xl mb-3 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{style.emoji}</div>
                                                <div className="font-bold text-base sm:text-lg mb-1.5 transition-colors" style={{ color: active ? style.color : 'rgba(255,255,255,0.9)' }}>
                                                    {style.label}
                                                </div>
                                                <div className="text-xs sm:text-sm text-white/40">{style.desc}</div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </TiltCardWrapper>

                {/* Navigation (step 1+) */}
                {step > 0 && (
                    <div className="mt-5 flex items-center justify-between gap-3">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl text-white/50 text-sm font-medium transition-all hover:text-white/80"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            <ArrowLeft size={15} /> 이전
                        </button>

                        <div className="flex gap-2">
                            {step === 2 && (
                                <button
                                    onClick={handleNext}
                                    className="px-5 py-3 rounded-xl text-white/40 text-sm font-medium transition-all hover:text-white/60"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                                >
                                    건너뛰기
                                </button>
                            )}

                            {step < 4 ? (
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(212,163,115,0.3)]"
                                    style={{ background: 'linear-gradient(135deg, #D4A373, #B8845A)' }}
                                >
                                    다음 <ArrowRight size={15} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(212,163,115,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ background: 'linear-gradient(135deg, #D4A373, #B8845A)' }}
                                >
                                    {loading ? 'AI 분석 중...' : (
                                        <><Sparkles size={15} /> Wepln 시작하기</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
