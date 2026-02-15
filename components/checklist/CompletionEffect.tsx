'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function CompletionEffect() {
    // Generate random particles
    const particles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100 - 50, // -50% to 50%
        y: Math.random() * 100 - 50, // -50% to 50%
        scale: Math.random() * 0.5 + 0.5,
        color: ['#FF8E8E', '#A855F7', '#3B82F6', '#10B981'][Math.floor(Math.random() * 4)]
    }))

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                    animate={{
                        x: p.x * 5,
                        y: p.y * 5,
                        opacity: 0,
                        scale: p.scale
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]"
                    style={{ backgroundColor: p.color }}
                />
            ))}
        </div>
    )
}
