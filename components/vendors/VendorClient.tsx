'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Sparkles, Plus, Trash2, CheckCircle2, Circle, ExternalLink, Loader2, HeartHandshake } from 'lucide-react'
import type { UserVendor } from '@/actions/user-vendors'
import { CATEGORIES } from '@/lib/constants/vendor-categories'

// 카테고리별 테마 그라디언트
const CATEGORY_STYLES: Record<string, string> = {
    'wedding-hall': 'from-rose-100/80 to-pink-50/50 text-rose-500 hover:border-rose-200',
    'studio': 'from-violet-100/80 to-purple-50/50 text-violet-500 hover:border-violet-200',
    'dress': 'from-pink-100/80 to-rose-50/50 text-pink-500 hover:border-pink-200',
    'makeup': 'from-fuchsia-100/80 to-pink-50/50 text-fuchsia-500 hover:border-fuchsia-200',
    'meeting-place': 'from-amber-100/80 to-orange-50/50 text-amber-500 hover:border-amber-200',
    'hanbok': 'from-red-100/80 to-rose-50/50 text-red-500 hover:border-red-200',
    'wedding-ring': 'from-yellow-100/80 to-amber-50/50 text-yellow-600 hover:border-yellow-200',
    'honeymoon': 'from-sky-100/80 to-blue-50/50 text-sky-500 hover:border-sky-200',
}

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

    return (
        <div className="max-w-5xl mx-auto px-4 pb-24 space-y-8">

            {/* ── 헤더 ────────── */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="text-center mb-12 mt-6"
            >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-pink-500 text-[10px] font-bold uppercase tracking-widest mb-4 border border-pink-100">
                    <HeartHandshake size={12} /> Our Dream Team
                </span>
                <h2 className="font-serif italic text-4xl md:text-5xl font-bold text-gray-800 tracking-tight mb-3">
                    Vendors
                </h2>
                <p className="text-sm text-gray-400 font-medium">완벽한 하루를 위해 최고의 전문가들을 모아보세요</p>

                {/* 진행률 바 */}
                <div className="mt-8 relative max-w-md mx-auto">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-2 px-1">
                        <span>진행률</span>
                        <span className="text-pink-500">{Math.round((confirmedCount / CATEGORIES.length) * 100)}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                            className="h-full bg-gradient-to-r from-pink-300 via-pink-400 to-rose-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(confirmedCount / CATEGORIES.length) * 100}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-3 text-center">
                        {selectedCount > 0
                            ? `${CATEGORIES.length}개 분야 중 ${selectedCount}개 분야 찜 · ${confirmedCount}개 최종 확정`
                            : '카테고리를 클릭해 업체를 탐색하세요'}
                    </p>
                </div>
            </motion.div>

            {/* ── SECTION A: 카테고리 탐색 (Bento Grid) ────────────────── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
                <div className="flex items-center gap-2 mb-5 px-2">
                    <div className="p-1.5 bg-pink-100 rounded-lg">
                        <Sparkles size={16} className="text-pink-500" />
                    </div>
                    <h2 className="text-base font-bold text-gray-800">어디부터 준비할까요?</h2>
                    <span className="text-xs font-medium text-gray-400 ml-auto hidden sm:block">클릭하여 탐색 시작</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {CATEGORIES.map((cat, idx) => {
                        const selected = getVendorByCategory(cat.slug)
                        const styleClass = CATEGORY_STYLES[cat.slug] || 'from-gray-50 to-white text-gray-500 hover:border-gray-200'

                        return (
                            <motion.button
                                key={cat.slug}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push(`/vendors/category/${cat.slug}`)}
                                className={`relative flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-all group overflow-hidden ${selected
                                        ? 'bg-white border-pink-200 shadow-sm'
                                        : `bg-gradient-to-br border-transparent hover:shadow-md ${styleClass}`
                                    }`}
                            >
                                {/* Glassmorphism 빛 반사 효과 */}
                                <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                <motion.span
                                    className="text-4xl drop-shadow-sm"
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, delay: idx * 0.2, ease: "easeInOut" }}
                                >
                                    {cat.emoji}
                                </motion.span>

                                <span className="text-sm font-bold tracking-tight z-10">{cat.label}</span>

                                {selected && (
                                    <div className="absolute top-3 right-3">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-pink-400 rounded-full blur-sm opacity-50" />
                                            <CheckCircle2 size={16} className="relative text-pink-500 fill-pink-50" />
                                        </div>
                                    </div>
                                )}
                            </motion.button>
                        )
                    })}
                </div>
            </motion.section>

            {/* ── SECTION B: 내가 선택한 업체 (My List) ─────────────── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="pt-6"
            >
                <div className="flex items-center justify-between mb-5 px-2">
                    <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-xl">📋</span> 내 리스트
                    </h2>
                    <span className="text-xs font-bold text-pink-500 bg-pink-50 px-3 py-1 rounded-full border border-pink-100 shadow-sm">
                        {selectedCount} / {CATEGORIES.length}
                    </span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {CATEGORIES.map((cat) => {
                        const vendor = getVendorByCategory(cat.slug)
                        if (vendor) {
                            return (
                                <div
                                    key={cat.slug}
                                    className={`relative rounded-[2rem] border p-5 transition-all duration-300 overflow-hidden group flex flex-col ${vendor.is_confirmed
                                        ? 'bg-gradient-to-b from-white to-pink-50/30 border-pink-200 shadow-md shadow-pink-100/50'
                                        : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-pink-100'
                                        }`}
                                >
                                    {vendor.is_confirmed && (
                                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-300 via-rose-400 to-pink-300" />
                                    )}
                                    <div className="flex items-start justify-between gap-1 mb-4">
                                        <span className="text-2xl drop-shadow-sm">{cat.emoji}</span>
                                        <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-sm border border-black/5">
                                            <button
                                                onClick={() => handleToggleConfirm(vendor)}
                                                disabled={confirmingId === vendor.id}
                                                className="p-1.5 rounded-full hover:bg-pink-100 transition-colors text-gray-300 hover:text-pink-500"
                                                title={vendor.is_confirmed ? '확정 취소' : '확정'}
                                            >
                                                {confirmingId === vendor.id
                                                    ? <Loader2 size={14} className="animate-spin" />
                                                    : vendor.is_confirmed
                                                        ? <CheckCircle2 size={14} className="text-pink-500 fill-pink-50" />
                                                        : <Circle size={14} />
                                                }
                                            </button>
                                            <div className="w-px h-3 bg-gray-200" />
                                            <button
                                                onClick={() => handleRemove(vendor.id)}
                                                disabled={removingId === vendor.id}
                                                className="p-1.5 rounded-full hover:bg-red-50 transition-colors text-gray-300 hover:text-red-500"
                                                title="삭제"
                                            >
                                                {removingId === vendor.id
                                                    ? <Loader2 size={14} className="animate-spin" />
                                                    : <Trash2 size={14} />
                                                }
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-auto">
                                        <p className="text-[10px] font-bold text-pink-400 uppercase tracking-wider mb-1">{cat.label}</p>
                                        <p className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug mb-2 group-hover:text-pink-600 transition-colors">{vendor.vendor_name}</p>

                                        <div className="flex flex-wrap items-center gap-2 mt-3">
                                            {vendor.price_range && PRICE_COLOR[vendor.price_range] && (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${PRICE_COLOR[vendor.price_range]}`}>
                                                    {vendor.price_range}
                                                </span>
                                            )}
                                            {vendor.vendor_link && (
                                                <a href={vendor.vendor_link} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-[10px] font-bold text-[#03C75A] bg-[#03C75A]/10 px-2 py-0.5 rounded-full hover:bg-[#03C75A]/20 transition-colors">
                                                    <ExternalLink size={10} />네이버
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        return (
                            <button
                                key={cat.slug}
                                onClick={() => router.push(`/vendors/category/${cat.slug}`)}
                                className="flex flex-col items-center justify-center gap-3 rounded-[2rem] border-2 border-dashed border-gray-200 p-6 min-h-[160px] hover:border-pink-300 hover:bg-pink-50/50 transition-all text-gray-400 hover:text-pink-500 group bg-gray-50/50"
                            >
                                <div className="relative">
                                    <span className="text-3xl opacity-30 group-hover:opacity-100 transition-all duration-300 drop-shadow-sm">{cat.emoji}</span>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 group-hover:border-pink-200 group-hover:text-pink-500 text-gray-300 transition-colors">
                                        <Plus size={12} strokeWidth={3} />
                                    </div>
                                </div>
                                <span className="text-[11px] font-bold uppercase tracking-wider">{cat.label} 추가</span>
                            </button>
                        )
                    })}
                </div>
            </motion.section>
        </div>
    )
}
