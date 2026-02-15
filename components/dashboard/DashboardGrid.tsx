'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Countdown3D from './Countdown3D'
import { BudgetStatus, TaskStatus } from './StatusModules'
import { Calendar, CheckSquare, Heart, MapPin, MessageCircle } from 'lucide-react'

interface DashboardGridProps {
    user: any
    weddingDate: Date | null
    budget: { total: number; used: number }
    tasks: { total: number; completed: number }
    dDayText: string
}

export default function DashboardGrid({ user, weddingDate, budget, tasks, dDayText }: DashboardGridProps) {
    // Django 'Cosmos' Floating Layout Implementation
    // Matching exact positioning from Django's style block in dashboard.html

    return (
        <div className="relative w-full h-[85vh] md:h-screen overflow-hidden">

            {/* 1. Center Hero: Countdown */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center w-full max-w-4xl px-4">
                <div className="animate-fade-in-up">
                    <p className="text-white/60 text-xs md:text-sm tracking-[0.3em] font-medium mb-4 uppercase">Your Beautiful Journey</p>
                    <h1 className="font-serif text-7xl md:text-[9rem] lg:text-[11rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-2xl mb-2 tracking-tight leading-none">
                        {dDayText}
                    </h1>
                    <div className="mt-4 md:mt-8 font-serif text-3xl md:text-5xl text-white/90 tracking-[0.2em] font-light">
                        {weddingDate ? weddingDate.toLocaleDateString() : 'Set Date'}
                    </div>
                </div>
            </div>

            {/* 2. Floating Cards (Absolute Positioning matches Django) */}

            {/* Card 1: Schedule (Top Left) */}
            <Link href="/schedule">
                <div className="hidden md:block absolute top-[20%] left-[15%] z-30 hover:z-50 transition-all duration-300 animate-float cursor-pointer hover:scale-105">
                    <div className="glass-panel p-4 flex items-center gap-3 hover:bg-white/20 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                            <Calendar size={18} />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] text-white/60 uppercase tracking-wider">Next Event</p>
                            <p className="text-white text-sm font-bold">Dress Fitting</p>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Card 2: Budget (Bottom Left) */}
            <div className="hidden md:block absolute top-[65%] left-[12%] z-30 hover:z-50 transition-all duration-300 animate-float [animation-delay:-2s] cursor-pointer hover:scale-105">
                <div className="glass-panel p-4 flex flex-col items-center text-center hover:bg-white/20 transition-colors min-w-[140px]">
                    <p className="text-[10px] text-white/60 uppercase tracking-wider mb-2">Budget Used</p>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                        <div
                            className="h-full bg-gradient-to-r from-primary-light to-primary w-[35%]"
                            style={{ width: `${Math.min((budget.used / budget.total) * 100, 100)}%` }}
                        ></div>
                    </div>
                    <p className="text-white text-xs font-bold">
                        {Math.round((budget.used / budget.total) * 100) || 0}% Complete
                    </p>
                </div>
            </div>

            {/* Card 3: Checklist (Top Right) */}
            <Link href="/checklist">
                <div className="hidden md:block absolute top-[18%] right-[15%] z-30 hover:z-50 transition-all duration-300 animate-float [animation-delay:-4s] cursor-pointer hover:scale-105">
                    <div className="glass-panel p-4 flex items-center gap-3 hover:bg-white/20 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-[#FF8E8E] flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-red-500/30">
                            {tasks.total - tasks.completed}
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] text-white/60 uppercase tracking-wider">To-Do</p>
                            <p className="text-white text-sm font-bold">Remaining Tasks</p>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Card 4: Vendors (Middle Right) */}
            <Link href="/vendors">
                <div className="hidden md:block absolute top-[45%] right-[10%] z-30 hover:z-50 transition-all duration-300 animate-float [animation-delay:-1s] cursor-pointer hover:scale-105">
                    <div className="glass-panel p-3 flex items-center gap-3 hover:bg-white/20 transition-colors">
                        <div className="p-2 rounded-full bg-white/10">
                            <MapPin size={16} className="text-white" />
                        </div>
                        <div className="text-left">
                            <span className="text-white text-xs font-bold block">My Vendors</span>
                            <span className="text-white/50 text-[10px]">3 Selected</span>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Card 5: Community (Bottom Right) */}
            <Link href="/community">
                <div className="hidden md:block absolute top-[70%] right-[18%] z-30 hover:z-50 transition-all duration-300 animate-float [animation-delay:-5s] cursor-pointer hover:scale-105">
                    <div className="glass-panel p-3 flex items-center gap-2 hover:bg-white/20 transition-colors">
                        <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-gray-300 border border-white"></div>
                            <div className="w-6 h-6 rounded-full bg-gray-400 border border-white"></div>
                            <div className="w-6 h-6 rounded-full bg-gray-500 border border-white"></div>
                        </div>
                        <span className="text-white text-xs font-medium ml-2">+12 New</span>
                    </div>
                </div>
            </Link>

            {/* Card 8: Quote (Center Bottom) */}
            <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-20 animate-fade-in-up [animation-delay:0.5s]">
                <div className="glass-panel px-6 py-3 text-center backdrop-blur-md bg-white/5 border-white/10">
                    <p className="font-serif italic text-white/80 text-sm tracking-wide">"Together is a beautiful place to be"</p>
                </div>
            </div>

            {/* Mobile View: Simple Grid (Fallback) */}
            <div className="md:hidden absolute bottom-[15%] w-full px-6 grid grid-cols-2 gap-3 z-30">
                <Link href="/schedule" className="glass-panel p-4 flex flex-col items-center justify-center text-center">
                    <Calendar className="text-white mb-2" size={20} />
                    <span className="text-white text-xs font-bold">Schedule</span>
                </Link>
                <Link href="/checklist" className="glass-panel p-4 flex flex-col items-center justify-center text-center">
                    <CheckSquare className="text-white mb-2" size={20} />
                    <span className="text-white text-xs font-bold">Checklist</span>
                </Link>
            </div>

        </div>
    )
}
