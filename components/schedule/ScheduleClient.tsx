'use client'

import { useState } from 'react'
import { Task, updateTaskDate } from '@/actions/checklist'
import { DDayAction, TimelineEvent } from '@/lib/logic/wedding'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle, Star, Plus, ArrowRight, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ScheduleClientProps {
    initialTasks: Task[]
    weddingDate: string | null // YYYY-MM-DD
    dDay: number | null
    dDayActions: DDayAction[]
    timelineEvents: TimelineEvent[]
}

export default function ScheduleClient({ initialTasks, weddingDate, dDay, dDayActions, timelineEvents }: ScheduleClientProps) {
    const router = useRouter()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [tasks, setTasks] = useState(initialTasks)

    // Calendar Gen
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

    // Handlers
    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

    const handleDrop = async (e: React.DragEvent, date: Date) => {
        e.preventDefault()
        const taskId = e.dataTransfer.getData("taskId")
        if (!taskId) return

        const dateStr = format(date, 'yyyy-MM-dd')
        if (confirm(`이 할 일을 ${dateStr}로 이동하시겠습니까?`)) {
            // Optimistic
            setTasks(tasks.map(t => t.id === taskId ? { ...t, due_date: dateStr } : t))
            await updateTaskDate(taskId as string, dateStr)
            router.refresh()
        }
    }

    return (
        <div className="max-w-[1200px] mx-auto pb-20 animate-in fade-in duration-700">

            {/* 1. Calendar Section */}
            <section className="mb-16">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight font-serif italic">Schedule</h2>
                    <div className="w-8 h-0.5 bg-gray-800 mx-auto mt-4 mb-2"></div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mt-2">Manage your wedding timeline</p>
                </div>

                <div className="bg-white rounded-[24px] shadow-xl border border-gray-100 overflow-hidden">
                    {/* Cal Header */}
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft /></button>
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-serif font-bold text-gray-800">
                                {format(currentDate, 'yyyy')}년 {format(currentDate, 'M')}월
                            </h3>
                            <button className="text-gray-400 hover:text-primary transition-colors">
                                <CalendarIcon size={20} />
                            </button>
                        </div>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight /></button>
                    </div>

                    {/* Legend */}
                    <div className="px-6 py-3 bg-gray-50/50 flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-primary/80"></span>
                            <span className="text-xs font-bold text-gray-500">일정</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                            <span className="text-xs font-bold text-gray-500">결혼식</span>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7 border-collapse min-h-[700px]">
                        {/* Weekday Headers */}
                        {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                            <div key={day} className={cn("text-center py-4 bg-gray-50/80 text-gray-500 font-medium text-sm border-b border-gray-100", i === 0 && "text-red-400", i === 6 && "text-blue-400")}>
                                {day}
                            </div>
                        ))}

                        {/* Days */}
                        {calendarDays.map((day, i) => {
                            const isToday = isSameDay(day, new Date())
                            const isWeddingDay = weddingDate ? isSameDay(day, new Date(weddingDate)) : false
                            const dayTasks = tasks.filter(t => t.due_date && isSameDay(new Date(t.due_date), day))
                            const isCurrentMonth = isSameMonth(day, currentDate)

                            return (
                                <div
                                    key={day.toISOString()}
                                    className={cn(
                                        "border-b border-r border-gray-100 p-2 min-h-[120px] relative transition-colors hover:bg-gray-50/50",
                                        !isCurrentMonth && "bg-gray-50/30 text-gray-300",
                                        isWeddingDay && "bg-gradient-to-br from-pink-50 to-purple-50"
                                    )}
                                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.backgroundColor = "rgba(255,142,142,0.1)" }}
                                    onDragLeave={(e) => { e.currentTarget.style.backgroundColor = "" }}
                                    onDrop={(e) => { e.currentTarget.style.backgroundColor = ""; handleDrop(e, day) }}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={cn(
                                            "text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full",
                                            isToday ? "bg-primary text-white shadow-sm" : (isCurrentMonth ? "text-gray-700" : "text-gray-300")
                                        )}>
                                            {format(day, 'd')}
                                        </span>
                                        {isWeddingDay && <span className="text-lg animate-bounce">💍</span>}
                                    </div>

                                    <div className="mt-2 flex flex-col gap-1 overflow-y-auto max-h-[90px]">
                                        {dayTasks.map(task => (
                                            <div
                                                key={task.id}
                                                draggable
                                                onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)}
                                                className="text-[10px] bg-primary/10 text-primary-dark px-2 py-1 rounded-md truncate font-bold cursor-move hover:bg-primary/20 transition-colors border border-primary/5"
                                                title={task.title}
                                            >
                                                {task.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* 2. Bezier Timeline Section */}
            <section className="mb-20">
                <div className="text-center mb-10">
                    <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-pink-50 text-pink-500 border border-pink-100 mb-3">
                        <CalendarIcon size={12} className="inline mr-1 mb-0.5" /> Timeline Flow
                    </span>
                    <h3 className="text-2xl font-extrabold text-gray-800">웨딩 준비 흐름</h3>
                    <p className="text-sm text-gray-400 mt-1">오늘부터 결혼식까지의 여정</p>
                </div>

                <TimelineGraph events={timelineEvents} totalDays={dDay || 100} />
            </section>


            {/* 3. D-Day Actions Section (Bento Grid) */}
            <BentoGrid dDay={dDay} />

        </div>
    )
}

// ─── Sub-components ───

function TimelineGraph({ events, totalDays }: { events: TimelineEvent[], totalDays: number }) {
    const width = 1000
    const height = 350
    const padding = { left: 50, right: 50 }
    const usableWidth = width - padding.left - padding.right
    const centerY = height / 2

    // Normalize D-Days: Left (Max D-Day) -> Right (D-Day 0)
    // Assume events have 'dDay' property representing "Days Remaining"
    const maxDDay = Math.max(...events.map(e => e.dDay), totalDays, 30)

    const graphPoints = events.map(e => {
        // Progress: 0 (Start) -> 1 (Wedding)
        let progress = 1 - (e.dDay / maxDDay)
        if (progress < 0) progress = 0
        if (progress > 1) progress = 1

        const x = padding.left + (usableWidth * progress)

        // Sine Wave: amplitude varies
        const amplitude = 50
        const y = centerY + Math.sin(progress * Math.PI * 2.5) * -amplitude

        return { ...e, x, y }
    }).sort((a, b) => a.x - b.x)

    // Generate Path
    if (graphPoints.length === 0) return null

    // Add Start Point (Today)
    const startPoint = {
        x: padding.left,
        y: centerY + Math.sin(0) * -50,
        title: 'Today',
        dDay: maxDDay
    }

    const allPoints = [startPoint, ...graphPoints]

    let d = `M ${allPoints[0].x} ${allPoints[0].y}`
    for (let i = 0; i < allPoints.length - 1; i++) {
        const p0 = allPoints[i]
        const p1 = allPoints[i + 1]
        const cp1x = p0.x + (p1.x - p0.x) * 0.5
        const cp1y = p0.y
        const cp2x = p1.x - (p1.x - p0.x) * 0.5
        const cp2y = p1.y
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`
    }

    return (
        <div className="relative w-full max-w-[1000px] mx-auto h-[350px] bg-white/40 backdrop-blur-xl rounded-[30px] shadow-sm border border-white/60 overflow-hidden mb-16">
            {/* Background Decoration */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200/40 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            <svg className="w-full h-full relative z-10" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#FF8E8E" />
                        <stop offset="100%" stopColor="#FFB5B5" />
                    </linearGradient>
                </defs>

                {/* Path Background */}
                <path d={d} fill="none" stroke="#e5e7eb" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 8" />
                {/* Active Path */}
                <path d={d} fill="none" stroke="url(#lineGrad)" strokeWidth="4" strokeLinecap="round" />

                {/* Nodes */}
                {allPoints.map((p, i) => (
                    <g key={i} transform={`translate(${p.x}, ${p.y})`} className="group cursor-pointer">
                        {/* Tooltip */}
                        <foreignObject x="-60" y="-85" width="120" height="70" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <div className="bg-white/90 backdrop-blur px-3 py-2 rounded-xl shadow-lg border border-pink-100 text-center">
                                <span className="block text-[10px] text-pink-500 font-bold mb-0.5">{p.dDay === 0 ? 'D-Day' : `D-${p.dDay}`}</span>
                                <span className="block text-xs font-bold text-gray-700 whitespace-nowrap">{p.title}</span>
                            </div>
                        </foreignObject>

                        <circle r="6" fill="white" stroke="#FF8E8E" strokeWidth="3" className="transition-all duration-300 group-hover:scale-150 group-hover:fill-pink-50" />
                        <circle r="12" fill="none" stroke="#FF8E8E" strokeWidth="1" className="opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-500" />

                        <foreignObject x="-50" y="15" width="100" height="30">
                            <div className="text-center">
                                <span className="bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-500 border border-white/50 group-hover:text-pink-600 transition-colors">
                                    {p.title}
                                </span>
                            </div>
                        </foreignObject>
                    </g>
                ))}
            </svg>
        </div>
    )
}


const BentoGrid = ({ dDay }: { dDay: number | null }) => {
    return (
        <div className="max-w-[1000px] mx-auto mb-20">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-extrabold text-gray-900 font-serif">
                        {dDay !== null ? <span className="text-primary">D-{dDay}</span> : "Wedding Day"} Checklist
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">오늘 꼭 챙겨야 할 중요 항목들</p>
                </div>
                <Link href="/checklist" className="group flex items-center gap-1 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all">
                    전체보기 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[180px]">
                {/* 1. Dynamic Recommendation */}
                <div className="col-span-1 md:col-span-2 row-span-1 bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100 to-transparent rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 mb-3">
                                <Sparkles size={20} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-800 mb-1">드레스 투어 예약하기</h4>
                            <p className="text-sm text-gray-500">인기 있는 드레스샵은 마감이 빠릅니다.</p>
                        </div>
                        <button className="self-start px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-700 transition-colors">
                            예약완료 표시
                        </button>
                    </div>
                </div>

                {/* 2. Budget Check */}
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mb-3">
                        <span className="font-bold">₩</span>
                    </div>
                    <h4 className="font-bold text-gray-800 mb-1">예산 점검</h4>
                    <p className="text-xs text-gray-400 mb-4">현재 35% 사용되었습니다.</p>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 w-[35%]"></div>
                    </div>
                </div>

                {/* 3. Add Custom */}
                <div className="border-2 border-dashed border-gray-200 rounded-[24px] flex flex-col items-center justify-center text-center p-6 text-gray-400 hover:border-primary hover:bg-pink-50/30 hover:text-primary cursor-pointer transition-all gap-3 group">
                    <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center transition-colors">
                        <Plus size={24} />
                    </div>
                    <span className="font-bold text-sm">직접 추가하기</span>
                </div>

            </div>
        </div>
    )
}
