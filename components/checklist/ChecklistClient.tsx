'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Circle, Plus, Trash2, ClipboardCheck, AlertCircle, Calendar, X, Save } from 'lucide-react'
import { format } from 'date-fns'
import { useSchedule } from '@/contexts/ScheduleContext'

interface Task {
    id: string
    title: string
    description?: string
    dDayOffset: number
    estimatedBudget: number
    scheduledDate: string | null
    isDone: boolean
}

const defaultTasks: Task[] = [
    { id: 'c1', title: '양가 상견례', description: '양가 부모님 인사 및 결혼 날짜 협의', dDayOffset: -365, estimatedBudget: 300000, scheduledDate: null, isDone: false },
    { id: 'c2', title: '결혼 날짜 확정', description: '양가 의견 반영하여 택일', dDayOffset: -300, estimatedBudget: 0, scheduledDate: null, isDone: false },
    { id: 'c3', title: '웨딩홀 투어 및 계약', description: '예산, 하객 규모, 교통편, 식사 퀄리티 비교', dDayOffset: -270, estimatedBudget: 5000000, scheduledDate: null, isDone: false },
    { id: 'c4', title: '스드메 상담 및 계약', description: '스튜디오·드레스·메이크업 패키지 비교 후 계약', dDayOffset: -240, estimatedBudget: 3000000, scheduledDate: null, isDone: false },
    { id: 'c5', title: '신혼집 알아보기', description: '예산, 위치, 교통, 학군 등 비교', dDayOffset: -240, estimatedBudget: 0, scheduledDate: null, isDone: false },
    { id: 'c6', title: '본식 스냅/DVD 업체 예약', description: '결혼식 당일 촬영 업체 비교 후 예약', dDayOffset: -210, estimatedBudget: 800000, scheduledDate: null, isDone: false },
    { id: 'c7', title: '신혼여행지 결정 및 예약', description: '여행지, 항공권, 숙소 예약 (비자·백신 확인)', dDayOffset: -180, estimatedBudget: 3000000, scheduledDate: null, isDone: false },
    { id: 'c8', title: '예물 상담 및 구매', description: '웨딩링 등 여러 매장 방문 후 결정', dDayOffset: -150, estimatedBudget: 4000000, scheduledDate: null, isDone: false },
    { id: 'c9', title: '가전·가구 리스트 작성', description: '신혼집 입주에 맞춰 필요 목록 정리', dDayOffset: -150, estimatedBudget: 0, scheduledDate: null, isDone: false },
    { id: 'c10', title: '피부 관리 시작', description: '결혼식 D-Day에 맞춰 관리 시작', dDayOffset: -120, estimatedBudget: 500000, scheduledDate: null, isDone: false },
    { id: 'c11', title: '청첩장 디자인 선택', description: '문구 결정 및 시안 확정, 인쇄 의뢰', dDayOffset: -100, estimatedBudget: 200000, scheduledDate: null, isDone: false },
    { id: 'c12', title: '예복·한복 준비', description: '예복/한복 피팅 및 예약 (맞춤 시 1개월 소요)', dDayOffset: -100, estimatedBudget: 1500000, scheduledDate: null, isDone: false },
    { id: 'c13', title: '가전·가구 구매', description: '비교 후 주문, 배송 일정 조율', dDayOffset: -90, estimatedBudget: 10000000, scheduledDate: null, isDone: false },
    { id: 'c14', title: '웨딩 촬영 진행', description: '스튜디오/야외 촬영, 소품·의상 준비', dDayOffset: -80, estimatedBudget: 0, scheduledDate: null, isDone: false },
    { id: 'c15', title: '드레스 최종 선택 및 가봉', description: '본식 드레스 확정 및 수선', dDayOffset: -70, estimatedBudget: 0, scheduledDate: null, isDone: false },
    { id: 'c16', title: '신혼여행 최종 점검', description: '항공권, 호텔, 여권, 여행자보험 확인', dDayOffset: -60, estimatedBudget: 0, scheduledDate: null, isDone: false },
    { id: 'c17', title: '청첩장 인쇄 및 발송', description: '최종 인쇄 확인 후 양가 하객에게 발송', dDayOffset: -50, estimatedBudget: 0, scheduledDate: null, isDone: false },
    { id: 'c18', title: '혼수·예단 목록 조율', description: '양가 부모님과 협의하여 결정', dDayOffset: -50, estimatedBudget: 0, scheduledDate: null, isDone: false },
    { id: 'c19', title: '주례·사회자·축가 섭외', description: '식순에 맞는 인원 섭외 및 확정', dDayOffset: -45, estimatedBudget: 300000, scheduledDate: null, isDone: false },
    { id: 'c20', title: '메이크업 리허설', description: '본식 메이크업·헤어 스타일 사전 점검', dDayOffset: -40, estimatedBudget: 0, scheduledDate: null, isDone: false },
    { id: 'c21', title: '혼주 메이크업·의상 준비', description: '양가 부모님 의상 및 메이크업 예약', dDayOffset: -35, estimatedBudget: 500000, scheduledDate: null, isDone: false },
    { id: 'c22', title: '감사선물·답례품 준비', description: '포장 및 수량 결정, 주문', dDayOffset: -30, estimatedBudget: 500000, scheduledDate: null, isDone: false },
    { id: 'c23', title: '폐백 음식 준비', description: '폐백 업체 선정 및 예약', dDayOffset: -30, estimatedBudget: 300000, scheduledDate: null, isDone: false },
    { id: 'c24', title: '영상 편지·식전 영상 제작', description: '상영할 영상 촬영 및 편집', dDayOffset: -25, estimatedBudget: 200000, scheduledDate: null, isDone: false },
    { id: 'c25', title: '결혼 소식 알림', description: '지인에게 결혼 소식 알림톡/카드 발송', dDayOffset: -25, estimatedBudget: 0, scheduledDate: null, isDone: false },
    { id: 'c26', title: '부케 예약', description: '원하는 스타일 선택 후 예약', dDayOffset: -20, estimatedBudget: 150000, scheduledDate: null, isDone: false },
    { id: 'c27', title: '하객 최종 명단 정리', description: '참석 인원 확인 및 좌석 배치', dDayOffset: -14, estimatedBudget: 0, scheduledDate: null, isDone: false },
    { id: 'c28', title: '식순 확정 및 세부 조율', description: '사회자·주례와 최종 식순 확인', dDayOffset: -14, estimatedBudget: 0, scheduledDate: null, isDone: false },
    { id: 'c29', title: '사례비·봉투 준비', description: '축의금 접수자, 사회자, 주례 사례비 준비', dDayOffset: -10, estimatedBudget: 500000, scheduledDate: null, isDone: false },
    { id: 'c30', title: '웨딩드레스·턱시도 최종 피팅', description: '수선 완료 확인 및 최종 점검', dDayOffset: -7, estimatedBudget: 0, scheduledDate: null, isDone: false },
    { id: 'c31', title: '뷔페 최종 인원 확정', description: '예식장에 참석 최종 인원 전달', dDayOffset: -5, estimatedBudget: 0, scheduledDate: null, isDone: false },
    { id: 'c32', title: '개인 준비물 점검', description: '웨딩슈즈, 속옷, 액세서리, 소품 등', dDayOffset: -3, estimatedBudget: 0, scheduledDate: null, isDone: false },
    { id: 'c33', title: '혼인신고서·가족관계 서류', description: '필수 서류 미리 준비', dDayOffset: -3, estimatedBudget: 0, scheduledDate: null, isDone: false },
    { id: 'c34', title: '웨딩카 준비 확인', description: '당일 웨딩카 준비 상황 점검', dDayOffset: -1, estimatedBudget: 0, scheduledDate: null, isDone: false },
    { id: 'c35', title: '결혼식 당일 🎉', description: '축하합니다! 행복한 하루 보내세요!', dDayOffset: 0, estimatedBudget: 0, scheduledDate: null, isDone: false },
]

export default function ChecklistClient() {
    const [tasks, setTasks] = useState<Task[]>(defaultTasks)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isDateModalOpen, setIsDateModalOpen] = useState(false)
    const [dateModalTaskId, setDateModalTaskId] = useState<string | null>(null)
    const [dateInput, setDateInput] = useState('')
    const [selectAll, setSelectAll] = useState(false)

    const { addEvent, events } = useSchedule()

    const totalBudget = tasks.reduce((sum, t) => sum + t.estimatedBudget, 0)
    const completedTasks = tasks.filter(t => t.isDone).length
    const progress = Math.round((completedTasks / tasks.length) * 100) || 0

    // Schedule tab events that are of type 'schedule' should also show here
    const scheduleEvents = events.filter(e => e.type === 'schedule')

    const toggleStatus = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, isDone: !t.isDone } : t))
    }

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        setSelectedIds(newSet)
        setSelectAll(newSet.size === tasks.length)
    }

    const toggleSelectAll = () => {
        if (selectAll) {
            setSelectedIds(new Set())
            setSelectAll(false)
        } else {
            setSelectedIds(new Set(tasks.map(t => t.id)))
            setSelectAll(true)
        }
    }

    const deleteSelected = () => {
        if (selectedIds.size === 0) return
        if (confirm(`${selectedIds.size}개 항목을 삭제하시겠습니까?`)) {
            setTasks(tasks.filter(t => !selectedIds.has(t.id)))
            setSelectedIds(new Set())
            setSelectAll(false)
        }
    }

    const updateBudget = (id: string, value: string) => {
        const numValue = parseInt(value.replace(/,/g, '')) || 0
        setTasks(tasks.map(t => t.id === id ? { ...t, estimatedBudget: numValue } : t))
    }

    const saveBudget = (id: string) => {
        const task = tasks.find(t => t.id === id)
        if (task) {
            console.log(`예산 저장: ${task.title} → ${task.estimatedBudget.toLocaleString()}₩`)
            // TODO: Supabase에 저장
        }
    }

    const openDateModal = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId)
        setDateModalTaskId(taskId)
        setDateInput(task?.scheduledDate || '')
        setIsDateModalOpen(true)
    }

    const handleScheduleDate = () => {
        if (!dateModalTaskId || !dateInput) return
        const task = tasks.find(t => t.id === dateModalTaskId)
        if (!task) return

        // Update task with scheduled date
        setTasks(tasks.map(t => t.id === dateModalTaskId ? { ...t, scheduledDate: dateInput } : t))

        // Add to shared schedule context so it shows on calendar
        addEvent({
            title: task.title,
            date: dateInput,
            type: 'checklist',
            checklistId: task.id,
        })

        setIsDateModalOpen(false)
        setDateModalTaskId(null)
        setDateInput('')
    }

    const getDDayColor = (offset: number) => {
        const abs = Math.abs(offset)
        if (offset === 0) return 'bg-pink-400 text-white'
        if (abs <= 7) return 'bg-red-500 text-white'
        if (abs <= 14) return 'bg-red-400 text-white'
        if (abs <= 30) return 'bg-orange-400 text-white'
        if (abs <= 60) return 'bg-amber-400 text-white'
        if (abs <= 90) return 'bg-yellow-400 text-gray-800'
        if (abs <= 150) return 'bg-emerald-400 text-white'
        if (abs <= 240) return 'bg-blue-400 text-white'
        return 'bg-gray-400 text-white'
    }

    const dateModalTask = tasks.find(t => t.id === dateModalTaskId)

    return (
        <div className="max-w-6xl mx-auto px-6 pb-20">
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="font-serif italic text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-2">
                    Checklist
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-pink-400"></div>
                    <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                    <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-pink-400"></div>
                </div>
            </div>

            {/* Title Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-pink-300">📋</span> 웨딩 체크리스트 (Timeline)
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 bg-gray-50 rounded-lg px-3 py-1.5">
                    <AlertCircle size={12} className="text-gray-300" />
                    ※ 참고용입니다. 상황에 맞게 추가/삭제하세요.
                </div>
            </div>

            {/* Stats + Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-white rounded-xl px-3 py-2 border border-gray-100 shadow-sm flex items-center gap-2">
                        <ClipboardCheck className="text-pink-300 w-4 h-4" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">예산 합계</span>
                        <span className="text-gray-800 font-bold text-sm">{totalBudget.toLocaleString()}₩</span>
                    </div>
                    <div className="bg-white rounded-xl px-3 py-2 border border-gray-100 shadow-sm flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">진행률</span>
                        <span className="text-gray-800 font-bold text-sm">{completedTasks}/{tasks.length}</span>
                        <span className="text-gray-400 text-[11px]">({progress}%)</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={deleteSelected}
                        disabled={selectedIds.size === 0}
                        className="h-8 px-3 rounded-lg bg-white border border-gray-200 flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 hover:border-red-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <Trash2 size={13} />
                        {selectedIds.size > 0 && <span className="font-bold">{selectedIds.size}개 삭제</span>}
                    </button>
                    <button className="h-8 flex items-center gap-1.5 px-4 rounded-lg bg-pink-400 hover:bg-pink-500 text-white font-bold text-xs shadow-md shadow-pink-300/20 hover:-translate-y-0.5 transition-all">
                        <Plus size={13} /> 추가
                    </button>
                </div>
            </div>

            {/* Schedule Events from Calendar */}
            {scheduleEvents.length > 0 && (
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 mb-4">
                    <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-2">📅 달력에서 등록된 일정</p>
                    <div className="space-y-1">
                        {scheduleEvents.map(evt => (
                            <div key={evt.id} className="flex items-center gap-3 text-[12px] text-gray-600 bg-white rounded-lg px-3 py-1.5 border border-blue-50">
                                <span className="font-bold text-blue-500">{evt.date}</span>
                                <span>{evt.title}</span>
                                {evt.time && <span className="text-gray-400">{evt.time}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/80 border-b-2 border-gray-200">
                                <th className="w-16 py-3 px-2 text-center">
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={toggleSelectAll}
                                        className="w-3.5 h-3.5 rounded border-gray-300 text-pink-300 focus:ring-pink-400 cursor-pointer"
                                    />
                                </th>
                                <th className="py-3 px-2 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider" style={{ width: '120px' }}>시기 (D-Day)</th>
                                <th className="py-3 px-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">할 일 (TODO)</th>
                                <th className="py-3 px-2 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider" style={{ width: '180px' }}>예상 예산</th>
                                <th className="py-3 px-2 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider" style={{ width: '130px' }}>일정 등록</th>
                                <th className="py-3 px-2 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider" style={{ width: '100px' }}>완료</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode='popLayout'>
                                {tasks.map((task, index) => (
                                    <motion.tr
                                        key={task.id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: index * 0.02 }}
                                        layout
                                        className={`border-b border-gray-200 transition-colors group ${task.isDone ? 'bg-gray-50/40' : 'hover:bg-pink-50/20'}`}
                                    >
                                        {/* Checkbox */}
                                        <td className="py-3 px-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(task.id)}
                                                onChange={() => toggleSelect(task.id)}
                                                className="w-3.5 h-3.5 rounded border-gray-300 text-pink-300 focus:ring-pink-400 cursor-pointer"
                                            />
                                        </td>

                                        {/* D-Day Badge */}
                                        <td className="py-3 px-2 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${getDDayColor(task.dDayOffset)}`}>
                                                {task.dDayOffset === 0 ? 'D-Day' : `D${task.dDayOffset}`}
                                            </span>
                                        </td>

                                        {/* Title + Description */}
                                        <td className="py-3 px-3">
                                            <div className={`font-semibold text-[13px] leading-snug ${task.isDone ? 'line-through text-gray-300' : 'text-gray-800'}`}>
                                                {task.title}
                                            </div>
                                            {task.description && (
                                                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{task.description}</p>
                                            )}
                                        </td>

                                        {/* Budget */}
                                        <td className="py-3 px-2">
                                            <div className="flex items-center gap-1 justify-center">
                                                <input
                                                    type="text"
                                                    value={task.estimatedBudget > 0 ? task.estimatedBudget.toLocaleString() : ''}
                                                    onChange={(e) => updateBudget(task.id, e.target.value)}
                                                    placeholder="0"
                                                    className="w-28 text-right text-[12px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg px-2 py-1.5 outline-none transition-all focus:border-pink-400 focus:ring-2 focus:ring-pink-100 placeholder-gray-300"
                                                />
                                                <button
                                                    onClick={() => saveBudget(task.id)}
                                                    className="w-6 h-6 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                                                    title="예산 저장"
                                                >
                                                    <Save size={11} />
                                                </button>
                                            </div>
                                        </td>

                                        {/* Schedule Date Button */}
                                        <td className="py-3 px-2 text-center">
                                            {task.scheduledDate ? (
                                                <button
                                                    onClick={() => openDateModal(task.id)}
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors"
                                                >
                                                    <Calendar size={10} />
                                                    {task.scheduledDate.slice(5).replace('-', '/')}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => openDateModal(task.id)}
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-pink-50 text-pink-300 border border-pink-100 hover:bg-pink-100 transition-colors"
                                                >
                                                    <Calendar size={10} />
                                                    등록
                                                </button>
                                            )}
                                        </td>

                                        {/* Completion Toggle */}
                                        <td className="py-3 px-2 text-center">
                                            <button
                                                onClick={() => toggleStatus(task.id)}
                                                className="transition-all hover:scale-110"
                                            >
                                                {task.isDone ? (
                                                    <CheckCircle size={20} className="text-emerald-500" />
                                                ) : (
                                                    <Circle size={20} className="text-gray-200 hover:text-pink-300" />
                                                )}
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Empty State */}
            {tasks.length === 0 && (
                <div className="text-center py-16 text-gray-300">
                    <ClipboardCheck className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">체크리스트가 비어 있습니다. 항목을 추가하세요.</p>
                </div>
            )}

            {/* Date Registration Modal */}
            {isDateModalOpen && dateModalTask && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-pink-900/20 backdrop-blur-sm" onClick={() => setIsDateModalOpen(false)}></div>
                    <div className="relative w-full max-w-sm bg-white rounded-[20px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FB7185 0%, #FDA4AF 100%)', padding: '1.25rem 1.5rem' }}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:20px_20px]"></div>
                            <div className="relative z-10">
                                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-0.5">일정 등록</p>
                                <h3 className="font-bold text-base text-white">{dateModalTask.title}</h3>
                                {dateModalTask.description && (
                                    <p className="text-white/60 text-[11px] mt-1">{dateModalTask.description}</p>
                                )}
                            </div>
                            <button
                                onClick={() => setIsDateModalOpen(false)}
                                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">날짜 선택</label>
                                <input
                                    type="date"
                                    value={dateInput}
                                    onChange={(e) => setDateInput(e.target.value)}
                                    className="w-full bg-pink-50/30 border-2 border-pink-100 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100"
                                />
                            </div>
                            <div className="text-[11px] text-gray-400 bg-blue-50 rounded-lg px-3 py-2 flex items-start gap-1.5">
                                <span className="mt-0.5">💡</span>
                                <span>이 일정은 <strong className="text-blue-500">스케줄 탭</strong>의 달력에도 자동으로 표시됩니다.</span>
                            </div>
                            <button
                                onClick={handleScheduleDate}
                                disabled={!dateInput}
                                className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    background: 'linear-gradient(135deg, #FB7185 0%, #F43F5E 100%)',
                                    boxShadow: '0 4px 15px rgba(251, 113, 133, 0.3)',
                                }}
                            >
                                <Calendar size={15} />
                                일정 등록하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
