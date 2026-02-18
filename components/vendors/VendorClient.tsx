'use client'

import { motion } from 'framer-motion'
import { Search, Filter, Star, MapPin, DollarSign, Heart } from 'lucide-react'

interface Vendor {
    id: string
    name: string
    category: string
    priceRange?: string
    region?: string
    image?: string
    rating?: number
    review_count?: number
}

interface Category {
    name: string
    count: number
    icon: string
    emoji: string
}

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } }
}

export default function VendorClient() {
    const selectedVendors: Vendor[] = [
        { id: '1', name: 'The Chapel at Nonhyeon', category: '예식장', priceRange: '상', rating: 4.8, review_count: 124, region: '논현' }
    ]

    const categories: Category[] = [
        { name: '예식장', count: 12, icon: 'bi-buildings', emoji: '💒' },
        { name: '스튜디오', count: 8, icon: 'bi-camera-fill', emoji: '📸' },
        { name: '드레스', count: 15, icon: 'bi-flower1', emoji: '👗' },
        { name: '메이크업', count: 10, icon: 'bi-palette-fill', emoji: '💄' },
        { name: '상견례장소', count: 5, icon: 'bi-geo-alt', emoji: '🍽️' },
        { name: '한복', count: 7, icon: 'bi-person-standing-dress', emoji: '👘' },
    ]

    const recommendedVendors: Vendor[] = [
        { id: '2', name: 'Luxe Studio', category: '스튜디오', priceRange: '중', region: '강남', rating: 4.9, review_count: 85 },
        { id: '3', name: 'Grace Kelly Dress', category: '드레스', priceRange: '상', region: '청담', rating: 5.0, review_count: 42 },
        { id: '4', name: 'Jenny House', category: '메이크업', priceRange: '상', region: '청담', rating: 4.7, review_count: 210 },
        { id: '5', name: 'Signiel Seoul', category: '예식장', priceRange: '최상', region: '잠실', rating: 4.9, review_count: 320 },
    ]

    const getPriceColor = (price?: string) => {
        switch (price) {
            case '최상': return 'text-purple-600 bg-purple-50'
            case '상': return 'text-pink-500 bg-pink-50'
            case '중': return 'text-blue-600 bg-blue-50'
            default: return 'text-gray-600 bg-gray-50'
        }
    }

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            {/* Header */}
            <div className="text-center mb-12">
                <h2 className="font-serif italic text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-2">
                    Vendors
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-pink-400"></div>
                    <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                    <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-pink-400"></div>
                </div>
                <p className="text-gray-400 text-sm mt-4">결혼 준비에 필요한 업체를 찾아보세요</p>
            </div>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-14 relative z-20">
                <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl px-5 py-3 flex items-center shadow-sm hover:shadow-md transition-all">
                    <Search className="text-gray-300 mr-3" size={20} />
                    <input
                        type="text"
                        placeholder="업체명, 지역, 카테고리 검색..."
                        className="bg-transparent border-none outline-none text-gray-700 placeholder-gray-300 w-full text-sm"
                    />
                    <button className="p-2 bg-pink-400 text-white rounded-xl hover:bg-pink-500 transition-colors">
                        <Filter size={16} />
                    </button>
                </div>
            </div>

            {/* Section 1: My Selection */}
            {selectedVendors.length > 0 && (
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="mb-14"
                >
                    <div className="flex items-center gap-2 mb-6 px-2">
                        <Heart className="text-pink-300 w-4 h-4 fill-current" />
                        <h3 className="text-lg font-bold text-gray-700">내가 선택한 업체</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedVendors.map(vendor => (
                            <div key={vendor.id} className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-100 to-pink-100 flex items-center justify-center text-2xl shrink-0">
                                        💒
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-800 text-sm truncate">{vendor.name}</h4>
                                        <p className="text-xs text-gray-400 mt-0.5">{vendor.category} · {vendor.region}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <div className="flex items-center gap-0.5">
                                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                <span className="text-xs font-bold text-gray-700">{vendor.rating}</span>
                                            </div>
                                            <span className="text-xs text-gray-300">({vendor.review_count})</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getPriceColor(vendor.priceRange)}`}>{vendor.priceRange}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 my-10">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                <div className="w-2 h-2 rotate-45 bg-pink-400/40"></div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            </div>

            {/* Section 2: Categories */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="mb-14"
            >
                <div className="flex items-center gap-2 mb-6 px-2">
                    <span className="text-pink-300">📂</span>
                    <h3 className="text-lg font-bold text-gray-700">카테고리</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {categories.map((cat, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -3, scale: 1.02 }}
                            className="group cursor-pointer rounded-2xl bg-white/70 backdrop-blur-xl hover:bg-white border border-white/50 hover:border-pink-100 p-5 text-center transition-all shadow-sm hover:shadow-md"
                        >
                            <div className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br from-pink-50 to-pink-50 group-hover:from-pink-100 group-hover:to-pink-100 text-2xl transition-all">
                                {cat.emoji}
                            </div>
                            <h4 className="text-xs font-bold text-gray-700 mb-0.5">{cat.name}</h4>
                            <p className="text-[10px] text-gray-400">{cat.count}개 업체</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Divider */}
            <div className="flex items-center gap-4 my-10">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                <div className="w-2 h-2 rotate-45 bg-pink-400/40"></div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            </div>

            {/* Section 3: Recommended */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
            >
                <div className="flex items-center gap-2 mb-6 px-2">
                    <Star className="text-amber-400 w-4 h-4 fill-current" />
                    <h3 className="text-lg font-bold text-gray-700">추천 업체</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendedVendors.map((vendor) => (
                        <motion.div
                            key={vendor.id}
                            whileHover={{ y: -2 }}
                            className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-3xl shrink-0">
                                    {vendor.category === '스튜디오' ? '📸' : vendor.category === '드레스' ? '👗' : vendor.category === '메이크업' ? '💄' : '💒'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-gray-800 text-sm">{vendor.name}</h4>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getPriceColor(vendor.priceRange)}`}>{vendor.priceRange}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={10} /> {vendor.region}
                                        </span>
                                        <span>{vendor.category}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star key={i} className={`w-3 h-3 ${i <= Math.floor(vendor.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-gray-600">{vendor.rating}</span>
                                        <span className="text-xs text-gray-300">({vendor.review_count})</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>
        </div>
    )
}
