'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import Image from 'next/image'

function LoginPageContent() {
    const [loading, setLoading] = useState(false)
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
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-100/30 blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-yellow-100/30 blur-3xl" />
            </div>

            <main className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center z-10">

                {/* Left Side — Image Card with Stack Effect */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="relative hidden lg:block"
                >
                    {/* Card Stack Effect */}
                    <div className="absolute inset-0 bg-[#f0efe9] rounded-2xl transform rotate-[-2deg] translate-x-[-10px] translate-y-[10px] shadow-sm z-0" />
                    <div className="absolute inset-0 bg-[#e8e6df] rounded-2xl transform rotate-[-4deg] translate-x-[-20px] translate-y-[20px] shadow-sm z-[-1]" />

                    {/* Main Image Card — Polaroid style */}
                    <div className="relative bg-white p-3 pb-12 rounded-xl shadow-xl transform rotate-[2deg] transition-transform duration-500 hover:rotate-0 z-10">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                            <Image
                                src="/images/login_bouquet.jpg"
                                alt="Wedding Bouquet"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-700"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                            <div className="absolute bottom-6 left-6 text-white text-left">
                                <h2 className="text-4xl font-serif mb-2 tracking-wide">
                                    Beautiful Memories
                                </h2>
                                <p className="text-sm font-light opacity-90 tracking-wider font-pretendard">
                                    당신의 가장 소중한 순간을 위해 WepIn이 함께합니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Mobile Image — simplified */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="lg:hidden relative w-full max-w-sm mx-auto"
                >
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                        <Image
                            src="/images/login_bouquet.jpg"
                            alt="Wedding Bouquet"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                            <h2 className="text-2xl font-serif tracking-wide">Beautiful Memories</h2>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side — Login Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    className="flex flex-col items-center text-center max-w-md mx-auto lg:mx-0 lg:w-full"
                >
                    {/* Header */}
                    <div className="mb-10">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <h1 className="text-5xl font-serif text-[#8B7355]">WepIn</h1>
                            <Sparkles className="w-5 h-5 text-[#D4C4A8] animate-pulse" />
                        </div>
                        <h2 className="text-xl text-gray-700 mb-1 font-medium">반가워요, 예비 부부님!</h2>
                        <p className="text-gray-400 text-sm font-light">로그인하여 결혼 준비를 이어가세요.</p>
                    </div>

                    {/* Login Card */}
                    <div className="w-full bg-gradient-to-b from-white to-[#fcfcfc] p-8 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white/50 mb-10">

                        {/* Error */}
                        {errorParam && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-center font-medium mb-5">
                                인증 중 오류가 발생했습니다. 다시 시도해 주세요.
                            </div>
                        )}

                        {/* Social Buttons */}
                        <div className="space-y-4">

                            {/* Naver */}
                            <button
                                onClick={() => handleSocialLogin('naver')}
                                disabled={loading}
                                className="w-full h-14 bg-[#03C75A] hover:bg-[#02b350] text-white rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                                <span className="font-extrabold text-lg leading-none w-5 text-center">N</span>
                                <span className="font-medium text-[15px]">네이버로 시작하기</span>
                            </button>

                            {/* Kakao */}
                            <button
                                onClick={() => handleSocialLogin('kakao')}
                                disabled={loading}
                                className="w-full h-14 bg-[#FEE500] hover:bg-[#fddc00] text-[#191919] rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                                <svg className="w-6 h-6 fill-[#191919]" viewBox="0 0 24 24">
                                    <path d="M12 3c5.523 0 10 3.582 10 8 0 2.658-1.583 5.035-4.067 6.467.243.882.88 3.23.918 3.42.062.302-.27.462-.482.327-.266-.17-3.95-2.67-4.57-3.08-.6.082-1.216.126-1.847.126-5.522 0-10-3.582-10-8s4.478-8 10-8z" />
                                </svg>
                                <span className="font-medium text-[15px]">카카오로 시작하기</span>
                            </button>

                            {/* Google */}
                            <button
                                onClick={() => handleSocialLogin('google')}
                                disabled={loading}
                                className="w-full h-14 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="font-medium text-[15px]">Google로 시작하기</span>
                            </button>
                        </div>
                    </div>

                    {/* Footer Quote */}
                    <div className="space-y-1 opacity-70">
                        <p className="font-serif italic text-lg text-gray-600">
                            Two souls with but a single thought,
                        </p>
                        <p className="font-serif italic text-lg text-gray-600">
                            two hearts that beat as one.
                        </p>
                    </div>
                </motion.div>
            </main>

            {/* Copyright */}
            <footer className="absolute bottom-4 text-center w-full text-[10px] text-gray-300 uppercase tracking-widest">
                &copy; 2024 WepIn. All rights reserved.
            </footer>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FCFAF6]" />}>
            <LoginPageContent />
        </Suspense>
    )
}
