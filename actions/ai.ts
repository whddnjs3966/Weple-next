'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface WeddingPlanData {
    weddingDate: string
    budgetRange: number // in 10,000 KRW
    styles: string[]
}

export async function generateWeddingPlan(planData: WeddingPlanData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // 1. Calculate Budget Breakdown (Korea 2025 Avg)
    // Budget is in unit of 10,000 KRW (Man-won)
    const totalBudget = planData.budgetRange

    // Ratios: Venue 50%, SDM 15%, Honeymoon 20%, Gifts/Etc 15%
    const breakdown = [
        { category: 'venue', title: '웨딩홀 & 식대', amount: Math.floor(totalBudget * 0.50) },
        { category: 'sdm', title: '스드메 (스튜디오/드레스/메이크업)', amount: Math.floor(totalBudget * 0.15) },
        { category: 'honeymoon', title: '신혼여행', amount: Math.floor(totalBudget * 0.20) },
        { category: 'gifts', title: '예물/예단 & 기타', amount: Math.floor(totalBudget * 0.15) },
    ]

    // 2. Insert Budget Items
    const budgetInserts = breakdown.map(item => ({
        user_id: user.id,
        category: item.category, // We need to ensure 'category' column exists in tasks or budget table
        title: item.title,
        amount: item.amount * 10000, // Convert back to Won for storage if DB uses Won
        // Note: Check DB schema. If we don't have a separate budget table, we might skip this 
        // OR add to 'tasks' with Estimated Budget.
    }))

    // Let's assume we add them as "Key Tasks" with budget
    // We need to check if 'tasks' table has 'category' column as per PRD. 
    // The PRD mentioned adding 'category' column. We will handle migration separately.
    // For now, we fit into existing 'tasks' structure: title, estimated_budget.

    const taskInserts = breakdown.map(item => ({
        user_id: user.id,
        title: `[예산] ${item.title}`,
        d_day: 0, // Placeholder
        estimated_budget: item.amount * 10000,
        is_completed: false
    }))

    // 3. Generate "Style-based" Checklist Items
    const styleTasks = []

    if (planData.styles.includes('Dark')) {
        styleTasks.push({ title: '어두운 홀 투어 (조명/음향 체크)', d_day: 200 })
        styleTasks.push({ title: '캔들/플라워 데코레이션 업체 선정', d_day: 150 })
    }
    if (planData.styles.includes('Garden')) {
        styleTasks.push({ title: '야외 웨딩 베뉴 투어 (우천 대비 확인)', d_day: 200 })
        styleTasks.push({ title: '야외 리허설 촬영 예약', d_day: 150 })
    }

    const commonTasks = [
        { title: '양가 인사 드리기', d_day: 300 },
        { title: '웨딩홀 계약', d_day: 250 },
        { title: '본식 스냅/DVD 예약', d_day: 240 },
        { title: '신혼여행 항공권 예약', d_day: 200 },
        { title: '드레스 투어', d_day: 180 },
    ]

    const allTasks = [...taskInserts, ...styleTasks.map(t => ({
        user_id: user.id,
        title: t.title,
        d_day: t.d_day,
        estimated_budget: 0,
        is_completed: false
    })), ...commonTasks.map(t => ({
        user_id: user.id,
        title: t.title,
        d_day: t.d_day,
        estimated_budget: 0,
        is_completed: false
    }))]

    // Use 'as any' workaround for bulk insert type inference issues
    const { error } = await (supabase.from('tasks') as any)
        .insert(allTasks)

    if (error) {
        console.error('AI Plan Gen Error:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/checklist')

    return { success: true }
}
