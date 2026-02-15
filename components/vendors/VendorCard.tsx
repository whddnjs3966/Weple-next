'use client'

import Link from 'next/link'
import { Star, MapPin, Image as ImageIcon, Sparkles } from 'lucide-react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

export default function VendorCard({ vendor }: { vendor: any }) {
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 })
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 })

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"])
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const mouseXVal = e.clientX - rect.left
        const mouseYVal = e.clientY - rect.top
        const xPct = mouseXVal / width - 0.5
        const yPct = mouseYVal / height - 0.5
        x.set(xPct)
        y.set(yPct)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.div
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="group relative h-full rounded-2xl bg-white/5 border border-white/10 p-1 transition-all duration-300 hover:shadow-neon hover:border-white/30"
        >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="relative h-full flex flex-col rounded-xl bg-[#0a0a12]/80 overflow-hidden backdrop-blur-md" style={{ transform: "translateZ(20px)" }}>
                {/* Image Area */}
                <div className="relative h-48 overflow-hidden">
                    {vendor.image_url ? (
                        <img
                            src={vendor.image_url}
                            alt={vendor.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 text-white/20">
                            <ImageIcon size={48} className="mb-2 opacity-50" />
                            <span className="text-xs font-bold">No Signal</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-transparent to-transparent opacity-80" />

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                            {vendor.category?.name || vendor.category}
                        </span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1 text-starlight font-bold text-sm shadow-glow">
                            <Star size={14} fill="currentColor" />
                            <span>{vendor.rating?.toFixed(1) || '0.0'}</span>
                            <span className="text-white/30 font-normal ml-1 text-xs">({vendor.review_count || 0})</span>
                        </div>
                        {vendor.priceRange && (
                            <span className="text-[10px] text-emerald-400 font-mono border border-emerald-500/30 px-2 py-0.5 rounded bg-emerald-500/10">
                                {vendor.priceRange}
                            </span>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors line-clamp-1 truncate">
                        {vendor.name}
                    </h3>

                    <p className="text-white/40 text-xs flex items-center gap-1.5 mb-4 font-light">
                        <MapPin size={12} />
                        {vendor.region_sido ? `${vendor.region_sido} ${vendor.region_sigungu}` : (vendor.region || 'Seoul, Korea')}
                    </p>

                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[10px] text-white/30 uppercase tracking-wider">
                            <Sparkles size={10} /> Verified
                        </span>
                        <Link
                            href={`/vendors/${vendor.id}`}
                            className="text-xs font-bold text-white hover:text-pink-300 transition-colors flex items-center gap-1 group-hover:translate-x-1 duration-300"
                        >
                            Explore <span className="text-lg leading-none">›</span>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
