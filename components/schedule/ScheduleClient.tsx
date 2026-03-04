'use client'

import { useState } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, differenceInDays } from 'date-fns'
import { ChevronLeft, ChevronRight, CalendarDays, Clock, MapPin, CheckCircle, Plus, Sparkles, Gift, Shirt, X, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSchedule } from '@/contexts/ScheduleContext'
import { Database } from '@/lib/types/database.types'
import { WEDDING_RECOMMENDATIONS } from '@/lib/constants/wedding-recommendations'

type DbTask = Database['public']['Tables']['tasks']['Row']

export default function ScheduleClient({ weddingDate, checklistTasks = [] }: { weddingDate?: string | null, checklistTasks?: DbTask[] }) {
    const router = useRouter()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalTab, setModalTab] = useState<'schedule' | 'memo'>('schedule')
    const [scheduleTitle, setScheduleTitle] = useState('')
    const [scheduleLocation, setScheduleLocation] = useState('')
    const [scheduleTime, setScheduleTime] = useState('')
    const [memoContent, setMemoContent] = useState('')

    const { events: sharedEvents, addEvent, getEventsForDate } = useSchedule()

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

    const dayNames = ['일', '월', '화', '수', '목', '금', '토']

    const handleDateClick = (day: Date) => {
        setSelectedDate(day)
        setIsModalOpen(true)
        setModalTab('schedule')
        setScheduleTitle('')
        setScheduleLocation('')
        setScheduleTime('')
        setMemoContent('')
    }

    const handleSaveSchedule = () => {
        if (!selectedDate || !scheduleTitle) return
        addEvent({
            title: scheduleTitle,
            date: format(selectedDate, 'yyyy-MM-dd'),
            time: scheduleTime || undefined,
            location: scheduleLocation || undefined,
            type: 'schedule',
        })
        setIsModalOpen(false)
    }

    const handleSaveMemo = () => {
        if (!selectedDate || !memoContent) return
        addEvent({
            title: '메모',
            date: format(selectedDate, 'yyyy-MM-dd'),
            type: 'memo',
            memo: memoContent,
        })
        setIsModalOpen(false)
    }

    const today = new Date()
    const todayStr = format(today, 'yyyy-MM-dd')

    const dbChecklistEvents = checklistTasks
        .filter(t => t.due_date)
        .map(t => ({
            id: t.id,
            title: t.title,
            date: t.due_date!,
            type: 'checklist' as const,
            checklistId: t.id,
            time: undefined,
            location: undefined,
            memo: undefined,
        }))

    const allEvents = [
        ...sharedEvents.filter(e => e.type !== 'checklist'),
        ...dbChecklistEvents,
        ...(weddingDate ? [{
            id: 'wedding-day',
            title: '결혼식',
            date: weddingDate,
            type: 'schedule' as const,
        }] : [])
    ]

    const upcomingEvents = allEvents
        .filter(e => e.type === 'schedule' && e.date >= todayStr)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 3)

    const getDDay = (dateStr: string): string => {
        const eventDate = new Date(dateStr + 'T00:00:00')
        const diff = differenceInDays(eventDate, today)
        if (diff === 0) return 'D-Day'
        if (diff > 0) return `D-${diff}`
        return `D+${Math.abs(diff)}`
    }

    const openAddModal = () => {
        setSelectedDate(new Date())
        setIsModalOpen(true)
        setModalTab('schedule')
        setScheduleTitle('')
        setScheduleLocation('')
        setScheduleTime('')
    }

    // Event indicators
    const hasEvent = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        return allEvents.some(e => e.date === dateStr && (e.type === 'schedule' || e.type === 'checklist'))
    }
    const hasMemo = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        return allEvents.some(e => e.date === dateStr && e.type === 'memo')
    }
    const hasChecklist = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        return allEvents.some(e => e.date === dateStr && e.type === 'checklist')
    }
    const hasWedding = (day: Date) => {
        if (!weddingDate) return false
        return format(day, 'yyyy-MM-dd') === weddingDate
    }

    return (
        <div className="max-w-[1100px] mx-auto px-4 pb-20">
            {/* Header */}
            <div className="text-center mb-10">
                <h2 className="font-serif italic text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-2">
                    Schedule
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-pink-400"></div>
                    <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                    <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-pink-400"></div>
                </div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-4">Manage your wedding timeline</p>
            </div>

            {/* Calendar Card */}
            <div className="shadow-xl rounded-[24px] overflow-hidden border border-gray-100 bg-white mb-16 mx-2 md:mx-6">

                {/* Calendar Header — 년월 글씨 축소 */}
                <div className="flex items-center justify-between px-6 md:px-10 py-5">
                    <button
                        onClick={prevMonth}
                        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-gray-400"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div className="flex items-center gap-2">
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 tracking-tight">
                            {format(currentDate, 'yyyy')}년 {format(currentDate, 'M')}월
                        </h3>
                        <button className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-pink-500 transition-colors">
                            <CalendarDays size={15} />
                        </button>
                    </div>

                    <button
                        onClick={nextMonth}
                        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-gray-400"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Legend — 오른쪽 정렬 */}
                <div className="flex items-center justify-end gap-3 md:gap-5 px-6 md:px-10 pb-3">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="text-[11px] font-bold text-gray-400">일정</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        <span className="text-[11px] font-bold text-gray-400">메모</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                        <span className="text-[11px] font-bold text-gray-400">결혼식</span>
                    </div>
                </div>

                {/* Calendar Grid — gap으로 셀 간격 */}
                <div className="px-3 md:px-6 pb-5">
                    {/* Day Names Header */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                        {dayNames.map((day, i) => (
                            <div
                                key={day}
                                className={`py-2.5 text-[12px] font-extrabold text-center rounded-lg bg-gray-50
                                    ${i === 0 ? 'text-pink-300' : i === 6 ? 'text-blue-500' : 'text-gray-500'}
                                `}
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Cells */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day) => {
                            const isCurrentMonth = isSameMonth(day, monthStart)
                            const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString()
                            const isSunday = day.getDay() === 0
                            const isSaturday = day.getDay() === 6
                            const dayHasEvent = hasEvent(day)
                            const dayHasMemo = hasMemo(day)
                            const dayHasChecklist = hasChecklist(day)
                            const dayHasWedding = hasWedding(day)

                            return (
                                <div
                                    key={day.toISOString()}
                                    className="aspect-square"
                                >
                                    {isCurrentMonth ? (
                                        <div
                                            className={`h-full p-1 sm:p-2 rounded-lg transition-all cursor-pointer relative
                                                ${isToday(day) ? 'ring-2 ring-inset ring-pink-300 bg-pink-50/50 shadow-sm' : 'bg-gray-50/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'}
                                                ${isSelected && !isToday(day) ? 'ring-2 ring-inset ring-pink-200 bg-white shadow-sm' : ''}
                                                hover:bg-pink-50/40 hover:shadow-sm
                                            `}
                                            onClick={() => handleDateClick(day)}
                                        >
                                            <span
                                                className={`text-[13px] font-semibold
                                                    ${isToday(day) ? 'text-pink-400 font-bold' : ''}
                                                    ${isSunday && !isToday(day) ? 'text-pink-300' : ''}
                                                    ${isSaturday && !isToday(day) ? 'text-blue-400' : ''}
                                                    ${!isSunday && !isSaturday && !isToday(day) ? 'text-gray-500' : ''}
                                                `}
                                            >
                                                {format(day, 'd')}
                                            </span>

                                            {/* Event Pills — full on sm+, dots only on mobile */}
                                            <div className="hidden sm:flex flex-col gap-0.5 mt-1">
                                                {dayHasEvent && (
                                                    <div className="text-[8px] px-1 py-0.5 rounded bg-emerald-50 text-emerald-500 font-medium truncate flex items-center gap-0.5">
                                                        <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0"></span>
                                                        일정
                                                    </div>
                                                )}
                                                {dayHasMemo && (
                                                    <div className="text-[8px] px-1 py-0.5 rounded bg-blue-50 text-blue-400 font-medium truncate flex items-center gap-0.5">
                                                        <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0"></span>
                                                        메모
                                                    </div>
                                                )}
                                                {dayHasChecklist && (
                                                    <div className="text-[8px] px-1 py-0.5 rounded bg-pink-50 text-pink-300 font-medium truncate flex items-center gap-0.5">
                                                        <span className="w-1 h-1 rounded-full bg-pink-400 shrink-0"></span>
                                                        체크
                                                    </div>
                                                )}
                                                {dayHasWedding && (
                                                    <div className="text-[8px] px-1 py-0.5 rounded bg-pink-100 text-pink-500 font-bold truncate flex items-center gap-0.5 border border-pink-200 shadow-sm">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0 animate-pulse"></span>
                                                        결혼식
                                                    </div>
                                                )}
                                            </div>
                                            {/* Mobile: dot indicators only */}
                                            <div className="flex sm:hidden gap-0.5 mt-1 justify-center">
                                                {dayHasEvent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                                                {dayHasMemo && <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
                                                {dayHasChecklist && <span className="w-1.5 h-1.5 rounded-full bg-pink-300"></span>}
                                                {dayHasWedding && <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full rounded-lg bg-gray-50/20 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"></div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-12 opacity-40">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <span className="text-gray-300 text-xs">✦</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            {/* ① 다가오는 일정 */}
            <section className="mb-16">
                <div className="text-center mb-8">
                    <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-pink-50 text-pink-400 border border-pink-100 mb-3">
                        Upcoming
                    </span>
                    <h3 className="text-2xl font-extrabold text-gray-800">다가오는 일정</h3>
                    <p className="text-sm text-gray-400 mt-1">
                        {upcomingEvents.length > 0
                            ? `달력에 등록된 일정 중 가장 가까운 ${upcomingEvents.length}건`
                            : '달력에서 날짜를 클릭해 일정을 추가하세요'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 실제 일정 카드 */}
                    {upcomingEvents.map((event) => (
                        <div
                            key={event.id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                            {/* 상단 골드 액센트 라인 */}
                            <div className="h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
                            <div className="p-5">
                                {/* D-Day — 골드 그라디언트 (대시보드 스타일) */}
                                <p
                                    className="font-cinzel text-4xl font-bold leading-none mb-3"
                                    style={{
                                        background: 'linear-gradient(135deg, #EDD5A3, #D4A373, #B8845A)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    {getDDay(event.date)}
                                </p>
                                <h4 className="font-bold text-gray-800 text-[15px] mb-4 leading-snug">
                                    {event.title}
                                </h4>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <CalendarDays size={11} className="text-gray-300 shrink-0" />
                                        {format(new Date(event.date + 'T00:00:00'), 'yyyy년 M월 d일')}
                                    </div>
                                    {event.time && (
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <Clock size={11} className="text-gray-300 shrink-0" />
                                            {event.time}
                                        </div>
                                    )}
                                    {event.location && (
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <MapPin size={11} className="text-gray-300 shrink-0" />
                                            {event.location}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* 빈 슬롯 → 직접 추가하기 카드 */}
                    {Array.from({ length: Math.max(0, 3 - upcomingEvents.length) }).map((_, i) => (
                        <button
                            key={`add-${i}`}
                            onClick={openAddModal}
                            className="bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm overflow-hidden hover:border-pink-200 hover:shadow-md transition-all flex flex-col items-center justify-center py-10 gap-3 group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center group-hover:border-pink-200 group-hover:bg-pink-50/40 transition-all">
                                <Plus size={20} className="text-gray-300 group-hover:text-pink-400 transition-colors" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-300 group-hover:text-gray-400 transition-colors">일정 추가하기</p>
                                <p className="text-xs text-gray-200 mt-0.5 group-hover:text-gray-300 transition-colors">달력에서 날짜 선택</p>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* Divider */}
            <div className="flex items-center gap-4 my-12 opacity-40">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <span className="text-gray-300 text-xs">✦</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            {/* ② AI 추천 체크리스트 (결혼식 D-Day 기반) */}
            <section className="mb-16">
                <div className="text-center mb-8 flex flex-col items-center justify-center">
                    <span className="inline-flex px-4 py-1.5 rounded-full text-[10px] items-center justify-center gap-1 font-extrabold uppercase tracking-widest bg-emerald-50 text-emerald-500 border border-emerald-100 mb-3 whitespace-nowrap">
                        <Sparkles size={12} className="text-emerald-400" />
                        AI Recommended
                    </span>
                    <h3 className="text-2xl font-extrabold text-gray-800">AI 추천 체크리스트</h3>
                    <p className="text-sm text-gray-400 mt-1">
                        현재 D-Day에 맞춰 꼭 필요한 준비 사항을 AI가 추천해 드립니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(() => {
                        // 1. Calculate D-Day for AI Recommendations
                        let currentDDay = 999;
                        if (weddingDate) {
                            const eventDate = new Date(weddingDate + 'T00:00:00');
                            currentDDay = differenceInDays(eventDate, today);
                        }

                        // 2. Find matching recommendations based on D-Day
                        let recommendedTasks: { title: string, description: string }[] = [];
                        let recMinDDay = 0;
                        let recMaxDDay = 0;
                        const match = WEDDING_RECOMMENDATIONS.find(
                            (rec) => currentDDay <= rec.maxDDay && currentDDay >= rec.minDDay
                        );

                        if (match) {
                            recommendedTasks = match.tasks;
                            recMinDDay = match.minDDay;
                            recMaxDDay = match.maxDDay;
                        } else if (currentDDay > 1000) {
                            recommendedTasks = WEDDING_RECOMMENDATIONS[0].tasks;
                            recMinDDay = WEDDING_RECOMMENDATIONS[0].minDDay;
                            recMaxDDay = WEDDING_RECOMMENDATIONS[0].maxDDay;
                        } else {
                            recommendedTasks = WEDDING_RECOMMENDATIONS[WEDDING_RECOMMENDATIONS.length - 1].tasks;
                            recMinDDay = WEDDING_RECOMMENDATIONS[WEDDING_RECOMMENDATIONS.length - 1].minDDay;
                            recMaxDDay = WEDDING_RECOMMENDATIONS[WEDDING_RECOMMENDATIONS.length - 1].maxDDay;
                        }

                        const displayTasks = recommendedTasks.slice(0, 3);
                        const ddayLabel = currentDDay === 0 ? 'D-Day' : (currentDDay > 0 ? `D-${currentDDay}` : `D+${Math.abs(currentDDay)}`);
                        const recPeriod = recMaxDDay === 1000 ? 'D-300 이전' : recMinDDay === -999 ? '예식 후' : recMinDDay === 0 ? `D-${recMaxDDay} ~ D-Day` : `D-${recMaxDDay} ~ D-${recMinDDay}`;
                        const icons = [CheckCircle, Gift, Shirt]

                        return displayTasks.map((taskItem, i) => {
                            const Icon = icons[i % icons.length]

                            return (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col h-full">
                                    {/* 상단 골드 액센트 라인 — 다가오는 일정과 동일 */}
                                    <div className="h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
                                    <div className="p-5 flex-1 flex flex-col">
                                        {/* 추천시기 — 강조 배지 */}
                                        <div
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-extrabold mb-4 w-fit shadow-sm"
                                            style={{
                                                background: 'linear-gradient(135deg, #059669, #10B981)',
                                                color: '#fff',
                                            }}
                                        >
                                            <Sparkles size={12} />
                                            추천시기 {recPeriod}
                                        </div>

                                        {/* 타이틀 — 다가오는 일정과 유사한 크기감 */}
                                        <h4 className="font-bold text-gray-800 text-[15px] mb-2 leading-snug">{taskItem.title}</h4>
                                        <p className="text-xs text-gray-400 leading-relaxed mb-5 flex-1">
                                            {taskItem.description}
                                        </p>

                                        {/* 나의 일정 참고 영역 */}
                                        <div className="space-y-1.5 pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <CalendarDays size={11} className="text-gray-300 shrink-0" />
                                                나의 웨딩 D-day: <span className="font-bold text-gray-500">{weddingDate ? ddayLabel : '미정'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <Icon size={11} className="text-gray-300 shrink-0" />
                                                {taskItem.title}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    })()}
                </div>
            </section>

            {/* ─── 날짜 클릭 모달: 일정/메모 등록 ─── */}
            {isModalOpen && selectedDate && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-indigo-950/30 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)', padding: '1.5rem 2rem' }}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:20px_20px]"></div>
                            <div className="relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 text-white shadow-sm border border-white/20">
                                    <CalendarDays size={20} />
                                </div>
                                <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest mb-1">일정 등록</p>
                                <h3 className="font-bold text-xl text-white">
                                    {format(selectedDate, 'yyyy년 M월 d일')}
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Tab Switch */}
                        <div className="flex border-b border-gray-100">
                            <button
                                onClick={() => setModalTab('schedule')}
                                className={`flex-1 py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors
                                    ${modalTab === 'schedule' ? 'text-indigo-500 border-b-2 border-indigo-500 bg-indigo-50/30' : 'text-gray-400 hover:text-gray-600'}
                                `}
                            >
                                <Calendar size={15} />
                                일정 등록
                            </button>
                            <button
                                onClick={() => setModalTab('memo')}
                                className={`flex-1 py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors
                                    ${modalTab === 'memo' ? 'text-indigo-500 border-b-2 border-indigo-500 bg-indigo-50/30' : 'text-gray-400 hover:text-gray-600'}
                                `}
                            >
                                <FileText size={15} />
                                메모 작성
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {modalTab === 'schedule' ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                            <CalendarDays size={12} className="text-indigo-400" /> 일정 제목
                                        </label>
                                        <input
                                            type="text"
                                            value={scheduleTitle}
                                            onChange={(e) => setScheduleTitle(e.target.value)}
                                            placeholder="예: 드레스 피팅, 스튜디오 촬영"
                                            className="w-full bg-indigo-50/30 border-2 border-indigo-100 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                            <Clock size={12} className="text-indigo-400" /> 시간
                                        </label>
                                        <input
                                            type="time"
                                            value={scheduleTime}
                                            onChange={(e) => setScheduleTime(e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                            <MapPin size={12} className="text-indigo-400" /> 장소
                                        </label>
                                        <input
                                            type="text"
                                            value={scheduleLocation}
                                            onChange={(e) => setScheduleLocation(e.target.value)}
                                            placeholder="예: 강남 드레스샵"
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSaveSchedule}
                                        className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
                                        style={{
                                            background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                                        }}
                                    >
                                        <Calendar size={16} />
                                        일정 저장하기
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                            <FileText size={12} className="text-indigo-400" /> 메모 내용
                                        </label>
                                        <textarea
                                            value={memoContent}
                                            onChange={(e) => setMemoContent(e.target.value)}
                                            placeholder="이 날짜에 대한 메모를 작성하세요..."
                                            rows={5}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 resize-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSaveMemo}
                                        className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
                                        style={{
                                            background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                                        }}
                                    >
                                        <FileText size={16} />
                                        메모 저장하기
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
