'use client'

import { useState } from 'react'
import { addTask } from '@/actions/checklist'
import { Plus, Calendar, Edit2, Wallet, FileText, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AddTaskModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        await addTask(formData)

        setIsSubmitting(false)
        onClose()
        router.refresh()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-pink-900/20 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F9A8D4 0%, #FBCFE8 100%)', padding: '1.5rem 2rem' }}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:20px_20px]"></div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-white/30 backdrop-blur-md flex items-center justify-center mb-3 text-white shadow-sm border border-white/20">
                            <Plus size={20} />
                        </div>
                        <p className="text-white/80 text-[11px] font-bold uppercase tracking-widest mb-1">새 할 일 추가</p>
                        <h3 className="font-bold text-xl text-white" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                            체크리스트 작성
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 bg-white">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* D-Day */}
                        <div>
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <Calendar size={12} className="text-pink-400" /> 시기 (D-Day offset)
                            </label>
                            <div className="flex items-center bg-gray-50 border-2 border-gray-100 rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-pink-400/10 focus-within:border-pink-400 transition-all focus-within:bg-white">
                                <span className="pl-4 font-bold text-gray-400 text-sm">D-</span>
                                <input
                                    type="number"
                                    name="d_day"
                                    className="flex-1 bg-transparent border-none py-3 px-2 text-sm text-gray-700 focus:ring-0 outline-none placeholder:text-gray-300"
                                    placeholder="예: 30"
                                    required
                                />
                                <span className="pr-4 text-xs font-bold text-gray-400">일</span>
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <Edit2 size={12} className="text-pink-400" /> 할 일 (Task)
                            </label>
                            <input
                                type="text"
                                name="title"
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 text-sm text-gray-700 outline-none transition-all focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-400/10 placeholder:text-gray-300"
                                placeholder="예: 양가 부모님 인사"
                                required
                            />
                        </div>

                        {/* Budget */}
                        <div>
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <Wallet size={12} className="text-pink-400" /> 예상 예산 (원)
                            </label>
                            <input
                                type="number"
                                name="budget"
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 text-sm text-gray-700 outline-none transition-all focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-400/10 placeholder:text-gray-300"
                                placeholder="0"
                            />
                        </div>

                        {/* Memo */}
                        <div>
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <FileText size={12} className="text-pink-400" /> 메모 (Memo)
                            </label>
                            <textarea
                                name="memo"
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 text-sm text-gray-700 outline-none transition-all focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-400/10 placeholder:text-gray-300 resize-none h-24"
                                placeholder="메모를 입력하세요..."
                            ></textarea>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    background: 'linear-gradient(135deg, #FB7185 0%, #F43F5E 100%)',
                                    boxShadow: '0 4px 15px rgba(251, 113, 133, 0.3)',
                                }}
                            >
                                <Plus size={16} />
                                {isSubmitting ? '항목 추가 중...' : '할 일 추가하기'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
