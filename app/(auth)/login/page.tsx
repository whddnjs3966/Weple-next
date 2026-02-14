'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import Particles from '@/components/Particles'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    // Tilt Effect State
    const cardRef = useRef<HTMLDivElement>(null)
    const [rotateX, setRotateX] = useState(0)
    const [rotateY, setRotateY] = useState(0)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return

        const card = cardRef.current
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2

        const rotateXValue = ((y - centerY) / centerY) * -8 // Reduced rotation for elegance
        const rotateYValue = ((x - centerX) / centerX) * 8

        setRotateX(rotateXValue)
        setRotateY(rotateYValue)
    }

    const handleMouseLeave = () => {
        setRotateX(0)
        setRotateY(0)
    }

    const searchParams = useSearchParams()
    const next = searchParams.get('next') || '/dashboard' // Default to dashboard if no next param

    const handleSocialLogin = async (provider: 'naver' | 'kakao' | 'google') => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: provider as any,
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

            {/* 1. Background Layers */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                    alt="Bright Wedding Background"
                    className="w-full h-full object-cover"
                />
                {/* Lighter, brighter overlay */}
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[4px]"></div>

                {/* Floating Orbs for extra depth (Subtler) */}
                <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#FF8E8E]/30 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#FFB5B5]/30 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            {/* 2. 3D Tilt Container */}
            <div
                className="relative z-10 perspective-1000 p-6"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Glass Card - Increased width (max-w-[480px]) */}
                <div
                    ref={cardRef}
                    className="w-full max-w-[480px] bg-white/60 backdrop-blur-2xl border border-white/60 rounded-[40px] px-12 py-14 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-transform duration-100 ease-out"
                    style={{
                        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                        transformStyle: 'preserve-3d',
                    }}
                >
                    {/* Inner 3D Content Layer */}
                    <div style={{ transform: 'translateZ(30px)' }} className="flex flex-col items-center">

                        {/* Logo / Icon */}
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF8E8E] to-[#FFB5B5] flex items-center justify-center text-white shadow-lg mb-8 animate-float">
                            <Heart size={32} className="fill-current" />
                        </div>

                        {/* Updated Text */}
                        <h2 className="text-3xl font-bold text-gray-800 mb-3 tracking-tight font-serif text-center">
                            Begin Your Journey
                        </h2>
                        <p className="text-gray-600 text-sm mb-12 text-center leading-relaxed">
                            가장 완벽한 결혼 준비의 시작,<br />
                            Wepln과 함께 꿈꾸던 순간을 만드세요.
                        </p>

                        {/* Social Login Buttons Container */}
                        <div className="w-full space-y-3">

                            {/* Naver Button - Uses NextAuth */}
                            <button
                                onClick={() => {
                                    setLoading(true)
                                    // Dynamically import signIn to avoid SSR issues if needed, or just use standard import
                                    import('next-auth/react').then(({ signIn }) => {
                                        signIn('naver', { callbackUrl: next })
                                    })
                                }}
                                className="w-full h-12 rounded-xl bg-[#03C75A] hover:bg-[#02b351] flex items-center justify-center gap-3 text-white transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-[#03C75A]/20 group"
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" /></svg>
                                <span className="font-bold text-sm tracking-wide">네이버로 시작하기</span>
                            </button>

                            {/* Kakao Button - Reduced Height (h-12) */}
                            <button
                                onClick={() => handleSocialLogin('kakao')}
                                className="w-full h-12 rounded-xl bg-[#FEE500] hover:bg-[#fdd800] flex items-center justify-center gap-3 text-[#191919] transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-[#FEE500]/20 group"
                            >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 3c5.523 0 10 3.582 10 8 0 2.658-1.583 5.035-4.067 6.467.243.882.88 3.23.918 3.42.062.302-.27.462-.482.327-.266-.17-3.95-2.67-4.57-3.08-.6.082-1.216.126-1.847.126-5.522 0-10-3.582-10-8s4.478-8 10-8z" /></svg>
                                <span className="font-bold text-sm tracking-wide">카카오로 시작하기</span>
                            </button>

                            {/* Google Button - Reduced Height (h-12) */}
                            <button
                                onClick={() => handleSocialLogin('google')}
                                className="w-full h-12 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 flex items-center justify-center gap-3 text-gray-700 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-gray-200/50 group"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                <span className="font-bold text-sm tracking-wide">Google로 시작하기</span>
                            </button>
                        </div>

                    </div>

                    {/* Shine Effect */}
                    <div className="absolute inset-0 rounded-[40px] pointer-events-none bg-gradient-to-tr from-white/40 to-transparent opacity-40"></div>
                </div>
            </div>

            {/* Footer Quote */}
            <div className="absolute bottom-8 z-20 text-white/80 text-xs font-serif italic tracking-widest pointer-events-none drop-shadow-md">
                DESIGN YOUR PERFECT MOMENT
            </div>

        </div>
    )
}
