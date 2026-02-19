'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Sparkles, Plus, Trash2, CheckCircle2, Circle, ExternalLink, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import type { UserVendor } from '@/actions/user-vendors'
import type { AiVendorRec } from '@/actions/ai'
import { CATEGORIES } from '@/lib/constants/vendor-categories'

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
}: VendorClientProps) {
    const router = useRouter()
    const [vendors, setVendors] = useState<UserVendor[]>(initialVendors)
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

    return (
        <div className="max-w-4xl mx-auto px-4 pb-20 space-y-6">

                {/* ── 헤더 — 다른 탭과 동일한 스타일 ────────── */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h2 className="font-serif italic text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-2">
                        Vendors
                    </h2>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-pink-400" />
                        <div className="w-2 h-2 rounded-full bg-pink-400" />
                        <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-pink-400" />
                    </div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mt-4">Manage your wedding vendors</p>
                    <div className="mt-5 w-full max-w-xs mx-auto h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-pink-300 to-pink-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(confirmedCount / CATEGORIES.length) * 100}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        {selectedCount > 0
                            ? `${CATEGORIES.length}개 카테고리 중 ${selectedCount}개 선택 · ${confirmedCount}개 확정`
                            : '카테고리를 클릭해 업체를 탐색하세요'}
                    </p>
                </motion.div>

                {/* ── SECTION A: 카테고리 탐색 ────────────────── */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-5">
                        <Sparkles size={15} className="text-pink-400" />
                        <h2 className="text-sm font-bold text-gray-700">카테고리 탐색</h2>
                        <span className="text-xs text-gray-400 ml-auto">클릭하면 AI 추천으로 이동</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        {CATEGORIES.map((cat) => {
                            const selected = getVendorByCategory(cat.slug)
                            return (
                                <button
                                    key={cat.slug}
                                    onClick={() => router.push(`/vendors/category/${cat.slug}`)}
                                    className={`relative flex flex-col items-center gap-2 py-5 px-3 rounded-2xl border-2 transition-all group ${selected
                                        ? 'bg-pink-50 border-pink-300 shadow-sm'
                                        : 'bg-white border-gray-100 hover:border-pink-300 hover:bg-pink-50/40'
                                        }`}
                                >
                                    <span className="text-2xl group-hover:scale-110 transition-transform">{cat.emoji}</span>
                                    <span className="text-xs font-bold text-gray-700">{cat.label}</span>
                                    {selected && (
                                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-pink-400 rounded-full flex items-center justify-center shadow-sm">
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
                    className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-bold text-gray-700">💍 내가 선택한 업체</h2>
                        <span className="text-xs text-pink-400 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
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
                                        className={`relative rounded-2xl border p-3.5 transition-all overflow-hidden ${vendor.is_confirmed
                                            ? 'bg-pink-50 border-pink-200'
                                            : 'bg-white border-gray-100 shadow-sm'
                                            }`}
                                    >
                                        {vendor.is_confirmed && (
                                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-300 to-pink-400" />
                                        )}
                                        <div className="flex items-start justify-between gap-1 mb-2">
                                            <span className="text-lg">{cat.emoji}</span>
                                            <div className="flex gap-0.5">
                                                <button
                                                    onClick={() => handleToggleConfirm(vendor)}
                                                    disabled={confirmingId === vendor.id}
                                                    className="p-1 rounded-lg hover:bg-pink-100 transition-colors text-gray-300 hover:text-pink-400"
                                                    title={vendor.is_confirmed ? '확정 취소' : '확정'}
                                                >
                                                    {confirmingId === vendor.id
                                                        ? <Loader2 size={13} className="animate-spin" />
                                                        : vendor.is_confirmed
                                                            ? <CheckCircle2 size={13} className="text-pink-400" />
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
                                        <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight mb-1">{vendor.vendor_name}</p>
                                        <p className="text-[10px] text-pink-400 font-medium">{cat.label}</p>
                                        {vendor.price_range && PRICE_COLOR[vendor.price_range] && (
                                            <span className={`inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${PRICE_COLOR[vendor.price_range]}`}>
                                                {vendor.price_range}
                                            </span>
                                        )}
                                        {vendor.vendor_link && (
                                            <a href={vendor.vendor_link} target="_blank" rel="noopener noreferrer"
                                                className="mt-2 flex items-center gap-1 text-[10px] text-[#03C75A] hover:opacity-70 transition-opacity">
                                                <ExternalLink size={10} />네이버
                                            </a>
                                        )}
                                    </div>
                                )
                            }
                            return (
                                <button
                                    key={cat.slug}
                                    onClick={() => router.push(`/vendors/category/${cat.slug}`)}
                                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 p-3 min-h-[100px] hover:border-pink-300 hover:bg-pink-50/30 transition-all text-gray-300 hover:text-pink-400 group"
                                >
                                    <span className="text-xl opacity-40 group-hover:opacity-70 transition-all group-hover:scale-110">{cat.emoji}</span>
                                    <Plus size={13} />
                                    <span className="text-[10px] font-semibold">{cat.label}</span>
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
                    className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={16} className="text-pink-400" />
                        <h2 className="text-sm font-bold text-gray-700">AI 추천 업체</h2>
                    </div>
                    <p className="text-xs text-gray-400 mb-5">카테고리별로 펼쳐 AI 추천을 받아보세요</p>

                    <div className="space-y-2">
                        {CATEGORIES.map((cat) => {
                            const isOpen = aiOpenCategory === cat.slug
                            const isLoading = aiLoading === cat.slug
                            const recs = aiRecs[cat.slug]

                            return (
                                <div key={cat.slug} className="border border-gray-100 rounded-2xl overflow-hidden">
                                    <button
                                        onClick={() => handleGetAiRecs(cat.slug)}
                                        className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-pink-50/40 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{cat.emoji}</span>
                                            <span className="text-sm font-bold text-gray-800">{cat.label} 추천</span>
                                            {recs && (
                                                <span className="text-[10px] bg-pink-50 text-pink-400 px-2 py-0.5 rounded-full border border-pink-100">
                                                    {recs.length}개
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isLoading && <Loader2 size={14} className="animate-spin text-gray-400" />}
                                            {!isLoading && (
                                                <span className="text-[11px] text-pink-400 font-semibold">
                                                    {recs ? (isOpen ? '접기' : '펼치기') : 'AI 추천 받기'}
                                                </span>
                                            )}
                                            {recs && (isOpen ? <ChevronUp size={14} className="text-gray-300" /> : <ChevronDown size={14} className="text-gray-300" />)}
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="border-t border-gray-50 bg-gray-50/40"
                                        >
                                            {aiError && aiOpenCategory === cat.slug && (
                                                <p className="text-xs text-red-400 p-4">{aiError}</p>
                                            )}
                                            {recs && recs.length > 0 && (
                                                <div className="p-3 space-y-2">
                                                    {recs.map((rec, i) => (
                                                        <div key={i} className="bg-white rounded-xl border border-gray-100 p-3.5 shadow-sm">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-[10px] font-extrabold text-pink-400 bg-pink-50 px-1.5 py-0.5 rounded-full border border-pink-100">#{i + 1}</span>
                                                                        <p className="text-sm font-bold text-gray-800">{rec.name}</p>
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 leading-relaxed">{rec.reason}</p>
                                                                    {rec.priceRange && (
                                                                        <span className="inline-block mt-2 text-[10px] text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                                                                            💰 {rec.priceRange}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    onClick={() => handleAddAiRec(cat.slug, rec)}
                                                                    className="shrink-0 px-3 py-1.5 bg-gradient-to-r from-pink-300 to-pink-400 hover:shadow-md text-white text-[11px] font-bold rounded-xl transition-all flex items-center gap-1"
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
    )
}
