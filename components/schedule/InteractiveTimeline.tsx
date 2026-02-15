'use client'

import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { format } from 'date-fns'
import { useEffect, useState, useRef } from 'react'
import { Star } from 'lucide-react'

interface TimelineEvent {
    title: string
    date: Date
    dDay: number
    type: 'start' | 'milestone' | 'end'
}

interface InteractiveTimelineProps {
    events: TimelineEvent[]
}

const StarNode = ({ type, isHovered }: { type: string, isHovered: boolean }) => {
    return (
        <div className="relative flex items-center justify-center">
            {/* Glow */}
            <motion.div
                animate={{ scale: isHovered ? 1.5 : 1, opacity: isHovered ? 0.8 : 0.4 }}
                className={`absolute inset-0 rounded-full blur-md ${type === 'end' ? 'bg-[#FF8E8E]' : 'bg-starlight'}`}
            />

            {/* Star Shape */}
            <motion.div
                animate={{ rotate: isHovered ? 180 : 0, scale: isHovered ? 1.2 : 1 }}
                transition={{ type: "spring", stiffness: 200 }}
            >
                <Star
                    size={type === 'end' ? 32 : 16}
                    fill={type === 'end' ? "#FF8E8E" : "#FFF"}
                    stroke={type === 'end' ? "#FF8E8E" : "#FFF"}
                    className="drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                />
            </motion.div>
        </div>
    )
}

export default function InteractiveTimeline({ events }: InteractiveTimelineProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    // Parallax Background Stars
    const [bgStars, setBgStars] = useState<{ x: number, y: number, size: number, delay: number }[]>([])

    useEffect(() => {
        const stars = Array.from({ length: 30 }).map(() => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 1,
            delay: Math.random() * 5
        }))
        setBgStars(stars)
    }, [])

    const width = Math.max(1000, events.length * 150)
    const height = 500
    const padding = { left: 100, right: 100 }
    const usableWidth = width - padding.left - padding.right
    const centerY = height / 2

    // Calculate progress based on Date difference or just spacing
    // For a nice visual, equal spacing might be better than actual time scale if dates are clustered
    const points = events.map((e, i) => {
        const progress = i / (events.length - 1 || 1)
        const x = padding.left + (usableWidth * progress)
        const amplitude = 80
        // Constellation Wave
        const y = centerY + Math.sin(progress * Math.PI * 2) * amplitude * (i % 2 === 0 ? 1 : -1) * 0.5
        return { x, y, ...e }
    })

    // Create Path D String (Smooth Curve)
    let pathD = ''
    if (points.length >= 2) {
        pathD = `M ${points[0].x} ${points[0].y}`
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i]
            const p1 = points[i + 1]
            // Bezier control points for smooth curve
            const cp1x = p0.x + (p1.x - p0.x) * 0.5
            const cp1y = p0.y
            const cp2x = p1.x - (p1.x - p0.x) * 0.5
            const cp2y = p1.y
            pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`
        }
    }

    return (
        <div ref={containerRef} className="w-full h-[600px] overflow-x-auto overflow-y-hidden custom-scrollbar bg-cosmos-dark relative rounded-3xl border border-white/10 shadow-2xl">

            {/* Cosmic Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black/40 to-black z-0 pointer-events-none"></div>

            {/* Parallax Stars */}
            {bgStars.map((star, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-white rounded-full opacity-40"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: star.size,
                        height: star.size
                    }}
                    animate={{
                        opacity: [0.2, 0.8, 0.2],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: 3 + star.delay,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            ))}

            <div className="relative min-w-[1000px] h-full z-10">
                <svg className="w-full h-full absolute inset-0 pointer-events-none" style={{ minWidth: width }}>
                    <defs>
                        <linearGradient id="cosmicLine" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                            <stop offset="10%" stopColor="rgba(255,255,255,0.5)" />
                            <stop offset="50%" stopColor="#a78bfa" />
                            <stop offset="90%" stopColor="rgba(255,255,255,0.5)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                        </linearGradient>
                        <filter id="glow-line" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Connecting Line */}
                    <motion.path
                        d={pathD}
                        stroke="url(#cosmicLine)"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="5 5"
                        filter="url(#glow-line)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                    />
                </svg>

                {/* Nodes */}
                {points.map((p, i) => (
                    <motion.div
                        key={i}
                        className="absolute z-20"
                        style={{ left: p.x, top: p.y, x: '-50%', y: '-50%' }}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <div className="relative group cursor-pointer">
                            {/* Visual Node */}
                            <StarNode type={p.type} isHovered={hoveredIndex === i} />

                            {/* Tooltip Card */}
                            <motion.div
                                className={`absolute left-1/2 -translate-x-1/2 mt-4 w-48 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 pointer-events-none transition-all duration-300 ${hoveredIndex === i ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
                            >
                                <div className="text-[#a78bfa] font-bold text-xs mb-1 tracking-widest uppercase">
                                    {p.title}
                                </div>
                                <div className="text-white text-sm font-medium">
                                    {format(p.date, 'MMM d, yyyy')}
                                </div>
                                <div className="text-white/50 text-xs mt-1">
                                    D-{p.dDay}
                                </div>
                            </motion.div>

                            {/* Label (Always visible for end/milestones, hover for others) */}
                            {p.type !== 'milestone' && (
                                <div className={`absolute -top-8 left-1/2 -translate-x-1/2 text-white/80 text-xs whitespace-nowrap transition-opacity duration-300 ${hoveredIndex === i ? 'opacity-0' : 'opacity-100'}`}>
                                    {p.title}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
