'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, CheckSquare, Store, Users } from 'lucide-react'

interface DashboardGridProps {
    user: any
    weddingDate: Date | null
    budget: { total: number; used: number }
    tasks: { total: number; completed: number }
    dDayText: string
}

export default function DashboardGrid({ user, weddingDate, budget, tasks, dDayText }: DashboardGridProps) {
    const budgetPct = budget.total > 0 ? Math.round((budget.used / budget.total) * 100) : 0
    const taskPct = tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0

    const navItems = [
        { name: 'Schedule', href: '/schedule', icon: Calendar, desc: '일정 관리', color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
        { name: 'Checklist', href: '/checklist', icon: CheckSquare, desc: '체크리스트', color: '#A7C4A0', bg: 'rgba(167,196,160,0.12)' },
        { name: 'Places', href: '/places', icon: Store, desc: '장소 분석', color: '#D4A373', bg: 'rgba(212,163,115,0.12)' },
        { name: 'Community', href: '/community', icon: Users, desc: '커뮤니티', color: '#F9A8D4', bg: 'rgba(249,168,212,0.12)' },
    ]

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 py-4">

            {/* ── D-Day Card ── */}
            <motion.div
                className="lg:col-span-2 flex flex-col items-center justify-center text-center px-8 py-10 rounded-3xl relative overflow-hidden"
                style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(16px)',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* 배경 글로우 */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(212,163,115,0.08) 0%, transparent 70%)',
                    }}
                />
                {/* 상단 골드 라인 */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-2/5 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(212,163,115,0.6), transparent)' }}
                />

                <p className="text-white/35 text-[10px] tracking-[0.35em] uppercase mb-3 font-semibold relative z-10">
                    Your Beautiful Journey
                </p>

                {/* D-Day 숫자 — 골드 그라디언트 */}
                <h1
                    className="font-cinzel text-[6.5rem] md:text-[8.5rem] leading-none font-bold mb-4 relative z-10"
                    style={{
                        background: 'linear-gradient(160deg, #EDD5A3 0%, #D4A373 40%, #B8845A 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'drop-shadow(0 0 30px rgba(212,163,115,0.3))',
                    }}
                >
                    {dDayText}
                </h1>

                <p className="text-white/55 text-xl md:text-2xl tracking-[0.15em] font-light mb-5 relative z-10">
                    {weddingDate
                        ? weddingDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
                        : '날짜 미설정'}
                </p>

                <div
                    className="px-5 py-2 rounded-2xl relative z-10"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                    <p className="font-cursive italic text-white/40 text-sm">
                        &ldquo;Together is a beautiful place to be&rdquo;
                    </p>
                </div>
            </motion.div>

            {/* ── 오른쪽: Budget + Tasks ── */}
            <div className="flex flex-col gap-4">

                {/* Budget Card */}
                <motion.div
                    className="rounded-2xl p-6 flex-1 relative overflow-hidden"
                    style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(212,163,115,0.15)',
                        backdropFilter: 'blur(16px)',
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    {/* 상단 골드 라인 */}
                    <div
                        className="absolute top-0 left-0 right-0 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,163,115,0.5), transparent)' }}
                    />

                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4A373]" />
                        <p className="text-[#D4A373]/70 text-[10px] uppercase tracking-widest font-semibold">Budget</p>
                    </div>

                    <div className="flex items-end justify-between mb-3">
                        <span
                            className="text-2xl font-bold"
                            style={{
                                background: 'linear-gradient(135deg, #EDD5A3, #D4A373)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            {budgetPct}%
                        </span>
                        <span className="text-white/35 text-xs text-right leading-relaxed">
                            {budget.used.toLocaleString()}만 ₩<br />
                            <span className="text-white/20">/ {budget.total.toLocaleString()}만 ₩</span>
                        </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #D4A373, #EDD5A3)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${budgetPct}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                        />
                    </div>
                    <p className="text-white/25 text-[10px] mt-2">사용됨</p>
                </motion.div>

                {/* Task Card */}
                <motion.div
                    className="rounded-2xl p-6 flex-1 relative overflow-hidden"
                    style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(167,196,160,0.15)',
                        backdropFilter: 'blur(16px)',
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {/* 상단 세이지 라인 */}
                    <div
                        className="absolute top-0 left-0 right-0 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(167,196,160,0.5), transparent)' }}
                    />

                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#A7C4A0]" />
                        <p className="text-[#A7C4A0]/70 text-[10px] uppercase tracking-widest font-semibold">Checklist</p>
                    </div>

                    <div className="flex items-end justify-between mb-3">
                        <span className="text-2xl font-bold text-white">
                            {tasks.completed}
                            <span className="text-white/25 text-base font-normal"> / {tasks.total}</span>
                        </span>
                        <span
                            className="text-xs font-semibold"
                            style={{
                                background: 'linear-gradient(135deg, #A7C4A0, #6BAE68)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            {taskPct}% 완료
                        </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #A7C4A0, #6BAE68)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${taskPct}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                        />
                    </div>
                    <p className="text-white/25 text-[10px] mt-2">할 일 완료</p>
                </motion.div>
            </div>

            {/* ── 하단 빠른 이동 ── */}
            <motion.div
                className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                {navItems.map(({ name, href, icon: Icon, desc, color, bg }) => (
                    <Link
                        key={href}
                        href={href}
                        className="flex flex-col items-center justify-center gap-2.5 py-5 px-4 rounded-2xl transition-all group relative overflow-hidden"
                        style={{
                            background: 'rgba(255,255,255,0.035)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            backdropFilter: 'blur(12px)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = bg
                            e.currentTarget.style.borderColor = `${color}35`
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.035)'
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                        }}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                            style={{ background: `${color}18` }}
                        >
                            <Icon className="w-5 h-5 transition-colors" style={{ color }} />
                        </div>
                        <span className="text-white/80 font-semibold text-sm group-hover:text-white transition-colors">{name}</span>
                        <span className="text-white/30 text-xs group-hover:text-white/50 transition-colors">{desc}</span>
                    </Link>
                ))}
            </motion.div>

        </div>
    )
}
