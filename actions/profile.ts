'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateWeddingDate(date: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await (supabase
        .from('profiles') as any)
        .update({ wedding_date: date })
        .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/', 'layout') // Revalidate everything as D-Day affects all pages
    return { success: true }
}
