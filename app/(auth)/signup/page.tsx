'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart } from 'lucide-react'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        })

        if (error) {
            alert(error.message)
            setLoading(false)
        } else {
            alert('회원가입 확인 메일을 보냈습니다! 이메일을 확인해주세요.')
            router.push('/login')
        }
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">

            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                    alt="Wedding Flowers"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
            </div>

            {/* Signup Glass Card */}
            <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in-up duration-700">
                <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 md:p-10 shadow-2xl border border-white/50">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#FF8E8E]/10 text-[#FF8E8E] mb-4 shadow-sm">
                            <Heart size={24} className="fill-current" />
                        </div>
                        <h2 className="font-serif text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
                        <p className="text-gray-500 text-sm font-medium">Start your journey with Weple</p>
                    </div>

                    {/* Signup Form */}
                    <form className="space-y-5" onSubmit={handleSignup}>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF8E8E]/50 focus:border-[#FF8E8E] transition-all shadow-sm"
                                placeholder="이메일 주소"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF8E8E]/50 focus:border-[#FF8E8E] transition-all shadow-sm"
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-[#FF8E8E] text-white font-bold shadow-lg shadow-[#FF8E8E]/30 hover:bg-[#ff7a7a] hover:shadow-[#FF8E8E]/50 hover:-translate-y-0.5 transition-all mt-2 disabled:opacity-50"
                        >
                            {loading ? '가입하기' : '무료로 시작하기'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-8 pt-6 border-t border-gray-200/60 text-center">
                        <p className="text-gray-500 text-xs">
                            이미 계정이 있으신가요?
                            <Link href="/login" className="font-bold text-[#FF8E8E] hover:text-[#ff7a7a] ml-1 no-underline transition-colors">
                                로그인
                            </Link>
                        </p>
                    </div>

                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-10 left-0 w-full text-center text-white/80 text-xs font-serif italic z-10 drop-shadow-md">
                "Two souls with but a single thought, two hearts that beat as one."
            </div>
        </div>
    )
}
