'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Sparkles, Plus, Trash2, CheckCircle2, Circle, ExternalLink, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import dynamic from 'next/dynamic'
import type { UserVendor } from '@/actions/user-vendors'
import type { AiVendorRec } from '@/actions/ai'

const VendorSearchModal = dynamic(() => import('./VendorSearchModal'), { ssr: false })

// ── 카테고리 정의 ──────────────────────────────────────────
const CATEGORIES = [
    { slug: 'wedding-hall', label: '예식장', emoji: '🏛️' },
    { slug: 'studio', label: '스튜디오', emoji: '📸' },
    { slug: 'dress', label: '드레스', emoji: '👗' },
    { slug: 'makeup', label: '메이크업', emoji: '💄' },
    { slug: 'meeting-place', label: '상견례', emoji: '🍽️' },
    { slug: 'hanbok', label: '한복', emoji: '👘' },
    { slug: 'wedding-band', label: '웨딩밴드', emoji: '🎵' },
    { slug: 'honeymoon', label: '신혼여행', emoji: '✈️' },
]

// 가격대 컬러
const PRICE_COLOR: Record<string, string> = {
    '저가': 'text-green-600 bg-green-50 border-green-100',
    '중가': 'text-yellow-600 bg-yellow-50 border-yellow-100',
    '고가': 'text-red-500 bg-red-50 border-red-100',
    '최고가': 'text-purple-600 bg-purple-50 border-purple-100',
}

interface VendorClientProps {
    initialVendors: UserVendor[]
    defaultSido: string
    defaultSigungu: string
    budgetMax: number
    style: string
}

export default function VendorClient({
    initialVendors,
    defaultSido,
    defaultSigungu,
}: VendorClientProps) {
    const router = useRouter()
    const [vendors, setVendors] = useState<UserVendor[]>(initialVendors)
    const [activeSearchCategory, setActiveSearchCategory] = useState<string | null>(null)
    const [aiRecs, setAiRecs] = useState<Record<string, AiVendorRec[]>>({})
    const [aiLoading, setAiLoading] = useState<string | null>(null)
    const [aiError, setAiError] = useState<string | null>(null)
    const [aiOpenCategory, setAiOpenCategory] = useState<string | null>(null)
    const [removingId, setRemovingId] = useState<string | null>(null)
    const [confirmingId, setConfirmingId] = useState<string | null>(null)

    const confirmedCount = vendors.filter(v => v.is_confirmed).length
    const selectedCount = vendors.length

    const getVendorByCategory = (slug: string) =>
        vendors.find(v => v.category === slug)

    const handleVendorAdded = useCallback(() => {
        router.refresh()
        setTimeout(() => setActiveSearchCategory(null), 400)
    }, [router])

    const handleRemove = async (id: string) => {
        setRemovingId(id)
        const { removeUserVendor } = await import('@/actions/user-vendors')
        await removeUserVendor(id)
        setVendors(prev => prev.filter(v => v.id !== id))
        setRemovingId(null)
    }

    const handleToggleConfirm = async (vendor: UserVendor) => {
        setConfirmingId(vendor.id)
        const { updateUserVendorMemo } = await import('@/actions/user-vendors')
        await updateUserVendorMemo(vendor.id, vendor.memo || '', !vendor.is_confirmed)
        setVendors(prev =>
            prev.map(v => v.id === vendor.id ? { ...v, is_confirmed: !v.is_confirmed } : v)
        )
        setConfirmingId(null)
    }

    const handleGetAiRecs = async (slug: string) => {
        if (aiRecs[slug]) {
            setAiOpenCategory(prev => prev === slug ? null : slug)
            return
        }
        setAiLoading(slug)
        setAiError(null)
        setAiOpenCategory(slug)
        try {
            const { recommendVendors } = await import('@/actions/ai')
            const result = await recommendVendors(slug)
            if (result.error) setAiError(result.error)
            else setAiRecs(prev => ({ ...prev, [slug]: result.recommendations }))
        } catch {
            setAiError('AI 추천을 불러오지 못했습니다.')
        } finally {
            setAiLoading(null)
        }
    }

    const handleAddAiRec = async (slug: string, rec: AiVendorRec) => {
        const { addUserVendor } = await import('@/actions/user-vendors')
        const result = await addUserVendor({
            category: slug,
            vendor_name: rec.name,
            price_range: rec.priceRange,
        })
        if (!result.error) {
            router.refresh()
        }
    }

    const handleModalClose = () => {
        setActiveSearchCategory(null)
        router.refresh()
    }

    const activeCategory = CATEGORIES.find(c => c.slug === activeSearchCategory)

    return (
        <div className="min-h-screen bg-gradient-to-br from-blush via-rose-50/60 to-cream">
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

                {/* ── 헤더 ─────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h1 className="text-3xl font-serif font-bold text-rose-900 mb-1">웨딩 업체 관리</h1>
                    <p className="text-rose-400 text-sm">
                        {selectedCount > 0
                            ? `${CATEGORIES.length}개 카테고리 중 ${selectedCount}개 선택 · ${confirmedCount}개 확정`
                            : '카테고리를 클릭해 업체를 탐색하세요'}
                    </p>
                    <div className="mt-3 w-full max-w-xs mx-auto h-1.5 bg-rose-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-rose-300 to-rose-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(confirmedCount / CATEGORIES.length) * 100}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                    </div>
                </motion.div>

                {/* ── SECTION A: 카테고리 탐색 ────────────────── */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/70 backdrop-blur-md rounded-3xl border border-rose-100 p-6 shadow-sm"
                >
                    <h2 className="text-base font-bold text-rose-900 mb-4">카테고리 탐색</h2>
                    <div className="grid grid-cols-4 gap-3">
                        {CATEGORIES.map((cat) => {
                            const selected = getVendorByCategory(cat.slug)
                            return (
                                <button
                                    key={cat.slug}
                                    onClick={() => setActiveSearchCategory(cat.slug)}
                                    className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group ${selected
                                        ? 'bg-rose-50 border-rose-300 shadow-sm'
                                        : 'bg-white border-rose-100 hover:border-rose-300 hover:bg-rose-50/50'
                                        }`}
                                >
                                    <span className="text-2xl">{cat.emoji}</span>
                                    <span className="text-xs font-bold text-rose-800">{cat.label}</span>
                                    {selected && (
                                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-400 rounded-full flex items-center justify-center">
                                            <CheckCircle2 size={12} className="text-white" />
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </motion.section>

                {/* ── SECTION B: 내가 선택한 업체 ─────────────── */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/70 backdrop-blur-md rounded-3xl border border-rose-100 p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-rose-900">💍 내가 선택한 업체</h2>
                        <span className="text-xs text-rose-400 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                            {selectedCount} / {CATEGORIES.length}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {CATEGORIES.map((cat) => {
                            const vendor = getVendorByCategory(cat.slug)
                            if (vendor) {
                                return (
                                    <div
                                        key={cat.slug}
                                        className={`relative rounded-2xl border-2 p-3 transition-all ${vendor.is_confirmed
                                            ? 'bg-rose-50 border-rose-300'
                                            : 'bg-white border-rose-100'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-1 mb-2">
                                            <span className="text-lg">{cat.emoji}</span>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleToggleConfirm(vendor)}
                                                    disabled={confirmingId === vendor.id}
                                                    className="p-1 rounded-lg hover:bg-rose-100 transition-colors text-rose-300 hover:text-rose-500"
                                                    title={vendor.is_confirmed ? '확정 취소' : '확정'}
                                                >
                                                    {confirmingId === vendor.id
                                                        ? <Loader2 size={13} className="animate-spin" />
                                                        : vendor.is_confirmed
                                                            ? <CheckCircle2 size={13} className="text-rose-400" />
                                                            : <Circle size={13} />
                                                    }
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(vendor.id)}
                                                    disabled={removingId === vendor.id}
                                                    className="p-1 rounded-lg hover:bg-red-50 transition-colors text-gray-300 hover:text-red-400"
                                                    title="삭제"
                                                >
                                                    {removingId === vendor.id
                                                        ? <Loader2 size={13} className="animate-spin" />
                                                        : <Trash2 size={13} />
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight">{vendor.vendor_name}</p>
                                        <p className="text-[10px] text-rose-400 mt-1">{cat.label}</p>
                                        {vendor.price_range && PRICE_COLOR[vendor.price_range] && (
                                            <span className={`inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${PRICE_COLOR[vendor.price_range]}`}>
                                                {vendor.price_range}
                                            </span>
                                        )}
                                        {vendor.vendor_link && (
                                            <a href={vendor.vendor_link} target="_blank" rel="noopener noreferrer"
                                                className="mt-2 flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-500 transition-colors">
                                                <ExternalLink size={10} />네이버
                                            </a>
                                        )}
                                    </div>
                                )
                            }
                            return (
                                <button
                                    key={cat.slug}
                                    onClick={() => setActiveSearchCategory(cat.slug)}
                                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rose-100 p-3 min-h-[88px] hover:border-rose-300 hover:bg-rose-50/30 transition-all text-rose-300 hover:text-rose-400 group"
                                >
                                    <span className="text-xl opacity-40 group-hover:opacity-70 transition-opacity">{cat.emoji}</span>
                                    <Plus size={14} />
                                    <span className="text-[10px] font-medium">{cat.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </motion.section>

                {/* ── SECTION C: AI 추천 업체 ──────────────────── */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/70 backdrop-blur-md rounded-3xl border border-rose-100 p-6 shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={18} className="text-rose-400" />
                        <h2 className="text-base font-bold text-rose-900">AI 추천 업체</h2>
                    </div>
                    <p className="text-xs text-rose-400 mb-5">내 예산·스타일·위치 기반으로 업체를 추천해드려요</p>

                    <div className="space-y-2">
                        {CATEGORIES.map((cat) => {
                            const isOpen = aiOpenCategory === cat.slug
                            const isLoading = aiLoading === cat.slug
                            const recs = aiRecs[cat.slug]

                            return (
                                <div key={cat.slug} className="border border-rose-100 rounded-2xl overflow-hidden">
                                    <button
                                        onClick={() => handleGetAiRecs(cat.slug)}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-rose-50/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{cat.emoji}</span>
                                            <span className="text-sm font-bold text-rose-900">{cat.label} 추천</span>
                                            {recs && (
                                                <span className="text-[10px] bg-rose-100 text-rose-500 px-2 py-0.5 rounded-full">
                                                    {recs.length}개
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isLoading && <Loader2 size={15} className="animate-spin text-rose-400" />}
                                            {!isLoading && (
                                                <span className="text-[11px] text-rose-400 font-medium">
                                                    {recs ? (isOpen ? '접기' : '펼치기') : 'AI 추천 받기'}
                                                </span>
                                            )}
                                            {recs && (isOpen ? <ChevronUp size={15} className="text-rose-300" /> : <ChevronDown size={15} className="text-rose-300" />)}
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="border-t border-rose-50 bg-rose-50/30"
                                        >
                                            {aiError && aiOpenCategory === cat.slug && (
                                                <p className="text-xs text-red-400 p-4">{aiError}</p>
                                            )}
                                            {recs && recs.length > 0 && (
                                                <div className="p-3 space-y-2">
                                                    {recs.map((rec, i) => (
                                                        <div key={i} className="bg-white rounded-xl border border-rose-100 p-3.5">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs font-bold text-rose-400">#{i + 1}</span>
                                                                        <p className="text-sm font-bold text-gray-800">{rec.name}</p>
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{rec.reason}</p>
                                                                    {rec.priceRange && (
                                                                        <span className="inline-block mt-2 text-[10px] text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                                                                            💰 {rec.priceRange}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    onClick={() => handleAddAiRec(cat.slug, rec)}
                                                                    className="shrink-0 px-3 py-1.5 bg-rose-400 hover:bg-rose-500 text-white text-[11px] font-bold rounded-xl transition-colors flex items-center gap-1"
                                                                >
                                                                    <Plus size={11} />
                                                                    선정
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </motion.section>
            </div>

            {/* ── 업체 검색 모달 ───────────────────────────── */}
            {activeSearchCategory && activeCategory && (
                <VendorSearchModal
                    category={activeSearchCategory}
                    categoryLabel={activeCategory.label}
                    categoryEmoji={activeCategory.emoji}
                    defaultSido={defaultSido}
                    defaultSigungu={defaultSigungu}
                    onClose={handleModalClose}
                    onVendorAdded={handleVendorAdded}
                />
            )}
        </div>
    )
}
