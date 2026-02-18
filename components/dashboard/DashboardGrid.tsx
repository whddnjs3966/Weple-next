'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Countdown3D from './Countdown3D'
import { BudgetStatus, TaskStatus } from './StatusModules'
import { Calendar, CheckSquare, Heart, MapPin, MessageCircle, Flower2 } from 'lucide-react'

interface DashboardGridProps {
    user: any
    weddingDate: Date | null
    budget: { total: number; used: number }
    tasks: { total: number; completed: number }
    dDayText: string
}

export default function DashboardGrid({ user, weddingDate, budget, tasks, dDayText }: DashboardGridProps) {
    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center text-center px-4">

            {/* D-Day Counter */}
            <div className="animate-fade-in-up">
                <p className="text-white/60 text-sm tracking-[0.3em] font-medium mb-4 uppercase">
                    Your Beautiful Journey
                </p>
                <h1 className="font-serif text-8xl md:text-[10rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-2xl mb-2 tracking-tight leading-none">
                    {dDayText}
                </h1>
                <div className="mt-6 font-serif text-4xl md:text-6xl text-white/90 tracking-[0.2em] font-light">
                    {weddingDate ? weddingDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace('.', '.') : 'Set Date'}
                </div>
            </div>

            {/* Quote */}
            <div className="animate-fade-in-up mt-10">
                <div className="px-6 py-3 bg-white/8 backdrop-blur-md border border-white/15 rounded-2xl">
                    <p className="font-serif italic text-white/90 text-sm">
                        &ldquo;Together is a beautiful place to be&rdquo;
                    </p>
                </div>
            </div>

        </div>
    )
}
