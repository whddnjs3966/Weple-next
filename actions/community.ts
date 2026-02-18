'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database.types'
import { revalidatePath } from 'next/cache'

export type Post = Database['public']['Tables']['posts']['Row'] & {
    author: { username: string | null } | null
    _count?: { comments: number }
}

export type Comment = Database['public']['Tables']['comments']['Row'] & {
    author: { username: string | null } | null
}

export async function getPosts(category: string = 'free', page = 1, limit = 10) {
    const supabase = await createClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
        .from('posts')
        .select(`
      *,
      author:profiles(username)
    `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    if (category !== 'all') {
        query = query.eq('category', category.toLowerCase())
    }

    const { data, error, count } = await query

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

    // view_count 증가 (race condition 방지를 위해 직접 SQL 사용이 best이지만, 일단 단순 증가로 처리)
    await supabase
        .from('posts')
        .update({ view_count: ((data.view_count ?? 0) + 1) })
        .eq('id', id)

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
    // 클라이언트에서 대문자로 보내더라도 소문자로 저장
    const category = (formData.get('category') as string)?.toLowerCase() || 'free'

    if (!title || !content) {
        return { error: '제목과 내용을 입력해주세요.' }
    }

    const { error } = await supabase
        .from('posts')
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

    const { error } = await supabase
        .from('comments')
        .insert({
            user_id: user.id,
            post_id: postId,
            content
        })

    if (error) return { error: error.message }

    revalidatePath(`/community/${postId}`)
    return { success: true }
}

export async function deletePost(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/community')
    return { success: true }
}
