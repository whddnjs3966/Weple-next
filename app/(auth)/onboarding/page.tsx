'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Users, Sparkles } from 'lucide-react'

// Steps
// 0. Choose Path (신규 입력 vs 초대 코드)
// 1. Wedding Date
// 2. Budget Range
// 3. Style Preference

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        weddingDate: '',
        budgetRange: 3000, // Default 30M KRW
        styles: [] as string[]
    })
    const [inviteCode, setInviteCode] = useState('')
    const [inviteError, setInviteError] = useState('')
    const [inviteSuccess, setInviteSuccess] = useState('')

    const totalSteps = 4 // 0: path, 1: date, 2: budget, 3: style
    const handleNext = () => setStep(prev => prev + 1)
    const handleBack = () => setStep(prev => prev - 1)

    // 초대 코드로 참여
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
            // 잠시 성공 메시지를 보여준 후 대시보드로 이동
            setTimeout(() => {
                router.push('/dashboard')
            }, 1500)
        } catch (error) {
            console.error('Invite Code Error:', error)
            setInviteError('초대 코드 처리 중 오류가 발생했습니다.')
            setLoading(false)
        }
    }

    // 신규 정보 입력 완료
    const handleSubmit = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error('No user found')

            // 1. Update Profile with Wedding Date
            const { error: profileError } = await supabase
                .from('profiles')
                // @ts-ignore
                .update({ wedding_date: formData.weddingDate })
                .eq('id', user.id)

            if (profileError) throw profileError

            // 2. Call AI Server Action (To be implemented)
            // await generateWeddingPlan(formData)

            router.push('/dashboard')
        } catch (error) {
            console.error('Onboarding Error:', error)
            alert('설정 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a15] text-white flex items-center justify-center relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[url('/images/cosmos-bg.jpg')] bg-cover opacity-20" />
            <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />

            <div className="relative z-10 w-full max-w-2xl px-6">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-serif mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">
                        Wepln AI Concierge
                    </h1>
                    <p className="text-white/60">당신만의 우주를 설계하기 위한 몇 가지 질문입니다.</p>
                </div>

                {/* Progress Bar (Step 0 이후부터 표시) */}
                {step > 0 && (
                    <div className="w-full h-1 bg-white/10 rounded-full mb-12">
                        <div
                            className="h-full bg-pink-400 rounded-full transition-all duration-500"
                            style={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
                        />
                    </div>
                )}

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 min-h-[400px]">
                    <AnimatePresence mode="wait">

                        {/* Step 0: 경로 선택 */}
                        {step === 0 && (
                            <motion.div
                                key="step0"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <h2 className="text-2xl font-medium text-center mb-8">어떻게 시작하시겠어요?</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* 새로 시작하기 */}
                                    <button
                                        onClick={handleNext}
                                        className="group p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-pink-500/10 hover:border-pink-400/30 transition-all text-left"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Sparkles size={24} />
                                        </div>
                                        <div className="font-bold text-lg mb-1">새로 시작하기</div>
                                        <div className="text-sm text-white/50 leading-relaxed">
                                            결혼 준비 정보를 직접 입력하고<br />
                                            나만의 웨딩 플랜을 만들어요.
                                        </div>
                                    </button>

                                    {/* 초대 코드로 참여 */}
                                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center">
                                            <Users size={24} />
                                        </div>
                                        <div className="font-bold text-lg mb-1">초대 코드로 참여</div>
                                        <div className="text-sm text-white/50 mb-3">
                                            파트너에게 받은 코드를 입력하면<br />
                                            데이터가 자동으로 공유돼요.
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
                                            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-center text-lg tracking-[0.3em] font-mono uppercase focus:border-cyan-400 outline-none transition-colors placeholder:text-white/20 placeholder:tracking-normal placeholder:font-sans"
                                            maxLength={8}
                                        />

                                        {inviteError && (
                                            <p className="text-red-400 text-sm">{inviteError}</p>
                                        )}
                                        {inviteSuccess && (
                                            <p className="text-green-400 text-sm">{inviteSuccess}</p>
                                        )}

                                        <button
                                            onClick={handleJoinWithCode}
                                            disabled={loading || !inviteCode.trim()}
                                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-400 hover:to-cyan-300 text-white rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {loading ? '연결 중...' : '참여하기'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 1: 결혼 예정일 */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h2 className="text-2xl font-medium">결혼 예정일이 언제인가요?</h2>
                                <input
                                    type="date"
                                    className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-xl focus:border-pink-400 outline-none transition-colors"
                                    value={formData.weddingDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, weddingDate: e.target.value }))}
                                />
                            </motion.div>
                        )}

                        {/* Step 2: 예산 범위 */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h2 className="text-2xl font-medium">생각하시는 총 예산 범위는요?</h2>
                                <div className="text-4xl font-bold text-pink-300 mb-4">
                                    {formData.budgetRange >= 10000
                                        ? '1억 원 이상'
                                        : `${formData.budgetRange.toLocaleString()}만 원`}
                                </div>
                                <input
                                    type="range"
                                    min="1000"
                                    max="10000"
                                    step="500"
                                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-400"
                                    value={formData.budgetRange}
                                    onChange={(e) => setFormData(prev => ({ ...prev, budgetRange: Number(e.target.value) }))}
                                />
                                <div className="flex justify-between text-sm text-white/40">
                                    <span>1,000만 원</span>
                                    <span>1억 원+</span>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: 웨딩 스타일 */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h2 className="text-2xl font-medium">선호하는 웨딩 스타일을 골라주세요.</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'Dark', label: 'Dark & Moody', desc: '어두운 홀, 캔들, 웅장함' },
                                        { id: 'Garden', label: 'Garden & Nature', desc: '야외, 그리너리, 자연광' },
                                        { id: 'Modern', label: 'Bright & Modern', desc: '화이트, 미니멀, 깔끔함' },
                                        { id: 'Small', label: 'Small & Intimate', desc: '소규모, 가족 중심, 파티' },
                                    ].map((style) => (
                                        <button
                                            key={style.id}
                                            onClick={() => {
                                                setFormData(prev => {
                                                    const isActive = prev.styles.includes(style.id)
                                                    return {
                                                        ...prev,
                                                        styles: isActive
                                                            ? prev.styles.filter(s => s !== style.id)
                                                            : [...prev.styles, style.id]
                                                    }
                                                })
                                            }}
                                            className={`p-4 rounded-xl text-left transition-all border ${formData.styles.includes(style.id)
                                                ? 'bg-pink-500/20 border-pink-400'
                                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="font-bold text-lg">{style.label}</div>
                                            <div className="text-sm text-white/60">{style.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation Buttons (Step 0에서는 숨김) */}
                {step > 0 && (
                    <div className="mt-8 flex justify-between">
                        <button
                            onClick={handleBack}
                            className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                        >
                            이전
                        </button>

                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                className="px-8 py-3 bg-pink-500 hover:bg-pink-400 text-white rounded-xl font-medium transition-colors"
                            >
                                다음
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-pink-500/25"
                            >
                                {loading ? 'AI 분석 중...' : 'Wepln 시작하기'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
