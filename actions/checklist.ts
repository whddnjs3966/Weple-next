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

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
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

    // Strictly typed payload
    const newTask: TaskInsert = {
        user_id: user.id,
        title,
        d_day,
        estimated_budget: budget,
        description: memo,
        is_completed: false
    }

    // Supabase inference bug workaround: Cast chain to any, but keep strict payload type
    const { error } = await (supabase
        .from('tasks') as any)
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

    // Check auth for security
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await (supabase
        .from('tasks') as any)
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/checklist')
    revalidatePath('/schedule')
    return { success: true }
}

export async function deleteTasks(ids: string[]) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await (supabase
        .from('tasks') as any)
        .delete()
        .in('id', ids)
        .eq('user_id', user.id)

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
