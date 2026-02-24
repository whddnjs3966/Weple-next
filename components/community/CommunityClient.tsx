'use client'

import { useState, useTransition, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, PenTool, ChevronLeft, ChevronRight, Loader2, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { getPosts, type Post as DBPost } from '@/actions/community'
import { format } from 'date-fns'

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

const PAGE_SIZE = 10

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
    const [currentPage, setCurrentPage] = useState(1)

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

    const fetchPosts = useCallback((category: string, page: number, search?: string) => {
        startTransition(async () => {
            const { posts: newPosts, count } = await getPosts(
                category.toLowerCase(),
                page,
                PAGE_SIZE,
                search || undefined
            )
            setPosts(newPosts as PostWithAuthor[])
            setTotalCount(count)
        })
    }, [])

    const handleCategoryChange = (categoryCode: string) => {
        setCurrentCategory(categoryCode)
        setCurrentPage(1)
        fetchPosts(categoryCode, 1, searchQuery)
    }

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return
        setCurrentPage(page)
        fetchPosts(currentCategory, page, searchQuery)
    }

    const handleSearch = () => {
        setCurrentPage(1)
        fetchPosts(currentCategory, 1, searchQuery)
    }

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch()
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

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return ''
        return format(new Date(dateString), 'yyyy.MM.dd')
    }

    const getPageNumbers = () => {
        const pages: number[] = []
        const maxVisible = 5
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
        const end = Math.min(totalPages, start + maxVisible - 1)
        start = Math.max(1, end - maxVisible + 1)
        for (let i = start; i <= end; i++) pages.push(i)
        return pages
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

            {/* Category Tabs */}
            <div className="border-b border-gray-200 mb-8">
                <div className="flex gap-0 overflow-x-auto scrollbar-hidden">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.code}
                            onClick={() => handleCategoryChange(cat.code)}
                            disabled={isPending}
                            className={`
                                px-5 py-3 text-sm font-medium whitespace-nowrap transition-all relative
                                ${currentCategory === cat.code
                                    ? 'text-pink-500 font-bold'
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
            <div className={`relative bg-white/70 backdrop-blur-xl rounded-[20px] shadow-xl border border-white/50 overflow-hidden mb-8 transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                {isPending && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <Loader2 className="animate-spin text-pink-400 w-8 h-8" />
                    </div>
                )}

                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100/50 bg-white/40">
                            <th className="hidden sm:table-cell py-3.5 px-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-16">No</th>
                            <th className="py-3.5 px-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-24">카테고리</th>
                            <th className="py-3.5 px-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">제목</th>
                            <th className="hidden sm:table-cell py-3.5 px-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-32">글쓴이</th>
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
                                        transition={{ delay: index * 0.02 }}
                                        className="border-b border-gray-50/50 transition-all cursor-pointer hover:bg-pink-50/30 group"
                                        onClick={() => window.location.href = `/community/${post.id}`}
                                    >
                                        <td className="hidden sm:table-cell py-3.5 px-4 text-center">
                                            <span className="text-sm text-gray-400">
                                                {totalCount - ((currentPage - 1) * PAGE_SIZE) - index}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-3 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryBadge(post.category)}`}>
                                                {getCategoryName(post.category)}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="font-bold text-sm text-gray-800 group-hover:text-pink-500 transition-colors">
                                                {post.title}
                                            </span>
                                        </td>
                                        <td className="hidden sm:table-cell py-3.5 px-3 text-center">
                                            <span className="text-xs text-gray-500">{post.author?.username || '익명'}</span>
                                        </td>
                                        <td className="py-3.5 px-3 text-center hidden md:table-cell">
                                            <span className="text-xs text-gray-400">{formatDate(post.created_at)}</span>
                                        </td>
                                        <td className="py-3.5 px-3 text-center hidden md:table-cell">
                                            <span className="text-xs text-gray-400">{post.view_count || 0}</span>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center border border-pink-100">
                                                <MessageCircle size={20} className="text-pink-300" />
                                            </div>
                                            <p className="text-gray-400 text-sm font-medium">
                                                {searchQuery
                                                    ? `"${searchQuery}" 검색 결과가 없습니다.`
                                                    : currentCategory !== 'ALL'
                                                        ? `${getCategoryName(currentCategory)} 카테고리에 아직 글이 없어요.`
                                                        : '등록된 게시글이 없습니다.'
                                                }
                                            </p>
                                            <Link
                                                href="/community/write"
                                                className="text-xs text-pink-400 font-bold hover:text-pink-500 transition-colors"
                                            >
                                                첫 글을 작성해보세요 →
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Bottom: Search + Write */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-xl px-4 py-2.5 flex items-center flex-1 shadow-sm focus-within:border-pink-300 focus-within:ring-2 focus-within:ring-pink-100 transition-all">
                        <Search size={14} className="text-gray-300 mr-2 shrink-0" />
                        <input
                            type="text"
                            placeholder="제목, 본문 내용 검색"
                            className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-300 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={isPending}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold text-gray-500 transition-all disabled:opacity-50 shrink-0"
                    >
                        검색
                    </button>
                </div>

                <Link
                    href="/community/write"
                    className="flex items-center gap-2 px-5 py-2.5 bg-pink-400 hover:bg-pink-500 rounded-xl text-white text-sm font-bold shadow-lg shadow-pink-300/20 hover:-translate-y-0.5 transition-all"
                >
                    <PenTool size={14} /> 글쓰기
                </Link>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-1.5">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isPending}
                        className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={14} />
                    </button>
                    {getPageNumbers().map(page => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            disabled={isPending}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all ${page === currentPage
                                ? 'bg-pink-400 text-white font-bold shadow-sm shadow-pink-200'
                                : 'bg-white border border-gray-100 text-gray-500 hover:text-gray-700 hover:border-gray-200'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || isPending}
                        className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            )}
        </div>
    )
}
