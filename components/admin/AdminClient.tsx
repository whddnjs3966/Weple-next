'use client'

import { useState, useTransition } from 'react'
import { Star, Users, MessageSquare, Search, Trash2, Crown, X, CheckCircle2, MapPin, BarChart3, UserCircle, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts'
import type { Place } from '@/actions/places'
import type { AdminMember, AnalyticsData, UserAnalyticsData } from '@/actions/admin'

type Post = {
    id: string
    title: string
    content: string
    category: string | null
    created_at: string
    user_id: string
    view_count: number | null
    author: { username: string | null; full_name: string | null } | null
}

interface AdminClientProps {
    posts: Post[]
    members: AdminMember[]
    places: Place[]
    analytics?: AnalyticsData[]
    userAnalytics?: UserAnalyticsData[]
}

type Tab = 'featured' | 'posts' | 'members' | 'analytics' | 'user-analytics'

// 최대 4개 슬롯
const SLOT_COUNT = 4

export default function AdminClient({ posts: initialPosts, members: initialMembers, places, analytics = [], userAnalytics = [] }: AdminClientProps) {
    const [tab, setTab] = useState<Tab>('analytics')
    const [posts, setPosts] = useState(initialPosts)
    const [members, setMembers] = useState(initialMembers)
    const [isPending, startTransition] = useTransition()

    // 추천 장소 관련
    const featuredPlaces = places.filter(p => p.is_featured)
    const [localFeatured, setLocalFeatured] = useState<Place[]>(featuredPlaces)
    const [showPlaceModal, setShowPlaceModal] = useState(false)
    const [placeSearch, setPlaceSearch] = useState('')
    const [replacingSlot, setReplacingSlot] = useState<number | null>(null)
    const [toastMsg, setToastMsg] = useState<string | null>(null)

    // 게시글 관련
    const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    // 멤버 관련
    const [promotingId, setPromotingId] = useState<string | null>(null)
    const [memberSearch, setMemberSearch] = useState('')

    // 사용자별 통계 관련
    const [userAnalyticsSearch, setUserAnalyticsSearch] = useState('')
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null)

    function showToast(msg: string) {
        setToastMsg(msg)
        setTimeout(() => setToastMsg(null), 3000)
    }

    // ── 추천 장소 토글 ──────────────────────────────────────────
    async function handleSelectFeatured(place: Place) {
        if (replacingSlot === null) return
        const { toggleFeaturedPlace } = await import('@/actions/admin')

        startTransition(async () => {
            try {
                // 이미 featured 목록에 있으면 먼저 해제
                const alreadyAt = localFeatured.findIndex(p => p.id === place.id)
                if (alreadyAt !== -1) {
                    showToast('이미 추천 목록에 있는 장소입니다.')
                    setShowPlaceModal(false)
                    return
                }

                // 슬롯에 기존 장소가 있으면 해제
                const current = localFeatured[replacingSlot]
                if (current) {
                    await toggleFeaturedPlace(current.id, false)
                }

                await toggleFeaturedPlace(place.id, true)

                const next = [...localFeatured]
                next[replacingSlot] = { ...place, is_featured: true }
                setLocalFeatured(next.slice(0, SLOT_COUNT))
                showToast(`"${place.name}" 추천 장소로 선정했습니다.`)
            } catch {
                showToast('오류가 발생했습니다.')
            }
            setShowPlaceModal(false)
            setReplacingSlot(null)
        })
    }

    async function handleRemoveFeatured(slotIdx: number) {
        const place = localFeatured[slotIdx]
        if (!place) return
        const { toggleFeaturedPlace } = await import('@/actions/admin')
        startTransition(async () => {
            try {
                await toggleFeaturedPlace(place.id, false)
                const next = [...localFeatured]
                next.splice(slotIdx, 1)
                setLocalFeatured(next)
                showToast(`"${place.name}" 추천 해제했습니다.`)
            } catch {
                showToast('오류가 발생했습니다.')
            }
        })
    }

    // ── 게시글 삭제 ──────────────────────────────────────────────
    async function handleDeletePost(id: string) {
        setDeletingPostId(id)
        const { adminDeletePost } = await import('@/actions/admin')
        try {
            await adminDeletePost(id)
            setPosts(prev => prev.filter(p => p.id !== id))
            showToast('게시글을 삭제했습니다.')
        } catch {
            showToast('삭제에 실패했습니다.')
        }
        setDeletingPostId(null)
        setConfirmDeleteId(null)
    }

    // ── 관리자 지정 ──────────────────────────────────────────────
    async function handlePromote(userId: string) {
        setPromotingId(userId)
        const { promoteToAdmin } = await import('@/actions/admin')
        try {
            await promoteToAdmin(userId)
            setMembers(prev => prev.map(m => m.id === userId ? { ...m, role: 'admin' } : m))
            showToast('관리자로 지정했습니다.')
        } catch {
            showToast('오류가 발생했습니다.')
        }
        setPromotingId(null)
    }

    const filteredPlaces = places.filter(p =>
        p.name.includes(placeSearch) || p.category?.name?.includes(placeSearch)
    )
    const filteredMembers = members.filter(m =>
        (m.username || '').includes(memberSearch) ||
        (m.full_name || '').includes(memberSearch)
    )
    const adminCount = members.filter(m => m.role === 'admin').length

    return (
        <div className="space-y-6">
            {/* 페이지 타이틀 */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
                <p className="text-sm text-gray-500 mt-1">Weple 서비스를 관리합니다.</p>
            </div>

            {/* 탭 */}
            <div className="flex gap-1 border-b border-gray-200">
                {([
                    { key: 'analytics', label: '통계 및 분석', icon: BarChart3 },
                    { key: 'user-analytics', label: '사용자별 통계', icon: UserCircle },
                    { key: 'featured', label: '추천 장소 관리', icon: Star },
                    { key: 'posts', label: '게시판 관리', icon: MessageSquare },
                    { key: 'members', label: '멤버 관리', icon: Users },
                ] as const).map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === key
                            ? 'border-rose-500 text-rose-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Icon size={15} />
                        {label}
                    </button>
                ))}
            </div>

            {/* ── 탭 0: 통계 및 분석 ─────────────────────────────────── */}
            {tab === 'analytics' && (
                <div className="space-y-6">
                    <p className="text-sm text-gray-500">사용자들의 탭별 방문 수 및 체류 시간 통계입니다.</p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 클릭수 차트 */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <BarChart3 size={18} className="text-rose-500" />
                                탭별 방문 수
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="tab_name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                        <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="views" name="방문 수" fill="#FB7185" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 체류 시간 차트 */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <BarChart3 size={18} className="text-pink-500" />
                                탭별 총 체류 시간 (분)
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    {/* duration_seconds를 분으로 변환하여 표시 */}
                                    <BarChart data={analytics.map(a => ({ ...a, total_minutes: Math.round(a.total_duration / 60) }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="tab_name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                        <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="total_minutes" name="총 체류 시간(분)" fill="#F472B6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* 상세 데이터 테이블 */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-4 py-3 text-left border-b text-xs font-bold text-gray-500">탭 이름</th>
                                    <th className="px-4 py-3 text-right border-b text-xs font-bold text-gray-500">방문 수</th>
                                    <th className="px-4 py-3 text-right border-b text-xs font-bold text-gray-500">총 체류 시간</th>
                                    <th className="px-4 py-3 text-right border-b text-xs font-bold text-gray-500">평균 체류 시간</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {analytics.map((item) => (
                                    <tr key={item.tab_name} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-800">{item.tab_name}</td>
                                        <td className="px-4 py-3 text-right text-gray-600 font-medium">{item.views.toLocaleString()}회</td>
                                        <td className="px-4 py-3 text-right text-gray-600">{Math.round(item.total_duration / 60)}분</td>
                                        <td className="px-4 py-3 text-right text-gray-600">{item.avg_duration}초</td>
                                    </tr>
                                ))}
                                {analytics.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">수집된 데이터가 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── 탭: 사용자별 통계 ─────────────────────────────── */}
            {tab === 'user-analytics' && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">사용자별 페이지 방문 수 및 체류 시간 통계입니다.</p>

                    {/* 검색 */}
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={userAnalyticsSearch}
                            onChange={e => setUserAnalyticsSearch(e.target.value)}
                            placeholder="이름 또는 아이디 검색..."
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white"
                        />
                    </div>

                    {/* 요약 카드 */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white rounded-2xl border border-gray-200 p-4">
                            <p className="text-xs text-gray-400 font-medium">활성 사용자 수</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{userAnalytics.length}</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-4">
                            <p className="text-xs text-gray-400 font-medium">전체 페이지뷰</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{userAnalytics.reduce((s, u) => s + u.total_views, 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-4">
                            <p className="text-xs text-gray-400 font-medium">전체 체류 시간</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{Math.round(userAnalytics.reduce((s, u) => s + u.total_duration, 0) / 60)}분</p>
                        </div>
                    </div>

                    {/* 사용자 목록 */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">사용자</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">총 방문 수</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 hidden md:table-cell">총 체류 시간</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 hidden lg:table-cell">방문 페이지 수</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 w-12">상세</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {userAnalytics
                                    .filter(u =>
                                        (u.username || '').includes(userAnalyticsSearch) ||
                                        (u.full_name || '').includes(userAnalyticsSearch)
                                    )
                                    .map(user => (
                                    <>
                                        <tr
                                            key={user.user_id}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => setExpandedUserId(expandedUserId === user.user_id ? null : user.user_id)}
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-800">{user.full_name || '—'}</p>
                                                <p className="text-[10px] text-gray-400">@{user.username || '—'}</p>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600 font-medium">{user.total_views.toLocaleString()}회</td>
                                            <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock size={12} className="text-gray-400" />
                                                    {user.total_duration >= 3600
                                                        ? `${Math.floor(user.total_duration / 3600)}시간 ${Math.round((user.total_duration % 3600) / 60)}분`
                                                        : `${Math.round(user.total_duration / 60)}분`
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600 hidden lg:table-cell">{user.pages.length}개</td>
                                            <td className="px-4 py-3 text-center">
                                                {expandedUserId === user.user_id
                                                    ? <ChevronUp size={16} className="inline text-gray-400" />
                                                    : <ChevronDown size={16} className="inline text-gray-400" />
                                                }
                                            </td>
                                        </tr>
                                        {expandedUserId === user.user_id && (
                                            <tr key={`${user.user_id}-detail`}>
                                                <td colSpan={5} className="px-4 py-0">
                                                    <div className="bg-gray-50 rounded-xl p-4 my-2">
                                                        <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1.5">
                                                            <BarChart3 size={13} className="text-rose-400" />
                                                            페이지별 상세 통계
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {user.pages.map(page => {
                                                                const maxViews = Math.max(...user.pages.map(p => p.views))
                                                                const barWidth = maxViews > 0 ? (page.views / maxViews) * 100 : 0
                                                                return (
                                                                    <div key={page.tab_name} className="flex items-center gap-3">
                                                                        <span className="text-xs font-medium text-gray-700 w-20 shrink-0">{page.tab_name}</span>
                                                                        <div className="flex-1 h-5 bg-white rounded-full overflow-hidden border border-gray-100">
                                                                            <div
                                                                                className="h-full rounded-full bg-gradient-to-r from-rose-300 to-pink-400"
                                                                                style={{ width: `${barWidth}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-[11px] text-gray-500 w-14 text-right shrink-0">{page.views}회</span>
                                                                        <span className="text-[11px] text-gray-400 w-16 text-right shrink-0">
                                                                            {page.total_duration >= 3600
                                                                                ? `${Math.floor(page.total_duration / 3600)}h ${Math.round((page.total_duration % 3600) / 60)}m`
                                                                                : page.total_duration >= 60
                                                                                    ? `${Math.round(page.total_duration / 60)}분`
                                                                                    : `${page.total_duration}초`
                                                                            }
                                                                        </span>
                                                                        <span className="text-[10px] text-gray-300 w-16 text-right shrink-0">평균 {page.avg_duration}초</span>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                                {userAnalytics.filter(u =>
                                    (u.username || '').includes(userAnalyticsSearch) ||
                                    (u.full_name || '').includes(userAnalyticsSearch)
                                ).length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                                            {userAnalyticsSearch ? '검색 결과가 없습니다.' : '수집된 데이터가 없습니다.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── 탭 1: 추천 장소 ─────────────────────────────────── */}
            {tab === 'featured' && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">최대 4개 장소를 추천 슬롯에 선정할 수 있습니다. /places 페이지 하단에 노출됩니다.</p>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: SLOT_COUNT }).map((_, idx) => {
                            const place = localFeatured[idx]
                            return (
                                <div key={idx} className="relative">
                                    {place ? (
                                        <div className="rounded-2xl border border-rose-100 bg-white shadow-sm overflow-hidden">
                                            <div className="h-28 bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center relative">
                                                {place.image_url ? (
                                                    <img src={place.image_url} alt={place.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-3xl opacity-30">🏛️</span>
                                                )}
                                                <button
                                                    onClick={() => handleRemoveFeatured(idx)}
                                                    className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                            <div className="p-3">
                                                <p className="text-xs font-bold text-gray-800 line-clamp-1">{place.name}</p>
                                                {place.category && (
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{place.category.name}</p>
                                                )}
                                                <button
                                                    onClick={() => { setReplacingSlot(idx); setShowPlaceModal(true) }}
                                                    className="mt-2 w-full text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 rounded-lg py-1 hover:bg-rose-100 transition-colors"
                                                >
                                                    변경
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setReplacingSlot(idx); setShowPlaceModal(true) }}
                                            className="w-full rounded-2xl border-2 border-dashed border-gray-200 min-h-[180px] flex flex-col items-center justify-center gap-2 hover:border-rose-300 hover:bg-rose-50/50 transition-all text-gray-400 hover:text-rose-500"
                                        >
                                            <Star size={20} className="opacity-40" />
                                            <span className="text-xs font-bold">슬롯 {idx + 1} — 장소 선정</span>
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* ── 탭 2: 게시판 관리 ───────────────────────────────── */}
            {tab === 'posts' && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">전체 게시글 {posts.length}개</p>
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">제목</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 hidden md:table-cell">작성자</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 hidden lg:table-cell">카테고리</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 hidden lg:table-cell">날짜</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">삭제</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {posts.map(post => (
                                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px]">
                                            <span className="line-clamp-1">{post.title}</span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                                            {post.author?.username || post.author?.full_name || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                                            {post.category || '일반'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                                            {new Date(post.created_at).toLocaleDateString('ko-KR')}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {confirmDeleteId === post.id ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-[10px] text-gray-500">삭제할까요?</span>
                                                    <button
                                                        onClick={() => handleDeletePost(post.id)}
                                                        disabled={deletingPostId === post.id}
                                                        className="text-[10px] font-bold text-white bg-red-500 px-2 py-1 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                                    >
                                                        확인
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDeleteId(null)}
                                                        className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                                                    >
                                                        취소
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmDeleteId(post.id)}
                                                    className="p-2 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {posts.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">게시글이 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── 탭 3: 멤버 관리 ─────────────────────────────────── */}
            {tab === 'members' && (
                <div className="space-y-4">
                    {/* stat 카드 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl border border-gray-200 p-4">
                            <p className="text-xs text-gray-400 font-medium">총 가입자</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{members.length}</p>
                        </div>
                        <div className="bg-rose-50 rounded-2xl border border-rose-100 p-4">
                            <p className="text-xs text-rose-400 font-medium">관리자</p>
                            <p className="text-2xl font-bold text-rose-600 mt-1">{adminCount}</p>
                        </div>
                    </div>

                    {/* 검색 */}
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={memberSearch}
                            onChange={e => setMemberSearch(e.target.value)}
                            placeholder="이름 또는 아이디 검색..."
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white"
                        />
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">이름</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 hidden md:table-cell">결혼일</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">역할</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredMembers.map(member => (
                                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-800">{member.full_name || '—'}</p>
                                            <p className="text-[10px] text-gray-400">@{member.username || '—'}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                                            {member.wedding_date
                                                ? new Date(member.wedding_date).toLocaleDateString('ko-KR')
                                                : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {member.role === 'admin' ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                                                    <Crown size={9} /> 관리자
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">일반</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {member.role !== 'admin' && (
                                                <button
                                                    onClick={() => handlePromote(member.id)}
                                                    disabled={promotingId === member.id}
                                                    className="text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors disabled:opacity-50"
                                                >
                                                    {promotingId === member.id ? '처리중...' : '관리자 지정'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredMembers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">멤버가 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── 장소 선택 모달 ──────────────────────────────────── */}
            {showPlaceModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800">장소 선택</h3>
                            <button onClick={() => { setShowPlaceModal(false); setReplacingSlot(null) }}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-4 border-b border-gray-100">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={placeSearch}
                                    onChange={e => setPlaceSearch(e.target.value)}
                                    placeholder="장소명 또는 카테고리 검색..."
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200"
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 p-4 space-y-2">
                            {filteredPlaces.map(place => {
                                const isAlreadyFeatured = localFeatured.some(f => f.id === place.id)
                                return (
                                    <button
                                        key={place.id}
                                        onClick={() => handleSelectFeatured(place)}
                                        disabled={isPending}
                                        className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${isAlreadyFeatured
                                            ? 'border-rose-200 bg-rose-50 opacity-60 cursor-not-allowed'
                                            : 'border-gray-100 hover:border-rose-200 hover:bg-rose-50/50'
                                            }`}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                                            {place.image_url
                                                ? <img src={place.image_url} alt={place.name} className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center text-lg">🏛️</div>
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 line-clamp-1">{place.name}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                                                {place.category && <span>{place.category.name}</span>}
                                                {place.region_sigungu && (
                                                    <span className="flex items-center gap-0.5">
                                                        <MapPin size={9} />{place.region_sigungu}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {isAlreadyFeatured && (
                                            <CheckCircle2 size={16} className="text-rose-400 flex-shrink-0" />
                                        )}
                                    </button>
                                )
                            })}
                            {filteredPlaces.length === 0 && (
                                <p className="text-center text-sm text-gray-400 py-8">검색 결과가 없습니다.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── 토스트 ───────────────────────────────────────────── */}
            {toastMsg && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2 animate-fade-in-up">
                    <CheckCircle2 size={15} className="text-green-400" />
                    {toastMsg}
                </div>
            )}
        </div>
    )
}
