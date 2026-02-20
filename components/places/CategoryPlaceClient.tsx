'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft, Plus, MapPin, Loader2,
    Search, Check, ChevronRight, ChevronLeft, Star,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { addUserPlace } from '@/actions/user-places'
import { CATEGORIES, CATEGORY_FILTERS } from '@/lib/constants/place-categories'

interface NaverPlace {
    title: string
    address: string
    roadAddress: string
    telephone: string
    link: string
    category: string
    description: string
    mapx?: string
    mapy?: string
}

const CITIES = ['서울', '경기', '인천', '부산', '대구', '대전', '광주', '제주']

const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '55%' : '-55%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-55%' : '55%', opacity: 0 }),
}
const transition = { type: 'spring' as const, stiffness: 320, damping: 32 }

/* 카테고리별 헤더 그라디언트 */
const CATEGORY_GRADIENTS: Record<string, { bg: string; text: string }> = {
    'wedding-hall': { bg: 'from-rose-100 via-pink-100 to-pink-200', text: 'text-rose-400' },
    'studio': { bg: 'from-violet-100 via-purple-100 to-purple-200', text: 'text-violet-400' },
    'dress': { bg: 'from-pink-100 via-rose-100 to-rose-200', text: 'text-pink-400' },
    'makeup': { bg: 'from-fuchsia-100 via-pink-100 to-pink-200', text: 'text-fuchsia-400' },
    'meeting-place': { bg: 'from-amber-100 via-orange-50 to-orange-200', text: 'text-amber-500' },
    'hanbok': { bg: 'from-red-100 via-rose-100 to-rose-200', text: 'text-red-400' },
    'wedding-ring': { bg: 'from-yellow-100 via-amber-50 to-amber-200', text: 'text-yellow-500' },
    'honeymoon': { bg: 'from-sky-100 via-blue-50 to-blue-200', text: 'text-sky-400' },
}

export default function CategoryPlaceClient({ slug }: { slug: string }) {
    const router = useRouter()
    const category = CATEGORIES.find((c: any) => c.slug === slug)
    const filters = CATEGORY_FILTERS[slug] || []
    const totalSteps = 1 + filters.length

    const [step, setStep] = useState(0)
    const [dir, setDir] = useState(1)
    const [showSummary, setShowSummary] = useState(false)

    const [sido, setSido] = useState('')
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({})

    const [naverResults, setNaverResults] = useState<NaverPlace[]>([])
    const [naverLoading, setNaverLoading] = useState(false)
    const [naverError, setNaverError] = useState<string | null>(null)
    const [addingPlace, setAddingPlace] = useState<string | null>(null)
    const [addedPlaces, setAddedPlaces] = useState<Set<string>>(new Set())
    const [searched, setSearched] = useState(false)

    // ── 위자드 네비게이션 ──────────────────────────────
    const advance = (fromStep: number) => {
        setDir(1)
        if (fromStep + 1 >= totalSteps) setShowSummary(true)
        else setStep(fromStep + 1)
    }

    const goBack = () => {
        setDir(-1)
        if (showSummary) setShowSummary(false)
        else if (step > 0) setStep(prev => prev - 1)
    }

    const handleCitySelect = (city: string) => {
        setSido(city)
        setTimeout(() => advance(0), 260)
    }

    const handleFilterSelect = (key: string, value: string, filterStep: number) => {
        setSelectedFilters(prev => ({ ...prev, [key]: value }))
        setTimeout(() => advance(filterStep), 260)
    }

    // ── 검색 ───────────────────────────────────────────
    const handleSearch = async () => {
        setSearched(true)
        setNaverLoading(true)
        setNaverError(null)
        setNaverResults([])

        const searchSido = sido || '서울'
        fetch(`/api/places/search?category=${slug}&sido=${encodeURIComponent(searchSido)}`)
            .then(r => r.json())
            .then(data => {
                if (data.error) setNaverError(data.error)
                else setNaverResults(data.places || [])
            })
            .catch(() => setNaverError('네이버 검색에 실패했습니다.'))
            .finally(() => setNaverLoading(false))
    }

    const handleAdd = async (
        placeName: string,
        placeAddress?: string,
        placePhone?: string,
        placeLink?: string,
    ) => {
        setAddingPlace(placeName)
        await addUserPlace({
            category: slug,
            place_name: placeName,
            place_address: placeAddress,
            place_phone: placePhone,
            place_link: placeLink,
        })
        setAddedPlaces(prev => new Set([...prev, placeName]))
        setAddingPlace(null)
    }

    const extractKeywords = (desc: string): string[] => {
        if (!desc) return []
        return desc
            .replace(/<[^>]+>/g, '')
            .split(/[,·\s]+/)
            .map(k => k.trim())
            .filter(k => k.length >= 2 && k.length <= 8)
            .slice(0, 3)
    }

    const resetWizard = () => {
        setSearched(false)
        setShowSummary(false)
        setStep(0)
        setDir(1)
        setSido('')
        setSelectedFilters({})
        setNaverResults([])
        setNaverError(null)
    }

    if (!category) {
        return (
            <div className="text-center py-20 text-gray-400">
                <p>카테고리를 찾을 수 없습니다.</p>
                <Link href="/places" className="text-pink-400 hover:underline mt-2 block">돌아가기</Link>
            </div>
        )
    }

    const progressStep = showSummary ? totalSteps : step
    const gradient = CATEGORY_GRADIENTS[slug] || { bg: 'from-gray-100 to-gray-200', text: 'text-gray-400' }

    return (
        <div className="max-w-5xl mx-auto px-3 sm:px-6 pb-24">

            {/* ── 상단 네비 ── */}
            <div className="mt-8 mb-8">
                <Link
                    href="/places"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={15} />
                    장소 관리
                </Link>
            </div>

            {/* ── 헤더 ── */}
            <div className="text-center mb-10">
                <div className="text-5xl mb-4">{category.emoji}</div>
                <h2 className="font-serif italic text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-2">
                    {category.label}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-pink-300" />
                    <div className="w-2 h-2 rounded-full bg-pink-300" />
                    <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-pink-300" />
                </div>
            </div>

            {/* ── 슬라이딩 위자드 ── */}
            {!searched && (
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-8">
                    {/* 진행 표시 */}
                    <div className="flex items-center justify-center gap-1.5 pt-6 pb-1 px-8">
                        {Array.from({ length: totalSteps + 1 }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 rounded-full transition-all duration-300 ${i === progressStep ? 'w-8 bg-pink-400'
                                    : i < progressStep ? 'w-3 bg-pink-200'
                                        : 'w-2 bg-gray-100'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* 슬라이드 영역 */}
                    <div className="relative overflow-hidden" style={{ minHeight: 320 }}>
                        <AnimatePresence mode="wait" custom={dir}>
                            {!showSummary ? (
                                <motion.div
                                    key={step}
                                    custom={dir}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={transition}
                                    className="px-8 pt-6 pb-4"
                                >
                                    <p className="text-[11px] font-extrabold text-pink-400 uppercase tracking-widest mb-1">
                                        Step {step + 1} / {totalSteps}
                                    </p>

                                    {step === 0 ? (
                                        <>
                                            <h3 className="text-2xl font-bold text-gray-800 mb-2">어느 지역에서 찾으시나요?</h3>
                                            <p className="text-sm text-gray-500 mb-8 font-medium">원하는 지역을 선택해주세요</p>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 md:gap-4">
                                                {CITIES.map(city => (
                                                    <button
                                                        key={city}
                                                        onClick={() => handleCitySelect(city)}
                                                        className={`relative py-5 rounded-2xl border-2 text-sm font-bold text-center transition-all duration-300 ${sido === city
                                                            ? 'border-pink-300 text-pink-600 bg-pink-50/80 shadow-md shadow-pink-100/50 scale-[1.02]'
                                                            : 'border-transparent text-gray-600 bg-gray-50/80 hover:bg-white hover:border-pink-200 hover:shadow-sm hover:text-pink-500'
                                                            }`}
                                                    >
                                                        {sido === city && (
                                                            <motion.span
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center shadow-sm"
                                                            >
                                                                <Check size={14} className="text-white" strokeWidth={3} />
                                                            </motion.span>
                                                        )}
                                                        {city}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                                {filters[step - 1].label}을(를) 선택해주세요
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-8 font-medium">가장 잘 맞는 옵션을 선택해주세요</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                                {(() => {
                                                    const currentFilter = filters[step - 1]
                                                    const options = typeof currentFilter.options === 'function'
                                                        ? currentFilter.options(selectedFilters)
                                                        : currentFilter.options

                                                    return options.map((option: any) => {
                                                        const key = currentFilter.key
                                                        const isSelected = selectedFilters[key] === option
                                                        return (
                                                            <button
                                                                key={option}
                                                                onClick={() => handleFilterSelect(key, option, step)}
                                                                className={`relative py-6 px-6 rounded-2xl border-2 text-base font-bold text-left transition-all duration-300 ${isSelected
                                                                    ? 'border-pink-300 text-pink-600 bg-pink-50/80 shadow-md shadow-pink-100/50 scale-[1.02]'
                                                                    : 'border-transparent text-gray-600 bg-gray-50/80 hover:bg-white hover:border-pink-200 hover:shadow-sm hover:text-pink-500'
                                                                    }`}
                                                            >
                                                                {isSelected && (
                                                                    <motion.span
                                                                        initial={{ scale: 0 }}
                                                                        animate={{ scale: 1 }}
                                                                        className="absolute top-1/2 -translate-y-1/2 right-4 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center shadow-sm"
                                                                    >
                                                                        <Check size={14} className="text-white" strokeWidth={3} />
                                                                    </motion.span>
                                                                )}
                                                                {option}
                                                            </button>
                                                        )
                                                    })
                                                })()}
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ) : (
                                /* 요약 확인 */
                                <motion.div
                                    key="summary"
                                    custom={dir}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={transition}
                                    className="px-8 pt-6 pb-4"
                                >
                                    <p className="text-[11px] font-extrabold text-pink-500 uppercase tracking-widest mb-2">확인</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">선택한 조건을 확인해주세요</h3>
                                    <p className="text-sm text-gray-500 mb-8 font-medium">맞으면 아래 버튼을 눌러 검색을 시작합니다</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-10">
                                        <div className="flex flex-col gap-1.5 py-5 px-6 bg-white border border-pink-100 rounded-[1.25rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden group hover:border-pink-200 transition-all hover:shadow-[0_8px_30px_rgb(244,114,182,0.15)] hover:-translate-y-0.5">
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-pink-400" />
                                            <span className="text-[11px] font-extrabold text-pink-500 uppercase tracking-widest">지역</span>
                                            <span className="text-lg font-extrabold text-gray-900 break-words leading-tight">{sido || '서울'}</span>
                                        </div>
                                        {filters.map((f: any) => selectedFilters[f.key] ? (
                                            <div key={f.key} className="flex flex-col gap-1.5 py-5 px-6 bg-white border border-gray-100 rounded-[1.25rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden hover:border-pink-200 hover:shadow-[0_8px_30px_rgb(244,114,182,0.15)] transition-all group hover:-translate-y-0.5">
                                                <div className="absolute top-0 left-0 w-1.5 h-full bg-gray-200 group-hover:bg-pink-300 transition-colors" />
                                                <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest group-hover:text-pink-500 transition-colors">{f.label}</span>
                                                <span className="text-lg font-extrabold text-gray-900 group-hover:text-gray-900 transition-colors break-words leading-tight">{selectedFilters[f.key]}</span>
                                            </div>
                                        ) : null)}
                                    </div>

                                    <button
                                        onClick={handleSearch}
                                        className="w-full py-5 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold text-base flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-pink-300/50 hover:-translate-y-0.5 transition-all"
                                    >
                                        <Search size={18} strokeWidth={2.5} />
                                        장소 검색하기
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 네비 버튼 */}
                    <div className="flex items-center justify-between px-8 pb-6 pt-2">
                        <button
                            onClick={goBack}
                            disabled={step === 0 && !showSummary}
                            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-0 disabled:pointer-events-none"
                        >
                            <ChevronLeft size={16} />이전
                        </button>
                        {!showSummary && (
                            <button
                                onClick={() => advance(step)}
                                className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                건너뛰기<ChevronRight size={16} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ── 검색 조건 요약 바 ── */}
            {searched && (
                <div className="bg-white/80 backdrop-blur-md border border-pink-100 rounded-2xl p-5 mb-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="text-[11px] font-extrabold text-pink-500 uppercase tracking-widest shrink-0 mr-2 bg-pink-50 px-2 py-1 rounded-md">검색 조건</span>
                        <span className="text-sm text-pink-600 font-bold bg-white px-4 py-1.5 rounded-full border border-pink-200 shadow-sm">
                            {sido || '서울'}
                        </span>
                        {Object.entries(selectedFilters).filter(([, v]) => v).map(([k, v]) => (
                            <span key={k} className="text-sm text-gray-700 font-bold bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
                                {v}
                            </span>
                        ))}
                    </div>
                    <button
                        onClick={resetWizard}
                        className="text-xs font-bold text-gray-500 hover:text-pink-600 bg-white border border-gray-200 hover:border-pink-200 px-4 py-2 rounded-full shrink-0 transition-all hover:shadow-sm"
                    >
                        다시 설정
                    </button>
                </div>
            )}

            {/* ── 검색 결과 ── */}
            {searched && (
                <section>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-extrabold text-[#03C75A] leading-none">N</span>
                        <h3 className="text-lg font-extrabold text-gray-800">장소 목록</h3>
                        {naverLoading && <Loader2 size={13} className="animate-spin text-gray-300 ml-1" />}
                    </div>
                    <p className="text-xs text-gray-400 mb-5">
                        {!naverLoading && naverResults.length > 0
                            ? `${naverResults.length}개의 장소가 검색되었습니다`
                            : naverLoading ? '검색 중...' : '네이버 검색 기반 장소 목록'}
                    </p>

                    {naverError && (
                        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-sm text-orange-400">
                            {naverError}
                        </div>
                    )}

                    {!naverLoading && naverResults.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {naverResults.map((place, i) => {
                                const keywords = extractKeywords(place.description)
                                const isAdded = addedPlaces.has(place.title)
                                const isAdding = addingPlace === place.title
                                const detailParams = new URLSearchParams({
                                    name: place.title,
                                    address: place.roadAddress || place.address || '',
                                    phone: place.telephone || '',
                                    link: place.link || '',
                                    mapx: place.mapx || '',
                                    mapy: place.mapy || '',
                                }).toString()

                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="bg-white rounded-[1.5rem] border border-gray-100 p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(244,114,182,0.12)] hover:border-pink-200 transition-all group flex flex-col h-full cursor-pointer"
                                        onClick={() => router.push(`/places/category/${slug}/detail?${detailParams}`)}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient.bg} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                                                <span className="text-2xl drop-shadow-sm">{category.emoji}</span>
                                            </div>
                                            {place.category && (
                                                <span className="text-[10px] font-bold text-gray-400 bg-gray-50/80 px-2.5 py-1 rounded-full border border-gray-100">
                                                    {place.category.split('>').pop()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 text-base leading-snug mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">
                                                {place.title}
                                            </h4>

                                            {(place.roadAddress || place.address) && (
                                                <p className="flex items-start gap-1.5 text-xs text-gray-500 mb-3 font-medium">
                                                    <MapPin size={12} className="shrink-0 mt-0.5 text-gray-300 group-hover:text-pink-300 transition-colors" />
                                                    <span className="line-clamp-2 leading-relaxed">{place.roadAddress || place.address}</span>
                                                </p>
                                            )}

                                            {keywords.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mb-4">
                                                    {keywords.map((kw, ki) => (
                                                        <span key={ki} className="text-[10px] bg-pink-50 border border-pink-100 text-pink-500 px-2.5 py-1 rounded-md font-bold">
                                                            #{kw}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 mt-auto pt-4 border-t border-gray-50/80">
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    router.push(`/places/category/${slug}/detail?${detailParams}`)
                                                }}
                                                className="flex-1 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-gray-500 hover:text-pink-600 font-bold text-xs flex items-center justify-center gap-1 hover:bg-white hover:border-pink-200 hover:shadow-sm transition-all"
                                            >
                                                상세보기
                                            </button>
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    handleAdd(place.title, place.roadAddress || place.address, place.telephone, place.link)
                                                }}
                                                disabled={isAdding || isAdded}
                                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${isAdded
                                                    ? 'bg-emerald-50 text-emerald-500 border border-emerald-100 cursor-default'
                                                    : 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-sm hover:shadow-md hover:shadow-pink-300/40 hover:-translate-y-0.5'
                                                    }`}
                                            >
                                                {isAdding ? <Loader2 size={12} className="animate-spin" />
                                                    : isAdded ? '✓ 추가됨'
                                                        : <><Plus size={12} />내 리스트</>}
                                            </button>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}

                    {!naverLoading && naverResults.length === 0 && !naverError && (
                        <div className="bg-gray-50 rounded-2xl p-12 text-center text-gray-400 text-sm">
                            검색 결과가 없습니다.
                        </div>
                    )}
                </section>
            )}
        </div>
    )
}
