'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type UserPlace = {
    id: string
    group_id: string | null
    user_id: string
    category: string
    place_name: string
    place_address: string | null
    place_phone: string | null
    place_link: string | null
    price_range: string | null
    memo: string | null
    is_confirmed: boolean
    created_at: string
}

export async function getUserPlaces(): Promise<UserPlace[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('wedding_group_id')
        .eq('id', user.id)
        .single()

    let query = supabase
        .from('user_places')
        .select('*')
        .order('created_at', { ascending: false })

    if (profile?.wedding_group_id) {
        query = query.eq('group_id', profile.wedding_group_id)
    } else {
        query = query.eq('user_id', user.id)
    }

    const { data, error } = await query
    if (error) {
        console.error('getUserPlaces error:', error)
        return []
    }
    return (data as UserPlace[]) || []
}

export async function addUserPlace(place: {
    category: string
    place_name: string
    place_address?: string
    place_phone?: string
    place_link?: string
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
        .from('user_places')
        .insert({
            ...place,
            user_id: user.id,
            group_id: profile?.wedding_group_id || null,
        })

    if (error) return { error: error.message }

    revalidatePath('/places')
    return { success: true }
}

export async function removeUserPlace(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('user_places')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/places')
    return { success: true }
}

export async function updateUserPlaceMemo(id: string, memo: string, is_confirmed: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('user_places')
        .update({ memo, is_confirmed })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/places')
    return { success: true }
}
