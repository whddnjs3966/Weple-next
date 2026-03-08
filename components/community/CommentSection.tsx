'use client'

import { useState } from 'react'
import { User, Trash2, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { createComment, deleteComment } from '@/actions/community'
import { motion, AnimatePresence } from 'framer-motion'

interface Author {
    username: string | null
    full_name: string | null
    role: string | null
}

interface Comment {
    id: string
    content: string
    created_at: string
    user_id: string
    author: Author | null
}

interface CommentSectionProps {
    postId: string
    initialComments: Comment[]
    currentUserId: string | null
    isAdmin: boolean
}

export default function CommentSection({ postId, initialComments, currentUserId, isAdmin }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [content, setContent] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim() || isSubmitting) return

        setIsSubmitting(true)
        const formData = new FormData()
        formData.append('post_id', postId)
        formData.append('content', content)

        try {
            const result = await createComment(formData)
            if (result.success) {
                // Refresh comments or just update state - for simplicity and better UX, 
                // we could fetch all comments again but here we'll assume the action revalidated the page
                // and we'll just reload the window or use a more complex state sync.
                // Since this is a client component in a server page, window.location.reload() is simplest for consistency
                window.location.reload()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (commentId: string) => {
        if (isDeleting) return
        if (!confirm('댓글을 삭제하시겠습니까?')) return

        setIsDeleting(commentId)
        try {
            const result = await deleteComment(commentId)
            if (result.success) {
                setComments(prev => prev.filter(c => c.id !== commentId))
            } else {
                alert(result.error || '삭제에 실패했습니다.')
            }
        } catch (err) {
            console.error(err)
            alert('삭제 중 오류가 발생했습니다.')
        } finally {
            setIsDeleting(null)
        }
    }

    return (
        <div className="bg-white/50 backdrop-blur-md rounded-[24px] p-8 border border-white/50 shadow-sm mt-8">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                댓글 <span className="text-pink-500">{comments.length}</span>
            </h3>

            {/* List */}
            <div className="space-y-6 mb-8">
                <AnimatePresence mode='popLayout'>
                    {comments.map(comment => {
                        const isOwner = currentUserId === comment.user_id
                        const canDelete = isOwner || isAdmin

                        return (
                            <motion.div
                                key={comment.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex gap-3 group"
                            >
                                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 flex-shrink-0">
                                    <User size={14} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-xs text-gray-800">
                                                {comment.author?.role === 'admin' ? '👑관리자' : (comment.author?.username || comment.author?.full_name || '익명')}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {format(new Date(comment.created_at), 'yyyy/MM/dd HH:mm')}
                                            </span>
                                        </div>

                                        {canDelete && (
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                disabled={isDeleting === comment.id}
                                                className="flex items-center gap-1 text-gray-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-md transition-colors text-[10px] font-medium"
                                                title="댓글 삭제"
                                            >
                                                {isDeleting === comment.id ? (
                                                    <Loader2 size={12} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={12} />
                                                )}
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                        {comment.content}
                                    </p>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                {comments.length === 0 && (
                    <p className="text-center py-4 text-gray-400 text-sm">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
                )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="relative">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-24 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl p-4 text-sm focus:ring-2 focus:ring-pink-300/50 focus:border-pink-300 outline-none resize-none shadow-sm transition-all placeholder-gray-400 disabled:opacity-50"
                    placeholder={currentUserId ? "댓글을 남겨보세요..." : "로그인 후 댓글을 남길 수 있습니다."}
                    required
                    disabled={isSubmitting || !currentUserId}
                ></textarea>
                <button
                    type="submit"
                    disabled={isSubmitting || !content.trim() || !currentUserId}
                    className="absolute bottom-3 right-3 px-4 py-1.5 bg-gradient-to-r from-pink-400 to-rose-400 text-white text-xs font-bold rounded-lg hover:shadow-lg hover:shadow-pink-300/30 hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-pink-300 disabled:opacity-50 disabled:translate-y-0 disabled:hover:shadow-none min-w-[60px] flex items-center justify-center"
                >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : '등록'}
                </button>
            </form>
        </div>
    )
}
