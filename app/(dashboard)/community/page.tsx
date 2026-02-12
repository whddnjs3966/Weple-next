import { getPosts } from '@/actions/community'
import Link from 'next/link'
import { Edit, MessageCircle, BarChart2, Search } from 'lucide-react'
import { format } from 'date-fns'

export default async function CommunityPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>
}) {
    const resolvedSearchParams = await searchParams
    const category = (resolvedSearchParams.category === 'notice' ? 'notice' : 'free') as 'notice' | 'free'
    const { posts, count } = await getPosts(category)

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in">

            {/* Header */}
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight font-serif italic">Community</h2>
                <div className="w-8 h-0.5 bg-gray-800 mx-auto mt-4 mb-2"></div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-2">Share your story</p>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex p-1 bg-gray-100/80 rounded-xl">
                    <Link
                        href="/community?category=free"
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${category === 'free' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        자유게시판
                    </Link>
                    <Link
                        href="/community?category=notice"
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${category === 'notice' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        공지사항
                    </Link>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="제목, 작성자, 내용 검색"
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    </div>
                    <Link
                        href="/community/new"
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-sm shadow-primary/20"
                    >
                        <Edit size={16} /> <span className="hidden sm:inline">글쓰기</span>
                    </Link>
                </div>
            </div>

            {/* Post List */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100 text-xs text-gray-500 uppercase font-bold">
                        <tr>
                            <th className="px-6 py-4 w-[10%] text-center">No</th>
                            <th className="px-6 py-4 w-[50%]">제목</th>
                            <th className="px-6 py-4 w-[15%] text-center">작성자</th>
                            <th className="px-6 py-4 w-[15%] text-center">작성일</th>
                            <th className="px-6 py-4 w-[10%] text-center">조회</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {/* Hot Posts (Mockup based on previous conversation history) */}
                        {category === 'free' && (
                            <tr className="bg-gradient-to-r from-red-50/50 to-white hover:from-red-50 hover:to-white transition-colors border-b border-red-100/50">
                                <td className="px-6 py-4 text-center"><span className="text-red-500 font-bold text-xs">HOT</span></td>
                                <td className="px-6 py-4">
                                    <a href="#" className="font-bold text-gray-800 hover:text-primary transition-colors flex items-center gap-2">
                                        🔥 예신님들 드레스 투어 꿀팁 공유해요!
                                        <span className="text-xs font-normal text-gray-400 ml-1 flex items-center gap-0.5"><MessageCircle size={10} /> 32</span>
                                    </a>
                                </td>
                                <td className="px-6 py-4 text-center text-sm text-gray-600 font-medium">관리자</td>
                                <td className="px-6 py-4 text-center text-xs text-gray-400">2026.02.12</td>
                                <td className="px-6 py-4 text-center text-xs text-gray-400">1.2k</td>
                            </tr>
                        )}

                        {posts.map((post) => (
                            <tr key={post.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4 text-center text-sm text-gray-400 font-medium">{post.id}</td>
                                <td className="px-6 py-4">
                                    <Link href={`/community/${post.id}`} className="font-semibold text-gray-700 hover:text-primary transition-colors block">
                                        {post.title}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-center text-sm text-gray-600">{post.author?.username || '익명'}</td>
                                <td className="px-6 py-4 text-center text-xs text-gray-400">
                                    {new Date(post.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-center text-xs text-gray-400 group-hover:text-primary transition-colors">
                                    {post.view_count}
                                </td>
                            </tr>
                        ))}

                        {posts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-gray-400">
                                    등록된 게시글이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination Mockup */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-center gap-2">
                    <button className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-sm hover:bg-gray-200 transition-colors" disabled>&lt;</button>
                    <button className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-sm">1</button>
                    <button className="w-8 h-8 rounded-full bg-white text-gray-600 border border-gray-100 flex items-center justify-center text-sm hover:bg-gray-50 transition-colors">2</button>
                    <button className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm hover:bg-gray-200 transition-colors">&gt;</button>
                </div>
            </div>

        </div>
    )
}
