'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { Flower2 } from 'lucide-react'

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
        // 네이버는 커스텀 API Route로 처리
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
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">

            {/* Wedding Photo Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80"
                    alt="Wedding"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md px-6 animate-fade-in-up">
                <div className="rounded-3xl p-8 md:p-10 shadow-petal bg-white/85 backdrop-blur-xl border border-pink-200/50">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-pink-50 text-pink-400 mb-4">
                            <Flower2 size={26} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                        <p className="text-gray-500 text-sm font-medium">Plan your dream wedding with Wepln</p>
                    </div>

                    {/* Error Message */}
                    {errorParam && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-500 text-xs text-center font-medium mb-5">
                            아이디 또는 비밀번호를 확인해주세요.
                        </div>
                    )}

                    {/* Social Login Buttons */}
                    <div className="space-y-3">

                        {/* Naver Button */}
                        <button
                            onClick={() => handleSocialLogin('naver')}
                            disabled={loading}
                            className="w-full py-4 rounded-2xl bg-[#03C75A] hover:bg-[#02b351] flex items-center justify-center gap-3 text-white font-bold shadow-lg shadow-[#03C75A]/20 hover:-translate-y-0.5 transition-all"
                        >
                            <span className="font-bold text-sm">N</span>
                            <span className="font-bold text-sm tracking-wide">네이버로 시작하기</span>
                        </button>

                        {/* Kakao Button */}
                        <button
                            onClick={() => handleSocialLogin('kakao')}
                            disabled={loading}
                            className="w-full py-4 rounded-2xl bg-[#FEE500] hover:bg-[#fdd800] flex items-center justify-center gap-3 text-[#191919] font-bold shadow-lg shadow-[#FEE500]/20 hover:-translate-y-0.5 transition-all"
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 3c5.523 0 10 3.582 10 8 0 2.658-1.583 5.035-4.067 6.467.243.882.88 3.23.918 3.42.062.302-.27.462-.482.327-.266-.17-3.95-2.67-4.57-3.08-.6.082-1.216.126-1.847.126-5.522 0-10-3.582-10-8s4.478-8 10-8z" /></svg>
                            <span className="font-bold text-sm tracking-wide">카카오로 시작하기</span>
                        </button>

                        {/* Google Button */}
                        <button
                            onClick={() => handleSocialLogin('google')}
                            disabled={loading}
                            className="w-full py-4 rounded-2xl bg-white border border-pink-100 hover:bg-pink-50/50 flex items-center justify-center gap-3 text-gray-700 font-bold shadow-soft hover:-translate-y-0.5 transition-all"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            <span className="font-bold text-sm tracking-wide">Google로 시작하기</span>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="mt-8 pt-6 border-t border-pink-100 text-center">
                        <p className="text-gray-400 text-xs">소셜 계정으로 간편하게 시작하세요</p>
                    </div>
                </div>
            </div>

            {/* Decorative Quote */}
            <div className="absolute bottom-10 left-0 w-full text-center text-white/70 text-xs font-cursive text-lg z-10">
                &ldquo;Two souls with but a single thought, two hearts that beat as one.&rdquo;
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className='min-h-screen flex items-center justify-center bg-blush'>Loading...</div>}>
            <LoginPageContent />
        </Suspense>
    )
}
