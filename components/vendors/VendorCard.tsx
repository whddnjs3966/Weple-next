import Link from 'next/link'
import { Vendor } from '@/actions/vendors'
import { Star, MapPin, Image as ImageIcon } from 'lucide-react'

export default function VendorCard({ vendor }: { vendor: Vendor }) {
    return (
        <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">

            {/* Image Area */}
            <div className="relative h-48 bg-gray-100 overflow-hidden">
                {vendor.image_url ? (
                    <img
                        src={vendor.image_url}
                        alt={vendor.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                        <ImageIcon size={48} className="opacity-50 mb-2" />
                        <span className="text-xs font-medium">이미지 준비중</span>
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-primary text-xs font-bold shadow-sm">
                        {vendor.category?.name}
                    </span>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                        <Star size={14} fill="currentColor" />
                        <span>{vendor.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-gray-300 font-normal ml-1">({vendor.review_count || 0})</span>
                    </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {vendor.name}
                </h3>

                <p className="text-gray-500 text-xs flex items-center gap-1 mb-4">
                    <MapPin size={12} />
                    {vendor.region_sido} {vendor.region_sigungu}
                </p>

                {vendor.summary_positive && (
                    <div className="mt-auto mb-4 p-3 rounded-xl bg-gray-50 text-xs text-gray-600 line-clamp-2">
                        <span className="mr-1">👍</span> {vendor.summary_positive}
                    </div>
                )}

                <Link
                    href={`/vendors/${vendor.id}`}
                    className="mt-auto w-full py-2.5 rounded-xl border border-primary/20 text-primary font-bold text-sm text-center hover:bg-primary hover:text-white transition-all"
                >
                    상세 보기
                </Link>
            </div>
        </div>
    )
}
