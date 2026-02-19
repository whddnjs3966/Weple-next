'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft, Plus, MapPin, Loader2,
    Search, Check, ChevronRight, ChevronLeft, Star,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { addUserVendor } from '@/actions/user-vendors'
import { CATEGORIES, CATEGORY_FILTERS } from '@/lib/constants/vendor-categories'

interface NaverVendor {
    title: string
    address: string
    roadAddress: string
    telephone: string
    link: string
    category: string
    description: string
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

export default function CategoryVendorClient({ slug }: { slug: string }) {
    const router = useRouter()
    const category = CATEGORIES.find(c => c.slug === slug)
    const filters = CATEGORY_FILTERS[slug] || []
    const totalSteps = 1 + filters.length

    const [step, setStep] = useState(0)
    const [dir, setDir] = useState(1)
    const [showSummary, setShowSummary] = useState(false)

    const [sido, setSido] = useState('')
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({})

    const [naverResults, setNaverResults] = useState<NaverVendor[]>([])
    const [naverLoading, setNaverLoading] = useState(false)
    const [naverError, setNaverError] = useState<string | null>(null)
    const [addingVendor, setAddingVendor] = useState<string | null>(null)
    const [addedVendors, setAddedVendors] = useState<Set<string>>(new Set())
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
        fetch(`/api/vendors/search?category=${slug}&sido=${encodeURIComponent(searchSido)}`)
            .then(r => r.json())
            .then(data => {
                if (data.error) setNaverError(data.error)
                else setNaverResults(data.vendors || [])
            })
            .catch(() => setNaverError('네이버 검색에 실패했습니다.'))
            .finally(() => setNaverLoading(false))
    }

    const handleAdd = async (
        vendorName: string,
        vendorAddress?: string,
        vendorPhone?: string,
        vendorLink?: string,
    ) => {
        setAddingVendor(vendorName)
        await addUserVendor({
            category: slug,
            vendor_name: vendorName,
            vendor_address: vendorAddress,
            vendor_phone: vendorPhone,
            vendor_link: vendorLink,
        })
        setAddedVendors(prev => new Set([...prev, vendorName]))
        setAddingVendor(null)
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
                <Link href="/vendors" className="text-pink-400 hover:underline mt-2 block">돌아가기</Link>
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
                    href="/vendors"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={15} />
                    업체 관리
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
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                    {/* 진행 표시 */}
                    <div className="flex items-center justify-center gap-1.5 pt-6 pb-1 px-8">
                        {Array.from({ length: totalSteps + 1 }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 rounded-full transition-all duration-300 ${
                                    i === progressStep ? 'w-8 bg-pink-400'
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
                                            <h3 className="text-xl font-bold text-gray-800 mb-1">어느 지역에서 찾으시나요?</h3>
                                            <p className="text-sm text-gray-400 mb-6">원하는 지역을 선택해주세요</p>
                                            <div className="grid grid-cols-4 gap-2.5">
                                                {CITIES.map(city => (
                                                    <button
                                                        key={city}
                                                        onClick={() => handleCitySelect(city)}
                                                        className={`relative py-4 rounded-2xl border-2 text-sm font-bold text-center transition-all duration-200 ${
                                                            sido === city
                                                                ? 'border-pink-400 text-pink-500 bg-pink-50 shadow-[0_0_18px_rgba(244,114,182,0.22)]'
                                                                : 'border-gray-100 text-gray-500 bg-white hover:border-pink-200 hover:bg-pink-50/30'
                                                        }`}
                                                    >
                                                        {sido === city && (
                                                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-pink-400 rounded-full flex items-center justify-center">
                                                                <Check size={9} className="text-white" strokeWidth={3} />
                                                            </span>
                                                        )}
                                                        {city}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-xl font-bold text-gray-800 mb-1">
                                                {filters[step - 1].label}을(를) 선택해주세요
                                            </h3>
                                            <p className="text-sm text-gray-400 mb-6">가장 잘 맞는 옵션을 선택해주세요</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {filters[step - 1].options.map(option => {
                                                    const key = filters[step - 1].key
                                                    const isSelected = selectedFilters[key] === option
                                                    return (
                                                        <button
                                                            key={option}
                                                            onClick={() => handleFilterSelect(key, option, step)}
                                                            className={`relative py-5 px-5 rounded-2xl border-2 text-sm font-semibold text-left transition-all duration-200 ${
                                                                isSelected
                                                                    ? 'border-pink-400 text-pink-600 bg-pink-50 shadow-[0_0_20px_rgba(244,114,182,0.18)]'
                                                                    : 'border-gray-100 text-gray-600 bg-white hover:border-pink-200 hover:bg-pink-50/20 hover:text-pink-500'
                                                            }`}
                                                        >
                                                            {isSelected && (
                                                                <span className="absolute top-3 right-3 w-5 h-5 bg-pink-400 rounded-full flex items-center justify-center">
                                                                    <Check size={11} className="text-white" strokeWidth={3} />
                                                                </span>
                                                            )}
                                                            {option}
                                                        </button>
                                                    )
                                                })}
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
                                    <p className="text-[11px] font-extrabold text-pink-400 uppercase tracking-widest mb-1">확인</p>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">선택한 조건을 확인해주세요</h3>
                                    <p className="text-sm text-gray-400 mb-6">맞으면 아래 버튼을 눌러 검색을 시작합니다</p>

                                    <div className="space-y-2 mb-7">
                                        <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-2xl">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">지역</span>
                                            <span className="text-sm font-semibold text-gray-700">{sido || '서울 (기본)'}</span>
                                        </div>
                                        {filters.map(f => selectedFilters[f.key] ? (
                                            <div key={f.key} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-2xl">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{f.label}</span>
                                                <span className="text-sm font-semibold text-gray-700">{selectedFilters[f.key]}</span>
                                            </div>
                                        ) : null)}
                                    </div>

                                    <button
                                        onClick={handleSearch}
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-300 to-pink-400 text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-pink-200/40 hover:-translate-y-0.5 transition-all"
                                    >
                                        <Search size={16} />
                                        업체 검색하기
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
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-2xl px-5 py-4 mb-8">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <span className="text-xs font-extrabold text-pink-500 uppercase tracking-wider shrink-0">검색 조건</span>
                            <span className="text-sm text-pink-600 font-bold bg-white px-3 py-1 rounded-full border border-pink-200 shadow-sm">
                                {sido || '서울'}
                            </span>
                            {Object.entries(selectedFilters).filter(([, v]) => v).map(([k, v]) => (
                                <span key={k} className="text-sm text-gray-700 font-semibold bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                                    {v}
                                </span>
                            ))}
                        </div>
                        <button
                            onClick={resetWizard}
                            className="text-xs font-bold text-pink-500 hover:text-pink-700 bg-white border border-pink-200 px-3 py-1.5 rounded-full shrink-0 transition-all hover:shadow-sm"
                        >
                            다시 설정
                        </button>
                    </div>
                </div>
            )}

            {/* ── 검색 결과 ── */}
            {searched && (
                <section>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-extrabold text-[#03C75A] leading-none">N</span>
                        <h3 className="text-lg font-extrabold text-gray-800">업체 목록</h3>
                        {naverLoading && <Loader2 size={13} className="animate-spin text-gray-300 ml-1" />}
                    </div>
                    <p className="text-xs text-gray-400 mb-5">
                        {!naverLoading && naverResults.length > 0
                            ? `${naverResults.length}개의 업체가 검색되었습니다`
                            : naverLoading ? '검색 중...' : '네이버 검색 기반 업체 목록'}
                    </p>

                    {naverError && (
                        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-sm text-orange-400">
                            {naverError}
                        </div>
                    )}

                    {!naverLoading && naverResults.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {naverResults.map((vendor, i) => {
                                const keywords = extractKeywords(vendor.description)
                                const isAdded = addedVendors.has(vendor.title)
                                const isAdding = addingVendor === vendor.title
                                const detailParams = new URLSearchParams({
                                    name: vendor.title,
                                    address: vendor.roadAddress || vendor.address || '',
                                    phone: vendor.telephone || '',
                                    link: vendor.link || '',
                                }).toString()

                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer"
                                        onClick={() => router.push(`/vendors/category/${slug}/detail?${detailParams}`)}
                                    >
                                        {/* 헤더 이미지 영역 */}
                                        <div className={`relative h-40 bg-gradient-to-br ${gradient.bg} flex items-end overflow-hidden`}>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className={`text-6xl opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all select-none`}>
                                                    {category.emoji}
                                                </span>
                                            </div>
                                            {vendor.category && (
                                                <span className="absolute top-3 left-3 text-[10px] font-semibold text-white bg-black/25 backdrop-blur-sm px-2.5 py-1 rounded-full">
                                                    {vendor.category}
                                                </span>
                                            )}
                                            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
                                        </div>

                                        {/* 콘텐츠 */}
                                        <div className="px-5 pb-5 -mt-2 relative">
                                            <h4 className="font-bold text-gray-800 text-[15px] leading-tight mb-1.5 line-clamp-1 group-hover:text-pink-600 transition-colors">
                                                {vendor.title}
                                            </h4>

                                            {(vendor.roadAddress || vendor.address) && (
                                                <p className="flex items-start gap-1.5 text-xs text-gray-400 mb-3">
                                                    <MapPin size={11} className="shrink-0 mt-0.5 text-gray-300" />
                                                    <span className="line-clamp-1">{vendor.roadAddress || vendor.address}</span>
                                                </p>
                                            )}

                                            {keywords.length > 0 && (
                                                <div className="flex items-center gap-1.5 mb-4">
                                                    <Star size={11} className="text-yellow-400 fill-yellow-400 shrink-0" />
                                                    <div className="flex flex-wrap gap-1">
                                                        {keywords.map((kw, ki) => (
                                                            <span key={ki} className="text-[10px] bg-pink-50 border border-pink-100 text-pink-500 px-2 py-0.5 rounded-full font-medium">
                                                                {kw}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex gap-2 border-t border-gray-50 pt-3">
                                                <button
                                                    onClick={e => {
                                                        e.stopPropagation()
                                                        router.push(`/vendors/category/${slug}/detail?${detailParams}`)
                                                    }}
                                                    className="flex-1 py-2.5 rounded-xl border border-gray-100 bg-white text-gray-600 text-xs font-bold flex items-center justify-center gap-1 hover:border-pink-200 hover:text-pink-500 hover:bg-pink-50/30 transition-all"
                                                >
                                                    상세보기
                                                </button>
                                                <button
                                                    onClick={e => {
                                                        e.stopPropagation()
                                                        handleAdd(vendor.title, vendor.roadAddress || vendor.address, vendor.telephone, vendor.link)
                                                    }}
                                                    disabled={isAdding || isAdded}
                                                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                                                        isAdded
                                                            ? 'bg-green-50 text-green-500 border border-green-100 cursor-default'
                                                            : 'bg-gradient-to-r from-pink-300 to-pink-400 text-white hover:shadow-md hover:shadow-pink-200/50'
                                                    }`}
                                                >
                                                    {isAdding ? <Loader2 size={12} className="animate-spin" />
                                                        : isAdded ? '✓ 추가됨'
                                                        : <><Plus size={12} />내 리스트</>}
                                                </button>
                                            </div>
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
