'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database.types'
import { revalidatePath } from 'next/cache'

export type Post = Database['public']['Tables']['posts']['Row'] & {
    author: { username: string | null; full_name: string | null; role: string | null } | null
    _count?: { comments: number }
}

export type Comment = Database['public']['Tables']['comments']['Row'] & {
    author: { username: string | null; full_name: string | null; role: string | null } | null
}

/**
 * ILIKE 쿼리에 사용되는 특수문자 이스케이프
 * %, _ : PostgreSQL 와일드카드
 * \ : 이스케이프 문자
 * (, ), ' : PostgREST .or() 필터 구문 문자
 */
function escapeLike(value: string): string {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/%/g, '\\%')
        .replace(/_/g, '\\_')
        .replace(/[(),']/g, '')
}

export async function getPosts(category: string = 'free', page = 1, limit = 10, search?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { posts: [], count: 0 }

    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
        .from('posts')
        .select(`
      *,
      author:profiles(username, full_name, role)
    `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    if (category !== 'all') {
        query = query.eq('category', category.toLowerCase())
    }

    if (search && search.trim()) {
        const escaped = escapeLike(search.trim())
        query = query.or(`title.ilike.%${escaped}%,content.ilike.%${escaped}%`)
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('posts')
        .select(`
      *,
      author:profiles(username, full_name, role)
    `)
        .eq('id', id)
        .single()

    if (error) return null

    // view_count 증가 — RLS를 우회하기 위해 admin client 사용 (타인 글도 조회수 증가 가능)
    const adminClient = createAdminClient()
    await adminClient
        .from('posts')
        .update({ view_count: (data.view_count ?? 0) + 1 })
        .eq('id', id)

    return data as Post
}

export async function getComments(postId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('comments')
        .select(`
            *,
            author:profiles(username, full_name, role)
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

export async function updatePost(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const category = (formData.get('category') as string)?.toLowerCase() || 'free'

    if (!title || !content) {
        return { error: '제목과 내용을 입력해주세요.' }
    }

    // Verify authorship or admin
    const { data: post } = await supabase.from('posts').select('user_id').eq('id', id).single()
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    if (!post) return { error: 'Post not found' }
    if (post.user_id !== user.id && profile?.role !== 'admin') {
        return { error: '권한이 없습니다.' }
    }

    const { error } = await supabase
        .from('posts')
        .update({
            title,
            content,
            category,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/community')
    revalidatePath(`/community/${id}`)
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 게시글 작성자 확인 + 현재 유저 역할 확인
    const adminClient = createAdminClient()
    const [{ data: post }, { data: profile }] = await Promise.all([
        adminClient.from('posts').select('user_id').eq('id', id).single(),
        supabase.from('profiles').select('role').eq('id', user.id).single(),
    ])

    if (!post) return { error: '게시글을 찾을 수 없습니다.' }

    const isAdmin = profile?.role === 'admin'
    const isAuthor = post.user_id === user.id

    if (!isAdmin && !isAuthor) {
        return { error: '삭제 권한이 없습니다.' }
    }

    // RLS를 우회하여 삭제 (서버 액션에서 이미 권한 검증 완료)
    const { error } = await adminClient
        .from('posts')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/community')
    return { success: true }
}
