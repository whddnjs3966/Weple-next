import { getPost, getComments, createComment, deletePost } from '@/actions/community'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Clock, Eye, Trash2 } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function PostDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const post = await getPost(id)
    const comments = await getComments(id)

    if (!post) notFound()

    // Simplified Comment Action for inline use
    async function submitComment(formData: FormData) {
        'use server'
        await createComment(formData)
    }

    async function removePost() {
        'use server'
        await deletePost(id)
        redirect('/community')
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in">

            <div className="mb-6 flex justify-between items-center">
                <Link
                    href="/community"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium text-sm"
                >
                    <ArrowLeft size={16} />
                    목록으로
                </Link>

                <form action={removePost}>
                    <button className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                        <Trash2 size={18} />
                    </button>
                </form>
            </div>

            {/* Post Content */}
            <div className="bg-white/70 backdrop-blur-xl rounded-[24px] shadow-xl border border-white/50 overflow-hidden mb-8">
                <div className="p-8 border-b border-gray-50">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
                        {post.category === 'notice' ? '공지사항' : '자유게시판'}
                    </span>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5 font-medium text-gray-800">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                                <User size={12} />
                            </div>
                            {post.author?.username || '익명'}
                        </span>
                        <span className="w-px h-3 bg-gray-200"></span>
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(post.created_at).toLocaleString()}
                        </span>
                        <span className="w-px h-3 bg-gray-200"></span>
                        <span className="flex items-center gap-1">
                            <Eye size={12} />
                            {post.view_count}
                        </span>
                    </div>
                </div>

                <div className="p-8 min-h-[300px] text-gray-700 leading-relaxed whitespace-pre-line">
                    {post.content}
                </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white/50 backdrop-blur-md rounded-[24px] p-8 border border-white/50 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                    댓글 <span className="text-primary">{comments.length}</span>
                </h3>

                {/* List */}
                <div className="space-y-6 mb-8">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 flex-shrink-0">
                                <User size={14} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-xs text-gray-800">{comment.author?.username || '익명'}</span>
                                    <span className="text-[10px] text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-600 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Form */}
                <form action={submitComment} className="relative">
                    <input type="hidden" name="post_id" value={post.id} />
                    <textarea
                        name="content"
                        className="w-full h-24 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl p-4 text-sm focus:ring-2 focus:ring-pink-300/50 focus:border-pink-300 outline-none resize-none shadow-sm transition-all placeholder-gray-400"
                        placeholder="댓글을 남겨보세요..."
                        required
                    ></textarea>
                    <button
                        type="submit"
                        className="absolute bottom-3 right-3 px-4 py-1.5 bg-gradient-to-r from-pink-400 to-rose-400 text-white text-xs font-bold rounded-lg hover:shadow-lg hover:shadow-pink-300/30 hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-pink-300"
                    >
                        등록
                    </button>
                </form>
            </div>

        </div>
    )
}
