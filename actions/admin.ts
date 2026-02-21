'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Place } from './places'

async function requireAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') throw new Error('Forbidden: admin only')
    return supabase
}

export async function getAllPostsAdmin() {
    const supabase = await requireAdmin()
    const { data, error } = await supabase
        .from('posts')
        .select('*, author:profiles(username, full_name)')
        .order('created_at', { ascending: false })
        .limit(100)

    if (error) {
        console.error('getAllPostsAdmin error:', error)
        return []
    }
    return data
}

export async function adminDeletePost(id: string) {
    const supabase = await requireAdmin()
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/community')
}

export type AdminMember = {
    id: string
    username: string | null
    full_name: string | null
    wedding_date: string | null
    role: string | null
}

export async function getAllMembers(): Promise<AdminMember[]> {
    const supabase = await requireAdmin()
    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, wedding_date, role')
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('getAllMembers error:', error)
        return []
    }
    return (data as AdminMember[]) ?? []
}

export async function getAllPlacesForAdmin(): Promise<Place[]> {
    const supabase = await requireAdmin()
    const { data, error } = await supabase
        .from('places')
        .select('*, category:place_categories(*)')
        .order('name')

    if (error) {
        console.error('getAllPlacesForAdmin error:', error)
        return []
    }
    return (data as Place[]) ?? []
}

export async function toggleFeaturedPlace(id: number, featured: boolean) {
    const supabase = await requireAdmin()
    const { error } = await supabase
        .from('places')
        .update({ is_featured: featured })
        .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/places')
}

export async function promoteToAdmin(userId: string) {
    const supabase = await requireAdmin()
    const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId)

    if (error) throw new Error(error.message)
}
