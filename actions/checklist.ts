'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database.types'
import { revalidatePath } from 'next/cache'

export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export async function getTasks() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // 그룹이 있으면 파트너 데이터 포함 조회
    const { data: profile } = await supabase
        .from('profiles')
        .select('wedding_group_id')
        .eq('id', user.id)
        .single()

    let userIds = [user.id]
    if (profile?.wedding_group_id) {
        const { data: members } = await supabase
            .from('profiles')
            .select('id')
            .eq('wedding_group_id', profile.wedding_group_id)
        if (members) userIds = members.map(m => m.id)
    }

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .in('user_id', userIds)
        .order('d_day', { ascending: true })

    if (error) {
        console.error('Error fetching tasks:', error)
        return []
    }

    return data
}

export async function addTask(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const title = formData.get('title') as string
    const d_day = parseInt(formData.get('d_day') as string)
    const budget = parseInt(formData.get('budget') as string) || 0
    const memo = formData.get('memo') as string

    const newTask: TaskInsert = {
        user_id: user.id,
        title,
        d_day,
        estimated_budget: budget,
        description: memo,
        is_completed: false
    }

    const { error } = await supabase
        .from('tasks')
        .insert(newTask)

    if (error) {
        console.error('Error adding task:', error)
        return { error: error.message }
    }

    revalidatePath('/checklist')
    revalidatePath('/schedule')
    return { success: true }
}

export async function updateTask(id: string, updates: TaskUpdate) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Fetch group members just like getTasks
    const { data: profile } = await supabase.from('profiles').select('wedding_group_id').eq('id', user.id).single()
    let userIds = [user.id]
    if (profile?.wedding_group_id) {
        const { data: members } = await supabase.from('profiles').select('id').eq('wedding_group_id', profile.wedding_group_id)
        if (members) userIds = members.map(m => m.id)
    }

    const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .in('user_id', userIds)

    if (error) return { error: error.message }

    revalidatePath('/checklist')
    revalidatePath('/schedule')
    return { success: true }
}

export async function deleteTasks(ids: string[]) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Fetch group members just like getTasks
    const { data: profile } = await supabase.from('profiles').select('wedding_group_id').eq('id', user.id).single()
    let userIds = [user.id]
    if (profile?.wedding_group_id) {
        const { data: members } = await supabase.from('profiles').select('id').eq('wedding_group_id', profile.wedding_group_id)
        if (members) userIds = members.map(m => m.id)
    }

    const { error } = await supabase
        .from('tasks')
        .delete()
        .in('id', ids)
        .in('user_id', userIds)

    if (error) return { error: error.message }

    revalidatePath('/checklist')
    revalidatePath('/schedule')
    return { success: true }
}

export async function toggleTaskCompletion(id: string, is_completed: boolean) {
    return await updateTask(id, { is_completed })
}

export async function updateTaskBudget(id: string, budget: number) {
    return await updateTask(id, { estimated_budget: budget })
}

export async function updateTaskDate(id: string, date: string) {
    return await updateTask(id, { due_date: date })
}

export async function updateTaskActualCost(id: string, cost: number) {
    return await updateTask(id, { actual_cost: cost })
}

export async function seedDefaultTasks(tasksToInsert: Pick<TaskInsert, 'title' | 'description' | 'd_day' | 'estimated_budget'>[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const fullTasks = tasksToInsert.map(t => ({
        ...t,
        user_id: user.id,
        is_completed: false
    }))

    const { error } = await supabase
        .from('tasks')
        .insert(fullTasks)

    if (error) {
        console.error('Error seeding tasks:', error)
        return { error: error.message }
    }

    revalidatePath('/checklist')
    revalidatePath('/schedule')
    return { success: true }
}
