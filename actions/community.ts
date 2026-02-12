// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database.types'
import { revalidatePath } from 'next/cache'

export type Post = Database['public']['Tables']['posts']['Row'] & {
    author: { username: string | null } | null // Joined profile
    _count?: { comments: number } // helper
}

export type Comment = Database['public']['Tables']['comments']['Row'] & {
    author: { username: string | null } | null
}

export async function getPosts(category: 'notice' | 'free' = 'free', page = 1, limit = 10) {
    const supabase = await createClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
        .from('posts')
        .select(`
      *,
      author:profiles(username)
    `, { count: 'exact' })
        .eq('category', category)
        .order('created_at', { ascending: false })
        .range(from, to)

    if (error) {
        console.error('Error fetching posts:', error)
        return { posts: [], count: 0 }
    }

    return { posts: data as Post[], count: count || 0 }
}

export async function getPost(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('posts')
        .select(`
      *,
      author:profiles(username)
    `)
        .eq('id', id)
        .single()

    if (error) return null

    // Increment view count (fire and forget)
    // supabase.rpc('increment_view_count', { post_id: id }) - if RPC exists
    // Or simple update:
    // @ts-ignore
    await (supabase.from('posts') as any).update({ view_count: (data.view_count || 0) + 1 }).eq('id', id)

    return data as Post
}

export async function getComments(postId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('comments')
        .select(`
            *,
            author:profiles(username)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

    if (error) return []
    return data as Comment[]
}

export async function createPost(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const category = formData.get('category') as 'free' | 'notice' || 'free'

    const { error } = await (supabase
        .from('posts') as any)
        .insert({
            user_id: user.id,
            title,
            content,
            category
        })

    if (error) return { error: error.message }

    revalidatePath('/community')
    return { success: true }
}

export async function createComment(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const postId = formData.get('post_id') as string
    const content = formData.get('content') as string

    const { error } = await (supabase
        .from('comments') as any)
        .insert({
            user_id: user.id,
            post_id: parseInt(postId),
            content
        })

    if (error) return { error: error.message }

    revalidatePath(`/community/${postId}`)
    return { success: true }
}

export async function deletePost(id: string) {
    // Check auth/ownership logic needed in real app
    const supabase = await createClient()
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/community')
    return { success: true }
}
