'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Heart, Sparkles, CalendarHeart, PiggyBank, Users } from 'lucide-react'
import Particles from '@/components/Particles'
import Link from 'next/link'

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
            className={`w-full rounded-3xl relative ${className}`}
        >
            <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(28px)',
                    WebkitBackdropFilter: 'blur(28px)',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
            />
            {children}
        </motion.div>
    )
}

function LoginPageContent() {
    const [loading, setLoading] = useState(false)
    const [aurora, setAurora] = useState({ x: 40, y: 50 })
    const pageRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    const searchParams = useSearchParams()
    const next = searchParams.get('next') || '/dashboard'
    const errorParam = searchParams.get('error')

    useEffect(() => {
        if (errorParam === 'auth-code-error') {
            alert('인증 코드를 교환하는 중 오류가 발생했습니다. 다시 시도해 주세요.')
        }
    }, [errorParam])

    const handleSocialLogin = async (provider: 'naver' | 'kakao' | 'google') => {
        if (provider === 'naver') {
            window.location.href = `/api/auth/naver?next=${encodeURIComponent(next)}`
            return
        }
        setLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
            },
        })
        if (error) {
            console.error(`${provider} login error:`, error)
            alert(`${provider} 로그인에 실패했습니다. 관리자에게 문의하세요.`)
            setLoading(false)
        }
    }

    return (
        <div
            ref={pageRef}
            className="relative min-h-screen w-full bg-[#0A0A14] flex items-center justify-center overflow-hidden font-sans"
            onMouseMove={(e) => {
                if (!pageRef.current) return
                const r = pageRef.current.getBoundingClientRect()
                setAurora({
                    x: ((e.clientX - r.left) / r.width) * 100,
                    y: ((e.clientY - r.top) / r.height) * 100,
                })
            }}
        >
            {/* Aurora gradient */}
            <div
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                    background: `
                        radial-gradient(ellipse 700px 500px at ${aurora.x * 0.5 + 10}% ${aurora.y * 0.5 + 8}%, rgba(139,92,246,0.15) 0%, transparent 65%),
                        radial-gradient(ellipse 550px 400px at ${92 - aurora.x * 0.3}% ${85 - aurora.y * 0.3}%, rgba(212,163,115,0.12) 0%, transparent 60%)
                    `,
                    transition: 'background 0.6s ease',
                }}
            />
            <Particles className="absolute inset-0 z-[1] opacity-40" quantity={60} />

            {/* Content */}
            <div className="relative z-10 w-full max-w-5xl mx-auto px-5 py-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-20">

                {/* ── Left panel (desktop only) ── */}
                <div className="hidden lg:flex flex-col flex-1 text-left">
                    <Link href="/" className="flex items-center gap-2.5 mb-12 group w-fit">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4A373] to-[#B8845A] flex items-center justify-center shadow-[0_0_20px_rgba(212,163,115,0.4)] group-hover:shadow-[0_0_30px_rgba(212,163,115,0.6)] transition-all">
                            <Heart size={16} className="text-white fill-white" />
                        </div>
                        <span className="text-white font-serif text-2xl font-bold tracking-tight">Wepln</span>
                    </Link>

                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-[#D4A373] text-xs font-semibold mb-5 tracking-widest w-fit">
                        <Sparkles size={10} /> AI 웨딩 플래너
                    </span>

                    <h1 className="text-4xl xl:text-5xl font-bold text-white mb-5 tracking-tight leading-[1.18] drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]">
                        결혼 준비의<br />
                        <span className="bg-gradient-to-r from-[#D4A373] via-[#EDD5A3] to-[#A78BFA] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(212,163,115,0.3)]">
                            새로운 기준
                        </span>
                    </h1>
                    <p className="text-white/40 text-sm leading-relaxed mb-10 font-medium">
                        AI가 맞춤 플랜을 설계하고,<br />커플이 함께 준비하는 웨딩 플래너
                    </p>

                    <div className="space-y-3.5">
                        {[
                            { icon: CalendarHeart, label: 'D-Day 기반 일정 & 체크리스트', color: '#A78BFA' },
                            { icon: PiggyBank, label: 'AI 예산 자동 배분', color: '#D4A373' },
                            { icon: Users, label: '커플 데이터 실시간 공유', color: '#F9A8D4' },
                            { icon: Sparkles, label: 'AI 장소 맞춤 추천', color: '#60A5FA' },
                        ].map(({ icon: Icon, label, color }, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner"
                                    style={{ background: `${color}18`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1)` }}
                                >
                                    <Icon size={14} style={{ color }} className="drop-shadow-[0_0_8px_currentColor]" />
                                </div>
                                <span className="text-white/60 text-sm font-medium">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right panel — Login Card ── */}
                <div className="w-full max-w-md lg:max-w-[360px] xl:max-w-md flex-shrink-0 perspective-[1000px]">

                    {/* Mobile logo */}
                    <div className="flex lg:hidden justify-center mb-8">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4A373] to-[#B8845A] flex items-center justify-center shadow-[0_0_18px_rgba(212,163,115,0.35)]">
                                <Heart size={16} className="text-white fill-white" />
                            </div>
                            <span className="text-white font-serif text-2xl font-bold">Wepln</span>
                        </Link>
                    </div>

                    {/* Card */}
                    <TiltCardWrapper>
                        <div className="relative z-10 w-full p-7 sm:p-8 flex flex-col items-center">
                            {/* Header */}
                            <div className="text-center mb-7">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4A373]/20 to-[#A78BFA]/20 border border-white/10 mb-4">
                                    <Heart size={22} className="text-[#D4A373] fill-[#D4A373]/40" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">환영합니다! 🎉</h2>
                                <p className="text-white/40 text-[13px] leading-relaxed break-keep">WEPLN과 함께 기분 좋은<br />결혼 준비를 시작해볼까요?</p>
                            </div>

                            {/* Error */}
                            {errorParam && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium mb-5">
                                    인증 중 오류가 발생했습니다. 다시 시도해 주세요.
                                </div>
                            )}

                            {/* Social Buttons */}
                            <div className="space-y-3">

                                {/* Naver */}
                                <button
                                    onClick={() => handleSocialLogin('naver')}
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-2xl bg-[#03C75A] hover:bg-[#02b351] flex items-center justify-center gap-3 text-white font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(3,199,90,0.28)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="font-extrabold text-base leading-none w-5 text-center">N</span>
                                    네이버로 시작하기
                                </button>

                                {/* Kakao */}
                                <button
                                    onClick={() => handleSocialLogin('kakao')}
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-2xl bg-[#FEE500] hover:bg-[#fdd800] flex items-center justify-center gap-3 text-[#191919] font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(254,229,0,0.22)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5 fill-[#191919]" viewBox="0 0 24 24">
                                        <path d="M12 3c5.523 0 10 3.582 10 8 0 2.658-1.583 5.035-4.067 6.467.243.882.88 3.23.918 3.42.062.302-.27.462-.482.327-.266-.17-3.95-2.67-4.57-3.08-.6.082-1.216.126-1.847.126-5.522 0-10-3.582-10-8s4.478-8 10-8z" />
                                    </svg>
                                    카카오로 시작하기
                                </button>

                                {/* Google */}
                                <button
                                    onClick={() => handleSocialLogin('google')}
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-3 text-white/75 font-bold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.10)',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.09)' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Google로 시작하기
                                </button>
                            </div>

                            {/* Footer */}
                            <div className="mt-7 pt-6 border-t border-white/[0.06] text-center">
                                <p className="text-white/18 text-xs">로그인 시 Wepln 이용약관에 동의하게 됩니다</p>
                            </div>
                        </div>
                    </TiltCardWrapper>

                    {/* Quote */}
                    <p className="text-center text-white/12 text-sm font-cursive mt-6">
                        &ldquo;Two souls with but a single thought, two hearts that beat as one.&rdquo;
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0A0A14]" />}>
            <LoginPageContent />
        </Suspense>
    )
}
