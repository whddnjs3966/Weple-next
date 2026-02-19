'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    ArrowLeft, MapPin, Phone, ExternalLink,
    Loader2, Plus, Check, BookOpen, Sparkles,
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

export default function VendorPlaceDetail({
    slug,
    name,
    address,
    phone,
    link,
}: VendorPlaceDetailProps) {
    const [reviews, setReviews] = useState<BlogReview[]>([])
    const [summary, setSummary] = useState<string | null>(null)
    const [reviewLoading, setReviewLoading] = useState(true)
    const [mapCoords, setMapCoords] = useState<{ lat: number; lon: number } | null>(null)
    const [mapFallback, setMapFallback] = useState(false)
    const [isAdded, setIsAdded] = useState(false)
    const [isAdding, setIsAdding] = useState(false)

    const fetchReviewsAndMap = useCallback(async () => {
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
        }

        if (address) {
            try {
                const res = await fetch(
                    `/api/vendors/geocode?address=${encodeURIComponent(address)}`
                )
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
        }
    }, [name, address, slug])

    useEffect(() => {
        fetchReviewsAndMap()
    }, [fetchReviewsAndMap])

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

    return (
        <div className="max-w-5xl mx-auto px-3 sm:px-6 pb-24">
            {/* ── Navigation ── */}
            <div className="mt-8 mb-6">
                <Link
                    href={`/vendors/category/${slug}`}
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={15} />
                    검색 결과로 돌아가기
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ══ 좌측: 메인 콘텐츠 (2/3) ══ */}
                <div className="lg:col-span-2 space-y-6">

                    {/* ── 업체 기본 정보 카드 ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7"
                    >
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight mb-2">
                            {name}
                        </h1>
                        {address && (
                            <p className="flex items-start gap-2 text-sm text-gray-400 mb-4">
                                <MapPin size={14} className="shrink-0 mt-0.5 text-pink-300" />
                                {address}
                            </p>
                        )}

                        {/* 연락처 & 링크 */}
                        <div className="flex flex-wrap gap-2">
                            {phone && (
                                <a
                                    href={`tel:${phone}`}
                                    className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-50 border border-gray-100 text-gray-500 px-3 py-2 rounded-xl hover:bg-pink-50 hover:border-pink-200 hover:text-pink-500 transition-all"
                                >
                                    <Phone size={12} />
                                    {phone}
                                </a>
                            )}
                            {link && (
                                <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-50 border border-gray-100 text-gray-500 px-3 py-2 rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500 transition-all"
                                >
                                    <ExternalLink size={12} />
                                    웹사이트
                                </a>
                            )}
                            <a
                                href={`https://map.naver.com/v5/search/${encodeURIComponent(name)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#03C75A]/10 border border-[#03C75A]/20 text-[#03C75A] px-3 py-2 rounded-xl hover:bg-[#03C75A]/20 transition-all"
                            >
                                <MapPin size={12} />
                                네이버 지도
                            </a>
                        </div>
                    </motion.div>

                    {/* ── AI 요약 ── */}
                    {!reviewLoading && summary && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 rounded-3xl p-6"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles size={14} className="text-pink-400" />
                                <span className="text-xs font-extrabold text-pink-500 uppercase tracking-wider">
                                    AI 요약
                                </span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
                        </motion.div>
                    )}

                    {/* ── 지도 ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                    >
                        <div className="px-6 pt-5 pb-3">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                <MapPin size={14} className="text-pink-400" />
                                위치 안내
                            </h3>
                        </div>
                        {mapCoords ? (
                            <div className="aspect-[16/9]">
                                <iframe
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lon - 0.005},${mapCoords.lat - 0.003},${mapCoords.lon + 0.005},${mapCoords.lat + 0.003}&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lon}`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    title={`${name} 지도`}
                                />
                            </div>
                        ) : mapFallback ? (
                            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                <MapPin size={32} className="text-gray-200 mb-3" />
                                <p className="text-sm text-gray-400 mb-3">지도를 표시할 수 없습니다</p>
                                <a
                                    href={`https://map.naver.com/v5/search/${encodeURIComponent(address || name)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#03C75A] px-4 py-2.5 rounded-xl hover:bg-[#02b351] transition-all shadow-md shadow-green-500/20"
                                >
                                    <MapPin size={12} />
                                    네이버 지도에서 보기
                                </a>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 size={24} className="animate-spin text-gray-200" />
                            </div>
                        )}
                    </motion.div>

                    {/* ── 블로그 리뷰 ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
                    >
                        <div className="flex items-center gap-2 mb-5">
                            <BookOpen size={15} className="text-pink-400" />
                            <h3 className="font-bold text-gray-800 text-sm">블로그 후기</h3>
                            {reviewLoading && <Loader2 size={12} className="animate-spin text-gray-300 ml-1" />}
                        </div>

                        {/* 로딩 스켈레톤 */}
                        {reviewLoading && (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-gray-50 rounded-2xl p-4 space-y-2 animate-pulse">
                                        <div className="h-3 bg-gray-200 rounded-full w-3/4" />
                                        <div className="h-3 bg-gray-100 rounded-full w-full" />
                                        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {!reviewLoading && reviews.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-8">
                                관련 블로그 후기가 없습니다.
                            </p>
                        )}

                        <div className="space-y-3">
                            {reviews.map((review, i) => (
                                <a
                                    key={i}
                                    href={review.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block bg-gray-50 hover:bg-pink-50/50 border border-gray-100 hover:border-pink-200 rounded-2xl p-4 transition-all group"
                                >
                                    <h4 className="text-sm font-bold text-gray-700 mb-1.5 line-clamp-1 group-hover:text-pink-500 transition-colors">
                                        {review.title}
                                    </h4>
                                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-2">
                                        {review.description}
                                    </p>
                                    <div className="flex items-center gap-3 text-[10px] text-gray-300">
                                        <span>{review.bloggername}</span>
                                        <span>·</span>
                                        <span>{formatDate(review.postdate)}</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* ══ 우측: 사이드바 (1/3) ══ */}
                <div className="lg:col-span-1">
                    <div className="sticky top-28 space-y-4">

                        {/* ── AI 요약 카드 (메인, 크게) ── */}
                        <motion.div
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 border border-pink-100 rounded-3xl p-6"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles size={14} className="text-pink-400" />
                                <span className="text-xs font-extrabold text-pink-500 uppercase tracking-wider">
                                    AI 분석 요약
                                </span>
                            </div>

                            {reviewLoading ? (
                                /* 로딩 스켈레톤 */
                                <div className="space-y-2.5 animate-pulse">
                                    <div className="h-4 bg-pink-100 rounded-full w-full" />
                                    <div className="h-4 bg-pink-100 rounded-full w-5/6" />
                                    <div className="h-4 bg-pink-100 rounded-full w-4/6" />
                                    <div className="h-3 bg-pink-50 rounded-full w-1/3 mt-3" />
                                </div>
                            ) : summary ? (
                                <>
                                    <p className="text-sm text-gray-700 leading-relaxed mb-4">
                                        {summary}
                                    </p>
                                    <div className="flex items-center gap-1.5 pt-3 border-t border-pink-100">
                                        <BookOpen size={12} className="text-pink-300" />
                                        <span className="text-[11px] text-pink-400 font-medium">
                                            블로그 후기 {reviews.length}개 분석
                                        </span>
                                    </div>
                                </>
                            ) : reviews.length > 0 ? (
                                <>
                                    <div className="flex items-baseline gap-1.5 mb-3">
                                        <span className="text-3xl font-extrabold text-gray-800">
                                            {reviews.length}
                                        </span>
                                        <span className="text-sm text-gray-400 font-medium">개 후기</span>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        아래 블로그 후기를 직접 확인해보세요.
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-400">
                                    관련 후기를 찾을 수 없습니다.
                                </p>
                            )}
                        </motion.div>

                        {/* ── 액션 카드 (후보 등록 + 빠른 접근 통합) ── */}
                        <motion.div
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5"
                        >
                            {/* 후보 등록 버튼 */}
                            <button
                                onClick={handleAdd}
                                disabled={isAdding || isAdded}
                                className={`w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all mb-3 ${
                                    isAdded
                                        ? 'bg-green-50 text-green-500 border border-green-100 cursor-default'
                                        : 'bg-gradient-to-r from-pink-300 to-pink-400 text-white hover:shadow-lg hover:shadow-pink-200/50 hover:-translate-y-0.5'
                                }`}
                            >
                                {isAdding ? (
                                    <Loader2 size={15} className="animate-spin" />
                                ) : isAdded ? (
                                    <><Check size={15} />리스트에 추가됨</>
                                ) : (
                                    <><Plus size={15} />내 웨딩 리스트에 추가</>
                                )}
                            </button>

                            {/* 구분선 */}
                            <div className="border-t border-gray-50 mb-3" />

                            {/* 빠른 접근 링크 */}
                            <div className="flex gap-2">
                                <a
                                    href={`https://map.naver.com/v5/search/${encodeURIComponent(name)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#03C75A]/10 border border-[#03C75A]/20 text-[#03C75A] text-xs font-bold hover:bg-[#03C75A]/20 transition-all"
                                >
                                    <MapPin size={12} />
                                    지도
                                </a>
                                <a
                                    href={`https://search.naver.com/search.naver?query=${encodeURIComponent(name + ' 웨딩 후기')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 text-xs font-bold hover:bg-pink-50 hover:border-pink-200 hover:text-pink-500 transition-all"
                                >
                                    <Sparkles size={12} />
                                    후기 검색
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
