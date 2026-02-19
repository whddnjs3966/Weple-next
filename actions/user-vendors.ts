'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type UserVendor = {
    id: string
    group_id: string | null
    user_id: string
    category: string
    vendor_name: string
    vendor_address: string | null
    vendor_phone: string | null
    vendor_link: string | null
    price_range: string | null
    memo: string | null
    is_confirmed: boolean
    created_at: string
}

export async function getUserVendors(): Promise<UserVendor[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('wedding_group_id')
        .eq('id', user.id)
        .single()

    let query = supabase
        .from('user_vendors')
        .select('*')
        .order('created_at', { ascending: false })

    if (profile?.wedding_group_id) {
        query = query.eq('group_id', profile.wedding_group_id)
    } else {
        query = query.eq('user_id', user.id)
    }

    const { data, error } = await query
    if (error) {
        console.error('getUserVendors error:', error)
        return []
    }
    return (data as UserVendor[]) || []
}

export async function addUserVendor(vendor: {
    category: string
    vendor_name: string
    vendor_address?: string
    vendor_phone?: string
    vendor_link?: string
    price_range?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('wedding_group_id')
        .eq('id', user.id)
        .single()

    const { error } = await supabase
        .from('user_vendors')
        .insert({
            ...vendor,
            user_id: user.id,
            group_id: profile?.wedding_group_id || null,
        })

    if (error) return { error: error.message }

    revalidatePath('/vendors')
    return { success: true }
}

export async function removeUserVendor(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('user_vendors')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/vendors')
    return { success: true }
}

export async function updateUserVendorMemo(id: string, memo: string, is_confirmed: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('user_vendors')
        .update({ memo, is_confirmed })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/vendors')
    return { success: true }
}
