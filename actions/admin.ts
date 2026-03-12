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

export type AnalyticsData = {
    tab_name: string
    views: number
    avg_duration: number
    total_duration: number
}

export async function getAnalyticsData(): Promise<AnalyticsData[]> {
    const supabase = await requireAdmin()

    // 이 예제에서는 단순함을 위해 모든 날짜의 데이터를 집계합니다.
    // 실서비스에서는 특정 기간(예: 최근 7일) 필터링이 필요할 수 있습니다.
    const { data, error } = await supabase
        .from('analytics_events' as any)
        .select('tab_name, duration_seconds')
        .eq('event_type', 'page_view')

    if (error) {
        console.error('getAnalyticsData error:', error)
        return []
    }

    const aggregated: Record<string, { views: number, total_duration: number }> = {}

    data.forEach((event: any) => {
        const tab = event.tab_name || 'Unknown'
        if (!aggregated[tab]) {
            aggregated[tab] = { views: 0, total_duration: 0 }
        }
        aggregated[tab].views += 1
        aggregated[tab].total_duration += (event.duration_seconds || 0)
    })

    const result: AnalyticsData[] = Object.keys(aggregated).map(tab => {
        const stat = aggregated[tab]
        return {
            tab_name: tab,
            views: stat.views,
            total_duration: stat.total_duration,
            avg_duration: stat.views > 0 ? Math.round(stat.total_duration / stat.views) : 0
        }
    })

    // 조회수 기준으로 내림차순 정렬
    return result.sort((a, b) => b.views - a.views)
}

export type UserAnalyticsData = {
    user_id: string
    username: string | null
    full_name: string | null
    pages: {
        tab_name: string
        views: number
        total_duration: number
        avg_duration: number
    }[]
    total_views: number
    total_duration: number
}

export async function getUserAnalyticsData(): Promise<UserAnalyticsData[]> {
    const supabase = await requireAdmin()

    const { data: events, error } = await supabase
        .from('analytics_events' as any)
        .select('user_id, tab_name, duration_seconds')
        .eq('event_type', 'page_view')
        .not('user_id', 'is', null)

    if (error) {
        console.error('getUserAnalyticsData error:', error)
        return []
    }

    // 사용자별 + 페이지별 집계
    const userMap: Record<string, Record<string, { views: number; total_duration: number }>> = {}

    ;(events as any[]).forEach((event: any) => {
        const uid = event.user_id
        if (!uid) return
        const tab = event.tab_name || 'Unknown'
        if (!userMap[uid]) userMap[uid] = {}
        if (!userMap[uid][tab]) userMap[uid][tab] = { views: 0, total_duration: 0 }
        userMap[uid][tab].views += 1
        userMap[uid][tab].total_duration += (event.duration_seconds || 0)
    })

    // 프로필 정보 가져오기
    const userIds = Object.keys(userMap)
    if (userIds.length === 0) return []

    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', userIds)

    const profileMap: Record<string, { username: string | null; full_name: string | null }> = {}
    ;(profiles ?? []).forEach((p: any) => {
        profileMap[p.id] = { username: p.username, full_name: p.full_name }
    })

    const result: UserAnalyticsData[] = userIds.map(uid => {
        const tabs = userMap[uid]
        const pages = Object.keys(tabs).map(tab => ({
            tab_name: tab,
            views: tabs[tab].views,
            total_duration: tabs[tab].total_duration,
            avg_duration: tabs[tab].views > 0 ? Math.round(tabs[tab].total_duration / tabs[tab].views) : 0,
        })).sort((a, b) => b.views - a.views)

        const total_views = pages.reduce((s, p) => s + p.views, 0)
        const total_duration = pages.reduce((s, p) => s + p.total_duration, 0)

        return {
            user_id: uid,
            username: profileMap[uid]?.username ?? null,
            full_name: profileMap[uid]?.full_name ?? null,
            pages,
            total_views,
            total_duration,
        }
    })

    return result.sort((a, b) => b.total_views - a.total_views)
}
