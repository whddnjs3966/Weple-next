'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { CheckCircle, Wallet } from 'lucide-react'

interface StatusModulesProps {
    budget: {
        total: number
        used: number
    }
    tasks: {
        total: number
        completed: number
    }
}

const COLORS = ['#FB7185', '#FFF1F2'] // rose-400, rose-50

export function BudgetStatus({ budget }: { budget: StatusModulesProps['budget'] }) {
    const percentage = Math.round((budget.used / budget.total) * 100) || 0
    const data = [
        { name: 'Used', value: budget.used },
        { name: 'Remaining', value: budget.total - budget.used },
    ]

    return (
        <div className="spring-card p-5 h-full flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-50 rounded-lg text-rose-400">
                        <Wallet size={18} />
                    </div>
                    <span className="text-rose-900 font-medium text-sm">Budget Health</span>
                </div>
                <span className="text-xs text-rose-400 bg-rose-50 px-2 py-1 rounded-full">{percentage}% Used</span>
            </div>

            <div className="flex-1 flex items-center justify-between gap-4">
                <div className="w-24 h-24 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={40}
                                startAngle={90}
                                endAngle={-270}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-[10px] text-rose-300">Rem</span>
                        <span className="text-xs font-bold text-rose-900">{(100 - percentage)}%</span>
                    </div>
                </div>

                <div className="flex-1 space-y-2">
                    <div>
                        <p className="text-[10px] text-rose-300 uppercase tracking-wide">Total Budget</p>
                        <p className="text-rose-900 font-bold">{budget.total.toLocaleString()}만 ₩</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-rose-300 uppercase tracking-wide">Spent</p>
                        <p className="text-rose-500 font-bold">{budget.used.toLocaleString()}만 ₩</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function TaskStatus({ tasks }: { tasks: StatusModulesProps['tasks'] }) {
    const percentage = Math.round((tasks.completed / tasks.total) * 100) || 0

    return (
        <div className="spring-card p-5 h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-sage/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-sage/20 rounded-lg text-sage">
                        <CheckCircle size={18} />
                    </div>
                    <span className="text-rose-900 font-medium text-sm">체크리스트</span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <h4 className="text-2xl font-bold text-rose-900">{tasks.completed} <span className="text-sm text-rose-300 font-normal">/ {tasks.total} Tasks</span></h4>
                    <span className="text-sage font-bold text-lg">{percentage}%</span>
                </div>

                <div className="w-full h-2 bg-rose-50 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-sage to-emerald-400 relative"
                    >
                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]" />
                    </motion.div>
                </div>

                <p className="text-xs text-rose-300">다음: 예식장 방문</p>
            </div>
        </div>
    )
}
