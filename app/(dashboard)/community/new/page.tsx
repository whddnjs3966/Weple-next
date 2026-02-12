'use client'

import { createPost } from '@/actions/community'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'

export default function NewPostPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        const formData = new FormData(e.currentTarget)
        await createPost(formData)
        setIsSubmitting(false)
        router.push('/community')
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4">

            <Link
                href="/community"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors font-medium text-sm"
            >
                <ArrowLeft size={16} />
                목록으로 돌아가기
            </Link>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Edit className="text-primary" size={20} /> 새 글 작성
                    </h2>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">게시판 선택</label>
                            <select
                                name="category"
                                className="w-full md:w-1/3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            >
                                <option value="free">자유게시판</option>
                                <option value="notice">공지사항 (관리자용)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">제목</label>
                            <input
                                type="text"
                                name="title"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                placeholder="제목을 입력하세요"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">본문 내용</label>
                            <textarea
                                name="content"
                                className="w-full h-80 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 resize-none"
                                placeholder="자유롭게 이야기를 나누어보세요..."
                                required
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Link
                                href="/community"
                                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                            >
                                취소
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-70"
                            >
                                {isSubmitting ? '등록 중...' : '등록완료'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>

        </div>
    )
}
