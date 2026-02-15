'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, PenTool, MessageSquare, ThumbsUp, Eye, Flame, ChevronLeft, ChevronRight } from 'lucide-react'

interface Post {
    id: number
    category: 'NOTICE' | 'FREE' | 'QUESTION' | 'REVIEW' | 'TIP'
    title: string
    author: string
    date: string
    views: number
    recommendations: number
    commentCount: number
    isHot?: boolean
}

const CATEGORIES = [
    { code: 'ALL', name: '전체' },
    { code: 'FREE', name: '자유게시판' },
    { code: 'NOTICE', name: '공지사항' },
    { code: 'QUESTION', name: 'Q&A' },
    { code: 'REVIEW', name: '후기' },
    { code: 'TIP', name: '꿀팁' },
]

export default function CommunityClient() {
    const [currentCategory, setCurrentCategory] = useState('ALL')
    const [searchQuery, setSearchQuery] = useState('')

    const posts: Post[] = [
        { id: 1, category: 'NOTICE', title: 'Wepln 커뮤니티 이용 가이드', author: '관리자', date: '2024.05.01', views: 1200, recommendations: 50, commentCount: 5 },
        { id: 101, category: 'REVIEW', title: '강남 예식장 투어 후기 (3곳 비교)', author: 'LovelyBride', date: '2024.05.20', views: 150, recommendations: 12, commentCount: 3, isHot: true },
        { id: 102, category: 'QUESTION', title: '예산 3000만원으로 가능한 범위가요?', author: '예비신랑', date: '2024.05.19', views: 80, recommendations: 2, commentCount: 8 },
        { id: 103, category: 'TIP', title: '신혼여행 TOP 5 추천 장소', author: 'TravelLover', date: '2024.05.18', views: 300, recommendations: 45, commentCount: 15, isHot: true },
        { id: 104, category: 'FREE', title: '예물 사진 자랑합니다 💍', author: 'HappyDays', date: '2024.05.18', views: 200, recommendations: 25, commentCount: 10 },
        { id: 105, category: 'QUESTION', title: '드레스 피팅 체크리스트 있나요?', author: '초보신부', date: '2024.05.17', views: 60, recommendations: 1, commentCount: 2 },
        { id: 106, category: 'FREE', title: '결혼 준비하면서 가장 힘들었던 것', author: '넘바쁜신부', date: '2024.05.16', views: 180, recommendations: 30, commentCount: 22, isHot: true },
        { id: 107, category: 'REVIEW', title: '메이크업 샵 비교 후기', author: '뷰티러버', date: '2024.05.15', views: 95, recommendations: 8, commentCount: 4 },
    ]

    const filteredPosts = currentCategory === 'ALL'
        ? posts
        : posts.filter(p => p.category === currentCategory)

    // Sort: HOT posts first
    const sortedPosts = [...filteredPosts].sort((a, b) => {
        if (a.isHot && !b.isHot) return -1
        if (!a.isHot && b.isHot) return 1
        return 0
    })

    const getCategoryBadge = (cat: string) => {
        switch (cat) {
            case 'NOTICE': return 'bg-red-50 text-red-500 border-red-100'
            case 'REVIEW': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
            case 'QUESTION': return 'bg-blue-50 text-blue-500 border-blue-100'
            case 'TIP': return 'bg-purple-50 text-purple-500 border-purple-100'
            case 'FREE': return 'bg-gray-50 text-gray-500 border-gray-100'
            default: return 'bg-gray-50 text-gray-500 border-gray-100'
        }
    }

    const getCategoryName = (cat: string) => {
        switch (cat) {
            case 'NOTICE': return '공지'
            case 'REVIEW': return '후기'
            case 'QUESTION': return 'Q&A'
            case 'TIP': return '꿀팁'
            case 'FREE': return '자유'
            default: return cat
        }
    }

    return (
        <div className="max-w-5xl mx-auto px-4 pb-20">
            {/* Header */}
            <div className="text-center mb-10">
                <h2 className="font-serif italic text-4xl md:text-5xl font-bold text-gray-800 tracking-tight mb-2">
                    Community
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-[#FF8E8E]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#FF8E8E]"></div>
                    <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-[#FF8E8E]"></div>
                </div>
                <p className="text-gray-400 text-sm mt-4">결혼 준비 이야기를 나눠보세요</p>
            </div>

            {/* Category Tabs (Underline Style) */}
            <div className="border-b border-gray-200 mb-8">
                <div className="flex gap-0 overflow-x-auto">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.code}
                            onClick={() => setCurrentCategory(cat.code)}
                            className={`
                                px-5 py-3 text-sm font-medium whitespace-nowrap transition-all relative
                                ${currentCategory === cat.code
                                    ? 'text-[#FF8E8E] font-bold'
                                    : 'text-gray-400 hover:text-gray-600'
                                }
                            `}
                        >
                            {cat.name}
                            {currentCategory === cat.code && (
                                <motion.div
                                    layoutId="categoryUnderline"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF8E8E]"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/70 backdrop-blur-xl rounded-[20px] shadow-xl border border-white/50 overflow-hidden mb-8">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="py-3.5 px-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-16">No</th>
                            <th className="py-3.5 px-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-20">카테고리</th>
                            <th className="py-3.5 px-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">제목</th>
                            <th className="py-3.5 px-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-24">글쓴이</th>
                            <th className="py-3.5 px-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-24 hidden md:table-cell">작성시간</th>
                            <th className="py-3.5 px-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-16 hidden md:table-cell">조회</th>
                            <th className="py-3.5 px-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-16 hidden md:table-cell">추천</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode='popLayout'>
                            {sortedPosts.map((post) => (
                                <motion.tr
                                    key={post.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className={`border-b border-gray-50 transition-colors cursor-pointer group
                                        ${post.isHot ? 'bg-pink-50/40' : 'hover:bg-pink-50/20'}
                                        ${post.category === 'NOTICE' ? 'bg-amber-50/30' : ''}
                                    `}
                                >
                                    {/* No */}
                                    <td className="py-3.5 px-4 text-center">
                                        {post.isHot ? (
                                            <span className="inline-flex items-center justify-center">
                                                <Flame size={16} className="text-[#FF8E8E] fill-[#FF8E8E]" />
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400">{post.id}</span>
                                        )}
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
                                            <span className={`font-medium text-sm group-hover:text-[#FF8E8E] transition-colors ${post.isHot ? 'font-bold text-gray-800' : 'text-gray-700'}`}>
                                                {post.title}
                                            </span>
                                            {post.commentCount > 0 && (
                                                <span className="text-[10px] text-[#FF8E8E] font-bold">[{post.commentCount}]</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Author */}
                                    <td className="py-3.5 px-3 text-center">
                                        <span className="text-xs text-gray-500">{post.author}</span>
                                    </td>

                                    {/* Date */}
                                    <td className="py-3.5 px-3 text-center hidden md:table-cell">
                                        <span className="text-xs text-gray-400">{post.date}</span>
                                    </td>

                                    {/* Views */}
                                    <td className="py-3.5 px-3 text-center hidden md:table-cell">
                                        <span className="text-xs text-gray-400">{post.views}</span>
                                    </td>

                                    {/* Recommendations */}
                                    <td className="py-3.5 px-3 text-center hidden md:table-cell">
                                        <span className={`text-xs font-medium ${post.recommendations >= 10 ? 'text-[#FF8E8E] font-bold' : 'text-gray-400'}`}>
                                            {post.recommendations}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
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
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#FF8E8E] hover:bg-[#ff7a7a] rounded-xl text-white text-sm font-bold shadow-lg shadow-[#FF8E8E]/20 hover:-translate-y-0.5 transition-all">
                    <PenTool size={14} /> 글쓰기
                </button>
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-1.5">
                <button className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-200 transition-all">
                    <ChevronLeft size={14} />
                </button>
                <button className="w-9 h-9 rounded-lg bg-[#FF8E8E] text-white font-bold text-sm flex items-center justify-center shadow-sm">1</button>
                <button className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-200 transition-all text-sm">2</button>
                <button className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-200 transition-all text-sm">3</button>
                <button className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-200 transition-all">
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    )
}
