'use client'

import { useState } from 'react'
import { Task, deleteTasks, toggleTaskCompletion, updateTaskBudget, updateTaskDate, updateTaskActualCost } from '@/actions/checklist'
import { Plus, Trash2, Info, Calendar, CheckSquare, Square, Wallet, X, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import AddTaskModal from './AddTaskModal'
import SmartBudgetValidator from './SmartBudgetValidator'
import { useRouter } from 'next/navigation'

export default function ChecklistClient({ initialTasks }: { initialTasks: Task[] }) {
    const router = useRouter()
    const [tasks, setTasks] = useState(initialTasks)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [dateModalTask, setDateModalTask] = useState<Task | null>(null)

    // Budget Calc
    const totalEstimated = tasks.reduce((sum, task) => sum + (task.estimated_budget || 0), 0)
    const totalActual = tasks.reduce((sum, task) => sum + (task.actual_cost || 0), 0)
    const budgetGap = totalActual - totalEstimated

    // Handlers
    const handleToggleSelect = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        setSelectedIds(newSet)
    }

    const handleSelectAll = () => {
        if (selectedIds.size === tasks.length) setSelectedIds(new Set())
        else setSelectedIds(new Set(tasks.map(t => t.id)))
    }

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return
        if (!confirm(`선택한 ${selectedIds.size}개의 항목을 삭제하시겠습니까?`)) return

        await deleteTasks(Array.from(selectedIds))
        setTasks(tasks.filter(t => !selectedIds.has(t.id)))
        setSelectedIds(new Set())
        router.refresh()
    }

    const handleToggleComplete = async (task: Task) => {
        const newState = !task.is_completed
        setTasks(tasks.map(t => t.id === task.id ? { ...t, is_completed: newState } : t))
        await toggleTaskCompletion(task.id, newState)
        router.refresh()
    }

    const handleBudgetChange = async (task: Task, newVal: string) => {
        const budget = parseInt(newVal.replace(/[^0-9]/g, '')) || 0
        if (budget === task.estimated_budget) return

        setTasks(tasks.map(t => t.id === task.id ? { ...t, estimated_budget: budget } : t))
        await updateTaskBudget(task.id, budget)
        router.refresh()
    }

    const handleActualCostChange = async (task: Task, newVal: string) => {
        const cost = parseInt(newVal.replace(/[^0-9]/g, '')) || 0
        if (cost === task.actual_cost) return

        setTasks(tasks.map(t => t.id === task.id ? { ...t, actual_cost: cost } : t))
        await updateTaskActualCost(task.id, cost)
        router.refresh()
    }

    const handleDateSave = async (dateStr: string) => {
        if (!dateModalTask) return

        setTasks(tasks.map(t => t.id === dateModalTask.id ? { ...t, due_date: dateStr } : t))
        await updateTaskDate(dateModalTask.id, dateStr)
        setDateModalTask(null)
        router.refresh()
    }

    return (
        <div className="animate-in fade-in duration-500">
            {/* Top Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/70 backdrop-blur-md border border-white/50 shadow-sm">
                        <Wallet className="text-gray-400" size={20} />
                        <div className="flex flex-col leading-tight">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Est. Budget</span>
                            <span className="text-base font-bold text-gray-800">{totalEstimated.toLocaleString()}원</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/70 backdrop-blur-md border border-pink-100 shadow-sm">
                        <TrendingUp className={cn(budgetGap > 0 ? "text-red-400" : "text-emerald-400")} size={20} />
                        <div className="flex flex-col leading-tight">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Actual Spent</span>
                            <span className={cn("text-base font-bold", budgetGap > 0 ? "text-red-500" : "text-emerald-600")}>
                                {totalActual.toLocaleString()}원
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-light text-white text-xs font-bold shadow-md shadow-primary/30 hover:-translate-y-0.5 transition-all"
                    >
                        <Plus size={16} />
                        추가
                    </button>
                    <button
                        onClick={handleDeleteSelected}
                        disabled={selectedIds.size === 0}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-500 text-xs font-bold shadow-sm border border-gray-200 transition-all hover:bg-red-50 hover:text-red-400 hover:border-red-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        <Trash2 size={16} />
                        삭제
                    </button>
                </div>
            </div>

            {/* Checklist Card */}
            <div className="rounded-[24px] bg-white/70 backdrop-blur-md border border-white/50 shadow-sm overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(255,142,142,0.06)' }}>

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100/60 flex flex-wrap items-center justify-between gap-2">
                    <h5 className="font-bold text-gray-800 text-base m-0 flex items-center gap-2">
                        <CheckSquare className="text-primary" size={20} />
                        웨딩 체크리스트 (Timeline)
                    </h5>
                    <div className="flex flex-col items-end gap-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 text-gray-400 text-[10px] font-semibold border border-gray-100">
                            <Info size={12} /> D-Day 순으로 정렬됩니다
                        </span>
                    </div>
                </div>

                {/* Table */}
                <div className="px-4 py-3 overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="text-xs uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100/50">
                                <th className="py-3 px-3 text-center w-[5%]">
                                    <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.size === tasks.length && tasks.length > 0} className="rounded border-gray-300 text-primary focus:ring-primary/20" />
                                </th>
                                <th className="py-3 px-2 text-center w-[8%]">시기 (D-Day)</th>
                                <th className="py-3 px-2 text-left w-[35%]">할 일 (Task)</th>
                                <th className="py-3 px-2 text-center w-[12%]">예상 예산</th>
                                <th className="py-3 px-2 text-center w-[15%]">실제 지출 (Actual)</th>
                                <th className="py-3 px-2 text-center w-[15%]">일정 (Date)</th>
                                <th className="py-3 px-2 text-center w-[10%]">완료여부</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {tasks.map((task) => (
                                <tr key={task.id} className={cn("hover:bg-pink-50/30 transition-colors", task.is_completed && "opacity-40")}>

                                    <td className="py-3.5 px-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(task.id)}
                                            onChange={() => handleToggleSelect(task.id)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary/20"
                                        />
                                    </td>

                                    <td className="py-3.5 px-2 text-center">
                                        <span className={cn(
                                            "inline-block px-2.5 py-1 rounded-full text-xs font-bold text-white",
                                            (task.d_day ?? 0) < -180 ? "bg-gray-400" :
                                                (task.d_day ?? 0) < -90 ? "bg-blue-400" :
                                                    (task.d_day ?? 0) < -30 ? "bg-emerald-400" : "bg-red-400"
                                        )}>
                                            {task.d_day === 0 ? "D-Day" : `D${task.d_day}`}
                                        </span>
                                    </td>

                                    <td className="py-3.5 px-2">
                                        <div className="flex flex-col">
                                            <span className={cn("font-semibold text-gray-800 text-sm", task.is_completed && "line-through text-gray-400")}>
                                                {task.title}
                                            </span>
                                            {task.description && (
                                                <span className="text-gray-400 text-xs mt-0.5 truncate max-w-[350px]">{task.description}</span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="py-3.5 px-2 text-center">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-24 mx-auto text-center text-xs font-semibold text-gray-500 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-primary focus:outline-none transition-all placeholder-gray-300"
                                                placeholder="0"
                                                defaultValue={task.estimated_budget?.toLocaleString()}
                                                onBlur={(e) => handleBudgetChange(task, e.target.value)}
                                            />
                                        </div>
                                    </td>

                                    <td className="py-3.5 px-2 text-center">
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="text"
                                                className="w-24 text-center text-xs font-bold text-gray-700 bg-white/60 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all placeholder-gray-300"
                                                placeholder="0"
                                                defaultValue={task.actual_cost?.toLocaleString()}
                                                onBlur={(e) => handleActualCostChange(task, e.target.value)}
                                            />
                                            <SmartBudgetValidator
                                                amount={task.actual_cost || 0}
                                                title={task.title}
                                                category={task.category}
                                            />
                                        </div>
                                    </td>

                                    <td className="py-3.5 px-2 text-center">
                                        {task.due_date ? (
                                            <button
                                                onClick={() => setDateModalTask(task)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/80 border border-gray-200 text-gray-600 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                                            >
                                                <Calendar size={12} className="text-primary" />
                                                {format(new Date(task.due_date), 'yyyy.MM.dd')}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setDateModalTask(task)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-br from-primary to-primary-light shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                                            >
                                                <Plus size={12} />
                                                일정 등록
                                            </button>
                                        )}
                                    </td>

                                    <td className="py-3.5 px-2 text-center">
                                        <button
                                            onClick={() => handleToggleComplete(task)}
                                            className="transition-transform hover:scale-110"
                                        >
                                            {task.is_completed ? (
                                                <CheckSquare className="text-emerald-500" size={20} fill="currentColor" stroke="white" />
                                            ) : (
                                                <Square className="text-gray-300 hover:text-primary-light" size={20} />
                                            )}
                                        </button>
                                    </td>

                                </tr>
                            ))}

                            {tasks.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-400">
                                        <CheckSquare size={48} className="mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">등록된 체크리스트가 없습니다.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Task Modal */}
            <AddTaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

            {/* Date Picker Modal */}
            {dateModalTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setDateModalTask(null)}></div>
                    <div className="relative w-full max-w-sm bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-6 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:24px_24px]"></div>
                            <div className="relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-2 text-white shadow-lg shadow-primary/30">
                                    <Calendar size={20} />
                                </div>
                                <h3 className="font-serif font-bold text-lg text-white">일정 등록</h3>
                                <p className="text-white/50 text-xs mt-1">{dateModalTask.title}</p>
                            </div>
                            <button
                                onClick={() => setDateModalTask(null)}
                                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 bg-white">
                            <form onSubmit={(e) => {
                                e.preventDefault()
                                handleDateSave(new FormData(e.currentTarget).get('date') as string)
                            }}>
                                <div className="mb-6">
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                                        <Calendar size={12} className="text-primary" /> 날짜 선택
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        defaultValue={dateModalTask.due_date || ''}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                                <button type="submit" className="w-full py-3 rounded-2xl bg-gradient-to-br from-primary to-primary-light text-white font-bold text-sm shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all">
                                    저장하기
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
