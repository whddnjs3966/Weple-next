'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateProfile } from '@/actions/settings'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Calendar, Users, Copy, Check, X } from 'lucide-react'

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    user: any
    weddingDate: Date | null
    inviteCode?: string
}

export default function SettingsModal({ isOpen, onClose, user, weddingDate, inviteCode = 'CODE-LOADING...' }: SettingsModalProps) {
    const [loading, setLoading] = useState(false)
    const [firstName, setFirstName] = useState(user?.user_metadata?.first_name || user?.email?.split('@')[0] || '')
    const [date, setDate] = useState(weddingDate ? weddingDate.toISOString().split('T')[0] : '')
    const [code, setCode] = useState(inviteCode)
    const [copied, setCopied] = useState(false)

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFirstName(user?.user_metadata?.first_name || user?.email?.split('@')[0] || '')
            // Ensure date string is YYYY-MM-DD local time consideration might be needed, but simple split is ok for date input
            if (weddingDate) {
                const offset = weddingDate.getTimezoneOffset()
                const localDate = new Date(weddingDate.getTime() - (offset * 60 * 1000))
                setDate(localDate.toISOString().split('T')[0])
            } else {
                setDate('')
            }
        }
    }, [isOpen, user, weddingDate])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation: Prevent users from changing their name TO "관리자"
        // But allow if their current name IS ALREADY "관리자" (they are just saving other settings)
        const currentName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || '';
        if (firstName.trim() === '관리자' && currentName !== '관리자') {
            alert("'관리자'라는 닉네임은 사용할 수 없습니다.");
            return;
        }

        setLoading(true)

        const formData = new FormData()
        formData.append('first_name', firstName)
        formData.append('wedding_date', date)

        const result = await updateProfile(formData)

        setLoading(false)
        if (result?.error) {
            alert('Failed to update settings')
        } else {
            onClose()
            // Optional: Show success toast
        }
    }

    const copyCode = () => {
        navigator.clipboard.writeText(inviteCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-rose-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={onClose}
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[24px] overflow-hidden w-full max-w-md shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="relative bg-gradient-to-br from-rose-400 to-rose-500 p-8 text-center overflow-hidden">
                                {/* Pattern Overlay */}
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 text-white shadow-lg">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-serif text-white font-bold mb-1">내 정보 변경</h2>
                                    <p className="text-white/50 text-xs">프로필과 결혼일을 수정하세요</p>
                                </div>

                                <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Body */}
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                {/* Name Input */}
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        <User className="w-4 h-4 text-rose-400" />
                                        닉네임
                                    </label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full bg-rose-50/30 border-2 border-rose-100 rounded-xl px-4 py-3 text-rose-900 outline-none transition-all focus:bg-white focus:border-rose-400"
                                        placeholder="닉네임을 입력하세요"
                                    />
                                </div>

                                {/* Date Input */}
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        <Calendar className="w-4 h-4 text-rose-400" />
                                        결혼 예정일
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-rose-50/30 border-2 border-rose-100 rounded-xl px-4 py-3 text-rose-900 outline-none focus:bg-white focus:border-rose-400 transition-all"
                                    />
                                </div>

                                {/* Invite Code */}
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        <Users className="w-4 h-4 text-rose-400" />
                                        파트너 초대코드
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-center font-bold text-gray-700 tracking-widest text-lg">
                                            {code}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={copyCode}
                                            className={`px-4 rounded-xl border-2 transition-all flex items-center justify-center ${copied
                                                ? 'bg-green-500 border-green-500 text-white'
                                                : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-rose-400 hover:text-rose-400'
                                                }`}
                                        >
                                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 ml-1">이 코드를 파트너에게 공유하여 함께 관리하세요</p>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-400 to-rose-500 text-white font-bold shadow-lg shadow-rose-300/30 hover:shadow-rose-300/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                                >
                                    {loading ? '저장 중...' : '저장하기'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
