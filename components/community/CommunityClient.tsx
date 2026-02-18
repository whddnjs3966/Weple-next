'use client'

import { useState, useEffect, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, PenTool, Flame, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getPosts, type Post as DBPost } from '@/actions/community'
import { format } from 'date-fns'

// UI용 Post 타입 확장
interface PostWithAuthor extends DBPost {
    author: { username: string | null } | null
}

const CATEGORIES = [
    { code: 'ALL', name: '전체' },
    { code: 'FREE', name: '자유게시판' },
    { code: 'NOTICE', name: '공지사항' },
    { code: 'QUESTION', name: 'Q&A' },
    { code: 'REVIEW', name: '후기' },
    { code: 'TIP', name: '꿀팁' },
]

interface CommunityClientProps {
    initialPosts: PostWithAuthor[]
    initialCount: number
}

export default function CommunityClient({ initialPosts, initialCount }: CommunityClientProps) {
    const [posts, setPosts] = useState<PostWithAuthor[]>(initialPosts)
    const [currentCategory, setCurrentCategory] = useState('ALL')
    const [searchQuery, setSearchQuery] = useState('')
    const [isPending, startTransition] = useTransition()
    const [totalCount, setTotalCount] = useState(initialCount)

    // 카테고리 변경 핸들러
    const handleCategoryChange = (categoryCode: string) => {
        setCurrentCategory(categoryCode)
        startTransition(async () => {
            const { posts: newPosts, count } = await getPosts(categoryCode.toLowerCase())
            setPosts(newPosts as PostWithAuthor[])
            setTotalCount(count)
        })
    }

    const getCategoryBadge = (cat: string | null | undefined) => {
        const upperCat = cat?.toUpperCase() || 'FREE'
        switch (upperCat) {
            case 'NOTICE': return 'bg-red-50 text-red-500 border-red-100'
            case 'REVIEW': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
            case 'QUESTION': return 'bg-blue-50 text-blue-500 border-blue-100'
            case 'TIP': return 'bg-purple-50 text-purple-500 border-purple-100'
            case 'FREE': return 'bg-gray-50 text-gray-500 border-gray-100'
            default: return 'bg-gray-50 text-gray-500 border-gray-100'
        }
    }

    const getCategoryName = (cat: string | null | undefined) => {
        const upperCat = cat?.toUpperCase() || 'FREE'
        const found = CATEGORIES.find(c => c.code === upperCat)
        return found ? found.name : cat
    }

    // 날짜 포맷팅
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return ''
        return format(new Date(dateString), 'yyyy.MM.dd')
    }

    return (
        <div className="max-w-5xl mx-auto px-4 pb-20">
            {/* Header */}
            <div className="text-center mb-10">
                <h2 className="font-serif italic text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-2">
                    Community
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-pink-400"></div>
                    <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                    <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-pink-400"></div>
                </div>
                <p className="text-gray-400 text-sm mt-4">결혼 준비 이야기를 나눠보세요</p>
            </div>

            {/* Category Tabs (Underline Style) */}
            <div className="border-b border-gray-200 mb-8">
                <div className="flex gap-0 overflow-x-auto">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.code}
                            onClick={() => handleCategoryChange(cat.code)}
                            disabled={isPending}
                            className={`
                                px-5 py-3 text-sm font-medium whitespace-nowrap transition-all relative
                                ${currentCategory === cat.code
                                    ? 'text-pink-300 font-bold'
                                    : 'text-gray-400 hover:text-gray-600'
                                }
                            `}
                        >
                            {cat.name}
                            {currentCategory === cat.code && (
                                <motion.div
                                    layoutId="categoryUnderline"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-pink-400"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className={`bg-white/70 backdrop-blur-xl rounded-[20px] shadow-xl border border-white/50 overflow-hidden mb-8 transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                {/* Loading Indicator */}
                {isPending && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <Loader2 className="animate-spin text-pink-400 w-8 h-8" />
                    </div>
                )}

                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="py-3.5 px-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-16">No</th>
                            <th className="py-3.5 px-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-24">카테고리</th>
                            <th className="py-3.5 px-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">제목</th>
                            <th className="py-3.5 px-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-32">글쓴이</th>
                            <th className="py-3.5 px-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-24 hidden md:table-cell">작성시간</th>
                            <th className="py-3.5 px-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-16 hidden md:table-cell">조회</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode='popLayout'>
                            {posts.length > 0 ? (
                                posts.map((post, index) => (
                                    <motion.tr
                                        key={post.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="border-b border-gray-50 transition-colors cursor-pointer hover:bg-pink-50/20"
                                    >
                                        {/* No: 단순히 역순 번호 표시 (페이지네이션 고려 필요하지만 일단 간단히) */}
                                        <td className="py-3.5 px-4 text-center">
                                            <span className="text-sm text-gray-400">{totalCount - index}</span>
                                        </td>

                                        {/* Category */}
                                        <td className="py-3.5 px-3 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryBadge(post.category)}`}>
                                                {getCategoryName(post.category)}
                                            </span>
                                        </td>

                                        {/* Title */}
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm text-gray-700 hover:text-pink-300 transition-colors">
                                                    {post.title}
                                                </span>
                                                {/* 댓글 수 표시 (임시) */}
                                                {/* {post._count?.comments > 0 && (
                                                    <span className="text-[10px] text-pink-300 font-bold">[{post._count.comments}]</span>
                                                )} */}
                                            </div>
                                        </td>

                                        {/* Author */}
                                        <td className="py-3.5 px-3 text-center">
                                            <span className="text-xs text-gray-500">{post.author?.username || '익명'}</span>
                                        </td>

                                        {/* Date */}
                                        <td className="py-3.5 px-3 text-center hidden md:table-cell">
                                            <span className="text-xs text-gray-400">{formatDate(post.created_at)}</span>
                                        </td>

                                        {/* Views */}
                                        <td className="py-3.5 px-3 text-center hidden md:table-cell">
                                            <span className="text-xs text-gray-400">{post.view_count || 0}</span>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-10 text-center text-gray-400 text-sm">
                                        등록된 게시글이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Bottom: Search + Write */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                {/* Search */}
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-xl px-4 py-2.5 flex items-center flex-1 shadow-sm">
                        <Search size={14} className="text-gray-300 mr-2" />
                        <input
                            type="text"
                            placeholder="제목, 작성자, 본문내용"
                            className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-300 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Write Button */}
                <Link
                    href="/community/write"
                    className="flex items-center gap-2 px-5 py-2.5 bg-pink-400 hover:bg-pink-500 rounded-xl text-white text-sm font-bold shadow-lg shadow-pink-300/20 hover:-translate-y-0.5 transition-all"
                >
                    <PenTool size={14} /> 글쓰기
                </Link>
            </div>

            {/* Pagination (Visual Only for now) */}
            <div className="flex justify-center gap-1.5">
                <button className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-200 transition-all">
                    <ChevronLeft size={14} />
                </button>
                <button className="w-9 h-9 rounded-lg bg-pink-400 text-white font-bold text-sm flex items-center justify-center shadow-sm">1</button>
                <button className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-200 transition-all text-sm">2</button>
                <button className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-200 transition-all text-sm">3</button>
                <button className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-200 transition-all">
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    )
}
