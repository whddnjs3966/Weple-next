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
    const [scheduleTime, setScheduleTime] = useState('09:00')
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
        setScheduleTime('09:00')
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
        setScheduleTime('09:00')
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
                                                ${isToday(day) ? 'ring-2 ring-inset ring-pink-300 bg-pink-50/50 shadow-sm' : ''}
                                                ${isSelected && !isToday(day) ? 'ring-2 ring-inset ring-pink-200 bg-white shadow-sm' : ''}
                                                ${!isToday(day) && !isSelected && (dayHasEvent || dayHasMemo || dayHasChecklist)
                                                    ? 'bg-white shadow-md border border-gray-100'
                                                    : !isToday(day) && !isSelected ? 'bg-gray-50/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]' : ''}
                                                hover:bg-pink-50/40 hover:shadow-md
                                            `}
                                            onClick={() => handleDateClick(day)}
                                        >
                                            {/* 일정이 있는 날짜 상단 컬러 바 */}
                                            {(dayHasEvent || dayHasMemo || dayHasChecklist) && !dayHasWedding && (
                                                <div className="absolute top-0 left-1 right-1 h-[3px] rounded-b-full bg-gradient-to-r from-emerald-400 via-blue-400 to-pink-400 opacity-60" />
                                            )}
                                            {dayHasWedding && (
                                                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-b-sm bg-gradient-to-r from-pink-400 via-rose-500 to-pink-400 animate-pulse" />
                                            )}

                                            <span
                                                className={`text-[13px] font-semibold
                                                    ${isToday(day) ? 'text-pink-400 font-bold' : ''}
                                                    ${isSunday && !isToday(day) ? 'text-pink-300' : ''}
                                                    ${isSaturday && !isToday(day) ? 'text-blue-400' : ''}
                                                    ${!isSunday && !isSaturday && !isToday(day) ? 'text-gray-600' : ''}
                                                `}
                                            >
                                                {format(day, 'd')}
                                            </span>

                                            {/* Event Pills — full on sm+, dots only on mobile */}
                                            <div className="hidden sm:flex flex-col gap-0.5 mt-1">
                                                {dayHasEvent && (
                                                    <div className="text-[8px] px-1 py-0.5 rounded-md bg-emerald-100 text-emerald-600 font-bold truncate flex items-center gap-0.5 shadow-sm">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                                        일정
                                                    </div>
                                                )}
                                                {dayHasMemo && (
                                                    <div className="text-[8px] px-1 py-0.5 rounded-md bg-blue-100 text-blue-600 font-bold truncate flex items-center gap-0.5 shadow-sm">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                                                        메모
                                                    </div>
                                                )}
                                                {dayHasChecklist && (
                                                    <div className="text-[8px] px-1 py-0.5 rounded-md bg-pink-100 text-pink-500 font-bold truncate flex items-center gap-0.5 shadow-sm">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0"></span>
                                                        체크
                                                    </div>
                                                )}
                                                {dayHasWedding && (
                                                    <div className="text-[8px] px-1 py-0.5 rounded-md bg-pink-200 text-pink-600 font-extrabold truncate flex items-center gap-0.5 border border-pink-300 shadow-md">
                                                        <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0 animate-pulse"></span>
                                                        결혼식
                                                    </div>
                                                )}
                                            </div>
                                            {/* Mobile: dot indicators — larger and more vivid */}
                                            <div className="flex sm:hidden gap-1 mt-1 justify-center">
                                                {dayHasEvent && <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-300"></span>}
                                                {dayHasMemo && <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-300"></span>}
                                                {dayHasChecklist && <span className="w-2 h-2 rounded-full bg-pink-400 shadow-sm shadow-pink-300"></span>}
                                                {dayHasWedding && <span className="w-2 h-2 rounded-full bg-pink-600 animate-pulse shadow-sm shadow-pink-400"></span>}
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
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="일정 등록">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full sm:max-w-[420px] bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 fade-in duration-300 max-h-[90vh] overflow-y-auto">

                        {/* Compact Header */}
                        <div className="relative px-6 pt-6 pb-4">
                            {/* Drag indicator (mobile) */}
                            <div className="sm:hidden w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4" />

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-1">Schedule</p>
                                    <h3 className="font-bold text-lg text-gray-900">
                                        {format(selectedDate, 'M월 d일')}
                                        <span className="text-gray-300 font-normal text-sm ml-1.5">
                                            {['일', '월', '화', '수', '목', '금', '토'][selectedDate.getDay()]}요일
                                        </span>
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    aria-label="닫기"
                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Tab Pills */}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setModalTab('schedule')}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all
                                        ${modalTab === 'schedule'
                                            ? 'bg-gray-900 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'}
                                    `}
                                >
                                    <Calendar size={12} />
                                    일정
                                </button>
                                <button
                                    onClick={() => setModalTab('memo')}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all
                                        ${modalTab === 'memo'
                                            ? 'bg-gray-900 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'}
                                    `}
                                >
                                    <FileText size={12} />
                                    메모
                                </button>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100" />

                        {/* Modal Body */}
                        <div className="p-6">
                            {modalTab === 'schedule' ? (
                                <div className="space-y-5">
                                    {/* 일정 제목 */}
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-500 mb-2 block">일정 제목</label>
                                        <input
                                            type="text"
                                            value={scheduleTitle}
                                            onChange={(e) => setScheduleTitle(e.target.value)}
                                            placeholder="예: 드레스 피팅, 스튜디오 촬영"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-800 outline-none transition-all focus:border-pink-300 focus:bg-white focus:ring-4 focus:ring-pink-50 placeholder-gray-300"
                                        />
                                    </div>

                                    {/* 시간 — 커스텀 시간 선택 UI */}
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-500 mb-2 block">시간</label>
                                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                            {/* 오전/오후 토글 */}
                                            <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const [h, m] = scheduleTime.split(':').map(Number)
                                                        const newH = h >= 12 ? h - 12 : h
                                                        setScheduleTime(`${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
                                                    }}
                                                    className={`px-3.5 py-3 text-xs font-bold transition-all ${
                                                        parseInt(scheduleTime.split(':')[0]) < 12
                                                            ? 'bg-pink-400 text-white shadow-sm'
                                                            : 'text-gray-400 hover:text-gray-600'
                                                    }`}
                                                >
                                                    오전
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const [h, m] = scheduleTime.split(':').map(Number)
                                                        const newH = h < 12 ? h + 12 : h
                                                        setScheduleTime(`${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
                                                    }}
                                                    className={`px-3.5 py-3 text-xs font-bold transition-all ${
                                                        parseInt(scheduleTime.split(':')[0]) >= 12
                                                            ? 'bg-pink-400 text-white shadow-sm'
                                                            : 'text-gray-400 hover:text-gray-600'
                                                    }`}
                                                >
                                                    오후
                                                </button>
                                            </div>

                                            {/* 시 선택 */}
                                            <select
                                                value={(() => {
                                                    let h = parseInt(scheduleTime.split(':')[0])
                                                    if (h === 0) h = 12
                                                    else if (h > 12) h -= 12
                                                    return String(h)
                                                })()}
                                                onChange={(e) => {
                                                    let h = parseInt(e.target.value)
                                                    const isPM = parseInt(scheduleTime.split(':')[0]) >= 12
                                                    if (isPM && h !== 12) h += 12
                                                    if (!isPM && h === 12) h = 0
                                                    const m = scheduleTime.split(':')[1]
                                                    setScheduleTime(`${String(h).padStart(2, '0')}:${m}`)
                                                }}
                                                className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-3 text-center text-sm font-bold text-gray-800 outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50 appearance-none cursor-pointer"
                                            >
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                                                    <option key={h} value={h}>{h}시</option>
                                                ))}
                                            </select>

                                            <span className="text-gray-300 font-bold text-lg">:</span>

                                            {/* 분 선택 */}
                                            <select
                                                value={scheduleTime.split(':')[1]}
                                                onChange={(e) => {
                                                    const h = scheduleTime.split(':')[0]
                                                    setScheduleTime(`${h}:${e.target.value}`)
                                                }}
                                                className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-3 text-center text-sm font-bold text-gray-800 outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50 appearance-none cursor-pointer"
                                            >
                                                {['00', '10', '20', '30', '40', '50'].map(m => (
                                                    <option key={m} value={m}>{m}분</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* 장소 */}
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-500 mb-2 block">장소 (선택)</label>
                                        <div className="relative">
                                            <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                            <input
                                                type="text"
                                                value={scheduleLocation}
                                                onChange={(e) => setScheduleLocation(e.target.value)}
                                                placeholder="예: 강남 드레스샵"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3.5 text-sm text-gray-800 outline-none transition-all focus:border-pink-300 focus:bg-white focus:ring-4 focus:ring-pink-50 placeholder-gray-300"
                                            />
                                        </div>
                                    </div>

                                    {/* 저장 버튼 */}
                                    <button
                                        onClick={handleSaveSchedule}
                                        disabled={!scheduleTitle}
                                        className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
                                        style={{
                                            background: 'linear-gradient(135deg, #F472B6 0%, #EC4899 50%, #DB2777 100%)',
                                            boxShadow: '0 4px 20px rgba(236, 72, 153, 0.3)',
                                        }}
                                    >
                                        <Calendar size={15} />
                                        일정 저장하기
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-500 mb-2 block">메모 내용</label>
                                        <textarea
                                            value={memoContent}
                                            onChange={(e) => setMemoContent(e.target.value)}
                                            placeholder="이 날짜에 대한 메모를 작성하세요..."
                                            rows={5}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-800 outline-none transition-all focus:border-pink-300 focus:bg-white focus:ring-4 focus:ring-pink-50 resize-none placeholder-gray-300"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSaveMemo}
                                        disabled={!memoContent}
                                        className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
                                        style={{
                                            background: 'linear-gradient(135deg, #F472B6 0%, #EC4899 50%, #DB2777 100%)',
                                            boxShadow: '0 4px 20px rgba(236, 72, 153, 0.3)',
                                        }}
                                    >
                                        <FileText size={15} />
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
