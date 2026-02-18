'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns'

interface Countdown3DProps {
    targetDate: Date | null
}

const NumberBlock = ({ value, label }: { value: number; label: string }) => {
    return (
        <div className="flex flex-col items-center mx-2">
            <div className="relative w-16 h-20 md:w-20 md:h-24 perspective-1000">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={value}
                        initial={{ rotateX: -90, opacity: 0 }}
                        animate={{ rotateX: 0, opacity: 1 }}
                        exit={{ rotateX: 90, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-md rounded-xl border border-pink-100 shadow-petal"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <span className="text-3xl md:text-5xl font-bold text-gray-800">
                            {value.toString().padStart(2, '0')}
                        </span>
                    </motion.div>
                </AnimatePresence>
            </div>
            <span className="text-xs md:text-sm font-medium text-pink-400 mt-2 uppercase tracking-widest">{label}</span>
        </div>
    )
}

export default function Countdown3D({ targetDate }: Countdown3DProps) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

    useEffect(() => {
        if (!targetDate) return

        const interval = setInterval(() => {
            const now = new Date()
            const days = differenceInDays(targetDate, now)
            const hours = differenceInHours(targetDate, now) % 24
            const minutes = differenceInMinutes(targetDate, now) % 60
            const seconds = differenceInSeconds(targetDate, now) % 60

            setTimeLeft({ days, hours, minutes, seconds })
        }, 1000)

        return () => clearInterval(interval)
    }, [targetDate])

    if (!targetDate) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2">날짜를 설정하세요</h3>
                <p className="text-gray-400 text-sm mb-4">결혼 예정일을 설정하고 여정을 시작하세요.</p>
                <div className="w-12 h-12 rounded-full border-2 border-pink-200 flex items-center justify-center animate-pulse-soft text-pink-400">
                    <span className="text-2xl">+</span>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 h-full w-full">
            <h3 className="text-pink-400 font-serif text-lg mb-6 tracking-widest uppercase">Time Remaining</h3>
            <div className="flex items-center">
                <NumberBlock value={timeLeft.days} label="Days" />
                <span className="text-2xl text-pink-200 mb-6">:</span>
                <NumberBlock value={timeLeft.hours} label="Hrs" />
                <span className="text-2xl text-pink-200 mb-6">:</span>
                <NumberBlock value={timeLeft.minutes} label="Min" />
                <span className="text-2xl text-pink-200 mb-6">:</span>
                <NumberBlock value={timeLeft.seconds} label="Sec" />
            </div>
        </div>
    )
}
