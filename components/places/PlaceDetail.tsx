'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import {
    ArrowLeft, MapPin, Phone, ExternalLink,
    Loader2, Check, BookOpen, Sparkles,
    ChevronDown, Search, Heart, Navigation,
    Quote, Calendar, User, ArrowUpRight, Info,
} from 'lucide-react'
import Link from 'next/link'
import { addUserPlace } from '@/actions/user-places'

interface BlogReview {
    title: string
    description: string
    link: string
    bloggername: string
    postdate: string
}

interface AiData {
    summary: string
    keywords: string[]
    pros: string[]
    cons: string[]
    rating: number
}

interface PlacePlaceDetailProps {
    slug: string
    name: string
    address: string
    phone: string
    link: string
    mapx?: string
    mapy?: string
}

/* ── 카테고리별 테마 (세련된 톤) ── */
const CATEGORY_THEMES: Record<string, { gradient: string; accent: string; icon: string }> = {
    'wedding-hall': { gradient: 'from-stone-800 via-stone-700 to-rose-900/80', accent: 'text-rose-300', icon: '🏛' },
    'studio': { gradient: 'from-slate-800 via-slate-700 to-violet-900/80', accent: 'text-violet-300', icon: '📸' },
    'dress': { gradient: 'from-stone-800 via-stone-700 to-pink-900/60', accent: 'text-pink-300', icon: '👗' },
    'makeup': { gradient: 'from-stone-800 via-warm-gray-700 to-rose-900/60', accent: 'text-rose-300', icon: '💄' },
    'meeting-place': { gradient: 'from-stone-800 via-amber-900/40 to-stone-700', accent: 'text-amber-300', icon: '🍽' },
    'hanbok': { gradient: 'from-stone-800 via-red-900/30 to-stone-700', accent: 'text-red-300', icon: '👘' },
    'wedding-ring': { gradient: 'from-stone-800 via-amber-900/50 to-stone-700', accent: 'text-amber-300', icon: '💍' },
    'honeymoon': { gradient: 'from-slate-800 via-sky-900/40 to-slate-700', accent: 'text-sky-300', icon: '✈️' },
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
export default function PlacePlaceDetail({
    slug,
    name,
    address,
    phone,
    link,
    mapx,
    mapy,
}: PlacePlaceDetailProps) {
    const [reviews, setReviews] = useState<BlogReview[]>([])
    const [summary, setSummary] = useState<AiData | null>(null)
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
            const res = await fetch(`/api/places/detail?${params}`)
            const data = await res.json()
            setReviews(data.reviews || [])
            setSummary(data.aiData || null)
        } catch {
            // silent
        } finally {
            setReviewLoading(false)
            setSummaryLoading(false)
        }
    }, [name, slug])

    /* ── 지도 좌표 세팅 ── */
    const initMapCoords = useCallback(() => {
        // 이미 검색 API에서 정확한 좌표(mapx, mapy)를 가져온 경우 직접 사용
        // 네이버 Local Search API의 mapx/y는 wgs84 * 10,000,000 형태로 내려옴
        if (mapx && mapy) {
            const lat = parseFloat(mapy) / 10000000
            const lon = parseFloat(mapx) / 10000000
            if (!isNaN(lat) && !isNaN(lon)) {
                setMapCoords({ lat, lon })
                return
            }
        }

        // fallback: Nominatim Geocoding (주소 기반)
        if (!address) { setMapFallback(true); return }
        fetch(`/api/places/geocode?address=${encodeURIComponent(address)}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.lat && data?.lon) {
                    setMapCoords({ lat: data.lat, lon: data.lon })
                } else {
                    setMapFallback(true)
                }
            })
            .catch(() => setMapFallback(true))
    }, [address, mapx, mapy])

    useEffect(() => {
        fetchReviews()
        initMapCoords()
    }, [fetchReviews, initMapCoords])

    const handleAdd = async () => {
        setIsAdding(true)
        try {
            await addUserPlace({
                category: slug,
                place_name: name,
                place_address: address,
                place_phone: phone,
                place_link: link,
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
                    href={`/places/category/${slug}`}
                    className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors text-sm font-medium group"
                >
                    <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
                    검색 결과로 돌아가기
                </Link>
            </motion.div>

            {/* ═══════════════════════════════════════════════ */}
            {/* SECTION 1: 히어로 + 장소 상세                    */}
            {/* ═══════════════════════════════════════════════ */}
            <TiltCard className="mb-6">
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    className="rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50"
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
                                className={`shrink-0 ml-auto inline-flex items-center gap-1.5 text-xs font-bold px-6 py-2.5 rounded-full transition-all ${isAdded
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
            {/* SECTION 2: AI 요약 + 구조화된 데이터 (Bento Grid)  */}
            {/* ═══════════════════════════════════════════════ */}
            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8"
            >
                {/* ── AI 종합 요약 (넓고 시각적으로 돋보이는 영역) ── */}
                <motion.div variants={fadeUp} className="md:col-span-2 lg:col-span-3 h-full flex flex-col gap-4 lg:gap-6">
                    <div className="relative flex-1 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group">
                        {/* Glassmorphism 빛 반사 장식 */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-100/40 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                        <div className="relative p-6 sm:p-8 z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-200">
                                        <Sparkles size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-[17px] font-bold text-gray-800 tracking-tight">AI 분석 요약</h3>
                                        <p className="text-[13px] text-gray-500 font-medium mt-0.5">실제 고객들의 생생한 리뷰를 바탕으로 분석했어요</p>
                                    </div>
                                </div>
                                {summary?.rating && (
                                    <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-full border border-pink-100 shadow-sm">
                                        <span className="text-yellow-400">★</span>
                                        <span className="font-extrabold text-sm text-gray-800">{summary.rating.toFixed(1)}</span>
                                        <span className="text-[10px] text-gray-400 font-bold">/ 5.0</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col justify-center mt-2.5">
                                {summaryLoading ? (
                                    <div className="space-y-4 animate-pulse pt-2">
                                        <div className="h-4 bg-gray-200/50 rounded-full w-full" />
                                        <div className="h-4 bg-gray-200/50 rounded-full w-11/12" />
                                        <div className="h-4 bg-gray-200/50 rounded-full w-4/5" />
                                        <div className="h-4 bg-gray-200/50 rounded-full w-2/3" />
                                    </div>
                                ) : summary ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.1 }}
                                        className="relative"
                                    >
                                        <Quote size={32} className="absolute -top-3 -left-3 text-pink-300/30 rotate-180" />
                                        <p className="text-[15px] sm:text-[16px] text-gray-700 font-semibold leading-[1.8] pl-7 relative z-10 break-keep">
                                            {summary.summary}
                                        </p>

                                        {/* 키워드 칩스 */}
                                        {summary.keywords && summary.keywords.length > 0 && (
                                            <div className="mt-7 flex flex-wrap gap-2.5 pl-7">
                                                {summary.keywords.map((kw, i) => (
                                                    <span key={i} className="px-3.5 py-1.5 bg-white/60 backdrop-blur-md border border-pink-100 text-pink-600 font-semibold text-[12px] tracking-tight rounded-full shadow-sm hover:bg-pink-50 transition-colors">
                                                        #{kw}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {reviews.length > 0 && (
                                            <div className="mt-8 flex items-center gap-2 pl-7">
                                                <div className="flex -space-x-2">
                                                    {reviews.slice(0, 3).map((_, i) => (
                                                        <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white flex items-center justify-center">
                                                            <User size={10} className="text-gray-400" />
                                                        </div>
                                                    ))}
                                                    {reviews.length > 3 && (
                                                        <div className="w-6 h-6 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-500">
                                                            +{reviews.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs font-semibold text-pink-600 bg-pink-50/80 px-2.5 py-1 rounded-md tracking-tight">
                                                    블로그 후기 <span className="font-bold">{reviews.length}</span>개 분석 완료
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100">
                                            <Sparkles size={20} className="text-gray-300" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-400">
                                            {reviews.length > 0
                                                ? 'AI 분석 데이터를 가져오지 못했습니다'
                                                : '분석할 블로그 후기가 아직 없습니다'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── AI 장단점 분석 (Bento Grid) ── */}
                <motion.div variants={fadeUp} className="md:col-span-2 lg:col-span-2 flex flex-col gap-4 lg:gap-6">
                    {/* 장점 카드 */}
                    <div className="flex-1 bg-white rounded-[2rem] border border-emerald-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 group hover:shadow-[0_8px_30px_rgb(16,185,129,0.1)] transition-shadow">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                <Check size={14} className="text-emerald-500" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800">이런 점이 좋아요</h3>
                        </div>
                        <ul className="space-y-3">
                            {summaryLoading ? (
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-3 bg-gray-100 rounded-full w-full" />
                                    <div className="h-3 bg-gray-100 rounded-full w-4/5" />
                                </div>
                            ) : summary?.pros && summary.pros.length > 0 ? (
                                summary.pros.map((pro, i) => (
                                    <li key={i} className="text-sm text-gray-600 font-medium flex items-start gap-2 leading-snug">
                                        <span className="text-emerald-400 mt-0.5">•</span> {pro}
                                    </li>
                                ))
                            ) : (
                                <li className="text-sm text-gray-400">분석된 장점 데이터가 없습니다.</li>
                            )}
                        </ul>
                    </div>

                    {/* 단점 카드 */}
                    <div className="flex-1 bg-white rounded-[2rem] border border-rose-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 group hover:shadow-[0_8px_30px_rgb(244,63,94,0.1)] transition-shadow">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100">
                                <Info size={14} className="text-rose-500" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800">이런 점은 아쉬워요</h3>
                        </div>
                        <ul className="space-y-3">
                            {summaryLoading ? (
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-3 bg-gray-100 rounded-full w-full" />
                                    <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                                </div>
                            ) : summary?.cons && summary.cons.length > 0 ? (
                                summary.cons.map((con, i) => (
                                    <li key={i} className="text-sm text-gray-600 font-medium flex items-start gap-2 leading-snug">
                                        <span className="text-rose-400 mt-0.5">•</span> {con}
                                    </li>
                                ))
                            ) : (
                                <li className="text-sm text-gray-400">크게 아쉬운 점이 포착되지 않았습니다.</li>
                            )}
                        </ul>
                    </div>
                </motion.div>
            </motion.div>

            {/* ═══════════════════════════════════════════════ */}
            {/* SECTION 3: 위치 및 상세 안내 (Split Layout)           */}
            {/* ═══════════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, type: 'spring', stiffness: 180, damping: 24 }}
                className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden mb-8 grid grid-cols-1 lg:grid-cols-3 group"
            >
                {/* 1. 지도 영역 (2/3) */}
                <div className="col-span-1 lg:col-span-2 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-100 relative">
                    <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-50 bg-white z-10 relative shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-[10px] bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                <Navigation size={14} className="text-emerald-500" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm tracking-tight">위치 안내</h3>
                        </div>
                        {/* Status indicators like Loading can go here if needed */}
                    </div>

                    <div className="flex-1 relative min-h-[300px] sm:min-h-[400px] bg-gray-50">
                        {mapCoords ? (
                            <>
                                <div className="absolute inset-0 bg-emerald-50/20 mix-blend-overlay pointer-events-none" />
                                <iframe
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lon - 0.004},${mapCoords.lat - 0.002},${mapCoords.lon + 0.004},${mapCoords.lat + 0.002}&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lon}`}
                                    width="100%"
                                    height="100%"
                                    className="absolute inset-0"
                                    style={{ border: 0, filter: 'grayscale(0.2) contrast(1.1) opacity(0.95)' }}
                                    title={`${name} 지도`}
                                    loading="lazy"
                                />
                            </>
                        ) : mapFallback ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gray-50/80">
                                <div className="w-14 h-14 rounded-[16px] bg-white shadow-sm flex items-center justify-center mb-4 border border-gray-100">
                                    <MapPin size={24} className="text-gray-300" />
                                </div>
                                <p className="text-sm font-medium text-gray-400 mb-5">정확한 지도를 표시할 수 없습니다</p>
                                <a
                                    href={`https://map.naver.com/v5/search/${encodeURIComponent(address || name)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-emerald-200/50 hover:-translate-y-0.5 transition-all"
                                >
                                    <Navigation size={14} />
                                    네이버 지도에서 보기
                                </a>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80">
                                <Loader2 size={24} className="animate-spin text-gray-300" />
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. 상세 정보 영역 (1/3) */}
                <div className="col-span-1 flex flex-col p-6 sm:p-8 bg-gradient-to-br from-gray-50/80 to-gray-100/30">
                    <h3 className="font-bold text-gray-800 text-lg mb-6 tracking-tight">오시는 길 & 문의</h3>

                    <div className="space-y-6 flex-1">
                        {/* 주소 */}
                        <div className="flex gap-3">
                            <MapPin size={18} className="text-gray-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">주소</p>
                                <p className="text-sm font-medium text-gray-700 leading-relaxed max-w-[90%] break-keep">{address || '주소 정보가 없습니다.'}</p>
                            </div>
                        </div>

                        {/* 연락처 */}
                        {phone && (
                            <div className="flex gap-3">
                                <Phone size={18} className="text-gray-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">연락처</p>
                                    <p className="text-sm font-medium text-gray-700">{phone}</p>
                                </div>
                            </div>
                        )}

                        {/* 부가 안내 */}
                        <div className="flex gap-3">
                            <Info size={18} className="text-gray-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">이용 안내</p>
                                <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
                                    주차장 여부 및 대중교통 노선, 세부 영업시간 등은 앱이나 공식 웹사이트에서 상세 확인을 권장합니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 하단 액션 버튼 */}
                    <div className="mt-8 pt-6 border-t border-gray-200/60 flex flex-col gap-3">
                        <a
                            href={`https://map.naver.com/v5/search/${encodeURIComponent(address || name)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 w-full text-sm font-bold text-white bg-[#03C75A] hover:bg-[#02b351] py-3.5 rounded-xl transition-all shadow-sm hover:shadow-[#03C75A]/20 hover:-translate-y-0.5"
                        >
                            네이버 지도 크게 보기
                            <ArrowUpRight size={16} />
                        </a>

                        {link && (
                            <a
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-2 w-full text-[13px] font-bold text-gray-600 bg-white border border-gray-200 hover:border-gray-300 py-3.5 rounded-xl transition-all shadow-sm hover:-translate-y-0.5"
                            >
                                <ExternalLink size={14} className="text-gray-400" />
                                공식 웹사이트 방문
                            </a>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* ═══════════════════════════════════════════════ */}
            {/* SECTION 4: 블로그 후기                           */}
            {/* ═══════════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 180, damping: 24 }}
                className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 relative overflow-hidden"
            >
                {/* 배경 꾸밈 장식 */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-pink-50/50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                {/* 헤더 */}
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-gray-100 to-gray-50 border border-white flex items-center justify-center shadow-sm">
                            <BookOpen size={18} className="text-gray-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 tracking-tight">블로그 후기</h2>
                            {!reviewLoading && reviews.length > 0 && (
                                <p className="text-xs font-bold text-gray-400 mt-0.5">
                                    총 {reviews.length}개의 리얼 리뷰
                                </p>
                            )}
                        </div>
                    </div>
                    {!reviewLoading && reviews.length > 0 && (
                        <a
                            href={`https://search.naver.com/search.naver?query=${encodeURIComponent(name + ' 웨딩 후기')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-gray-500 hover:text-gray-800 bg-white border border-gray-100 hover:border-gray-200 px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md flex items-center gap-1.5"
                        >
                            더보기
                            <ArrowUpRight size={14} />
                        </a>
                    )}
                </div>

                {/* 로딩 스켈레톤 */}
                {reviewLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 animate-pulse">
                                <div className="h-4 bg-gray-100 rounded-full w-4/5" />
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-50 rounded-full w-full" />
                                    <div className="h-3 bg-gray-50 rounded-full w-3/5" />
                                </div>
                                <div className="flex gap-2 pt-4 border-t border-gray-50">
                                    <div className="h-4 bg-gray-50 rounded w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 빈 상태 */}
                {!reviewLoading && reviews.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center relative z-10 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-5 border border-gray-100">
                            <BookOpen size={24} className="text-gray-300" />
                        </div>
                        <p className="text-base font-bold text-gray-500 mb-1">아직 관련 리뷰를 찾지 못했어요</p>
                        <p className="text-sm font-medium text-gray-400 mb-6">네이버에서 직접 검색해 보시겠어요?</p>
                        <a
                            href={`https://search.naver.com/search.naver?query=${encodeURIComponent(name + ' 웨딩 후기')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-bold text-white bg-gray-800 px-6 py-3 rounded-xl hover:bg-gray-900 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <Search size={14} />
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
                                        className="group block bg-white hover:bg-gray-50/50 border border-gray-100 hover:border-gray-200 rounded-[1.5rem] p-6 transition-all duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-pink-300 to-rose-300 opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {/* 제목 */}
                                        <h4 className="text-base font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-pink-600 transition-colors leading-snug tracking-tight">
                                            {review.title}
                                        </h4>

                                        {/* 요약 */}
                                        <p className="text-[13px] text-gray-500 font-medium leading-[1.7] line-clamp-3 mb-5">
                                            {review.description}
                                        </p>

                                        {/* 메타 정보 */}
                                        <div className="flex items-center gap-4 pt-4 border-t border-gray-100 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                                            <span className="flex items-center gap-1.5">
                                                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <User size={10} className="text-gray-500" />
                                                </div>
                                                {review.bloggername}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={12} className="text-gray-300" />
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
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-pink-600 bg-white border border-gray-200 hover:border-pink-200 px-8 py-3.5 rounded-full transition-all shadow-sm hover:shadow-md"
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
