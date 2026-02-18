'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, PenTool, Loader2 } from 'lucide-react'
import { createPost } from '@/actions/community'
import TextEditor from './TextEditor'

const CATEGORIES = [
    { code: 'FREE', name: '자유게시판' },
    { code: 'QUESTION', name: 'Q&A' },
    { code: 'REVIEW', name: '후기' },
    { code: 'TIP', name: '꿀팁' },
]

export default function WritePostForm() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [category, setCategory] = useState('FREE')
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!title.trim() || !content.trim()) {
            setError('제목과 내용을 모두 입력해주세요.')
            return
        }

        const formData = new FormData()
        formData.append('title', title)
        formData.append('content', content)
        formData.append('category', category)

        startTransition(async () => {
            const result = await createPost(formData)
            if (result?.error) {
                setError(result.error)
            } else {
                router.push('/community')
            }
        })
    }

    return (
        <div className="max-w-4xl mx-auto px-4 pb-20">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="font-serif italic text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-2">
                    New Post
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-pink-400"></div>
                    <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                    <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-pink-400"></div>
                </div>
                <p className="text-gray-400 text-sm mt-4">새로운 이야기를 들려주세요</p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-[20px] shadow-xl border border-white/50 p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Category Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600 block pl-1">카테고리</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.code}
                                    type="button"
                                    onClick={() => setCategory(cat.code)}
                                    className={`
                                        px-4 py-2 rounded-xl text-sm font-medium transition-all
                                        ${category === cat.code
                                            ? 'bg-pink-400 text-white shadow-lg shadow-pink-300/30 font-bold scale-105'
                                            : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title Input */}
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-bold text-gray-600 block pl-1">제목</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="제목을 입력하세요"
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300/50 focus:border-pink-300 transition-all font-medium"
                            disabled={isPending}
                        />
                    </div>

                    {/* Content Input (Rich Text Editor) */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600 block pl-1">내용</label>
                        <div className="h-[450px]">
                            <TextEditor
                                value={content}
                                onChange={setContent}
                                placeholder="자유롭게 이야기를 나누어보세요. (질문, 후기, 꿀팁 등)"
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center justify-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-8">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 px-6 py-3.5 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-50 hover:text-gray-700 transition-all flex items-center justify-center gap-2"
                            disabled={isPending}
                        >
                            <ChevronLeft size={18} />
                            취소
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] px-6 py-3.5 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold shadow-lg shadow-pink-300/30 hover:shadow-pink-300/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    저장 중...
                                </>
                            ) : (
                                <>
                                    <PenTool size={18} />
                                    글 등록하기
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
