'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * 총 예산 저장
 * - 현재 유저의 profiles.budget_max에 총 예산(만원 단위) 저장
 */
export async function saveTotalBudget(amount: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('profiles')
        .update({ budget_max: amount })
        .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard')
    revalidatePath('/checklist')
    return { success: true }
}

/**
 * 예산 요약 정보 조회
 * - 총 예산 (profiles.budget_max)
 * - 항목별 예상비용 합계 (tasks.estimated_budget)
 * - 항목별 실제비용 합계 (tasks.actual_cost)
 */
export async function getBudgetSummary() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { totalBudget: 0, estimatedTotal: 0, actualTotal: 0 }

    // 1. 프로필에서 총 예산 + 그룹 ID 조회
    const { data: profile } = await supabase
        .from('profiles')
        .select('budget_max, wedding_group_id')
        .eq('id', user.id)
        .single()

    // 2. 그룹이 있으면 파트너 멤버 ID도 포함
    let userIds = [user.id]
    if (profile?.wedding_group_id) {
        const { data: members } = await supabase
            .from('profiles')
            .select('id')
            .eq('wedding_group_id', profile.wedding_group_id)
        if (members) userIds = members.map(m => m.id)
    }

    // 3. 그룹 전체 태스크에서 예상/실제 비용 합계 조회
    const { data: tasks } = await supabase
        .from('tasks')
        .select('estimated_budget, actual_cost')
        .in('user_id', userIds)

    const estimatedTotal = (tasks || []).reduce((sum, t) => sum + (t.estimated_budget || 0), 0)
    const actualTotal = (tasks || []).reduce((sum, t) => sum + (t.actual_cost || 0), 0)

    return {
        totalBudget: profile?.budget_max || 0,
        estimatedTotal,
        actualTotal,
    }
}
