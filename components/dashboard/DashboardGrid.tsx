'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, CheckSquare, Store, Users, ArrowRight } from 'lucide-react'

interface UpcomingTask {
    title: string
    dDay: number
    description: string | null
    category: string | null
    estimatedBudget: number | null
}

interface DashboardGridProps {
    user: any
    weddingDate: Date | null
    budget: { total: number; used: number }
    tasks: { total: number; completed: number }
    dDayText: string
    upcomingTasks?: UpcomingTask[]
    categoryBudgets?: Record<string, number>
}

export default function DashboardGrid({ user, weddingDate, budget, tasks, dDayText, upcomingTasks = [], categoryBudgets = {} }: DashboardGridProps) {
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
                className="lg:col-span-2 flex flex-col items-center justify-center text-center px-4 py-6 sm:px-8 sm:py-10 rounded-3xl relative overflow-hidden"
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

                <p className="text-white/50 text-[10px] tracking-[0.35em] uppercase mb-3 font-semibold relative z-10">
                    Your Beautiful Journey
                </p>

                {/* D-Day 숫자 — 골드 그라디언트 */}
                <h1
                    className="font-cinzel text-[4rem] sm:text-[6.5rem] md:text-[8.5rem] leading-none font-bold mb-4 relative z-10"
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
                    className="rounded-2xl p-6 relative"
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
                        <span className="text-white/50 text-xs text-right leading-relaxed">
                            {budget.used.toLocaleString()}원<br />
                            <span className="text-white/20">/ {budget.total.toLocaleString()}원</span>
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

                    {/* 카테고리별 예산 분류 바 */}
                    {Object.keys(categoryBudgets).length > 0 && budget.total > 0 && (
                        <div className="mt-3 space-y-1.5">
                            <p className="text-white/30 text-[9px] uppercase tracking-widest font-semibold">카테고리별</p>
                            <div className="w-full h-2 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.07)' }}>
                                {(() => {
                                    const COLORS = ['#D4A373', '#E8B98A', '#C49362', '#B07D4F', '#A06A3C']
                                    const entries = Object.entries(categoryBudgets)
                                    return entries.map(([, amount], i) => (
                                        <div
                                            key={i}
                                            className="h-full"
                                            style={{
                                                width: `${Math.round((amount / budget.total) * 100)}%`,
                                                background: COLORS[i % COLORS.length],
                                            }}
                                        />
                                    ))
                                })()}
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                                {(() => {
                                    const COLORS = ['#D4A373', '#E8B98A', '#C49362', '#B07D4F', '#A06A3C']
                                    return Object.entries(categoryBudgets).map(([cat, amount], i) => (
                                        <span key={cat} className="flex items-center gap-1 text-[9px] text-white/40">
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                            {cat} {Math.round((amount / budget.total) * 100)}%
                                        </span>
                                    ))
                                })()}
                            </div>
                        </div>
                    )}
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

            {/* ── 다음 할 일 카드 ── */}
            {upcomingTasks.length > 0 && (
                <motion.div
                    className="lg:col-span-3 rounded-2xl p-5 relative overflow-hidden"
                    style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(249,168,212,0.15)',
                        backdropFilter: 'blur(16px)',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                >
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(249,168,212,0.4), transparent)' }} />

                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#F9A8D4]" />
                            <p className="text-[#F9A8D4]/70 text-[10px] uppercase tracking-widest font-semibold">Next To-Do</p>
                        </div>
                        <Link href="/checklist" className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/50 transition-colors">
                            전체 보기 <ArrowRight size={10} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {upcomingTasks.map((task, i) => (
                            <div
                                key={i}
                                className="rounded-xl px-4 py-3.5"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                                <div className="flex items-center gap-2.5 mb-2">
                                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-500/20 text-pink-300 whitespace-nowrap">
                                        D-{task.dDay}
                                    </span>
                                    {task.category && (
                                        <span className="text-[9px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded-full truncate">
                                            {task.category}
                                        </span>
                                    )}
                                </div>
                                <p className="text-white/80 text-sm font-semibold mb-1 truncate">{task.title}</p>
                                {task.description && (
                                    <p className="text-white/35 text-xs leading-relaxed line-clamp-2 mb-2">{task.description}</p>
                                )}
                                {task.estimatedBudget && task.estimatedBudget > 0 && (
                                    <p className="text-[10px] text-[#D4A373]/70 font-medium">
                                        💰 {task.estimatedBudget.toLocaleString()}원
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

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
