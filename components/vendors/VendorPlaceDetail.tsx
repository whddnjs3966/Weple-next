'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import {
    ArrowLeft, MapPin, Phone, ExternalLink,
    Loader2, Check, BookOpen, Sparkles,
    ChevronDown, Search, Heart, Navigation,
    Quote, Calendar, User, ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'
import { addUserVendor } from '@/actions/user-vendors'

interface BlogReview {
    title: string
    description: string
    link: string
    bloggername: string
    postdate: string
}

interface VendorPlaceDetailProps {
    slug: string
    name: string
    address: string
    phone: string
    link: string
}

/* ── 카테고리별 테마 (세련된 톤) ── */
const CATEGORY_THEMES: Record<string, { gradient: string; accent: string; icon: string }> = {
    'wedding-hall': { gradient: 'from-stone-800 via-stone-700 to-rose-900/80', accent: 'text-rose-300', icon: '🏛' },
    'studio':      { gradient: 'from-slate-800 via-slate-700 to-violet-900/80', accent: 'text-violet-300', icon: '📸' },
    'dress':       { gradient: 'from-stone-800 via-stone-700 to-pink-900/60', accent: 'text-pink-300', icon: '👗' },
    'makeup':      { gradient: 'from-stone-800 via-warm-gray-700 to-rose-900/60', accent: 'text-rose-300', icon: '💄' },
    'meeting-place': { gradient: 'from-stone-800 via-amber-900/40 to-stone-700', accent: 'text-amber-300', icon: '🍽' },
    'hanbok':      { gradient: 'from-stone-800 via-red-900/30 to-stone-700', accent: 'text-red-300', icon: '👘' },
    'wedding-ring': { gradient: 'from-stone-800 via-amber-900/50 to-stone-700', accent: 'text-amber-300', icon: '💍' },
    'honeymoon':   { gradient: 'from-slate-800 via-sky-900/40 to-slate-700', accent: 'text-sky-300', icon: '✈️' },
}

const CATEGORY_LABELS: Record<string, string> = {
    'wedding-hall': '웨딩홀',
    'studio': '스튜디오',
    'dress': '드레스',
    'makeup': '메이크업',
    'meeting-place': '상견례',
    'hanbok': '한복',
    'wedding-ring': '웨딩링',
    'honeymoon': '허니문',
}

const INITIAL_REVIEW_COUNT = 3

/* ── 3D Tilt 카드 컴포넌트 (미세한 효과) ── */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [1.5, -1.5]), { stiffness: 200, damping: 40 })
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-1.5, 1.5]), { stiffness: 200, damping: 40 })

    function handleMouse(e: React.MouseEvent) {
        const rect = ref.current?.getBoundingClientRect()
        if (!rect) return
        x.set((e.clientX - rect.left) / rect.width - 0.5)
        y.set((e.clientY - rect.top) / rect.height - 0.5)
    }

    function handleLeave() {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={handleLeave}
            style={{ rotateX, rotateY, transformPerspective: 1200 }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

/* ── 메인 컴포넌트 ── */
export default function VendorPlaceDetail({
    slug,
    name,
    address,
    phone,
    link,
}: VendorPlaceDetailProps) {
    const [reviews, setReviews] = useState<BlogReview[]>([])
    const [summary, setSummary] = useState<string | null>(null)
    const [summaryLoading, setSummaryLoading] = useState(true)
    const [reviewLoading, setReviewLoading] = useState(true)
    const [mapCoords, setMapCoords] = useState<{ lat: number; lon: number } | null>(null)
    const [mapFallback, setMapFallback] = useState(false)
    const [isAdded, setIsAdded] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [showAllReviews, setShowAllReviews] = useState(false)

    /* ── 리뷰 + AI 요약 로드 ── */
    const fetchReviews = useCallback(async () => {
        try {
            const params = new URLSearchParams({ name })
            if (slug) params.set('category', slug)
            const res = await fetch(`/api/vendors/detail?${params}`)
            const data = await res.json()
            setReviews(data.reviews || [])
            setSummary(data.summary || null)
        } catch {
            // silent
        } finally {
            setReviewLoading(false)
            setSummaryLoading(false)
        }
    }, [name, slug])

    /* ── 지도 좌표 로드 (Nominatim geocode) ── */
    const fetchMapCoords = useCallback(async () => {
        if (!address) { setMapFallback(true); return }
        try {
            const res = await fetch(`/api/vendors/geocode?address=${encodeURIComponent(address)}`)
            if (res.ok) {
                const data = await res.json()
                if (data.lat && data.lon) {
                    setMapCoords({ lat: data.lat, lon: data.lon })
                } else {
                    setMapFallback(true)
                }
            } else {
                setMapFallback(true)
            }
        } catch {
            setMapFallback(true)
        }
    }, [address])

    useEffect(() => {
        fetchReviews()
        fetchMapCoords()
    }, [fetchReviews, fetchMapCoords])

    const handleAdd = async () => {
        setIsAdding(true)
        try {
            await addUserVendor({
                category: slug,
                vendor_name: name,
                vendor_address: address,
                vendor_phone: phone,
                vendor_link: link,
            })
            setIsAdded(true)
        } catch {
            // silent
        } finally {
            setIsAdding(false)
        }
    }

    const formatDate = (rawDate: string): string => {
        if (!rawDate || rawDate.length !== 8) return rawDate
        return `${rawDate.slice(0, 4)}.${rawDate.slice(4, 6)}.${rawDate.slice(6, 8)}`
    }

    const theme = CATEGORY_THEMES[slug] || { gradient: 'from-stone-800 via-stone-700 to-stone-600', accent: 'text-stone-300', icon: '🏢' }
    const categoryLabel = CATEGORY_LABELS[slug] || slug
    const visibleReviews = showAllReviews ? reviews : reviews.slice(0, INITIAL_REVIEW_COUNT)
    const hasMoreReviews = reviews.length > INITIAL_REVIEW_COUNT

    const stagger = {
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
    }
    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 24 } },
    }

    return (
        <div className="max-w-5xl mx-auto px-2 sm:px-4 pb-24">
            {/* ── Navigation ── */}
            <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                className="mt-6 mb-5"
            >
                <Link
                    href={`/vendors/category/${slug}`}
                    className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors text-sm font-medium group"
                >
                    <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
                    검색 결과로 돌아가기
                </Link>
            </motion.div>

            {/* ═══════════════════════════════════════════════ */}
            {/* SECTION 1: 히어로 + 업체 상세                    */}
            {/* ═══════════════════════════════════════════════ */}
            <TiltCard className="mb-5">
                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 180, damping: 22 }}
                    className="rounded-[2rem] overflow-hidden shadow-xl shadow-stone-200/60"
                >
                    {/* ── 히어로 ── */}
                    <div className={`relative bg-gradient-to-br ${theme.gradient} px-6 sm:px-10 pt-10 pb-12 overflow-hidden`}>
                        {/* 장식 요소 */}
                        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/[0.03] blur-3xl -translate-y-1/2 translate-x-1/3" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/[0.04] blur-2xl translate-y-1/3 -translate-x-1/4" />
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute top-8 right-10 text-5xl opacity-20 select-none"
                        >
                            {theme.icon}
                        </motion.div>

                        {/* 카테고리 뱃지 */}
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block bg-white/10 backdrop-blur-sm text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 border border-white/10"
                        >
                            {categoryLabel}
                        </motion.span>

                        <motion.h1
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                            className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3 tracking-tight"
                        >
                            {name}
                        </motion.h1>

                        {address && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-start gap-2 text-sm text-white/50 font-medium"
                            >
                                <MapPin size={14} className="shrink-0 mt-0.5" />
                                {address}
                            </motion.p>
                        )}
                    </div>

                    {/* ── 액션 바 ── */}
                    <div className="bg-white px-5 sm:px-8 py-4 border-b border-stone-100">
                        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
                            {phone && (
                                <a
                                    href={`tel:${phone}`}
                                    className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold bg-stone-50 border border-stone-200 text-stone-500 px-4 py-2.5 rounded-full hover:bg-stone-100 hover:text-stone-700 transition-all"
                                >
                                    <Phone size={13} />
                                    전화
                                </a>
                            )}
                            {link && (
                                <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold bg-stone-50 border border-stone-200 text-stone-500 px-4 py-2.5 rounded-full hover:bg-stone-100 hover:text-stone-700 transition-all"
                                >
                                    <ExternalLink size={13} />
                                    웹사이트
                                </a>
                            )}
                            <a
                                href={`https://map.naver.com/v5/search/${encodeURIComponent(name)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold bg-[#03C75A]/8 border border-[#03C75A]/15 text-[#03C75A] px-4 py-2.5 rounded-full hover:bg-[#03C75A]/15 transition-all"
                            >
                                <Navigation size={13} />
                                네이버 지도
                            </a>

                            {/* ── 선정하기 버튼 ── */}
                            <motion.button
                                onClick={handleAdd}
                                disabled={isAdding || isAdded}
                                whileHover={!isAdded ? { scale: 1.04, y: -1 } : {}}
                                whileTap={!isAdded ? { scale: 0.97 } : {}}
                                className={`shrink-0 ml-auto inline-flex items-center gap-1.5 text-xs font-bold px-6 py-2.5 rounded-full transition-all ${
                                    isAdded
                                        ? 'bg-emerald-50 text-emerald-500 border border-emerald-200'
                                        : 'bg-stone-800 text-white hover:bg-stone-900 shadow-lg shadow-stone-300/40'
                                }`}
                            >
                                {isAdding ? (
                                    <Loader2 size={13} className="animate-spin" />
                                ) : isAdded ? (
                                    <><Check size={13} />선정 완료</>
                                ) : (
                                    <><Heart size={13} />선정하기</>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </TiltCard>

            {/* ═══════════════════════════════════════════════ */}
            {/* SECTION 2: AI 요약 + 빠른 정보 + 지도           */}
            {/* ═══════════════════════════════════════════════ */}
            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-5"
            >
                {/* ── AI 요약 (넓은 영역) ── */}
                <motion.div variants={fadeUp} className="lg:col-span-3">
                    <div className="h-full bg-white rounded-[1.5rem] border border-stone-100 shadow-sm p-6 sm:p-7">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                                <Sparkles size={15} className="text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-stone-800">AI 분석 요약</h3>
                                <p className="text-[10px] text-stone-400 font-medium">블로그 후기 기반 분석</p>
                            </div>
                        </div>

                        {summaryLoading ? (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-4 bg-stone-100 rounded-lg w-full" />
                                <div className="h-4 bg-stone-100 rounded-lg w-5/6" />
                                <div className="h-4 bg-stone-50 rounded-lg w-3/5" />
                            </div>
                        ) : summary ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="relative bg-gradient-to-br from-stone-50 to-amber-50/30 rounded-2xl p-5 border border-stone-100/60">
                                    <Quote size={20} className="absolute top-3 left-3 text-amber-200/60" />
                                    <p className="text-sm text-stone-700 leading-[1.8] pl-4">
                                        {summary}
                                    </p>
                                </div>
                                {reviews.length > 0 && (
                                    <p className="text-[11px] text-stone-400 mt-3 ml-1">
                                        블로그 후기 {reviews.length}개를 분석한 결과입니다
                                    </p>
                                )}
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <Sparkles size={20} className="text-stone-200 mb-2" />
                                <p className="text-xs text-stone-400">
                                    {reviews.length > 0
                                        ? 'AI 요약을 생성하지 못했습니다'
                                        : '분석할 후기가 아직 없습니다'}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ── 빠른 정보 카드들 (좁은 영역) ── */}
                <motion.div variants={fadeUp} className="lg:col-span-2 flex flex-col gap-4">
                    {/* 정보 카드 */}
                    <div className="bg-white rounded-[1.5rem] border border-stone-100 shadow-sm p-5 flex-1">
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">빠른 정보</h3>
                        <div className="space-y-3">
                            {address && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center shrink-0">
                                        <MapPin size={14} className="text-stone-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-stone-400">위치</p>
                                        <p className="text-sm text-stone-700 font-medium truncate">{address.split(' ').slice(0, 3).join(' ')}</p>
                                    </div>
                                </div>
                            )}
                            {phone && (
                                <a href={`tel:${phone}`} className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center shrink-0 group-hover:bg-stone-100 transition-colors">
                                        <Phone size={14} className="text-stone-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-stone-400">연락처</p>
                                        <p className="text-sm text-stone-700 font-medium truncate group-hover:text-stone-900 transition-colors">{phone}</p>
                                    </div>
                                </a>
                            )}
                            {link && (
                                <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center shrink-0 group-hover:bg-stone-100 transition-colors">
                                        <ExternalLink size={14} className="text-stone-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-stone-400">웹사이트</p>
                                        <p className="text-sm text-stone-700 font-medium truncate group-hover:text-stone-900 transition-colors">바로가기</p>
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* ═══════════════════════════════════════════════ */}
            {/* SECTION 3: 지도                                 */}
            {/* ═══════════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, type: 'spring', stiffness: 180, damping: 24 }}
                className="bg-white rounded-[1.5rem] border border-stone-100 shadow-sm overflow-hidden mb-5"
            >
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <MapPin size={13} className="text-emerald-500" />
                        </div>
                        <h3 className="font-bold text-stone-800 text-sm">위치 안내</h3>
                    </div>
                    <a
                        href={`https://map.naver.com/v5/search/${encodeURIComponent(address || name)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#03C75A] hover:underline"
                    >
                        네이버 지도에서 열기
                        <ArrowUpRight size={11} />
                    </a>
                </div>

                {mapCoords ? (
                    <div className="aspect-[2.2/1] sm:aspect-[2.8/1]">
                        <iframe
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lon - 0.004},${mapCoords.lat - 0.002},${mapCoords.lon + 0.004},${mapCoords.lat + 0.002}&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lon}`}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            title={`${name} 지도`}
                            loading="lazy"
                        />
                    </div>
                ) : mapFallback ? (
                    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mb-3">
                            <MapPin size={20} className="text-stone-300" />
                        </div>
                        <p className="text-sm text-stone-400 mb-4">정확한 지도를 표시할 수 없습니다</p>
                        <a
                            href={`https://map.naver.com/v5/search/${encodeURIComponent(address || name)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#03C75A] px-5 py-2.5 rounded-xl hover:bg-[#02b351] transition-all shadow-md shadow-green-500/20"
                        >
                            <Navigation size={12} />
                            네이버 지도에서 보기
                        </a>
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-14">
                        <Loader2 size={22} className="animate-spin text-stone-200" />
                    </div>
                )}
            </motion.div>

            {/* ═══════════════════════════════════════════════ */}
            {/* SECTION 4: 블로그 후기                           */}
            {/* ═══════════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 180, damping: 24 }}
                className="bg-white rounded-[1.5rem] border border-stone-100 shadow-sm p-6 sm:p-8"
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center">
                            <BookOpen size={15} className="text-stone-500" />
                        </div>
                        <div>
                            <h2 className="font-bold text-stone-800">블로그 후기</h2>
                            {!reviewLoading && reviews.length > 0 && (
                                <p className="text-[10px] text-stone-400 font-medium mt-0.5">
                                    실제 방문자 후기 {reviews.length}개
                                </p>
                            )}
                        </div>
                    </div>
                    {!reviewLoading && reviews.length > 0 && (
                        <a
                            href={`https://search.naver.com/search.naver?query=${encodeURIComponent(name + ' 웨딩 후기')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-1"
                        >
                            더 검색하기
                            <ArrowUpRight size={12} />
                        </a>
                    )}
                </div>

                {/* 로딩 스켈레톤 */}
                {reviewLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-stone-50 rounded-2xl p-5 space-y-3 animate-pulse">
                                <div className="h-4 bg-stone-200/60 rounded-lg w-4/5" />
                                <div className="h-3.5 bg-stone-100 rounded-lg w-full" />
                                <div className="h-3.5 bg-stone-100 rounded-lg w-3/5" />
                                <div className="flex gap-2 pt-3 border-t border-stone-100">
                                    <div className="h-3 bg-stone-100 rounded w-14" />
                                    <div className="h-3 bg-stone-100 rounded w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 빈 상태 */}
                {!reviewLoading && reviews.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center mb-4">
                            <BookOpen size={24} className="text-stone-200" />
                        </div>
                        <p className="text-sm text-stone-500 font-medium mb-1">아직 관련 후기가 없습니다</p>
                        <p className="text-xs text-stone-400 mb-5">네이버에서 직접 검색해보세요</p>
                        <a
                            href={`https://search.naver.com/search.naver?query=${encodeURIComponent(name + ' 웨딩 후기')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 bg-stone-100 px-5 py-2.5 rounded-full hover:bg-stone-200 transition-all"
                        >
                            <Search size={12} />
                            네이버에서 검색하기
                        </a>
                    </div>
                )}

                {/* 후기 카드 그리드 */}
                {!reviewLoading && reviews.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence mode="popLayout">
                                {visibleReviews.map((review, i) => (
                                    <motion.a
                                        key={review.link || i}
                                        href={review.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        layout
                                        initial={{ opacity: 0, y: 16, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{
                                            delay: i < INITIAL_REVIEW_COUNT ? i * 0.06 : (i - INITIAL_REVIEW_COUNT) * 0.05,
                                            type: 'spring',
                                            stiffness: 260,
                                            damping: 25,
                                        }}
                                        className="group block bg-stone-50/70 hover:bg-white border border-stone-100 hover:border-stone-200 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-stone-100/80 hover:-translate-y-0.5"
                                    >
                                        {/* 제목 */}
                                        <h4 className="text-[15px] font-bold text-stone-800 mb-2.5 line-clamp-2 group-hover:text-stone-900 transition-colors leading-snug tracking-tight">
                                            {review.title}
                                        </h4>

                                        {/* 요약 */}
                                        <p className="text-[13px] text-stone-500 leading-relaxed line-clamp-3 mb-4">
                                            {review.description}
                                        </p>

                                        {/* 메타 정보 */}
                                        <div className="flex items-center gap-3 pt-3 border-t border-stone-100 text-[11px] text-stone-400">
                                            <span className="flex items-center gap-1 font-medium">
                                                <User size={10} />
                                                {review.bloggername}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={10} />
                                                {formatDate(review.postdate)}
                                            </span>
                                        </div>
                                    </motion.a>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* 더보기 / 접기 */}
                        {hasMoreReviews && (
                            <motion.div
                                layout
                                className="flex justify-center mt-6"
                            >
                                <motion.button
                                    onClick={() => setShowAllReviews(prev => !prev)}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="inline-flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 px-6 py-3 rounded-full transition-colors"
                                >
                                    {showAllReviews ? (
                                        <>접기</>
                                    ) : (
                                        <>후기 더보기 ({reviews.length - INITIAL_REVIEW_COUNT})</>
                                    )}
                                    <motion.div
                                        animate={{ rotate: showAllReviews ? 180 : 0 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    >
                                        <ChevronDown size={14} />
                                    </motion.div>
                                </motion.button>
                            </motion.div>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    )
}
