'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database.types'
import { revalidatePath } from 'next/cache'

export type Task = Database['public']['Tables']['tasks']['Row']

export async function getTasks() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('d_day', { ascending: true }) // Typical default sort for checklist

    if (error) {
        console.error('Error fetching tasks:', error)
        return []
    }

    // Calculate d_day_offset if needed dynamically, or rely on what's in DB if it is stored.
    // Django model had `d_day` (integer offset?) or calculated it.
    // The schema I created has `d_day` as integer. I should assume it stores the "D-Day offset" (e.g. -30 for 30 days before).

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

    const { error } = await supabase
        .from('tasks')
        .insert({
            user_id: user.id,
            title,
            d_day,
            estimated_budget: budget,
            description: memo, // Mapping memo to description
            is_completed: false
        })

    if (error) {
        console.error('Error adding task:', error)
        return { error: error.message }
    }

    revalidatePath('/checklist')
    revalidatePath('/schedule')
    return { success: true }
}

export async function updateTask(id: string, updates: Partial<Task>) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/checklist')
    revalidatePath('/schedule')
    return { success: true }
}

export async function deleteTasks(ids: string[]) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('tasks')
        .delete()
        .in('id', ids)

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
    // date string YYYY-MM-DD
    return await updateTask(id, { due_date: date })
}
