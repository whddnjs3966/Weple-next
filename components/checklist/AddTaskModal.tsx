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
            <div className="absolute inset-0 bg-rose-900/20 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-br from-rose-400 to-rose-500 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:24px_24px]"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 text-white text-xl shadow-lg">
                            <Plus size={24} />
                        </div>
                        <h3 className="font-serif font-bold text-xl text-white">새 할 일 추가</h3>
                        <p className="text-white/50 text-xs mt-1">체크리스트에 새 항목을 추가하세요</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 bg-white">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* D-Day */}
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                                <Calendar size={12} className="text-primary" /> 시기 (D-Day offset)
                            </label>
                            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                <span className="pl-4 font-bold text-gray-400 text-sm">D-</span>
                                <input
                                    type="number"
                                    name="d_day"
                                    className="flex-1 bg-transparent border-none py-3 px-2 text-sm text-gray-700 focus:ring-0 outline-none"
                                    placeholder="000 (예: -30)"
                                    required
                                />
                                <span className="pr-4 text-xs text-gray-400">일</span>
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                                <Edit2 size={12} className="text-primary" /> 할 일 (Task)
                            </label>
                            <input
                                type="text"
                                name="title"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
                                placeholder="할 일을 입력하세요"
                                required
                            />
                        </div>

                        {/* Budget */}
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                                <Wallet size={12} className="text-primary" /> 예상 예산 (원)
                            </label>
                            <input
                                type="number"
                                name="budget"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
                                placeholder="0"
                            />
                        </div>

                        {/* Memo */}
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                                <FileText size={12} className="text-primary" /> 메모 (Memo)
                            </label>
                            <textarea
                                name="memo"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400 resize-none h-24"
                                placeholder="메모를 입력하세요"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-primary to-primary-light text-white font-bold text-sm shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            <Plus size={18} />
                            {isSubmitting ? '추가 중...' : '추가하기'}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    )
}
