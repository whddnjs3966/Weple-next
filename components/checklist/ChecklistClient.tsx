'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Circle, Plus, Trash2, ClipboardCheck, Calendar, X, Save, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSchedule } from '@/contexts/ScheduleContext'
import { Database } from '@/lib/types/database.types'
import { toggleTaskCompletion, updateTaskBudget, updateTaskDate, deleteTasks, addTask } from '@/actions/checklist'
import { AI_CHECKLIST_SECTIONS, getCategoryIcon, getCategoryColor } from '@/lib/constants/ai-checklist'
import type { AiChecklistItem } from '@/lib/constants/ai-checklist'
import AddTaskModal from './AddTaskModal'

type DbTask = Database['public']['Tables']['tasks']['Row']

interface Task {
    id: string
    title: string
    description?: string
    dDayOffset: number
    estimatedBudget: number
    scheduledDate: string | null
    isDone: boolean
}

type TabType = 'my' | 'ai'

const TABS: { key: TabType; label: string; icon: string }[] = [
    { key: 'my', label: '내 체크리스트', icon: '📋' },
    { key: 'ai', label: 'AI 추천 체크리스트', icon: '✨' },
]

export default function ChecklistClient({ initialTasks }: { initialTasks: DbTask[] }) {
    const router = useRouter()

    const mapDbTasks = (dbTasks: DbTask[]): Task[] => dbTasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description || undefined,
        dDayOffset: t.d_day || 0,
        estimatedBudget: t.estimated_budget || 0,
        scheduledDate: t.due_date,
        isDone: t.is_completed || false,
    }))

    const [activeTab, setActiveTab] = useState<TabType>('my')
    const [tasks, setTasks] = useState<Task[]>(mapDbTasks(initialTasks))
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isDateModalOpen, setIsDateModalOpen] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [dateModalTaskId, setDateModalTaskId] = useState<string | null>(null)
    const [dateInput, setDateInput] = useState('')
    const [selectAll, setSelectAll] = useState(false)
    const [addingItemId, setAddingItemId] = useState<string | null>(null)

    useEffect(() => {
        setTasks(mapDbTasks(initialTasks))
    }, [initialTasks])

    const { addEvent, events } = useSchedule()

    const totalBudget = tasks.reduce((sum, t) => sum + t.estimatedBudget, 0)
    const completedTasks = tasks.filter(t => t.isDone).length
    const progress = Math.round((completedTasks / tasks.length) * 100) || 0

    const scheduleEvents = events.filter(e => e.type === 'schedule')

    const toggleStatus = async (id: string) => {
        const task = tasks.find(t => t.id === id)
        if (!task) return
        setTasks(tasks.map(t => t.id === id ? { ...t, isDone: !t.isDone } : t))
        await toggleTaskCompletion(id, !task.isDone)
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

    const deleteSelected = async () => {
        if (selectedIds.size === 0) return
        if (confirm(`${selectedIds.size}개 항목을 삭제하시겠습니까?`)) {
            const idsToDelete = Array.from(selectedIds)
            setTasks(prev => prev.filter(t => !selectedIds.has(t.id)))
            setSelectedIds(new Set())
            setSelectAll(false)

            if (idsToDelete.length > 0) {
                const res = await deleteTasks(idsToDelete)
                if (res?.error) {
                    console.error('Failed to delete tasks:', res.error)
                    alert('삭제에 실패했습니다.')
                } else {
                    router.refresh()
                }
            }
        }
    }

    const updateBudget = (id: string, value: string) => {
        const numValue = parseInt(value.replace(/,/g, '')) || 0
        setTasks(tasks.map(t => t.id === id ? { ...t, estimatedBudget: numValue } : t))
    }

    const saveBudget = async (id: string) => {
        const task = tasks.find(t => t.id === id)
        if (task) {
            await updateTaskBudget(id, task.estimatedBudget)
        }
    }

    const openDateModal = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId)
        setDateModalTaskId(taskId)
        setDateInput(task?.scheduledDate || '')
        setIsDateModalOpen(true)
    }

    const handleScheduleDate = async () => {
        if (!dateModalTaskId || !dateInput) return
        const task = tasks.find(t => t.id === dateModalTaskId)
        if (!task) return

        setTasks(tasks.map(t => t.id === dateModalTaskId ? { ...t, scheduledDate: dateInput } : t))
        await updateTaskDate(dateModalTaskId, dateInput)

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

    const handleAddAiItem = async (item: AiChecklistItem) => {
        setAddingItemId(item.id)
        const formData = new FormData()
        formData.set('title', item.title)
        formData.set('d_day', String(item.dDayOffset))
        formData.set('budget', String(item.estimatedBudget))
        formData.set('memo', item.description)

        const result = await addTask(formData)
        setAddingItemId(null)

        if (result?.error) {
            alert('추가에 실패했습니다.')
        } else {
            router.refresh()
            setActiveTab('my')
        }
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

            {/* Tab Bar */}
            <div className="border-b border-gray-200 mb-6">
                <div className="flex gap-0">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`
                                px-5 py-3 text-sm font-medium whitespace-nowrap transition-all relative
                                ${activeTab === tab.key
                                    ? 'text-pink-500 font-bold'
                                    : 'text-gray-400 hover:text-gray-600'
                                }
                            `}
                        >
                            <span className="mr-1.5">{tab.icon}</span>
                            {tab.label}
                            {activeTab === tab.key && (
                                <motion.div
                                    layoutId="checklistTabUnderline"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-pink-400"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ═══ 내 체크리스트 탭 ═══ */}
            {activeTab === 'my' && (
                <>
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
                            <button onClick={() => setIsAddModalOpen(true)} className="h-8 flex items-center gap-1.5 px-4 rounded-lg bg-pink-400 hover:bg-pink-500 text-white font-bold text-xs shadow-md shadow-pink-300/20 hover:-translate-y-0.5 transition-all">
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
                    {tasks.length > 0 && (
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
                                                    <td className="py-3 px-2 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.has(task.id)}
                                                            onChange={() => toggleSelect(task.id)}
                                                            className="w-3.5 h-3.5 rounded border-gray-300 text-pink-300 focus:ring-pink-400 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="py-3 px-2 text-center">
                                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${getDDayColor(task.dDayOffset)}`}>
                                                            {task.dDayOffset === 0 ? 'D-Day' : `D${task.dDayOffset}`}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <div className={`font-semibold text-[13px] leading-snug ${task.isDone ? 'line-through text-gray-300' : 'text-gray-800'}`}>
                                                            {task.title}
                                                        </div>
                                                        {task.description && (
                                                            <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{task.description}</p>
                                                        )}
                                                    </td>
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
                    )}

                    {/* Empty State */}
                    {tasks.length === 0 && (
                        <div className="text-center py-20 px-6 max-w-md mx-auto">
                            <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-100 shadow-sm">
                                <ClipboardCheck className="w-8 h-8 text-pink-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">체크리스트가 비어있어요</h3>
                            <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
                                <button
                                    onClick={() => setActiveTab('ai')}
                                    className="text-pink-500 font-bold hover:underline"
                                >
                                    AI 추천 체크리스트
                                </button>
                                를 참고하여<br />
                                필요한 항목을 추가해보세요.
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <button
                                    onClick={() => setActiveTab('ai')}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-md shadow-violet-200 hover:-translate-y-0.5 transition-all"
                                >
                                    <Sparkles size={14} />
                                    AI 추천 보기
                                </button>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-pink-400 hover:bg-pink-500 text-white font-bold text-sm rounded-xl shadow-md shadow-pink-200 hover:-translate-y-0.5 transition-all"
                                >
                                    <Plus size={14} />
                                    직접 추가
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ═══ AI 추천 체크리스트 탭 ═══ */}
            {activeTab === 'ai' && (
                <div className="space-y-6">
                    {/* Info Banner */}
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-xl p-4 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Sparkles size={16} className="text-violet-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800 mb-0.5">AI 추천 웨딩 체크리스트</p>
                            <p className="text-[12px] text-gray-500 leading-relaxed">
                                참고용 체크리스트입니다. 필요한 항목을 골라 <strong className="text-pink-500">내 체크리스트</strong>에 추가하세요.
                            </p>
                        </div>
                    </div>

                    {/* Timeline Sections */}
                    {AI_CHECKLIST_SECTIONS.map((section) => (
                        <div key={section.range}>
                            {/* Section Header */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-extrabold text-violet-500 bg-violet-100 px-2.5 py-1 rounded-full">{section.range}</span>
                                    <span className="text-sm font-bold text-gray-700">{section.label}</span>
                                </div>
                                <div className="flex-1 h-px bg-gray-200"></div>
                                <span className="text-[11px] text-gray-400">{section.items.length}개</span>
                            </div>

                            {/* Items */}
                            <div className="space-y-2">
                                {section.items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-pink-100 transition-all group"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${getDDayColor(item.dDayOffset)}`}>
                                                        {item.dDayOffset === 0 ? 'D-Day' : item.dDayOffset > 0 ? `D+${item.dDayOffset}` : `D${item.dDayOffset}`}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${getCategoryColor(item.category)}`}>
                                                        {getCategoryIcon(item.category)} {item.category}
                                                    </span>
                                                </div>
                                                <h4 className="font-semibold text-[13px] text-gray-800 leading-snug">{item.title}</h4>
                                                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{item.description}</p>
                                                {item.estimatedBudget > 0 && (
                                                    <p className="text-[11px] text-emerald-500 font-bold mt-1">
                                                        예상 예산: {item.estimatedBudget.toLocaleString()}원
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleAddAiItem(item)}
                                                disabled={addingItemId === item.id}
                                                className="flex-shrink-0 h-8 px-3 rounded-lg bg-pink-50 border border-pink-200 text-pink-500 text-xs font-bold hover:bg-pink-100 hover:border-pink-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                                            >
                                                {addingItemId === item.id ? (
                                                    <span className="animate-pulse">추가중...</span>
                                                ) : (
                                                    <>
                                                        <Plus size={12} />
                                                        추가
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Date Registration Modal */}
            {isDateModalOpen && dateModalTask && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-pink-900/20 backdrop-blur-sm" onClick={() => setIsDateModalOpen(false)}></div>
                    <div className="relative w-full max-w-sm bg-white rounded-[20px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
            {/* Add Task Modal */}
            <AddTaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        </div>
    )
}
