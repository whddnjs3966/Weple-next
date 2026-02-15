'use client'

import { useState } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isBefore, addDays } from 'date-fns'
import { ChevronLeft, ChevronRight, CalendarDays, Clock, MapPin, CheckCircle, Plus, Sparkles, Gift, Shirt, X, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'
import { useSchedule } from '@/contexts/ScheduleContext'

export default function ScheduleClient() {
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

    // Dummy upcoming events
    const upcomingEvents = [
        {
            id: 1,
            title: '드레스 피팅 2차',
            date: addDays(new Date(), 3),
            location: '강남 드레스샵',
            dDay: 'D-3',
            color: 'from-pink-500 to-rose-400',
            emoji: '👗',
        },
        {
            id: 2,
            title: '스튜디오 촬영',
            date: addDays(new Date(), 12),
            location: '청담 럭스 스튜디오',
            dDay: 'D-12',
            color: 'from-violet-500 to-purple-400',
            emoji: '📸',
        },
        {
            id: 3,
            title: '예식장 최종 미팅',
            date: addDays(new Date(), 25),
            location: '논현 더채플',
            dDay: 'D-25',
            color: 'from-amber-500 to-orange-400',
            emoji: '💒',
        },
    ]

    // Event indicators from shared context
    const hasEvent = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        return sharedEvents.some(e => e.date === dateStr && (e.type === 'schedule' || e.type === 'checklist'))
    }
    const hasMemo = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        return sharedEvents.some(e => e.date === dateStr && e.type === 'memo')
    }
    const hasChecklist = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        return sharedEvents.some(e => e.date === dateStr && e.type === 'checklist')
    }

    return (
        <div className="max-w-[1100px] mx-auto px-4 pb-20">
            {/* Header */}
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight font-serif italic">Schedule</h2>
                <div className="w-8 h-0.5 bg-gray-800 mx-auto mt-4 mb-2"></div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-2">Manage your wedding timeline</p>
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
                <div className="flex items-center justify-end gap-5 px-6 md:px-10 pb-3">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="text-[11px] font-bold text-gray-400">일정</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        <span className="text-[11px] font-bold text-gray-400">메모</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#FF8E8E]"></span>
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
                                    ${i === 0 ? 'text-[#FF8E8E]' : i === 6 ? 'text-blue-500' : 'text-gray-500'}
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

                            return (
                                <div
                                    key={day.toISOString()}
                                    className="aspect-square min-h-[90px] md:min-h-[110px]"
                                >
                                    {isCurrentMonth ? (
                                        <div
                                            className={`h-full p-2 rounded-lg transition-all cursor-pointer relative
                                                ${isToday(day) ? 'ring-2 ring-pink-300 bg-pink-50/50 shadow-sm' : 'bg-gray-50/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'}
                                                ${isSelected && !isToday(day) ? 'ring-2 ring-pink-200 bg-white shadow-sm' : ''}
                                                hover:bg-pink-50/40 hover:shadow-sm
                                            `}
                                            onClick={() => handleDateClick(day)}
                                        >
                                            <span
                                                className={`text-[13px] font-semibold
                                                    ${isToday(day) ? 'text-pink-500 font-bold' : ''}
                                                    ${isSunday && !isToday(day) ? 'text-[#FF8E8E]' : ''}
                                                    ${isSaturday && !isToday(day) ? 'text-blue-400' : ''}
                                                    ${!isSunday && !isSaturday && !isToday(day) ? 'text-gray-500' : ''}
                                                `}
                                            >
                                                {format(day, 'd')}
                                            </span>

                                            {/* Event Pills */}
                                            <div className="flex flex-col gap-0.5 mt-1">
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
                                                    <div className="text-[8px] px-1 py-0.5 rounded bg-pink-50 text-[#FF8E8E] font-medium truncate flex items-center gap-0.5">
                                                        <span className="w-1 h-1 rounded-full bg-[#FF8E8E] shrink-0"></span>
                                                        체크
                                                    </div>
                                                )}
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

            {/* ① 다가오는 일정 (순서 변경: 먼저) */}
            <section className="mb-16">
                <div className="text-center mb-8">
                    <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-pink-50 text-pink-500 border border-pink-100 mb-3">
                        Upcoming
                    </span>
                    <h3 className="text-2xl font-extrabold text-gray-800">다가오는 일정</h3>
                    <p className="text-sm text-gray-400 mt-1">가장 가까운 예정 일정 3건</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {upcomingEvents.map((event) => (
                        <div
                            key={event.id}
                            className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
                        >
                            {/* Color Top Bar */}
                            <div className={`h-1.5 bg-gradient-to-r ${event.color}`}></div>

                            <div className="p-5">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl shrink-0">
                                        {event.emoji}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <h4 className="font-bold text-gray-800 text-[15px] group-hover:text-[#FF8E8E] transition-colors">{event.title}</h4>
                                            <span className="text-xs font-bold text-[#FF8E8E] bg-[#FF8E8E]/10 px-2 py-0.5 rounded-full shrink-0 ml-2">{event.dDay}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                                <CalendarDays size={12} className="text-gray-300" />
                                                {format(event.date, 'yyyy.MM.dd (eee)')}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                                <MapPin size={12} className="text-gray-300" />
                                                {event.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Divider */}
            <div className="flex items-center gap-4 my-12 opacity-40">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <span className="text-gray-300 text-xs">✦</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            {/* ② D-Day 체크리스트 (순서 변경: 나중) */}
            <section className="mb-16">
                <div className="rounded-[20px] bg-gradient-to-br from-pink-50/80 to-rose-50/50 p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                <span className="text-[#FF8E8E] font-extrabold">D-13</span>{' '}체크리스트
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">오늘 꼭 챙겨야 할 중요 항목들</p>
                        </div>
                        <Link href="/checklist" className="flex items-center gap-1 text-xs font-bold text-[#FF8E8E] border border-[#FF8E8E]/30 rounded-full px-4 py-2 hover:bg-[#FF8E8E]/5 transition-colors">
                            전체보기 →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {[
                            { icon: Sparkles, title: '본식 드레스 가봉', desc: '최종적으로 상태와 사이즈를 점검하세요.', color: 'from-pink-400 to-rose-300' },
                            { icon: Gift, title: '식권/방명록 준비', desc: '당일 사용할 물품들을 꼼꼼히 챙겨두세요.', color: 'from-pink-400 to-fuchsia-300' },
                            { icon: Shirt, title: '컨디션 조절', desc: '충분한 수면과 휴식으로 최상의 컨디션을 만드세요.', color: 'from-rose-400 to-pink-300' },
                        ].map((item) => {
                            const Icon = item.icon
                            return (
                                <div key={item.title} className="bg-white rounded-2xl p-5 border border-gray-100/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-3 shadow-sm`}>
                                        <Icon size={18} />
                                    </div>
                                    <h4 className="font-bold text-gray-800 text-[15px] mb-1.5">{item.title}</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed mb-4">{item.desc}</p>
                                    <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF8E8E] to-[#ff7a7a] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:shadow-md hover:shadow-pink-200/50 transition-all">
                                        <CheckCircle size={14} />
                                        완료 표시
                                    </button>
                                </div>
                            )
                        })}
                    </div>

                    {/* 직접 추가하기 카드 */}
                    <div className="bg-white/60 rounded-2xl p-5 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF8E8E]/40 hover:bg-white/80 transition-all max-w-[220px]">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                            <Plus size={16} />
                        </div>
                        <span className="text-sm font-medium text-gray-400">직접 추가하기</span>
                    </div>
                </div>
            </section>

            {/* ─── 날짜 클릭 모달: 일정/메모 등록 ─── */}
            {isModalOpen && selectedDate && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FF8E8E 0%, #FFB5B5 100%)', padding: '1.5rem 2rem' }}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:20px_20px]"></div>
                            <div className="relative z-10">
                                <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest mb-1">일정 등록</p>
                                <h3 className="font-bold text-xl text-white" style={{ fontFamily: "'Noto Serif KR', serif" }}>
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
                                    ${modalTab === 'schedule' ? 'text-[#FF8E8E] border-b-2 border-[#FF8E8E] bg-pink-50/30' : 'text-gray-400 hover:text-gray-600'}
                                `}
                            >
                                <Calendar size={15} />
                                일정 등록
                            </button>
                            <button
                                onClick={() => setModalTab('memo')}
                                className={`flex-1 py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors
                                    ${modalTab === 'memo' ? 'text-[#FF8E8E] border-b-2 border-[#FF8E8E] bg-pink-50/30' : 'text-gray-400 hover:text-gray-600'}
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
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">일정 제목</label>
                                        <input
                                            type="text"
                                            value={scheduleTitle}
                                            onChange={(e) => setScheduleTitle(e.target.value)}
                                            placeholder="예: 드레스 피팅, 스튜디오 촬영"
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none transition-all focus:border-[#FF8E8E] focus:bg-white focus:ring-4 focus:ring-[#FF8E8E]/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">시간</label>
                                        <input
                                            type="time"
                                            value={scheduleTime}
                                            onChange={(e) => setScheduleTime(e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none transition-all focus:border-[#FF8E8E] focus:bg-white focus:ring-4 focus:ring-[#FF8E8E]/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">장소</label>
                                        <input
                                            type="text"
                                            value={scheduleLocation}
                                            onChange={(e) => setScheduleLocation(e.target.value)}
                                            placeholder="예: 강남 드레스샵"
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none transition-all focus:border-[#FF8E8E] focus:bg-white focus:ring-4 focus:ring-[#FF8E8E]/10"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSaveSchedule}
                                        className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
                                        style={{
                                            background: 'linear-gradient(135deg, #FF8E8E 0%, #ff7a7a 100%)',
                                            boxShadow: '0 4px 15px rgba(255, 142, 142, 0.3)',
                                        }}
                                    >
                                        <Calendar size={16} />
                                        일정 저장하기
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">메모 내용</label>
                                        <textarea
                                            value={memoContent}
                                            onChange={(e) => setMemoContent(e.target.value)}
                                            placeholder="이 날짜에 대한 메모를 작성하세요..."
                                            rows={5}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none transition-all focus:border-[#FF8E8E] focus:bg-white focus:ring-4 focus:ring-[#FF8E8E]/10 resize-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSaveMemo}
                                        className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
                                        style={{
                                            background: 'linear-gradient(135deg, #FF8E8E 0%, #ff7a7a 100%)',
                                            boxShadow: '0 4px 15px rgba(255, 142, 142, 0.3)',
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
