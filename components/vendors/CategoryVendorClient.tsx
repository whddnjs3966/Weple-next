'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, Plus, MapPin, Phone, ExternalLink, Loader2, Search } from 'lucide-react'
import Link from 'next/link'
import { CATEGORIES, CATEGORY_FILTERS } from '@/lib/constants/vendor-categories'

interface NaverVendor {
    title: string
    address: string
    roadAddress: string
    telephone: string
    link: string
}

interface AiRec {
    name: string
    reason: string
    priceRange: string
}

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

        // 네이버 검색
        fetch(`/api/vendors/search?category=${slug}&sido=${sido}`)
            .then(r => r.json())
            .then(data => {
                if (data.error) setNaverError(data.error)
                else setNaverResults(data.vendors || [])
            })
            .catch(() => setNaverError('네이버 검색에 실패했습니다.'))
            .finally(() => setNaverLoading(false))

        // AI 추천
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

    if (!category) {
        return (
            <div className="text-center py-20 text-gray-400">
                <p>카테고리를 찾을 수 없습니다.</p>
                <Link href="/vendors" className="text-pink-400 hover:underline mt-2 block">돌아가기</Link>
            </div>
        )
    }

    const CITIES = ['서울', '경기', '인천', '부산', '대구', '대전', '광주', '제주']

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

            {/* Header — 다른 탭과 동일한 스타일 */}
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

            {/* 필터 패널 */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-5 flex items-center gap-2">
                    <Sparkles size={15} className="text-pink-400" />
                    선호하는 조건을 선택해주세요
                </h3>

                <div className="space-y-5">
                    {/* 지역 */}
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">지역</p>
                        <div className="flex flex-wrap gap-2">
                            {CITIES.map(city => (
                                <button
                                    key={city}
                                    onClick={() => setSido(city)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${sido === city
                                        ? 'bg-pink-400 text-white border-pink-400 shadow-sm'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-pink-300 hover:text-pink-400'
                                        }`}
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 카테고리별 필터 */}
                    {filters.map(filter => (
                        <div key={filter.key}>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">{filter.label}</p>
                            <div className="flex flex-wrap gap-2">
                                {filter.options.map(option => (
                                    <button
                                        key={option}
                                        onClick={() => toggleFilter(filter.key, option)}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${selectedFilters[filter.key] === option
                                            ? 'bg-pink-400 text-white border-pink-400 shadow-sm'
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-pink-300 hover:text-pink-400'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleSearch}
                    disabled={naverLoading || aiLoading}
                    className="mt-6 w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-300 to-pink-400 text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-pink-200/50 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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
                    {/* AI 추천 섹션 */}
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

                    {/* 네이버 검색 결과 섹션 */}
                    <section>
                        <div className="flex items-center gap-2 mb-5">
                            <span className="text-base font-extrabold text-[#03C75A]">N</span>
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
                            <div className="space-y-3">
                                {naverResults.map((vendor, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-4 hover:shadow-md transition-all"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-lg shrink-0 border border-pink-100">
                                            {category.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-bold text-gray-800 text-sm leading-tight">{vendor.title}</h4>
                                                {vendor.link && (
                                                    <a href={vendor.link} target="_blank" rel="noopener noreferrer"
                                                        className="shrink-0 text-[#03C75A] hover:opacity-70 transition-opacity mt-0.5">
                                                        <ExternalLink size={14} />
                                                    </a>
                                                )}
                                            </div>
                                            <div className="mt-1.5 space-y-0.5">
                                                {(vendor.roadAddress || vendor.address) && (
                                                    <p className="flex items-center gap-1.5 text-xs text-gray-400">
                                                        <MapPin size={11} className="shrink-0 text-gray-300" />
                                                        {vendor.roadAddress || vendor.address}
                                                    </p>
                                                )}
                                                {vendor.telephone && (
                                                    <p className="flex items-center gap-1.5 text-xs text-gray-400">
                                                        <Phone size={11} className="shrink-0 text-gray-300" />
                                                        {vendor.telephone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAdd(vendor.title, vendor.roadAddress || vendor.address, vendor.telephone, vendor.link)}
                                            disabled={addingVendor === vendor.title || addedVendors.has(vendor.title)}
                                            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${addedVendors.has(vendor.title)
                                                ? 'bg-green-50 text-green-500 border border-green-100 cursor-default'
                                                : 'bg-pink-50 text-pink-400 border border-pink-100 hover:bg-pink-400 hover:text-white'
                                                }`}
                                        >
                                            {addingVendor === vendor.title ? <Loader2 size={11} className="animate-spin" />
                                                : addedVendors.has(vendor.title) ? '✓'
                                                    : <><Plus size={11} />추가</>}
                                        </button>
                                    </motion.div>
                                ))}
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
