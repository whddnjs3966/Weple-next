'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, MapPin, ExternalLink, Plus, Check, Loader2 } from 'lucide-react'
import { WEDDING_LOCATIONS, SIDO_LIST } from '@/lib/constants/wedding-locations'
import { addUserPlace } from '@/actions/user-places'

type SearchResult = {
    title: string
    address: string
    roadAddress: string
    telephone: string
    link: string
    category: string
    description: string
}

interface PlaceSearchModalProps {
    category: string
    categoryLabel: string
    categoryEmoji: string
    defaultSido: string
    defaultSigungu: string
    onClose: () => void
    onPlaceAdded: () => void
}

export default function PlaceSearchModal({
    category,
    categoryLabel,
    categoryEmoji,
    defaultSido,
    defaultSigungu,
    onClose,
    onPlaceAdded,
}: PlaceSearchModalProps) {
    const [sido, setSido] = useState(defaultSido || '서울')
    const [sigungu, setSigungu] = useState(defaultSigungu || '')
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [addingId, setAddingId] = useState<string | null>(null)
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

    const sigunguList = sido ? WEDDING_LOCATIONS[sido] || [] : []

    // 첫 로드 시 자동 검색
    useEffect(() => {
        handleSearch()
    }, [])

    const handleSearch = async () => {
        setLoading(true)
        setError('')
        try {
            const params = new URLSearchParams({ category, sido, sigungu })
            const res = await fetch(`/api/places/search?${params}`)
            const data = await res.json()

            if (data.error) {
                setError(data.error)
                setResults([])
            } else {
                setResults(data.places || [])
            }
        } catch {
            setError('검색 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const handleSidoChange = (newSido: string) => {
        setSido(newSido)
        setSigungu('')
    }

    const handleSelect = async (place: SearchResult) => {
        const key = place.title
        setAddingId(key)
        try {
            const result = await addUserPlace({
                category,
                place_name: place.title,
                place_address: place.roadAddress || place.address,
                place_phone: place.telephone,
                place_link: place.link,
            })
            if (!result.error) {
                setAddedIds(prev => new Set([...prev, key]))
                onPlaceAdded()
            }
        } catch {
            // silent fail
        } finally {
            setAddingId(null)
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-0 sm:px-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-rose-50 shrink-0">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{categoryEmoji}</span>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{categoryLabel} 찾기</h3>
                                <p className="text-xs text-rose-400">마음에 드는 장소를 선정해보세요</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-rose-50 text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Search Controls */}
                    <div className="px-6 py-4 bg-rose-50/50 shrink-0">
                        <div className="flex gap-2 mb-3">
                            <select
                                value={sido}
                                onChange={(e) => handleSidoChange(e.target.value)}
                                className="flex-1 bg-white border border-rose-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                            >
                                {SIDO_LIST.filter(s => s !== '미정/기타').map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            <select
                                value={sigungu}
                                onChange={(e) => setSigungu(e.target.value)}
                                disabled={!sido}
                                className="flex-1 bg-white border border-rose-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:opacity-50"
                            >
                                <option value="">전체</option>
                                {sigunguList.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="px-4 py-2.5 bg-rose-400 hover:bg-rose-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-60 shrink-0"
                            >
                                {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                                검색
                            </button>
                        </div>
                        {results.length > 0 && !loading && (
                            <p className="text-xs text-rose-400">
                                <MapPin size={11} className="inline mr-1" />
                                {sido}{sigungu ? ` ${sigungu}` : ''} 검색 결과 {results.length}개
                            </p>
                        )}
                    </div>

                    {/* Results */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                        {loading && (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 size={28} className="animate-spin text-rose-300" />
                            </div>
                        )}

                        {error && !loading && (
                            <div className="text-center py-10 text-sm text-gray-400">
                                <p className="text-rose-400 font-medium mb-1">검색 결과를 불러오지 못했습니다</p>
                                <p>{error}</p>
                            </div>
                        )}

                        {!loading && !error && results.length === 0 && (
                            <div className="text-center py-10 text-sm text-gray-400">
                                검색 결과가 없습니다. 지역을 변경해서 검색해보세요.
                            </div>
                        )}

                        {!loading && results.map((place, i) => {
                            const isAdded = addedIds.has(place.title)
                            const isAdding = addingId === place.title
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="bg-white border border-rose-100 rounded-2xl p-4 hover:border-rose-200 hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-800 text-sm truncate">{place.title}</p>
                                            {place.category && (
                                                <span className="inline-block text-[10px] text-rose-400 bg-rose-50 px-2 py-0.5 rounded-full mt-1">
                                                    {place.category}
                                                </span>
                                            )}
                                            {(place.roadAddress || place.address) && (
                                                <p className="text-xs text-gray-400 mt-1.5 flex items-start gap-1">
                                                    <MapPin size={11} className="shrink-0 mt-0.5 text-rose-300" />
                                                    <span className="line-clamp-1">{place.roadAddress || place.address}</span>
                                                </p>
                                            )}
                                            {place.telephone && (
                                                <p className="text-xs text-gray-400 mt-0.5">{place.telephone}</p>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2 shrink-0">
                                            {place.link && (
                                                <a
                                                    href={place.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-rose-400 hover:border-rose-200 transition-colors"
                                                >
                                                    <ExternalLink size={14} />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => !isAdded && !isAdding && handleSelect(place)}
                                                disabled={isAdded || isAdding}
                                                className={`p-2 rounded-xl border transition-all flex items-center justify-center ${isAdded
                                                    ? 'bg-green-50 border-green-200 text-green-500 cursor-default'
                                                    : 'bg-rose-50 border-rose-200 text-rose-400 hover:bg-rose-400 hover:text-white hover:border-rose-400'
                                                    }`}
                                            >
                                                {isAdding ? <Loader2 size={14} className="animate-spin" /> : isAdded ? <Check size={14} /> : <Plus size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
