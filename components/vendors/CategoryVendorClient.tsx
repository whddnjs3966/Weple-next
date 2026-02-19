'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, Plus, MapPin, Phone, ExternalLink, Loader2, Search, Check } from 'lucide-react'
import Link from 'next/link'
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

interface AiRec {
    name: string
    reason: string
    priceRange: string
}

// 카드 헤더 그라디언트 (인덱스 순환)
const CARD_GRADIENTS = [
    'from-rose-400 to-pink-300',
    'from-violet-400 to-purple-300',
    'from-amber-400 to-yellow-300',
    'from-blue-400 to-cyan-300',
    'from-emerald-400 to-green-300',
    'from-fuchsia-400 to-pink-300',
    'from-orange-400 to-amber-300',
    'from-sky-400 to-blue-300',
    'from-teal-400 to-emerald-300',
    'from-indigo-400 to-violet-300',
]

const CITIES = ['서울', '경기', '인천', '부산', '대구', '대전', '광주', '제주']

export default function CategoryVendorClient({ slug }: { slug: string }) {
    const category = CATEGORIES.find(c => c.slug === slug)
    const filters = CATEGORY_FILTERS[slug] || []

    const [sido, setSido] = useState('서울')
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({})
    const [naverResults, setNaverResults] = useState<NaverVendor[]>([])
    const [aiRecs, setAiRecs] = useState<AiRec[]>([])
    const [naverLoading, setNaverLoading] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const [naverError, setNaverError] = useState<string | null>(null)
    const [aiError, setAiError] = useState<string | null>(null)
    const [addingVendor, setAddingVendor] = useState<string | null>(null)
    const [addedVendors, setAddedVendors] = useState<Set<string>>(new Set())
    const [searched, setSearched] = useState(false)

    const toggleFilter = (key: string, value: string) => {
        setSelectedFilters(prev => ({ ...prev, [key]: prev[key] === value ? '' : value }))
    }

    const handleSearch = async () => {
        setSearched(true)
        setNaverLoading(true)
        setAiLoading(true)
        setNaverError(null)
        setAiError(null)
        setNaverResults([])
        setAiRecs([])

        fetch(`/api/vendors/search?category=${slug}&sido=${encodeURIComponent(sido)}`)
            .then(r => r.json())
            .then(data => {
                if (data.error) setNaverError(data.error)
                else setNaverResults(data.vendors || [])
            })
            .catch(() => setNaverError('네이버 검색에 실패했습니다.'))
            .finally(() => setNaverLoading(false))

        import('@/actions/ai')
            .then(({ recommendVendorsWithFilters }) => recommendVendorsWithFilters(slug, selectedFilters, sido))
            .then(result => {
                if (result.error) setAiError(result.error)
                else setAiRecs(result.recommendations)
            })
            .catch(() => setAiError('AI 추천을 불러오지 못했습니다.'))
            .finally(() => setAiLoading(false))
    }

    const handleAdd = async (
        vendorName: string,
        vendorAddress?: string,
        vendorPhone?: string,
        vendorLink?: string,
        priceRange?: string,
    ) => {
        setAddingVendor(vendorName)
        const { addUserVendor } = await import('@/actions/user-vendors')
        await addUserVendor({ category: slug, vendor_name: vendorName, vendor_address: vendorAddress, vendor_phone: vendorPhone, vendor_link: vendorLink, price_range: priceRange })
        setAddedVendors(prev => new Set([...prev, vendorName]))
        setAddingVendor(null)
    }

    // 설명에서 키워드 추출
    const extractKeywords = (desc: string): string[] => {
        if (!desc) return []
        return desc
            .replace(/<[^>]+>/g, '')
            .split(/[,·\s·]+/)
            .map(k => k.trim())
            .filter(k => k.length >= 2 && k.length <= 8)
            .slice(0, 4)
    }

    if (!category) {
        return (
            <div className="text-center py-20 text-gray-400">
                <p>카테고리를 찾을 수 없습니다.</p>
                <Link href="/vendors" className="text-pink-400 hover:underline mt-2 block">돌아가기</Link>
            </div>
        )
    }

    const selectedFilterCount = Object.values(selectedFilters).filter(Boolean).length

    return (
        <div className="max-w-4xl mx-auto px-4 pb-24">
            {/* Back */}
            <Link
                href="/vendors"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium mt-8 mb-8"
            >
                <ArrowLeft size={15} />
                업체 관리로 돌아가기
            </Link>

            {/* Header */}
            <div className="text-center mb-10">
                <div className="text-5xl mb-4">{category.emoji}</div>
                <h2 className="font-serif italic text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-2">
                    {category.label}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-pink-400" />
                    <div className="w-2 h-2 rounded-full bg-pink-400" />
                    <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-pink-400" />
                </div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-4">AI-powered vendor recommendations</p>
            </div>

            {/* ── 필터 패널 (온보딩 스타일) ─────────────── */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Sparkles size={15} className="text-pink-400" />
                        <h3 className="text-sm font-bold text-gray-700">선호하는 조건을 선택해주세요</h3>
                    </div>
                    {selectedFilterCount > 0 && (
                        <span className="text-[11px] font-bold text-pink-400 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-100">
                            {selectedFilterCount}개 선택됨
                        </span>
                    )}
                </div>

                <div className="space-y-7">
                    {/* 지역 선택 */}
                    <div>
                        <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                            <span className="w-4 h-px bg-gray-200" />
                            지역
                            <span className="flex-1 h-px bg-gray-100" />
                        </p>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                            {CITIES.map(city => (
                                <button
                                    key={city}
                                    onClick={() => setSido(city)}
                                    className={`relative py-3 rounded-2xl border-2 text-xs font-bold text-center transition-all ${sido === city
                                        ? 'border-pink-400 text-pink-500 bg-pink-50 shadow-[0_0_16px_rgba(244,114,182,0.2)]'
                                        : 'border-gray-100 text-gray-500 bg-white hover:border-pink-200 hover:bg-pink-50/30'
                                        }`}
                                >
                                    {sido === city && (
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-pink-400 rounded-full flex items-center justify-center shadow-sm">
                                            <Check size={9} className="text-white" strokeWidth={3} />
                                        </span>
                                    )}
                                    {city}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 카테고리별 필터 */}
                    {filters.map(filter => (
                        <div key={filter.key}>
                            <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                                <span className="w-4 h-px bg-gray-200" />
                                {filter.label}
                                <span className="flex-1 h-px bg-gray-100" />
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {filter.options.map(option => {
                                    const isSelected = selectedFilters[filter.key] === option
                                    return (
                                        <button
                                            key={option}
                                            onClick={() => toggleFilter(filter.key, option)}
                                            className={`relative py-4 px-4 rounded-2xl border-2 text-sm font-semibold text-center transition-all ${isSelected
                                                ? 'border-pink-400 text-pink-600 bg-pink-50 shadow-[0_0_20px_rgba(244,114,182,0.18)]'
                                                : 'border-gray-100 text-gray-600 bg-white hover:border-pink-200 hover:bg-pink-50/20 hover:text-pink-500'
                                                }`}
                                        >
                                            {isSelected && (
                                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-pink-400 rounded-full flex items-center justify-center shadow-sm">
                                                    <Check size={11} className="text-white" strokeWidth={3} />
                                                </span>
                                            )}
                                            {option}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleSearch}
                    disabled={naverLoading || aiLoading}
                    className="mt-8 w-full py-4 rounded-2xl bg-gradient-to-r from-pink-300 to-pink-400 text-white font-bold text-sm flex items-center justify-center gap-2.5 hover:shadow-xl hover:shadow-pink-200/40 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                    {naverLoading || aiLoading ? (
                        <><Loader2 size={16} className="animate-spin" />검색 중...</>
                    ) : (
                        <><Search size={16} />업체 검색 + AI 추천 받기</>
                    )}
                </button>
            </div>

            {searched && (
                <>
                    {/* ── AI 맞춤 추천 ─────────────── */}
                    <section className="mb-10">
                        <div className="flex items-center gap-2 mb-5">
                            <Sparkles size={18} className="text-pink-400" />
                            <h3 className="text-xl font-extrabold text-gray-800">AI 맞춤 추천</h3>
                            {aiLoading && <Loader2 size={14} className="animate-spin text-gray-400 ml-1" />}
                        </div>

                        {aiError && (
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-400 mb-4">{aiError}</div>
                        )}

                        {!aiLoading && aiRecs.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {aiRecs.map((rec, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
                                    >
                                        <div className="h-0.5 bg-gradient-to-r from-pink-300 to-pink-400" />
                                        <div className="p-5">
                                            <div className="flex items-start justify-between mb-3">
                                                <span className="text-[11px] font-extrabold text-pink-400 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-100">
                                                    AI 추천 #{i + 1}
                                                </span>
                                                {rec.priceRange && (
                                                    <span className="text-[10px] text-gray-400 shrink-0 ml-2">{rec.priceRange}</span>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-gray-800 text-[15px] mb-2 leading-tight">{rec.name}</h4>
                                            <p className="text-xs text-gray-400 leading-relaxed mb-4">{rec.reason}</p>
                                            <button
                                                onClick={() => handleAdd(rec.name, undefined, undefined, undefined, rec.priceRange)}
                                                disabled={addingVendor === rec.name || addedVendors.has(rec.name)}
                                                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${addedVendors.has(rec.name)
                                                    ? 'bg-green-50 text-green-500 border border-green-100 cursor-default'
                                                    : 'bg-gradient-to-r from-pink-300 to-pink-400 text-white hover:shadow-md hover:shadow-pink-200/50'
                                                    }`}
                                            >
                                                {addingVendor === rec.name ? <Loader2 size={12} className="animate-spin" />
                                                    : addedVendors.has(rec.name) ? '✓ 추가됨'
                                                        : <><Plus size={12} />내 리스트에 추가</>}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {!aiLoading && aiRecs.length === 0 && !aiError && (
                            <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400 text-sm">
                                AI 추천 결과가 없습니다. 조건을 변경해보세요.
                            </div>
                        )}
                    </section>

                    {/* ── 네이버 검색 결과 (카드형) ─────────────── */}
                    <section>
                        <div className="flex items-center gap-2.5 mb-5">
                            <span className="text-base font-extrabold text-[#03C75A] leading-none">N</span>
                            <h3 className="text-xl font-extrabold text-gray-800">네이버 검색 결과</h3>
                            {naverLoading && <Loader2 size={14} className="animate-spin text-gray-400 ml-1" />}
                            {!naverLoading && naverResults.length > 0 && (
                                <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">{naverResults.length}개</span>
                            )}
                        </div>

                        {naverError && (
                            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-sm text-orange-400">{naverError}</div>
                        )}

                        {!naverLoading && naverResults.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {naverResults.map((vendor, i) => {
                                    const keywords = extractKeywords(vendor.description)
                                    const gradient = CARD_GRADIENTS[i % CARD_GRADIENTS.length]
                                    const isAdded = addedVendors.has(vendor.title)
                                    const isAdding = addingVendor === vendor.title

                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                        >
                                            {/* 컬러 헤더 */}
                                            <div className={`h-24 bg-gradient-to-br ${gradient} relative flex items-center justify-center`}>
                                                <span className="text-5xl opacity-70 drop-shadow-sm">{category.emoji}</span>
                                                {/* 카테고리 뱃지 */}
                                                {vendor.category && (
                                                    <span className="absolute bottom-2.5 left-3 text-[10px] font-bold bg-black/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
                                                        {vendor.category}
                                                    </span>
                                                )}
                                                {/* 네이버 링크 */}
                                                {vendor.link && (
                                                    <a
                                                        href={vendor.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="absolute top-2.5 right-2.5 w-7 h-7 bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-black/30 transition-colors"
                                                    >
                                                        <ExternalLink size={12} className="text-white" />
                                                    </a>
                                                )}
                                            </div>

                                            <div className="p-4">
                                                {/* 업체명 */}
                                                <h4 className="font-bold text-gray-800 text-[15px] mb-1.5 leading-tight">{vendor.title}</h4>

                                                {/* 주소 */}
                                                {(vendor.roadAddress || vendor.address) && (
                                                    <p className="flex items-start gap-1.5 text-xs text-gray-400 mb-3">
                                                        <MapPin size={11} className="shrink-0 mt-0.5 text-gray-300" />
                                                        <span className="line-clamp-1">{vendor.roadAddress || vendor.address}</span>
                                                    </p>
                                                )}

                                                {/* 키워드 */}
                                                {keywords.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                                        {keywords.map((kw, ki) => (
                                                            <span
                                                                key={ki}
                                                                className="text-[10px] bg-gray-50 border border-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
                                                            >
                                                                {kw}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* CTA 버튼 */}
                                                <div className="flex gap-2">
                                                    {vendor.telephone && (
                                                        <a
                                                            href={`tel:${vendor.telephone}`}
                                                            className="flex-1 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-gray-100 transition-colors"
                                                        >
                                                            <Phone size={11} />
                                                            {vendor.telephone}
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => handleAdd(vendor.title, vendor.roadAddress || vendor.address, vendor.telephone, vendor.link)}
                                                        disabled={isAdding || isAdded}
                                                        className={`${vendor.telephone ? 'flex-1' : 'w-full'} py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${isAdded
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
                            <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400 text-sm">
                                검색 결과가 없습니다.
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    )
}
