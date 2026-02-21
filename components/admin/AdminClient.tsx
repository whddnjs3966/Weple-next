'use client'

import { useState, useTransition } from 'react'
import { Star, Users, MessageSquare, Search, Trash2, Crown, X, CheckCircle2, MapPin } from 'lucide-react'
import type { Place } from '@/actions/places'
import type { AdminMember } from '@/actions/admin'

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
}

type Tab = 'featured' | 'posts' | 'members'

// 최대 4개 슬롯
const SLOT_COUNT = 4

export default function AdminClient({ posts: initialPosts, members: initialMembers, places }: AdminClientProps) {
    const [tab, setTab] = useState<Tab>('featured')
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
