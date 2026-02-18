'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Users, Sparkles, Flower2 } from 'lucide-react'

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

            // 1. Update Profile with Wedding Date, Budget, and Style
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    wedding_date: formData.weddingDate,
                    budget_max: formData.budgetRange,
                    style: formData.styles.join(',') || null,
                })
                .eq('id', user.id)

            if (profileError) throw profileError

            router.push('/dashboard')
        } catch (error) {
            console.error('Onboarding Error:', error)
            alert('설정 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blush via-rose-50 to-cream text-rose-900 flex items-center justify-center relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-rose-200/20 rounded-full blur-[120px]" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-rose-100/30 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gold/5 rounded-full blur-[80px]" />

            {/* Floating petal decorations */}
            <svg className="absolute top-20 right-32 w-8 h-8 opacity-15 animate-float" viewBox="0 0 50 50" fill="none">
                <ellipse cx="25" cy="25" rx="10" ry="20" fill="#FB7185" transform="rotate(25 25 25)" />
            </svg>
            <svg className="absolute bottom-40 left-20 w-6 h-6 opacity-10 animate-float [animation-delay:3s]" viewBox="0 0 50 50" fill="none">
                <ellipse cx="25" cy="25" rx="8" ry="16" fill="#FDA4AF" transform="rotate(-35 25 25)" />
            </svg>

            <div className="relative z-10 w-full max-w-2xl px-6">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 text-rose-400 mb-3">
                        <Flower2 size={24} />
                    </div>
                    <h1 className="text-4xl font-serif mb-2 text-gradient-rose">
                        Wepln AI Concierge
                    </h1>
                    <p className="text-rose-400/70">아름다운 웨딩을 위한 몇 가지 질문입니다.</p>
                </div>

                {/* Progress Bar (Step 0 이후부터 표시) */}
                {step > 0 && (
                    <div className="w-full h-1.5 bg-rose-100 rounded-full mb-12">
                        <div
                            className="h-full bg-gradient-to-r from-rose-400 to-rose-300 rounded-full transition-all duration-500"
                            style={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
                        />
                    </div>
                )}

                <div className="bg-white/70 backdrop-blur-xl border border-rose-100 rounded-3xl p-8 min-h-[400px] shadow-petal">
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
                                <h2 className="text-2xl font-serif font-medium text-center mb-8 text-rose-900">어떻게 시작하시겠어요?</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* 새로 시작하기 */}
                                    <button
                                        onClick={handleNext}
                                        className="group p-6 rounded-2xl border border-rose-100 bg-white/50 hover:bg-rose-50 hover:border-rose-200 transition-all text-left"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-400 to-rose-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-white shadow-lg shadow-rose-300/30">
                                            <Sparkles size={24} />
                                        </div>
                                        <div className="font-bold text-lg mb-1 text-rose-900">새로 시작하기</div>
                                        <div className="text-sm text-rose-400/70 leading-relaxed">
                                            결혼 준비 정보를 직접 입력하고<br />
                                            나만의 웨딩 플랜을 만들어요.
                                        </div>
                                    </button>

                                    {/* 초대 코드로 참여 */}
                                    <div className="p-6 rounded-2xl border border-rose-100 bg-white/50 space-y-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-gold to-amber-400 flex items-center justify-center text-white shadow-lg shadow-gold/20">
                                            <Users size={24} />
                                        </div>
                                        <div className="font-bold text-lg mb-1 text-rose-900">초대 코드로 참여</div>
                                        <div className="text-sm text-rose-400/70 mb-3">
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
                                            className="w-full bg-rose-50/50 border border-rose-200 rounded-xl px-4 py-3 text-center text-lg tracking-[0.3em] font-mono uppercase focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all placeholder:text-rose-200 placeholder:tracking-normal placeholder:font-sans text-rose-900"
                                            maxLength={8}
                                        />

                                        {inviteError && (
                                            <p className="text-red-500 text-sm">{inviteError}</p>
                                        )}
                                        {inviteSuccess && (
                                            <p className="text-sage text-sm font-medium">{inviteSuccess}</p>
                                        )}

                                        <button
                                            onClick={handleJoinWithCode}
                                            disabled={loading || !inviteCode.trim()}
                                            className="w-full py-3 bg-gradient-to-r from-gold to-amber-400 hover:from-amber-400 hover:to-gold text-white rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-gold/20"
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
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-400">
                                        <Calendar size={20} />
                                    </div>
                                    <h2 className="text-2xl font-serif font-medium text-rose-900">결혼 예정일이 언제인가요?</h2>
                                </div>
                                <input
                                    type="date"
                                    className="w-full bg-rose-50/30 border border-rose-200 rounded-xl p-4 text-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all text-rose-900"
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
                                <h2 className="text-2xl font-serif font-medium text-rose-900">생각하시는 총 예산 범위는요?</h2>
                                <div className="text-4xl font-bold text-gradient-rose mb-4">
                                    {formData.budgetRange >= 10000
                                        ? '1억 원 이상'
                                        : `${formData.budgetRange.toLocaleString()}만 원`}
                                </div>
                                <input
                                    type="range"
                                    min="1000"
                                    max="10000"
                                    step="500"
                                    className="w-full h-2 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-400"
                                    value={formData.budgetRange}
                                    onChange={(e) => setFormData(prev => ({ ...prev, budgetRange: Number(e.target.value) }))}
                                />
                                <div className="flex justify-between text-sm text-rose-300">
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
                                <h2 className="text-2xl font-serif font-medium text-rose-900">선호하는 웨딩 스타일을 골라주세요.</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'Classic', label: 'Classic & Elegant', desc: '클래식, 고급스러운, 격식' },
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
                                                ? 'bg-rose-50 border-rose-300 shadow-petal'
                                                : 'bg-white/50 border-rose-100 hover:bg-rose-50/50'
                                                }`}
                                        >
                                            <div className="font-bold text-lg text-rose-900">{style.label}</div>
                                            <div className="text-sm text-rose-400/70">{style.desc}</div>
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
                            className="px-6 py-3 rounded-xl border border-rose-200 hover:bg-rose-50 transition-colors text-rose-700 font-medium"
                        >
                            이전
                        </button>

                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                className="px-8 py-3 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-rose-300/25"
                            >
                                다음
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-8 py-3 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-rose-300/25"
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
